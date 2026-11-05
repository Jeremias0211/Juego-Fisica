/* Une estado, controles, simulación y dibujo dentro de una instancia de p5. */

import { crearEstado, reiniciarNivel } from "./estado.js";
import { crearControles } from "./controles.js";
import { actualizarJuego } from "./actualizar.js";
import { prepararVista } from "./dibujo/vista.js";
import { dibujarEscena } from "./dibujo/composicion.js";

export function crearEscena(p, mission, callbacks, sceneHost) {
  let canvas = null;
  let ctx = null;

  const state = crearEstado(mission);
  const controles = crearControles({ p, mission, state, callbacks });

  function medidaEscena() {
    if (!sceneHost) return { w: 0, h: 0 };
    const rect = sceneHost.getBoundingClientRect ? sceneHost.getBoundingClientRect() : null;
    return {
      w: Math.max(1, Math.floor(sceneHost.clientWidth || (rect && rect.width) || window.innerWidth || 800)),
      h: Math.max(1, Math.floor(sceneHost.clientHeight || (rect && rect.height) || window.innerHeight || 500)),
    };
  }

  function ajustarCanvas() {
    if (!canvas || !sceneHost) return;
    const medida = medidaEscena();
    if (!medida.w || !medida.h) return;

    const dpr = window.devicePixelRatio || 1;
    if (typeof p.pixelDensity === "function" && Math.abs(p.pixelDensity() - dpr) > 0.01) {
      p.pixelDensity(dpr);
    }
    if (Math.abs(p.width - medida.w) > 1 || Math.abs(p.height - medida.h) > 1) {
      p.resizeCanvas(medida.w, medida.h);
    }

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.display = "block";
  }

  function reiniciar() {
    reiniciarNivel(state, mission, callbacks);
  }

  p.pauseGame = controles.pauseGame;
  p.resumeGame = controles.resumeGame;
  p.useAbility = controles.useAbility;
  p.setJetpack = controles.setJetpack;
  p.restartLevel = reiniciar;

  controles.conectar();
  callbacks.onLivesChange(state.lives);
  callbacks.onJetpackChange(state.jetpackFuel, state.jetpackCollected);
  callbacks.onEnergyChange(state.energyCollected, mission.requiredEnergy || 0);

  p.setup = function () {
    p.pixelDensity(window.devicePixelRatio || 1);
    const medida = medidaEscena();
    const renderer = p.createCanvas(medida.w, medida.h);
    renderer.id("escena");
    canvas = renderer.elt;
    if (canvas.parentNode !== sceneHost) sceneHost.appendChild(canvas);

    if (sceneHost.style.position === "" || sceneHost.style.position === "static") {
      sceneHost.style.position = "relative";
    }
    sceneHost.style.overflow = "hidden";

    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("aria-label", "Nivel 2D. A y D para moverse, W o espacio para saltar, P para pausar.");
    ctx = p.drawingContext;
    p.frameRate(60);
    state.lastFloor = null;
    ajustarCanvas();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(function () {
        ajustarCanvas();
      });
      observer.observe(sceneHost);
    }

    window.addEventListener("resize", ajustarCanvas);
    window.addEventListener("orientationchange", ajustarCanvas);
    window.setTimeout(ajustarCanvas, 60);
    window.setTimeout(ajustarCanvas, 260);
  };

  p.draw = function () {
    if (!canvas || !ctx || state.paused) return;

    const frameTime = p.millis();
    const dt = state.lastTime ? Math.min((frameTime - state.lastTime) / 1000, 0.04) : 0;
    state.lastTime = frameTime;
    state.gameTime += dt * 1000;

    try {
      const view = prepararVista(p, canvas);
      if (!view) return;
      actualizarJuego(state.gameTime, dt, view.floorY, { mission, state, callbacks });
      dibujarEscena(view, state, mission, state.gameTime);
    } catch (error) {
      console.error("Error en draw", error);
    }
  };

  p.windowResized = function () {
    ajustarCanvas();
  };

  return { restart: reiniciar };
}
