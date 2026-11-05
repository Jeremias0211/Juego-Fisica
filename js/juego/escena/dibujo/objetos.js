/* Plataformas de impulso, campos gravitatorios, láseres, objetos y salida. */

import { laserActivo } from "../estado.js";

export function dibujarObjetos(ctx, state, mission, { floorY, viewWidth, camera, time }) {
  state.impulsePads.forEach((pad) => {
    ctx.save();
    ctx.globalAlpha = pad.activated ? .35 : .95;
    ctx.shadowColor = "#fff074";
    ctx.shadowBlur = pad.activated ? 3 : 14;
    ctx.fillStyle = pad.activated ? "#7c7956" : "#e7c64d";
    ctx.fillRect(pad.x - 22, floorY - 9, 44, 9);
    ctx.strokeStyle = "#fff6a4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.x - 13, floorY - 11);
    ctx.lineTo(pad.x - 8, floorY - 18);
    ctx.lineTo(pad.x - 3, floorY - 11);
    ctx.lineTo(pad.x + 2, floorY - 18);
    ctx.lineTo(pad.x + 7, floorY - 11);
    ctx.lineTo(pad.x + 12, floorY - 18);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#fff9ce";
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pad.activated ? "USADO" : "E · IMPULSO", pad.x, floorY - 26);
  });

  (mission.gravityWells || []).forEach((well, index) => {
    const centerY = floorY - well[1];
    const pulse = 1 + Math.sin(time / 400 + index) * .06;
    ctx.save();
    ctx.translate(well[0], centerY);
    ctx.rotate(time / 1800 + index);
    ctx.globalAlpha = .46;
    ctx.strokeStyle = "#ffc1ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42 * pulse, 17, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#93e9ff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 56 * pulse, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = "#c685ff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#c98dff";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  state.lasers.forEach((laser) => {
    if (laser[0] < camera - 50 || laser[0] > camera + viewWidth + 50) return;
    const top = floorY - laser[1];
    const active = laserActivo(laser, time);
    ctx.fillStyle = "#51677c";
    ctx.fillRect(laser[0] - 11, top - 8, 22, 12);
    ctx.fillRect(laser[0] - 11, floorY - 4, 22, 10);
    ctx.save();
    ctx.globalAlpha = active ? .95 : .25;
    ctx.shadowColor = active ? "#ff315f" : "#ffc66e";
    ctx.shadowBlur = active ? 18 : 5;
    ctx.strokeStyle = active ? "#ff456b" : "#ffc66e";
    ctx.lineWidth = active ? 8 : 3;
    ctx.beginPath();
    ctx.moveTo(laser[0], top);
    ctx.lineTo(laser[0], floorY);
    ctx.stroke();
    if (active) {
      ctx.strokeStyle = "#fff0f3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(laser[0], top + 3);
      ctx.lineTo(laser[0], floorY - 3);
      ctx.stroke();
    }
    ctx.restore();
  });

  if (mission.jetpack && !state.jetpackCollected) {
    const pickupX = mission.jetpack.pickup[0];
    const pickupY = floorY - mission.jetpack.pickup[1] + Math.sin(time / 240) * 4;
    if (pickupX > camera - 50 && pickupX < camera + viewWidth + 50) {
      ctx.save();
      ctx.shadowColor = "#7deaff";
      ctx.shadowBlur = 17;
      ctx.fillStyle = "#b8e7f4";
      ctx.beginPath();
      ctx.roundRect(pickupX - 14, pickupY - 20, 28, 40, 7);
      ctx.fill();
      ctx.fillStyle = "#4584a8";
      ctx.fillRect(pickupX - 9, pickupY - 13, 18, 21);
      ctx.fillStyle = "#ffb557";
      ctx.beginPath();
      ctx.moveTo(pickupX - 10, pickupY + 19);
      ctx.lineTo(pickupX - 7, pickupY + 31);
      ctx.lineTo(pickupX - 4, pickupY + 19);
      ctx.moveTo(pickupX + 4, pickupY + 19);
      ctx.lineTo(pickupX + 7, pickupY + 31);
      ctx.lineTo(pickupX + 10, pickupY + 19);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#ecfbff";
      ctx.font = "bold 9px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("JETPACK · J", pickupX, pickupY - 28);
    }
  }

  const stationX = mission.station;
  ctx.save();
  ctx.shadowColor = "#58f4ff";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "rgba(58, 215, 232, .25)";
  ctx.fillRect(stationX - 18, floorY - 76, 38, 76);
  ctx.strokeStyle = "#9cffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(stationX - 18, floorY - 76, 38, 76);
  ctx.restore();
  ctx.fillStyle = "#dffeff";
  ctx.font = "bold 10px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RECARGA", stationX + 1, floorY - 84);
  ctx.fillStyle = "#67f7ff";
  ctx.fillRect(stationX - 9, floorY - 56, 20, 10);
  ctx.fillStyle = "#eaffff";
  ctx.font = "bold 8px Arial, sans-serif";
  ctx.fillText("O₂", stationX + 1, floorY - 48);

  state.orbs.forEach((orb, index) => {
    if (orb.collected || orb.x < camera - 40 || orb.x > camera + viewWidth + 40) return;
    const bob = Math.sin(time / 260 + index) * 5;
    const orbY = floorY - orb.lift + bob;
    ctx.save();
    ctx.shadowColor = "#60ffff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(97, 250, 255, .22)";
    ctx.beginPath();
    ctx.arc(orb.x, orbY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#adffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(orb.x, orbY, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#ecffff";
    ctx.font = "bold 9px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("O₂", orb.x, orbY + 3);
  });

  state.energyCells.forEach((cell, index) => {
    if (cell.collected || cell.x < camera - 40 || cell.x > camera + viewWidth + 40) return;
    const cellY = floorY - cell.lift + Math.sin(time / 260 + index) * 4;
    ctx.save();
    ctx.translate(cell.x, cellY);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = "#ffe56b";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffe56b";
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = "#fff9cf";
    ctx.fillRect(-4, -7, 8, 14);
    ctx.restore();
    ctx.fillStyle = "#fff9cf";
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ENERGÍA", cell.x, cellY - 18);
  });

  const goalX = state.worldLength - 58;
  ctx.save();
  ctx.shadowColor = mission.accent;
  ctx.shadowBlur = 22;
  const exitLocked = Boolean(mission.requiredEnergy && !state.exitActivated);
  ctx.strokeStyle = exitLocked ? "#ff7f91" : mission.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(goalX, floorY - 43, 18, 39, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#fff4ca";
  ctx.fillRect(goalX + 20, floorY - 75, 3, 73);
  ctx.fillStyle = exitLocked ? "#ff7f91" : mission.accent;
  ctx.beginPath();
  ctx.moveTo(goalX + 23, floorY - 72);
  ctx.lineTo(goalX + 47, floorY - 62);
  ctx.lineTo(goalX + 23, floorY - 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f3ffff";
  ctx.font = "bold 10px Arial, sans-serif";
  ctx.textAlign = "center";
  const exitLabel = mission.requiredEnergy && state.energyCollected < mission.requiredEnergy
    ? "3 CELDAS"
    : (exitLocked ? "E · ACTIVAR" : "SALIDA");
  ctx.fillText(exitLabel, goalX, floorY - 94);
}
