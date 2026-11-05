/* Ajustes del recorrido: acorta el mundo y separa objetos para que no se superpongan. */

export function acortarMision(mission, factor) {
  const x = (valor) => Math.round(valor * factor);
  mission.world = x(mission.world);
  mission.gaps = mission.gaps.map(([inicio, fin]) => [x(inicio), x(fin)]);
  mission.blocks = mission.blocks.map(([posicion, alto, ancho]) => [x(posicion), alto, ancho]);
  mission.platforms = mission.platforms.map(([posicion, ancho, alto]) => [x(posicion), ancho, alto]);
  mission.movingPlatforms = (mission.movingPlatforms || []).map(([posicion, ancho, alto, movimiento, velocidad, fase]) => [x(posicion), ancho, alto, movimiento, velocidad, fase]);
  mission.orbs = mission.orbs.map(([posicion, altura]) => [x(posicion), altura]);
  mission.lasers = mission.lasers.map(([posicion, altura, periodo, fase, activo]) => [x(posicion), altura, periodo, fase, activo]);
  mission.station = x(mission.station);
  mission.impulsePads = (mission.impulsePads || []).map(x);
  mission.gravityWells = (mission.gravityWells || []).map(([posicion, altura, radio, fuerza]) => [x(posicion), altura, radio, fuerza]);
  if (mission.jetpack) {
    mission.jetpack.pickup[0] = x(mission.jetpack.pickup[0]);
    mission.jetpack.requiredGap = mission.jetpack.requiredGap.map(x);
  }
  if (mission.energyCells) mission.energyCells = mission.energyCells.map(([posicion, altura]) => [x(posicion), altura]);
}

export function separarObjetosMision(mission) {
  const reservados = [];
  const esHueco = (x, ancho = 0) => mission.gaps.some(([inicio, fin]) => x + ancho / 2 > inicio && x - ancho / 2 < fin);

  function libre(x, lift, forma, requiereSuelo) {
    if (x < 75 || x > mission.world - 100 || (requiereSuelo && esHueco(x, forma.width))) return false;
    const chocaCaja = mission.blocks.some(([boxX, boxHeight, boxWidth = 48]) => {
      const horizontal = Math.abs(x - (boxX + boxWidth / 2)) < (forma.width + boxWidth) / 2 + 28;
      const vertical = lift - forma.height / 2 < boxHeight + 6 && lift + forma.height / 2 > -6;
      return horizontal && vertical;
    });
    if (chocaCaja) return false;

    const plataformas = [
      ...(mission.platforms || []).map(([platformX, width, height]) => ({ x: platformX, width, top: height, bottom: height + 14 })),
      ...(mission.movingPlatforms || []).map(([platformX, width, height, movement]) => ({
        x: platformX,
        width,
        top: height - movement,
        bottom: height + movement + 14,
      })),
    ];
    const chocaPlataforma = plataformas.some((platform) => {
      const horizontal = Math.abs(x - (platform.x + platform.width / 2)) < (forma.width + platform.width) / 2 + 8;
      const vertical = lift - forma.height / 2 < platform.bottom + 6 && lift + forma.height / 2 > platform.top - 6;
      return horizontal && vertical;
    });
    if (chocaPlataforma) return false;

    const chocaLaser = mission.lasers.some(([laserX, laserHeight]) =>
      Math.abs(x - laserX) < forma.width / 2 + 20 && lift - forma.height / 2 < laserHeight
    );
    if (chocaLaser) return false;

    return !reservados.some((item) =>
      Math.abs(x - item.x) < (forma.width + item.forma.width) / 2 + 22 &&
      Math.abs(lift - item.lift) < (forma.height + item.forma.height) / 2 + 12
    );
  }

  function ubicar(x, lift, forma, requiereSuelo) {
    if (libre(x, lift, forma, requiereSuelo)) return x;
    for (let distancia = 28; distancia <= 672; distancia += 28) {
      for (const candidato of [x + distancia, x - distancia]) {
        if (libre(candidato, lift, forma, requiereSuelo)) return candidato;
      }
    }
    return x;
  }

  function reservar(x, lift, forma) {
    reservados.push({ x, lift, forma });
    return x;
  }

  const station = { width: 38, height: 76 };
  mission.station = reservar(ubicar(mission.station, 38, station, true), 38, station);

  const pad = { width: 48, height: 18 };
  mission.impulsePads = (mission.impulsePads || []).map((x) => reservar(ubicar(x, 9, pad, true), 9, pad));

  if (mission.jetpack) {
    const pickup = mission.jetpack.pickup;
    const backpack = { width: 38, height: 48 };
    pickup[0] = reservar(ubicar(pickup[0], pickup[1], backpack, true), pickup[1], backpack);
  }

  const orbShape = { width: 38, height: 38 };
  mission.orbs = mission.orbs.map(([x, lift]) => {
    const safeX = reservar(ubicar(x, lift, orbShape, false), lift, orbShape);
    return [safeX, lift];
  });

  const cellShape = { width: 28, height: 28 };
  if (mission.energyCells?.length) {
    mission.energyCells = mission.energyCells.map(([x, lift]) => {
      const safeX = reservar(ubicar(x, lift, cellShape, false), lift, cellShape);
      return [safeX, lift];
    });
  }
}
