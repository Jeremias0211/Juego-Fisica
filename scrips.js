document.addEventListener("DOMContentLoaded", () => {

    const $ = (id) => document.getElementById(id);

    const comenzar = $("comenzar");
    const opciones = $("opciones");
    const salir = $("salir");
    const instrucciones = $("instrucciones");
    const creditos = $("creditos");

    const menuOpciones = $("menuOpciones");
    const panelOpciones = $("panelOpciones");
    const cerrarOpciones = $("cerrarOpciones");


    // =========================
    // VERIFICAR SESIÓN
    // =========================

    const sesionActiva = localStorage.getItem("sesionActiva");
    const modoInvitado = localStorage.getItem("modoInvitado") === "true";

    if (sesionActiva !== "true" && !modoInvitado) {
        window.location.href = "Login.html";
        return;
    }

    const jugadorActual = (localStorage.getItem("jugadorActual") || "").trim();


    // =========================
    // INICIAR MISIÓN
    // =========================

    if (comenzar) {
        comenzar.addEventListener("click", () => {
            window.location.href = "Historia.html";
        });
    }

    instrucciones?.addEventListener("click", () => {
        window.location.href = "Instrucciones.html";
    });

    creditos?.addEventListener("click", () => {
        window.location.href = "Creditos.html";
    });


    // =========================
    // AUDIO
    // =========================

    const Sonido = window.SonidoJuego;

    function ajustesAudio() {
        return Sonido ? Sonido.getSettings() : {
            volumen: 80,
            musica: true,
            efectos: true,
            volumenMusica: 55,
            volumenEfectos: 90,
        };
    }

    function guardarAudio(cambios) {
        if (!Sonido) return;
        Sonido.updateSettings(cambios);
    }

    const volumen = $("volumen");
    const volumenMusica = $("volumenMusica");
    const volumenEfectos = $("volumenEfectos");
    const musica = $("musica");
    const efectos = $("efectos");
    const valorVolumen = $("valorVolumen");
    const valorMusica = $("valorMusica");
    const valorEfectos = $("valorEfectos");
    const probarSonido = $("probarSonido");

    function pintarAjustes() {
        const ajustes = ajustesAudio();

        if (volumen) volumen.value = ajustes.volumen;
        if (volumenMusica) volumenMusica.value = ajustes.volumenMusica;
        if (volumenEfectos) volumenEfectos.value = ajustes.volumenEfectos;

        if (valorVolumen) valorVolumen.textContent = ajustes.volumen + "%";
        if (valorMusica) valorMusica.textContent = ajustes.volumenMusica + "%";
        if (valorEfectos) valorEfectos.textContent = ajustes.volumenEfectos + "%";

        if (musica) musica.checked = ajustes.musica;
        if (efectos) efectos.checked = ajustes.efectos;
    }

    function estado(mensaje, tipo = "") {
        const salida = $("estadoOpciones");
        if (!salida) return;
        salida.textContent = mensaje;
        salida.classList.remove("exito", "aviso");
        if (tipo) salida.classList.add(tipo);
    }

    volumen?.addEventListener("input", () => {
        if (valorVolumen) valorVolumen.textContent = volumen.value + "%";
        guardarAudio({ volumen: Number(volumen.value) });
    });

    volumenMusica?.addEventListener("input", () => {
        if (valorMusica) valorMusica.textContent = volumenMusica.value + "%";
        guardarAudio({ volumenMusica: Number(volumenMusica.value) });
    });

    volumenEfectos?.addEventListener("input", () => {
        if (valorEfectos) valorEfectos.textContent = volumenEfectos.value + "%";
        guardarAudio({ volumenEfectos: Number(volumenEfectos.value) });
    });

    musica?.addEventListener("change", () => {
        guardarAudio({ musica: musica.checked });
        Sonido?.ensure();
        estado(musica.checked ? "Música activada. Se guardó tu preferencia." : "Música desactivada.", "exito");
    });

    efectos?.addEventListener("change", () => {
        guardarAudio({ efectos: efectos.checked });
        estado(efectos.checked ? "Efectos activados." : "Efectos desactivados.", "exito");
    });

    probarSonido?.addEventListener("click", () => {
        if (!Sonido) {
            estado("Tu navegador no permite el motor de audio de este juego.", "aviso");
            return;
        }
        Sonido.ensure();
        const ajustes = Sonido.getSettings();
        if (!ajustes.efectos) {
            estado("Los efectos están desactivados. Activá el interruptor para escucharlos.", "aviso");
            return;
        }
        Sonido.preview();
        estado("Reproduciendo una muestra: salto, orbe y selección.", "exito");
    });

    pintarAjustes();


    // =========================
    // PANTALLA COMPLETA
    // =========================

    const pantallaCompleta = $("pantallaCompleta");

    function actualizarPantallaCompleta() {
        if (!pantallaCompleta) return;
        const activa = Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
        pantallaCompleta.textContent = activa ? "SALIR" : "ACTIVAR";
        pantallaCompleta.setAttribute("aria-pressed", String(activa));
    }

    async function alternarPantallaCompleta() {
        const raiz = document.documentElement;
        const activa = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        try {
            if (activa) {
                const salirPantalla = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
                if (salirPantalla) await salirPantalla.call(document);
            } else {
                const entrar = raiz.requestFullscreen || raiz.webkitRequestFullscreen || raiz.msRequestFullscreen;
                if (!entrar) {
                    estado("Pantalla completa no está disponible en este navegador.", "aviso");
                    return;
                }
                await entrar.call(raiz);
            }
            estado(
                document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement
                    ? "Pantalla completa activada. Presioná Esc para salir."
                    : "Pantalla completa desactivada.",
                "exito"
            );
        } catch (_) {
            estado("El navegador bloqueó la pantalla completa. Probá con un clic directo.", "aviso");
        }
        actualizarPantallaCompleta();
    }

    if (pantallaCompleta) {
        if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) {
            pantallaCompleta.textContent = "NO DISPONIBLE";
            pantallaCompleta.disabled = true;
        } else {
            pantallaCompleta.addEventListener("click", alternarPantallaCompleta);
        }
    }

    ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((evento) => {
        document.addEventListener(evento, actualizarPantallaCompleta);
    });
    actualizarPantallaCompleta();


    // =========================
    // ESTADÍSTICAS
    // =========================

    function progresoLocal() {
        const DB = window.JuegoDB;
        if (DB) {
            if (jugadorActual && typeof DB.progress === "function") {
                const progreso = DB.progress(jugadorActual);
                if (progreso) return progreso;
            }
            if (typeof DB.read === "function") {
                const datos = DB.read();
                const jugador = (datos.jugadores || []).find(
                    (p) => p.usuario.toLowerCase() === jugadorActual.toLowerCase()
                );
                if (jugador && jugador.progreso) return jugador.progreso;
            }
        }
        return { nivel: 1, completados: [], puntuacion: 0, combustible: 100 };
    }

    function actualizarEstadisticas() {
        const statJugador = $("statJugador");
        const statNivel = $("statNivel");
        const statPuntos = $("statPuntos");
        const statCombustible = $("statCombustible");
        const statCompletados = $("statCompletados");
        const barra = $("barraProgresoOpciones");

        if (!statJugador && !statNivel) return;

        const progreso = progresoLocal();
        const completados = Array.isArray(progreso.completados) ? progreso.completados : [];
        const nivel = Math.max(1, Math.min(6, Number(progreso.nivel) || 1));
        const puntos = Math.max(0, Number(progreso.puntuacion) || 0);
        const combustible = Math.max(0, Math.min(100, Number(progreso.combustible ?? 100)));

        if (statJugador) statJugador.textContent = jugadorActual || "Invitado";
        if (statNivel) statNivel.textContent = nivel + " / 6";
        if (statPuntos) statPuntos.textContent = puntos.toLocaleString("es-AR");
        if (statCombustible) statCombustible.textContent = Math.round(combustible) + "%";
        if (statCompletados) {
            statCompletados.textContent =
                completados.length + " / 6 planeta" + (completados.length === 1 ? "" : "s") + " completado" +
                (completados.length === 1 ? "" : "s");
        }
        if (barra) barra.style.width = Math.round((completados.length / 6) * 100) + "%";
    }


    // =========================
    // REINICIAR PROGRESO
    // =========================

    const reiniciarProgreso = $("reiniciarProgreso");

    reiniciarProgreso?.addEventListener("click", async () => {
        const nombre = jugadorActual || "Invitado";
        const confirmar = confirm(
            "¿Reiniciar el progreso de " + nombre + "?\n\n" +
            "Se borrarán niveles completados, puntos y combustible. Tu cuenta seguirá existiendo."
        );
        if (!confirmar) {
            Sonido?.play("denied");
            return;
        }

        reiniciarProgreso.disabled = true;

        if (!modoInvitado) {
            try {
                const respuesta = await fetch("../api/reiniciar-progreso.php", { method: "POST" });
                const datos = await respuesta.json().catch(() => ({}));
                if (!respuesta.ok || !datos.ok) throw new Error(datos.error || "Error del servidor");
            } catch (_) {
                reiniciarProgreso.disabled = false;
                estado("No se pudo reiniciar el progreso de la cuenta. Revisá la conexión e intentá otra vez.", "aviso");
                Sonido?.play("denied");
                return;
            }
        }

        const DB = window.JuegoDB;
        let hecho = false;
        if (DB && typeof DB.reset === "function") {
            hecho = DB.reset(jugadorActual);
        }

        reiniciarProgreso.disabled = false;

        if (!hecho) {
            estado("No se pudo reiniciar el progreso guardado en este dispositivo.", "aviso");
            return;
        }

        actualizarEstadisticas();
        Sonido?.play("station");
        estado("Progreso reiniciado. Ya podés comenzar la misión desde el nivel 1.", "exito");
    });


    // =========================
    // ABRIR / CERRAR OPCIONES
    // =========================

    let focoAnterior = null;

    function abrirOpciones() {
        if (!menuOpciones) return;
        focoAnterior = document.activeElement;

        menuOpciones.classList.add("activo");
        menuOpciones.setAttribute("aria-hidden", "false");
        opciones?.setAttribute("aria-expanded", "true");
        document.body.classList.add("opciones-abiertas");

        pintarAjustes();
        actualizarEstadisticas();
        actualizarPantallaCompleta();
        estado("Los cambios se guardan automáticamente.");

        window.setTimeout(() => {
            if (menuOpciones.classList.contains("activo")) {
                (panelOpciones || menuOpciones).focus();
            }
        }, 80);
    }

    function cerrarModal() {
        if (!menuOpciones) return;

        menuOpciones.classList.remove("activo");
        menuOpciones.setAttribute("aria-hidden", "true");
        opciones?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("opciones-abiertas");

        if (focoAnterior && typeof focoAnterior.focus === "function") {
            focoAnterior.focus();
        }
        focoAnterior = null;
    }

    opciones?.addEventListener("click", abrirOpciones);
    cerrarOpciones?.addEventListener("click", cerrarModal);

    menuOpciones?.addEventListener("click", (evento) => {
        if (evento.target === menuOpciones) cerrarModal();
    });

    document.addEventListener("keydown", (evento) => {
        if (!menuOpciones || !menuOpciones.classList.contains("activo")) return;

        if (evento.key === "Escape") {
            evento.preventDefault();
            cerrarModal();
            return;
        }

        if (evento.key !== "Tab") return;

        const enfocables = panelOpciones
            ? Array.from(
                panelOpciones.querySelectorAll(
                    "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
                )
            ).filter((elemento) => elemento.offsetParent !== null)
            : [];

        if (!enfocables.length) return;

        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];
        const dentro = panelOpciones && panelOpciones.contains(document.activeElement);

        if (!dentro || document.activeElement === panelOpciones) {
            evento.preventDefault();
            (evento.shiftKey ? ultimo : primero).focus();
            return;
        }

        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero.focus();
        }
    });


    // =========================
    // SALIR
    // =========================

    if (salir) {
        salir.addEventListener("click", () => {

            const confirmar = confirm(
                modoInvitado ? "¿Querés salir del modo invitado?" : "¿Querés cerrar la sesión?"
            );

            if (confirmar) {

                if (sesionActiva === "true") {
                    fetch("../api/cerrar-sesion.php", { method: "POST" }).catch(() => {});
                }

                localStorage.removeItem("sesionActiva");
                localStorage.removeItem("modoInvitado");
                localStorage.removeItem("jugadorActual");

                window.location.href = "Login.html";
            }
        });
    }

});
