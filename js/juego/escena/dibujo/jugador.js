/* Dibujo del astronauta: sprites del traje con respaldo vectorial. */

import { fotograma } from "../sprites.js";

const ALTO_SPRITE = 52;

function animacionActual(state) {
  const player = state.player;
  const tiempo = state.gameTime || 0;

  if (!player.grounded) {
    if (player.vy < -90) return { nombre: "saltando", indice: 1 };
    if (player.vy <= 60) return { nombre: "saltando", indice: 2 };
    return { nombre: "cayendo", indice: Math.floor(tiempo / 120) };
  }

  if (Math.abs(player.vx) > 14) {
    return { nombre: "corriendo", indice: Math.floor(state.walkTime) };
  }

  return { nombre: "quieto", indice: Math.floor(tiempo / 260) };
}

function dibujarSprite(ctx, imagen, centerX, feetY, facing) {
  const escala = ALTO_SPRITE / imagen.naturalHeight;
  const ancho = imagen.naturalWidth * escala;
  const alto = imagen.naturalHeight * escala;

  ctx.save();
  ctx.translate(centerX, feetY);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imagen, -ancho / 2, -alto, ancho, alto);
  ctx.restore();
}

function dibujarVector(ctx, state) {
  const player = state.player;
  const centerX = player.x + player.width / 2;
  const stride = player.grounded && player.vx ? Math.sin(state.walkTime) * 3 : 0;

  ctx.fillStyle = "#e2a153";
  ctx.fillRect(centerX - 14, player.y + 20, 7, 18);
  ctx.fillStyle = "#55cfe2";
  ctx.beginPath();
  ctx.roundRect(centerX - 9, player.y + 16, 19, 25, 6);
  ctx.fill();
  ctx.fillStyle = "#8bf4f7";
  ctx.beginPath();
  ctx.arc(centerX, player.y + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#163b56";
  ctx.beginPath();
  ctx.ellipse(centerX + (player.vx >= 0 ? 3 : -3), player.y + 10, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f0c677";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX - 5, player.y + 39);
  ctx.lineTo(centerX - 6 + stride, player.y + 47);
  ctx.moveTo(centerX + 5, player.y + 39);
  ctx.lineTo(centerX + 6 - stride, player.y + 47);
  ctx.stroke();

  ctx.fillStyle = "#b5f4f2";
  ctx.beginPath();
  ctx.roundRect(centerX + 8, player.y + 22, 8, 14, 3);
  ctx.fill();
}

export function dibujarJugador(ctx, state, mission, floorY) {
  const player = state.player;
  const centerX = player.x + player.width / 2;
  const feetY = player.y + player.height;

  if (mission.jetpack && state.jetpackCollected) {
    ctx.fillStyle = "#8094a9";
    ctx.fillRect(centerX - 16, player.y + 22, 8, 17);
    ctx.fillStyle = "#40c9ff";
    ctx.fillRect(centerX - 15, player.y + 25, 6, 8);
  }

  ctx.fillStyle = "rgba(7, 12, 24, .35)";
  ctx.beginPath();
  ctx.ellipse(centerX, floorY + 3, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const eleccion = animacionActual(state);
  const imagen = fotograma(eleccion.nombre, eleccion.indice);

  if (imagen) {
    dibujarSprite(ctx, imagen, centerX, feetY, player.facing || 1);
  } else {
    dibujarVector(ctx, state);
  }

  if (mission.jetpack && state.jetpackCollected && state.keys.has("jetpack") && state.jetpackFuel > 0) {
    ctx.fillStyle = "#ffb54e";
    ctx.beginPath();
    ctx.moveTo(centerX - 13, player.y + 39);
    ctx.lineTo(centerX - 9, player.y + 50);
    ctx.lineTo(centerX - 5, player.y + 39);
    ctx.closePath();
    ctx.fill();
  }
}
