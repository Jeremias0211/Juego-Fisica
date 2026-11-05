/* Fondo, terreno, plataformas y bloques del escenario. */

export function dibujarFondo(ctx, state, mission, viewWidth, viewHeight, floorY) {
  const background = ctx.createLinearGradient(0, 0, 0, viewHeight);
  background.addColorStop(0, mission.sky[0]);
  background.addColorStop(1, mission.sky[1]);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  for (let i = 0; i < 34; i++) {
    let sx = (i * 139 + 31 - state.camera * 0.18) % (viewWidth + 80);
    if (sx < -2) sx += viewWidth + 80;
    const sy = (i * 53 + 17) % Math.max(1, floorY - 55);
    ctx.globalAlpha = 0.25 + (i % 4) * 0.13;
    ctx.fillStyle = "#e6f8ff";
    ctx.fillRect(sx, sy, i % 5 === 0 ? 3 : 2, i % 5 === 0 ? 3 : 2);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(9, 19, 35, .26)";
  for (let i = -1; i < Math.ceil(viewWidth / 380) + 2; i++) {
    const mx = i * 380 - (state.camera * 0.34 % 380);
    ctx.beginPath();
    ctx.moveTo(mx, floorY);
    ctx.lineTo(mx + 100, floorY - 48 - (i % 2) * 15);
    ctx.lineTo(mx + 220, floorY);
    ctx.closePath();
    ctx.fill();
  }
}

export function dibujarTerreno(ctx, state, mission, floorY, viewWidth, viewHeight) {
  state.groundSegments.forEach((segment) => {
    ctx.fillStyle = mission.ground;
    ctx.fillRect(segment.x, floorY, segment.w, viewHeight - floorY);
    ctx.fillStyle = mission.surface;
    ctx.fillRect(segment.x, floorY, segment.w, 4);
  });

  for (let x = Math.floor(state.camera / 95) * 95; x < state.camera + viewWidth + 100; x += 95) {
    const rockY = floorY + 9 + (Math.floor(x / 95) % 2) * 7;
    ctx.fillStyle = mission.rock;
    ctx.beginPath();
    ctx.ellipse(x + 24, rockY, 6 + (Math.floor(x / 95) % 3) * 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  mission.platforms.forEach((platform) => {
    const top = floorY - platform[2];
    ctx.shadowColor = mission.accent;
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#40556a";
    ctx.fillRect(platform[0], top, platform[1], 14);
    ctx.shadowBlur = 0;
    ctx.fillStyle = mission.accent;
    ctx.fillRect(platform[0], top, platform[1], 3);
    ctx.fillStyle = "rgba(255,255,255,.2)";
    ctx.fillRect(platform[0] + 8, top + 5, Math.max(10, platform[1] - 16), 2);
  });

  (mission.movingPlatforms || []).forEach((platform, index) => {
    const rect = state.rects.find((item) => item.type === "moving-platform" && item.index === index);
    if (!rect) return;
    ctx.save();
    ctx.shadowColor = "#c899ff";
    ctx.shadowBlur = 13;
    ctx.fillStyle = "#394768";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#d0a9ff";
    ctx.fillRect(rect.x, rect.y, rect.w, 4);
    ctx.fillStyle = "rgba(244,229,255,.8)";
    ctx.font = "bold 9px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("INERCIA", rect.x + rect.w / 2, rect.y - 6);
    ctx.restore();
  });

  mission.blocks.forEach((block) => {
    const w = block[2] || 48;
    const y = floorY - block[1];
    const gradient = ctx.createLinearGradient(block[0], y, block[0] + w, floorY);
    gradient.addColorStop(0, mission.surface);
    gradient.addColorStop(1, mission.rock);
    ctx.fillStyle = gradient;
    ctx.fillRect(block[0], y, w, block[1]);
    ctx.strokeStyle = "rgba(255, 238, 190, .7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(block[0] + 2, y + 2, w - 4, block[1] - 4);
    ctx.strokeStyle = "rgba(40, 25, 43, .4)";
    ctx.beginPath();
    ctx.moveTo(block[0] + w / 2, y + 6);
    ctx.lineTo(block[0] + w / 2 - 5, floorY - 5);
    ctx.stroke();
  });
}
