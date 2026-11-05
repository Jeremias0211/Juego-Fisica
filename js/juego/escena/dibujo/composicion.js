/* Compone un fotograma completo: fondo, terreno, objetos, jugador y HUD del lienzo. */

import { dibujarFondo, dibujarTerreno } from "./escenario.js";
import { dibujarObjetos } from "./objetos.js";
import { dibujarJugador } from "./jugador.js";

export function dibujarEscena(view, state, mission, time) {
  const { ctx, viewWidth, viewHeight, floorY } = view;

  dibujarFondo(ctx, state, mission, viewWidth, viewHeight, floorY);

  state.camera = Math.max(0, Math.min(state.worldLength - viewWidth, state.player.x - viewWidth * 0.34));

  ctx.save();
  ctx.translate(-state.camera, 0);
  dibujarTerreno(ctx, state, mission, floorY, viewWidth, viewHeight);
  dibujarObjetos(ctx, state, mission, {
    floorY,
    viewWidth,
    camera: state.camera,
    time,
  });

  if (state.invulnerability <= 0 || Math.floor(time / 100) % 2 === 0) {
    dibujarJugador(ctx, state, mission, floorY);
  }
  ctx.restore();

  ctx.fillStyle = "#f3fbff";
  ctx.font = "bold 12px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    "PLANETA " + (mission.planet.split("·")[1] || "").trim() + " · GRAVEDAD " + mission.gravity.toString().replace(".", ",") + " m/s²",
    14,
    viewHeight - 12
  );

  const progressWidth = Math.min(150, viewWidth * 0.3);
  ctx.fillStyle = "rgba(8, 18, 33, .65)";
  ctx.fillRect(viewWidth - progressWidth - 14, 14, progressWidth, 6);
  ctx.fillStyle = mission.accent;
  ctx.fillRect(
    viewWidth - progressWidth - 14,
    14,
    progressWidth * Math.max(0, Math.min(1, state.player.x / state.worldLength)),
    6
  );
}
