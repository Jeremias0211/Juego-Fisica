/* Motor de audio de Nuevo Hogar.
   Genera música y efectos en tiempo real con Web Audio API, sin archivos externos. */
(() => {
  "use strict";

  const STORAGE_KEY = "nuevoHogarAudio";
  const DEFAULTS = {
    volumen: 80,
    musica: true,
    efectos: true,
    volumenMusica: 55,
    volumenEfectos: 90,
  };

  const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(maximo, Number(valor)));

  function leerAjustes() {
    let guardados = {};
    try {
      guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (_) {
      guardados = {};
    }
    return {
      volumen: limitar(guardados.volumen ?? DEFAULTS.volumen, 0, 100),
      musica: guardados.musica !== false,
      efectos: guardados.efectos !== false,
      volumenMusica: limitar(guardados.volumenMusica ?? DEFAULTS.volumenMusica, 0, 100),
      volumenEfectos: limitar(guardados.volumenEfectos ?? DEFAULTS.volumenEfectos, 0, 100),
    };
  }

  const ajustes = leerAjustes();

  let ctx = null;
  let master = null;
  let busEfectos = null;
  let busMusica = null;
  let compresor = null;
  let bufferRuido = null;

  let escenaMusica = null;
  let musicaActiva = false;
  let temporizadorMusica = null;
  let sesionMusica = null;
  let vocesMusica = new Set();
  let proximoCompas = 0;
  let numeroCompas = 0;

  let jetpackActivo = null;

  const ACORDES = [
    [110.0, 261.63, 329.63, 440.0], // La menor
    [87.31, 220.0, 261.63, 349.23], // Fa mayor
    [130.81, 261.63, 329.63, 392.0], // Do mayor
    [98.0, 246.94, 293.66, 392.0], // Sol mayor
  ];

  function guardarAjustes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ajustes));
    } catch (_) {
      /* El audio sigue funcionando aunque el navegador bloquee localStorage. */
    }
  }

  function crearContexto() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      ctx = new AudioCtor();
    } catch (_) {
      return null;
    }

    compresor = ctx.createDynamicsCompressor();
    compresor.threshold.value = -18;
    compresor.knee.value = 24;
    compresor.ratio.value = 6;
    compresor.attack.value = 0.003;
    compresor.release.value = 0.25;

    master = ctx.createGain();
    busEfectos = ctx.createGain();
    busMusica = ctx.createGain();

    busEfectos.connect(master);
    busMusica.connect(master);
    master.connect(compresor);
    compresor.connect(ctx.destination);

    aplicarVolumen(true);
    return ctx;
  }

  function aplicarVolumen(inmediato) {
    if (!ctx) return;
    const ahora = ctx.currentTime;
    const maestro = Math.pow(ajustes.volumen / 100, 1.6);
    const musica = ajustes.musica ? Math.pow(ajustes.volumenMusica / 100, 1.4) : 0;
    const efectos = ajustes.efectos ? Math.pow(ajustes.volumenEfectos / 100, 1.4) : 0;
    if (inmediato) {
      master.gain.value = maestro;
      busMusica.gain.value = musica;
      busEfectos.gain.value = efectos;
      return;
    }
    master.gain.setTargetAtTime(maestro, ahora, 0.03);
    busMusica.gain.setTargetAtTime(musica, ahora, 0.03);
    busEfectos.gain.setTargetAtTime(efectos, ahora, 0.03);
  }

  function obtenerBufferRuido() {
    if (bufferRuido || !ctx) return bufferRuido;
    const duracion = 1;
    const muestras = Math.floor(ctx.sampleRate * duracion);
    bufferRuido = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = bufferRuido.getChannelData(0);
    for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
    return bufferRuido;
  }

  function programarTono(opciones) {
    if (!ctx) return;
    const {
      freq,
      hasta,
      tipo = "sine",
      duracion = 0.2,
      volumen = 0.1,
      ataque = 0.008,
      delay = 0,
      detune = 0,
      destino = busEfectos,
    } = opciones;
    const t = ctx.currentTime + Math.max(0, delay);
    const osc = ctx.createOscillator();
    const ganancia = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(Math.max(20, freq), t);
    if (hasta && hasta !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, hasta), t + duracion);
    }
    if (detune) osc.detune.setValueAtTime(detune, t);
    ganancia.gain.setValueAtTime(0.0001, t);
    ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), t + ataque);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    osc.connect(ganancia).connect(destino);
    osc.start(t);
    osc.stop(t + duracion + 0.03);
  }

  function programarRuido(opciones) {
    if (!ctx) return;
    const {
      duracion = 0.25,
      volumen = 0.08,
      tipo = "bandpass",
      freq = 900,
      hasta,
      q = 0.8,
      delay = 0,
      destino = busEfectos,
    } = opciones;
    const t = ctx.currentTime + Math.max(0, delay);
    const fuente = ctx.createBufferSource();
    fuente.buffer = obtenerBufferRuido();
    fuente.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.setValueAtTime(Math.max(30, freq), t);
    if (hasta) filtro.frequency.exponentialRampToValueAtTime(Math.max(30, hasta), t + duracion);
    filtro.Q.value = q;
    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(0.0001, t);
    ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), t + 0.012);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    fuente.connect(filtro).connect(ganancia).connect(destino);
    fuente.start(t);
    fuente.stop(t + duracion + 0.03);
  }

  function reproducir(nombre, opciones = {}) {
    if (!ajustes.efectos) return;
    if (!crearContexto()) return;

    switch (nombre) {
      case "jump":
        programarTono({ freq: 300, hasta: 620, tipo: "triangle", duracion: 0.14, volumen: 0.16 });
        break;
      case "jetpackJump":
        programarTono({ freq: 170, hasta: 360, tipo: "sawtooth", duracion: 0.18, volumen: 0.1 });
        programarRuido({ duracion: 0.16, volumen: 0.04, tipo: "bandpass", freq: 500, hasta: 1200, q: 0.9 });
        break;
      case "land": {
        const fuerza = limitar(opciones.fuerza || 1, 0.4, 1.6);
        programarRuido({ duracion: 0.07, volumen: 0.045 * fuerza, tipo: "lowpass", freq: 520, q: 0.8 });
        programarTono({ freq: 125, hasta: 55, tipo: "sine", duracion: 0.13, volumen: 0.13 * fuerza });
        break;
      }
      case "orb":
        programarTono({ freq: 880, hasta: 1320, tipo: "sine", duracion: 0.14, volumen: 0.1 });
        programarTono({ freq: 1320, tipo: "sine", duracion: 0.18, volumen: 0.06, delay: 0.07 });
        break;
      case "energy":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          programarTono({ freq: f, tipo: "triangle", duracion: 0.2, volumen: 0.07, delay: i * 0.07 });
        });
        break;
      case "jetpackPickup":
        programarTono({ freq: 180, hasta: 520, tipo: "sawtooth", duracion: 0.32, volumen: 0.1 });
        programarTono({ freq: 520, hasta: 820, tipo: "triangle", duracion: 0.24, volumen: 0.07, delay: 0.12 });
        break;
      case "impulse":
        programarRuido({ duracion: 0.45, volumen: 0.09, tipo: "bandpass", freq: 300, hasta: 1900, q: 1.2 });
        programarTono({ freq: 150, hasta: 760, tipo: "triangle", duracion: 0.45, volumen: 0.12 });
        break;
      case "pulse":
        programarTono({ freq: 220, hasta: 82, tipo: "sine", duracion: 0.6, volumen: 0.16 });
        programarTono({ freq: 440, hasta: 164, tipo: "sine", duracion: 0.5, volumen: 0.06, delay: 0.05 });
        break;
      case "brake":
        programarRuido({ duracion: 0.28, volumen: 0.09, tipo: "highpass", freq: 1400, hasta: 260 });
        programarTono({ freq: 320, hasta: 120, tipo: "triangle", duracion: 0.2, volumen: 0.06 });
        break;
      case "slingshot":
        programarTono({ freq: 260, hasta: 1180, tipo: "sine", duracion: 0.38, volumen: 0.11 });
        programarRuido({ duracion: 0.3, volumen: 0.05, tipo: "bandpass", freq: 700, hasta: 2400, q: 1.4 });
        break;
      case "beacon":
        [392, 523.25, 659.25].forEach((f, i) => {
          programarTono({ freq: f, tipo: "sine", duracion: 0.7, volumen: 0.06, delay: i * 0.08 });
        });
        programarTono({ freq: 1318.5, tipo: "sine", duracion: 0.5, volumen: 0.035, delay: 0.24 });
        break;
      case "station":
        programarTono({ freq: 659.25, tipo: "sine", duracion: 0.22, volumen: 0.07 });
        programarTono({ freq: 987.77, tipo: "sine", duracion: 0.34, volumen: 0.05, delay: 0.1 });
        break;
      case "laser":
        programarTono({ freq: 1450, hasta: 180, tipo: "sawtooth", duracion: 0.28, volumen: 0.12 });
        programarRuido({ duracion: 0.24, volumen: 0.08, tipo: "bandpass", freq: 2400, hasta: 420, q: 2.2 });
        programarTono({ freq: 160, hasta: 70, tipo: "square", duracion: 0.22, volumen: 0.08, delay: 0.08 });
        break;
      case "hurt":
        programarTono({ freq: 180, hasta: 70, tipo: "square", duracion: 0.28, volumen: 0.11 });
        programarRuido({ duracion: 0.14, volumen: 0.06, tipo: "lowpass", freq: 420 });
        break;
      case "fall":
        programarTono({ freq: 620, hasta: 90, tipo: "sine", duracion: 0.55, volumen: 0.13 });
        programarRuido({ duracion: 0.42, volumen: 0.05, tipo: "lowpass", freq: 360 });
        programarTono({ freq: 82, hasta: 40, tipo: "sine", duracion: 0.2, volumen: 0.16, delay: 0.55 });
        break;
      case "oxygen":
        [880, 660, 880].forEach((f, i) => {
          programarTono({ freq: f, tipo: "square", duracion: 0.11, volumen: 0.05, delay: i * 0.15 });
        });
        break;
      case "gameover":
        [392, 329.63, 261.63, 196].forEach((f, i) => {
          programarTono({ freq: f, tipo: "triangle", duracion: 0.48, volumen: 0.1, delay: i * 0.17 });
        });
        programarTono({ freq: 98, hasta: 49, tipo: "sine", duracion: 1.1, volumen: 0.12, delay: 0.1 });
        break;
      case "win":
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
          programarTono({ freq: f, tipo: "triangle", duracion: 0.34, volumen: 0.1, delay: i * 0.11 });
        });
        [523.25, 659.25, 783.99].forEach((f) => {
          programarTono({ freq: f, tipo: "sine", duracion: 1.1, volumen: 0.045, delay: 0.55 });
        });
        break;
      case "select":
        programarTono({ freq: 440, tipo: "sine", duracion: 0.1, volumen: 0.07 });
        programarTono({ freq: 660, tipo: "sine", duracion: 0.14, volumen: 0.06, delay: 0.08 });
        break;
      case "denied":
        programarTono({ freq: 220, hasta: 150, tipo: "square", duracion: 0.18, volumen: 0.06 });
        break;
      case "click":
        programarTono({ freq: 520, hasta: 640, tipo: "triangle", duracion: 0.06, volumen: 0.045 });
        break;
      default:
        break;
    }
  }

  function registrarVoz(voz) {
    vocesMusica.add(voz);
    voz.addEventListener("ended", () => vocesMusica.delete(voz));
  }

  function tonoMusical(freq, cuando, duracion, volumen) {
    if (!ctx || !sesionMusica) return;
    const osc = ctx.createOscillator();
    const ganancia = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, cuando);
    ganancia.gain.setValueAtTime(0.0001, cuando);
    ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, volumen), cuando + 0.03);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
    osc.connect(ganancia).connect(sesionMusica);
    osc.start(cuando);
    osc.stop(cuando + duracion + 0.03);
    registrarVoz(osc);
  }

  function programarCompas(t, indice, escena, largo) {
    if (!ctx || !sesionMusica) return;
    const acorde = ACORDES[indice % ACORDES.length];
    const intensidad = escena === "juego" ? 1 : 0.78;

    // Colchón de cuerdas: osciladores suaves y desafinados entre sí.
    acorde.slice(1).forEach((frecuencia, i) => {
      [0, 6].forEach((detune, j) => {
        const osc = ctx.createOscillator();
        const ganancia = ctx.createGain();
        osc.type = j === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(frecuencia, t);
        osc.detune.setValueAtTime(detune, t);
        ganancia.gain.setValueAtTime(0.0001, t);
        ganancia.gain.exponentialRampToValueAtTime(0.012 * intensidad / (i + 1), t + 1.3);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, t + largo + 0.9);
        osc.connect(ganancia).connect(sesionMusica);
        osc.start(t);
        osc.stop(t + largo + 1.05);
        registrarVoz(osc);
      });
    });

    // Bajo profundo.
    const bajo = ctx.createOscillator();
    const gananciaBajo = ctx.createGain();
    bajo.type = "sine";
    bajo.frequency.setValueAtTime(acorde[0] / 2, t);
    gananciaBajo.gain.setValueAtTime(0.0001, t);
    gananciaBajo.gain.exponentialRampToValueAtTime(0.05 * intensidad, t + 0.8);
    gananciaBajo.gain.exponentialRampToValueAtTime(0.0001, t + largo + 0.5);
    bajo.connect(gananciaBajo).connect(sesionMusica);
    bajo.start(t);
    bajo.stop(t + largo + 0.7);
    registrarVoz(bajo);

    // Arpegio cristalino.
    const pasos = escena === "juego" ? 8 : 4;
    for (let i = 0; i < pasos; i++) {
      const nota = acorde[(i % (acorde.length - 1)) + 1] * 2;
      const cuando = t + i * (largo / pasos);
      tonoMusical(nota, cuando, escena === "juego" ? 0.55 : 0.9, 0.022 * intensidad);
    }

    // Pulso rítmico muy suave en el modo juego.
    if (escena === "juego") {
      for (let i = 0; i < 4; i++) {
        const cuando = t + i * (largo / 4);
        const pulso = ctx.createOscillator();
        const ganancia = ctx.createGain();
        pulso.type = "sine";
        pulso.frequency.setValueAtTime(58, cuando);
        pulso.frequency.exponentialRampToValueAtTime(38, cuando + 0.12);
        ganancia.gain.setValueAtTime(0.0001, cuando);
        ganancia.gain.exponentialRampToValueAtTime(i === 0 || i === 2 ? 0.045 : 0.022, cuando + 0.01);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.16);
        pulso.connect(ganancia).connect(sesionMusica);
        pulso.start(cuando);
        pulso.stop(cuando + 0.2);
        registrarVoz(pulso);
      }
    }
  }

  function programarCompases() {
    if (!musicaActiva || !ctx || !sesionMusica) return;
    const largo = escenaMusica === "juego" ? 3.4 : 4.6;
    if (proximoCompas < ctx.currentTime - 0.1) proximoCompas = ctx.currentTime + 0.05;
    let margen = 0;
    while (proximoCompas < ctx.currentTime + 1.1 && margen < 4) {
      programarCompas(proximoCompas, numeroCompas, escenaMusica, largo);
      proximoCompas += largo;
      numeroCompas++;
      margen++;
    }
  }

  function escenaDelDocumento() {
    const valor = document.body && document.body.dataset ? document.body.dataset.musica : "";
    if (valor === "juego") return "juego";
    if (valor === "menu") return "menu";
    return null;
  }

  function iniciarMusica(escena) {
    const destino = escena || escenaDelDocumento();
    if (!destino || !ajustes.musica) return;
    if (!crearContexto()) return;
    if (musicaActiva && escenaMusica === destino) return;
    detenerMusica();
    escenaMusica = destino;
    musicaActiva = true;
    numeroCompas = 0;
    proximoCompas = ctx.currentTime + 0.15;
    sesionMusica = ctx.createGain();
    sesionMusica.gain.setValueAtTime(0.0001, ctx.currentTime);
    sesionMusica.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.1);
    sesionMusica.connect(busMusica);
    programarCompases();
    temporizadorMusica = window.setInterval(programarCompases, 350);
  }

  function detenerMusica() {
    musicaActiva = false;
    if (temporizadorMusica) {
      window.clearInterval(temporizadorMusica);
      temporizadorMusica = null;
    }
    if (!ctx || !sesionMusica) return;
    const sesion = sesionMusica;
    sesionMusica = null;
    const ahora = ctx.currentTime;
    try {
      sesion.gain.cancelScheduledValues(ahora);
      sesion.gain.setTargetAtTime(0.0001, ahora, 0.07);
    } catch (_) {
      /* La sesión ya podía estar desconectada. */
    }
    vocesMusica.forEach((voz) => {
      try { voz.stop(ahora + 0.25); } catch (_) { /* ya estaba detenida */ }
    });
    vocesMusica.clear();
    window.setTimeout(() => {
      try { sesion.disconnect(); } catch (_) { /* nada */ }
    }, 520);
  }

  function iniciarJetpack() {
    if (jetpackActivo || !ajustes.efectos || !crearContexto()) return;
    const fuente = ctx.createBufferSource();
    fuente.buffer = obtenerBufferRuido();
    fuente.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 720;
    filtro.Q.value = 0.9;
    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.085, ctx.currentTime + 0.08);
    fuente.connect(filtro).connect(ganancia).connect(busEfectos);
    fuente.start();
    jetpackActivo = { fuente, ganancia };
  }

  function detenerJetpack() {
    if (!jetpackActivo) return;
    const { fuente, ganancia } = jetpackActivo;
    jetpackActivo = null;
    if (!ctx) return;
    const ahora = ctx.currentTime;
    try {
      ganancia.gain.cancelScheduledValues(ahora);
      ganancia.gain.setTargetAtTime(0.0001, ahora, 0.035);
      fuente.stop(ahora + 0.22);
    } catch (_) {
      /* La fuente ya podía estar detenida. */
    }
  }

  function configurarJetpack(activo) {
    if (activo) {
      if (ajustes.efectos) iniciarJetpack();
    } else {
      detenerJetpack();
    }
  }

  function actualizarAjustes(cambios) {
    if (!cambios || typeof cambios !== "object") return obtenerAjustes();
    if ("volumen" in cambios) ajustes.volumen = limitar(cambios.volumen, 0, 100);
    if ("volumenMusica" in cambios) ajustes.volumenMusica = limitar(cambios.volumenMusica, 0, 100);
    if ("volumenEfectos" in cambios) ajustes.volumenEfectos = limitar(cambios.volumenEfectos, 0, 100);
    if ("musica" in cambios) ajustes.musica = Boolean(cambios.musica);
    if ("efectos" in cambios) ajustes.efectos = Boolean(cambios.efectos);
    guardarAjustes();
    if (ctx) aplicarVolumen(false);
    if ("musica" in cambios) {
      if (ajustes.musica) iniciarMusica(escenaDelDocumento());
      else detenerMusica();
    }
    if ("efectos" in cambios && !ajustes.efectos) detenerJetpack();
    return obtenerAjustes();
  }

  function obtenerAjustes() {
    return { ...ajustes };
  }

  function probarSonido() {
    if (!ajustes.efectos) return;
    if (!crearContexto()) return;
    reproducir("jump");
    window.setTimeout(() => reproducir("orb"), 150);
    window.setTimeout(() => reproducir("select"), 360);
  }

  function estado() {
    return {
      disponible: Boolean(ctx),
      contexto: ctx ? ctx.state : "sin-contexto",
      musica: musicaActiva,
      escena: escenaMusica,
      efectos: ajustes.efectos,
      ajustes: obtenerAjustes(),
    };
  }

  let primerGestoHecho = false;
  function primerGesto() {
    if (primerGestoHecho) return;
    primerGestoHecho = true;
    if (!crearContexto()) return;
    iniciarMusica(escenaDelDocumento());
  }

  document.addEventListener("pointerdown", primerGesto, { passive: true });
  document.addEventListener("keydown", primerGesto);
  document.addEventListener("click", (evento) => {
    const objetivo = evento.target;
    if (!objetivo || typeof objetivo.closest !== "function") return;
    const control = objetivo.closest("button, a");
    if (!control || control.hasAttribute("data-sin-sonido")) return;
    reproducir("click");
  });

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });

  window.addEventListener("pagehide", () => {
    detenerMusica();
    detenerJetpack();
  });

  window.SonidoJuego = {
    play: reproducir,
    preview: probarSonido,
    startMusic: iniciarMusica,
    stopMusic: detenerMusica,
    setJetpack: configurarJetpack,
    getSettings: obtenerAjustes,
    updateSettings: actualizarAjustes,
    ensure: crearContexto,
    estado,
  };
})();
