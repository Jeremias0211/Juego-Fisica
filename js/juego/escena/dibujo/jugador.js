/* Dibujo del astronauta. */

export function dibujarJugador(ctx, state, mission, floorY) {
  const player = state.player;
  const centerX = player.x + player.width / 2;
  const stride = player.grounded && player.vx ? Math.sin(state.walkTime) * 3 : 0;

  if (mission.jetpack && state.jetpackCollected) {
    ctx.fillStyle = "#8094a9";
    ctx.fillRect(centerX - 16, player.y + 22, 8, 17);
    ctx.fillStyle = "#40c9ff";
    ctx.fillRect(centerX - 15, player.y + 25, 6, 8);
    if (state.keys.has("jetpack") && state.jetpackFuel > 0) {
      ctx.fillStyle = "#ffb54e";
      ctx.beginPath();
      ctx.moveTo(centerX - 13, player.y + 39);
      ctx.lineTo(centerX - 9, player.y + 50);
      ctx.lineTo(centerX - 5, player.y + 39);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(7, 12, 24, .35)";
  ctx.beginPath();
  ctx.ellipse(centerX, floorY + 3, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

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
