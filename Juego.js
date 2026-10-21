document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("jugadorActual");
  if (localStorage.getItem("sesionActiva") !== "true" || !user) {
    location.href = "Login.html";
    return;
  }

  const missions = [
    {
      planet: "PLANETA 1 · MERCURIO",
      title: "El salto de impulso",
      description: "Cruzá la superficie de Mercurio, esquivá rocas y alcanzá el portal antes de quedarte sin oxígeno.",
      formula: "Física: impulso y gravedad · Objetivo: llegar al portal",
      fact: "¡Mercurio completado! Venus quedó desbloqueado.",
      gravity: 9.8, drain: 9.5, world: 2520,
      sky: ["#10213c", "#512d49"], ground: "#744654", surface: "#f0a079", rock: "#a85e61", accent: "#73f0d1",
      gaps: [[610, 700], [1290, 1380], [1900, 1985]],
      blocks: [[250, 42], [430, 56], [900, 48], [1110, 42], [1515, 54], [1740, 44], [2110, 48]],
      platforms: [[735, 118, 88], [1400, 132, 72], [1995, 125, 94]],
      orbs: [[500, 82], [1045, 112], [1665, 96], [2210, 92]],
      meteors: [[760, 126, 52, 16, 1.7, 0.3, 18], [1580, 152, 68, 22, 1.3, 1.8, 20], [2240, 116, 42, 14, 1.9, 3.2, 17]],
      lasers: [[985, 126, 2.4, 0.4, 0.52], [1835, 118, 2.8, 1.1, 0.48]],
      station: 1240, refill: 36
    },
    {
      planet: "PLANETA 2 · VENUS",
      title: "Gravedad entre nubes",
      description: "Saltá entre formaciones rocosas y plataformas de nubes. La gravedad de Venus cambia la caída.",
      formula: "Física: gravedad de 8,9 m/s² · Reuní oxígeno y llegá a la baliza",
      fact: "¡Venus completado! La gravedad cambió tu recorrido y llegaste a salvo.",
      gravity: 8.9, drain: 9.7, world: 2580,
      sky: ["#351e42", "#a45252"], ground: "#7a4b50", surface: "#f5ba79", rock: "#b96553", accent: "#82f4dc",
      gaps: [[520, 620], [1130, 1235], [1810, 1915]],
      blocks: [[260, 45], [805, 60], [1010, 44], [1510, 52], [2070, 58], [2300, 40]],
      platforms: [[635, 130, 105], [925, 110, 82], [1255, 125, 118], [1645, 130, 90], [1940, 128, 110]],
      orbs: [[420, 88], [875, 128], [1550, 115], [2200, 98]],
      meteors: [[705, 142, 48, 20, 1.4, 0.7, 19], [1450, 124, 65, 18, 1.8, 2.1, 18], [2265, 146, 42, 20, 1.2, 3.7, 20]],
      lasers: [[940, 132, 2.6, 0.2, 0.5], [1750, 124, 2.9, 1.4, 0.46]],
      station: 1110, refill: 36
    },
    {
      planet: "PLANETA 3 · TIERRA",
      title: "Ruta de inercia",
      description: "Atravesá una estación orbital con tramos móviles y cajas. Conservá el impulso y administrá el oxígeno.",
      formula: "Física: inercia · Un cuerpo conserva su movimiento si no actúa otra fuerza",
      fact: "¡Tierra completada! Mantuviste el impulso y alcanzaste la salida.",
      gravity: 9.81, drain: 9.4, world: 2600,
      sky: ["#092c4b", "#245e72"], ground: "#334b59", surface: "#7be0c7", rock: "#486d78", accent: "#81f5e7",
      gaps: [[650, 760], [1450, 1560], [2080, 2170]],
      blocks: [[315, 50], [500, 38], [965, 60], [1190, 46], [1650, 52], [1870, 44], [2300, 50]],
      platforms: [[785, 128, 82], [1330, 110, 100], [1580, 140, 92], [1945, 118, 110], [2190, 120, 78]],
      orbs: [[565, 105], [1080, 96], [1780, 122], [2390, 92]],
      meteors: [[845, 132, 70, 18, 1.6, 0.8, 18], [1785, 148, 58, 21, 1.2, 2.4, 21], [2360, 116, 50, 14, 1.9, 4.1, 17]],
      lasers: [[1125, 120, 2.5, 0.7, 0.5], [2030, 135, 2.7, 1.5, 0.5]],
      station: 1430, refill: 36
    },
    {
      planet: "PLANETA 4 · MARTE",
      title: "Cruce del gran cráter",
      description: "Recogé el jetpack antes del gran cráter. Mantené J para impulsarte y cruzar el vacío; sin la mochila no se puede pasar.",
      formula: "Misión especial: recogé el jetpack y mantené J durante el cruce",
      fact: "¡Marte completado! Cruzaste el cráter usando la gravedad a tu favor.",
      gravity: 3.71, drain: 9.6, world: 2780,
      sky: ["#281d37", "#813e45"], ground: "#82494b", surface: "#ffc078", rock: "#b55d50", accent: "#87f3d0",
      gaps: [[500, 620], [1270, 1980], [2340, 2430]],
      blocks: [[270, 40], [770, 48], [1035, 38], [2085, 58], [2225, 42], [2480, 50], [2640, 42]],
      platforms: [[635, 126, 94], [1010, 120, 112], [1995, 132, 104], [2290, 124, 88], [2440, 128, 100]],
      orbs: [[425, 105], [1110, 115], [2150, 105], [2585, 122]],
      meteors: [[720, 142, 50, 18, 1.3, 0.8, 19], [2215, 150, 54, 20, 1.6, 2.7, 20], [2605, 118, 38, 15, 1.8, 4.2, 17]],
      lasers: [[975, 125, 2.7, 0.8, 0.5], [2390, 126, 2.8, 1.7, 0.48], [2530, 118, 2.5, 2.2, 0.5]],
      station: 1190, refill: 38,
      jetpack: { pickup: [835, 74], requiredGap: [1270, 1980], burn: 32, thrust: 1100, maxRise: 520 }
    },
    {
      planet: "PLANETA 5 · JÚPITER",
      title: "Salto bajo alta gravedad",
      description: "La gravedad de Júpiter te atrae con fuerza. Calculá bien cada salto, recargá el tanque y seguí.",
      formula: "Física: gravedad de Júpiter · Saltos breves y controlados",
      fact: "¡Júpiter completado! Superaste la alta gravedad y llegaste a la ruta de rescate.",
      gravity: 24.79, drain: 9.3, world: 2550,
      sky: ["#261d34", "#76503c"], ground: "#705044", surface: "#eeb771", rock: "#a35e49", accent: "#7ef5d8",
      gaps: [[570, 660], [1260, 1350], [1910, 2000]],
      blocks: [[260, 48], [410, 38], [830, 56], [1030, 42], [1460, 52], [1690, 45], [2130, 54], [2310, 42]],
      platforms: [[680, 120, 72], [1365, 122, 70], [2015, 118, 74]],
      orbs: [[475, 74], [970, 102], [1615, 88], [2245, 94]],
      meteors: [[740, 132, 48, 16, 1.8, 0.6, 18], [1530, 138, 70, 18, 1.4, 2.2, 20], [2220, 108, 45, 15, 1.9, 3.7, 18]],
      lasers: [[1070, 118, 2.5, 0.9, 0.52], [1840, 130, 2.9, 1.8, 0.48]],
      station: 1240, refill: 38
    },
    {
      planet: "PLANETA 6 · SATURNO",
      title: "Energía para el nuevo hogar",
      description: "Recorré los anillos de Saturno, juntá las últimas reservas de oxígeno y activá la baliza final.",
      formula: "Física: energía y movimiento · Objetivo: completar la misión",
      fact: "¡Misión cumplida! Llegaste al nuevo hogar con la tripulación a salvo.",
      gravity: 10.44, drain: 9.5, world: 2700,
      sky: ["#15223b", "#644759"], ground: "#59465b", surface: "#f0c17c", rock: "#906178", accent: "#8ff4dd",
      gaps: [[590, 690], [1290, 1400], [1970, 2080]],
      blocks: [[260, 46], [445, 54], [875, 42], [1080, 58], [1510, 48], [1740, 56], [2210, 44], [2415, 50]],
      platforms: [[715, 126, 92], [1415, 132, 102], [2095, 132, 94]],
      orbs: [[500, 90], [1040, 112], [1670, 118], [2350, 100]],
      meteors: [[760, 130, 58, 18, 1.6, 0.5, 19], [1620, 150, 62, 20, 1.3, 2.5, 21], [2375, 118, 45, 18, 1.8, 4.0, 18]],
      lasers: [[1155, 124, 2.6, 0.6, 0.5], [1840, 132, 2.7, 1.7, 0.5], [2460, 116, 2.9, 2.2, 0.48]],
      station: 1270, refill: 40
    }
  ];

  const level = Math.max(1, Math.min(missions.length, Number(new URLSearchParams(location.search).get("nivel")) || 1));
  const mission = missions[level - 1];
  const progress = JuegoDB.progress(user);
  if (level > progress.nivel && !progress.completados.includes(level)) {
    location.href = "Niveles.html";
    return;
  }

  document.getElementById("jugador").textContent = user;
  const status = document.getElementById("estado");
  status.textContent = "PLANETA " + level + " / 6 · " + progress.puntuacion + " PUNTOS";
  document.getElementById("planeta").textContent = mission.planet;
  document.getElementById("titulo").textContent = mission.title;
  document.getElementById("descripcion").textContent = mission.description;
  document.getElementById("formula").textContent = mission.formula;

  const next = document.getElementById("siguiente");
  const platformMessage = document.getElementById("mensajePlataforma");
  const retry = document.getElementById("reintentar");
  const fuelFill = document.getElementById("barraCombustible");
  const fuelValue = document.getElementById("valorCombustible");
  const hearts = document.getElementById("corazones");
  const jetpackPanel = document.getElementById("jetpackPanel");
  const jetpackFill = document.getElementById("barraJetpack");
  const jetpackValue = document.getElementById("valorJetpack");
  let solved = progress.completados.includes(level);
  const launch = JuegoDB.startLevel(user, level, 15);
  const noFuel = !launch.ok;
  next.textContent = level === missions.length ? "VER FINAL DE MISIÓN →" : "VOLVER AL MAPA · NIVEL " + (level + 1) + " DESBLOQUEADO →";
  next.hidden = !solved;
  next.addEventListener("click", () => {
    location.href = !noFuel && level === missions.length ? "Final.html" : "Niveles.html";
  });
  retry.addEventListener("click", () => game.restart());

  function updateFuelHud(value) {
    const amount = Math.max(0, Math.min(100, Math.floor(value)));
    fuelFill.style.width = amount + "%";
    fuelFill.parentElement.setAttribute("aria-valuenow", String(amount));
    fuelValue.textContent = amount + "%";
  }
  function updateHearts(lives) {
    hearts.textContent = [0, 1, 2].map(function (index) { return index < lives ? "♥" : "♡"; }).join(" ");
    hearts.setAttribute("aria-label", lives + (lives === 1 ? " vida" : " vidas"));
  }
  function updateJetpackHud(value, collected) {
    const amount = Math.max(0, Math.min(100, Math.floor(value)));
    jetpackPanel.hidden = !mission.jetpack;
    if (!mission.jetpack) return;
    jetpackFill.style.width = amount + "%";
    jetpackFill.parentElement.setAttribute("aria-valuenow", String(amount));
    jetpackValue.textContent = collected ? (amount > 0 ? "CARGA " + amount + "% · MANTENÉ J" : "SIN CARGA") : "BUSCÁ LA MOCHILA";
  }
  updateFuelHud(launch.combustible ?? progress.combustible ?? 100);
  updateHearts(3);
  updateJetpackHud(100, false);

  platformMessage.textContent = solved
    ? "Nivel completado. Podés volver a jugar o regresar al mapa."
    : (mission.jetpack
      ? "El oxígeno baja. Recogé el jetpack antes del cráter y mantené J para cruzar el tramo largo."
      : "Tenés 3 vidas. Esquivá meteoritos y rayos láser, y recogé orbes para recargar oxígeno.");
  if (!solved && launch.cobrado) platformMessage.textContent += " Se gastaron 15% de combustible de la nave.";

  if (!launch.ok) {
    platformMessage.textContent = launch.error + " Completá otro nivel para recuperar combustible.";
    next.textContent = "VOLVER AL MAPA";
    next.hidden = false;
    return;
  }

  const oxygenFill = document.getElementById("barraOxigeno");
  const oxygenValue = document.getElementById("valorOxigeno");
  const orbCount = document.getElementById("contadorOrbes");

  function updateOxygenHud(oxygenPercent, collected, totalOrbs) {
    const value = Math.max(0, Math.ceil(oxygenPercent));
    oxygenFill.style.width = value + "%";
    oxygenFill.parentElement.setAttribute("aria-valuenow", String(value));
    oxygenFill.classList.toggle("critico", value <= 25);
    oxygenValue.textContent = value + "%";
    orbCount.textContent = collected + " / " + totalOrbs + " orbes";
  }
  updateOxygenHud(100, 0, mission.orbs.length);

  function completeLevel() {
    if (solved) {
      platformMessage.textContent = "Ya habías completado este nivel. El siguiente está disponible en el mapa.";
      next.hidden = false;
      return;
    }
    if (!JuegoDB.complete(user, level, 100)) {
      platformMessage.textContent = "No se pudo guardar el progreso. Revisá la sesión e intentá otra vez.";
      return;
    }
    fetch("../api/puntuaciones/nivel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: user, nivel: level }),
    }).catch(() => {});
    solved = true;
    const updated = JuegoDB.progress(user);
    updateFuelHud(updated.combustible);
    status.textContent = "PLANETA " + level + " / 6 · " + updated.puntuacion + " PUNTOS";
    platformMessage.textContent = "✅ " + mission.fact + " +100 puntos · Combustible recuperado: " + updated.combustible + "%";
    next.hidden = false;
  }

  const canvas = document.getElementById("escena");
  const game = animatePlatformer(canvas, mission, {
    onOxygenChange: function (value, collected, total) {
      updateOxygenHud(value, collected, total);
    },
    onMessage: function (message) {
      platformMessage.textContent = message;
    },
    onLivesChange: updateHearts,
    onJetpackChange: updateJetpackHud,
    onGameOver: function () {
      platformMessage.textContent = "Perdiste las 3 vidas. Reintentá el nivel; no se vuelve a cobrar el combustible de esta misión.";
      retry.hidden = false;
    },
    onRestart: function () {
      retry.hidden = true;
      next.hidden = !solved;
    },
    onComplete: completeLevel,
  });
});

function animatePlatformer(canvas, mission, callbacks) {
  const ctx = canvas.getContext("2d");
  const keys = new Set();
  const player = { x: 34, y: 0, vx: 0, vy: 0, width: 34, height: 48, grounded: false };
  const orbs = mission.orbs.map(function (orb) {
    return { x: orb[0], lift: orb[1], collected: false };
  });
  const meteors = mission.meteors || [];
  const lasers = mission.lasers || [];
  const worldLength = mission.world;
  const speed = 265;
  const baseGravity = 910;
  const gravity = baseGravity * mission.gravity / 9.8;
  const jumpSpeed = 575 * Math.sqrt(mission.gravity / 9.8);
  let lastTime = 0;
  let lastFloor = null;
  let walkTime = 0;
  let oxygen = 100;
  let collected = 0;
  let stationUsed = false;
  let finished = false;
  let gameOver = false;
  let lives = 3;
  let invulnerability = 0;
  let jetpackCollected = false;
  let jetpackFuel = 100;
  let jetpackUsedInGap = false;
  let camera = 0;
  let lastReportedOxygen = 100;
  let lastReportedJetpack = 100;

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    const jump = key === "w" || key === "arrowup" || event.code === "Space";
    const left = key === "a" || key === "arrowleft";
    const right = key === "d" || key === "arrowright";
    const jetpack = key === "j";
    if (!jump && !left && !right && !jetpack) return;
    if (event.code === "Space" && event.target.closest && event.target.closest("button, a, input, select, textarea")) return;
    if (event.code === "Space" || key.indexOf("arrow") === 0) event.preventDefault();
    if (finished || gameOver) return;
    if (jetpack) {
      if (!mission.jetpack || !jetpackCollected || jetpackFuel <= 0) return;
      event.preventDefault();
      if (!keys.has("jetpack") && player.grounded) {
        player.vy = -jumpSpeed * 0.68;
        player.grounded = false;
      }
      keys.add("jetpack");
      return;
    }
    if (jump && !keys.has("jump") && player.grounded) {
      player.vy = -jumpSpeed;
      player.grounded = false;
    }
    if (left) keys.add("left");
    if (right) keys.add("right");
    if (jump) keys.add("jump");
  }

  function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") keys.delete("left");
    if (key === "d" || key === "arrowright") keys.delete("right");
    if (key === "w" || key === "arrowup" || event.code === "Space") keys.delete("jump");
    if (key === "j") keys.delete("jetpack");
  }

  function clearKeys() { keys.clear(); }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearKeys);
  callbacks.onLivesChange(lives);
  callbacks.onJetpackChange(jetpackFuel, jetpackCollected);

  function getGroundSegments() {
    const gaps = mission.gaps.slice().sort(function (a, b) { return a[0] - b[0]; });
    const segments = [];
    let cursor = 0;
    gaps.forEach(function (gap) {
      if (gap[0] > cursor) segments.push({ x: cursor, w: gap[0] - cursor });
      cursor = gap[1];
    });
    if (cursor < worldLength) segments.push({ x: cursor, w: worldLength - cursor });
    return segments;
  }
  const groundSegments = getGroundSegments();

  function getRects(floorY) {
    const rects = [];
    mission.blocks.forEach(function (block) {
      rects.push({ x: block[0], y: floorY - block[1], w: block[2] || 48, h: block[1], type: "block" });
    });
    mission.platforms.forEach(function (platform) {
      rects.push({ x: platform[0], y: floorY - platform[2], w: platform[1], h: 14, type: "platform" });
    });
    return rects;
  }

  function resetPlayer(floorY) {
    player.x = 34;
    player.y = floorY - player.height;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    oxygen = 100;
    collected = 0;
    stationUsed = false;
    orbs.forEach(function (orb) { orb.collected = false; });
    jetpackCollected = false;
    jetpackFuel = 100;
    jetpackUsedInGap = false;
    invulnerability = 1.4;
    clearKeys();
    callbacks.onOxygenChange(oxygen, collected, orbs.length);
    callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
  }

  function loseLife(message, floorY) {
    if (invulnerability > 0 || gameOver || finished) return;
    lives = Math.max(0, lives - 1);
    callbacks.onLivesChange(lives);
    resetPlayer(floorY);
    if (lives === 0) {
      gameOver = true;
      invulnerability = 0;
      callbacks.onGameOver();
      callbacks.onMessage("Se agotaron los 3 corazones. Podés reintentar el nivel.");
      return;
    }
    callbacks.onMessage(message + " Perdiste un corazón; te quedan " + lives + ".");
  }

  function restart() {
    lives = 3;
    gameOver = false;
    finished = false;
    lastReportedOxygen = 100;
    if (lastFloor !== null) resetPlayer(lastFloor);
    invulnerability = 1.1;
    callbacks.onLivesChange(lives);
    callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
    callbacks.onRestart();
    callbacks.onMessage("Nuevo intento: tenés 3 corazones y el combustible de la nave ya está cargado.");
  }

  function meteorPosition(meteor, floorY, time) {
    const phase = meteor[5] || 0;
    const speed = meteor[4] || 1.5;
    return {
      x: meteor[0] + Math.sin(time / 1000 * speed + phase) * (meteor[2] || 0),
      y: floorY - meteor[1] + Math.sin(time / 1000 * speed * 1.3 + phase) * (meteor[3] || 0),
      radius: meteor[6] || 18
    };
  }

  function laserIsActive(laser, time) {
    const period = laser[2] || 2.5;
    const phase = laser[3] || 0;
    const ratio = laser[4] || 0.5;
    const step = ((time / 1000 + phase) % period + period) % period;
    return step < period * ratio;
  }

  function collidesWithHazard(floorY, time) {
    for (let i = 0; i < meteors.length; i++) {
      const meteor = meteorPosition(meteors[i], floorY, time);
      const nearX = Math.max(player.x, Math.min(meteor.x, player.x + player.width));
      const nearY = Math.max(player.y, Math.min(meteor.y, player.y + player.height));
      const dx = meteor.x - nearX;
      const dy = meteor.y - nearY;
      if (dx * dx + dy * dy <= (meteor.radius + 2) * (meteor.radius + 2)) return "Te golpeó un meteorito.";
    }
    for (let i = 0; i < lasers.length; i++) {
      const laser = lasers[i];
      if (!laserIsActive(laser, time)) continue;
      const top = floorY - laser[1];
      const beamWidth = 12;
      const touchesX = player.x + player.width > laser[0] - beamWidth / 2 && player.x < laser[0] + beamWidth / 2;
      const touchesY = player.y + player.height > top && player.y < floorY;
      if (touchesX && touchesY) return "Te alcanzó un rayo láser.";
    }
    return "";
  }

  function drawPlayer(x, y, floorY, dt) {
    const centerX = x + player.width / 2;
    const stride = player.grounded && player.vx ? Math.sin(walkTime) * 3 : 0;
    if (mission.jetpack && jetpackCollected) {
      ctx.fillStyle = "#8094a9";
      ctx.fillRect(centerX - 16, y + 22, 8, 17);
      ctx.fillStyle = "#40c9ff";
      ctx.fillRect(centerX - 15, y + 25, 6, 8);
      if (keys.has("jetpack") && jetpackFuel > 0) {
        ctx.fillStyle = "#ffb54e";
        ctx.beginPath();
        ctx.moveTo(centerX - 13, y + 39);
        ctx.lineTo(centerX - 9, y + 50);
        ctx.lineTo(centerX - 5, y + 39);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.fillStyle = "rgba(7, 12, 24, .35)";
    ctx.beginPath();
    ctx.ellipse(centerX, floorY + 3, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e2a153";
    ctx.fillRect(centerX - 14, y + 20, 7, 18);
    ctx.fillStyle = "#55cfe2";
    ctx.beginPath();
    ctx.roundRect(centerX - 9, y + 16, 19, 25, 6);
    ctx.fill();
    ctx.fillStyle = "#8bf4f7";
    ctx.beginPath();
    ctx.arc(centerX, y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#163b56";
    ctx.beginPath();
    ctx.ellipse(centerX + (player.vx >= 0 ? 3 : -3), y + 10, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f0c677";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(centerX - 5, y + 39);
    ctx.lineTo(centerX - 6 + stride, y + 47);
    ctx.moveTo(centerX + 5, y + 39);
    ctx.lineTo(centerX + 6 - stride, y + 47);
    ctx.stroke();
    ctx.fillStyle = "#b5f4f2";
    ctx.beginPath();
    ctx.roundRect(centerX + 8, y + 22, 8, 14, 3);
    ctx.fill();
  }

  function draw(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (!width || !height) {
      requestAnimationFrame(draw);
      return;
    }
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const zoom = Math.max(0.72, Math.min(1.12, width / 720));
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
    const floorY = viewHeight - 30;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 0;
    lastTime = time;

    if (lastFloor === null) {
      player.y = floorY - player.height;
      player.grounded = true;
    } else if (lastFloor !== floorY) {
      player.y += floorY - lastFloor;
    }
    lastFloor = floorY;

    const rects = getRects(floorY);
    const previousX = player.x;
    const previousY = player.y;

    if (!finished && !gameOver && dt > 0) {
      if (invulnerability > 0) invulnerability = Math.max(0, invulnerability - dt);
      oxygen = Math.max(0, oxygen - mission.drain * dt);
      if (oxygen <= 0) {
        loseLife("Se terminó el oxígeno. El traje te devolvió al inicio con el tanque lleno.", floorY);
      } else {
        const direction = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
        player.vx = direction * speed;
        player.x = Math.max(0, Math.min(worldLength - player.width, player.x + player.vx * dt));

        rects.forEach(function (rect) {
          const vertical = player.y + player.height > rect.y + 2 && player.y < rect.y + rect.h - 1;
          const horizontal = player.x + player.width > rect.x && player.x < rect.x + rect.w;
          if (!vertical || !horizontal) return;
          if (direction > 0 && previousX + player.width <= rect.x + 2) player.x = rect.x - player.width;
          else if (direction < 0 && previousX >= rect.x + rect.w - 2) player.x = rect.x + rect.w;
        });

        const usingJetpack = Boolean(mission.jetpack && jetpackCollected && keys.has("jetpack") && jetpackFuel > 0);
        if (usingJetpack) {
          player.vy = Math.max(-mission.jetpack.maxRise, player.vy - mission.jetpack.thrust * dt);
          jetpackFuel = Math.max(0, jetpackFuel - mission.jetpack.burn * dt);
          const gap = mission.jetpack.requiredGap;
          if (gap && player.x + player.width > gap[0] && player.x < gap[1] && player.y + player.height < floorY - 5) jetpackUsedInGap = true;
          if (Math.ceil(jetpackFuel) !== lastReportedJetpack) {
            lastReportedJetpack = Math.ceil(jetpackFuel);
            callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
          }
        }
        player.vy += gravity * dt;
        player.y += player.vy * dt;
        player.grounded = false;

        if (player.vy >= 0) {
          let landingY = null;
          rects.forEach(function (rect) {
            const overlapsX = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
            const oldBottom = previousY + player.height;
            const newBottom = player.y + player.height;
            if (overlapsX && oldBottom <= rect.y + 4 && newBottom >= rect.y && (landingY === null || rect.y < landingY)) {
              landingY = rect.y;
            }
          });
          groundSegments.forEach(function (segment) {
            const overlapsX = player.x + player.width > segment.x + 2 && player.x < segment.x + segment.w - 2;
            const oldBottom = previousY + player.height;
            const newBottom = player.y + player.height;
            if (overlapsX && oldBottom <= floorY + 4 && newBottom >= floorY && (landingY === null || floorY < landingY)) {
              landingY = floorY;
            }
          });
          if (landingY !== null) {
            player.y = landingY - player.height;
            player.vy = 0;
            player.grounded = true;
          }
        } else {
          rects.forEach(function (rect) {
            const overlapsX = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
            const oldTop = previousY;
            const newTop = player.y;
            const bottom = rect.y + rect.h;
            if (overlapsX && oldTop >= bottom - 2 && newTop <= bottom) {
              player.y = bottom;
              player.vy = 0;
            }
          });
        }

        if (direction) walkTime += dt * 11;

        const hazardHit = collidesWithHazard(floorY, time);
        if (hazardHit) loseLife(hazardHit, floorY);

        if (mission.jetpack && !jetpackCollected) {
          const pickupX = mission.jetpack.pickup[0];
          const pickupY = floorY - mission.jetpack.pickup[1];
          const playerCenterX = player.x + player.width / 2;
          const playerCenterY = player.y + player.height / 2;
          if (Math.abs(playerCenterX - pickupX) < 42 && Math.abs(playerCenterY - pickupY) < 58) {
            jetpackCollected = true;
            callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
            callbacks.onMessage("¡Jetpack recogido! Mantené J para impulsarte y cruzar el cráter ancho.");
          }
        }

        for (let i = 0; i < orbs.length; i++) {
          const orb = orbs[i];
          if (orb.collected) continue;
          const orbY = floorY - orb.lift;
          const dx = player.x + player.width / 2 - orb.x;
          const dy = player.y + player.height / 2 - orbY;
          if (dx * dx + dy * dy < 34 * 34) {
            orb.collected = true;
            collected++;
            oxygen = Math.min(100, oxygen + mission.refill);
            callbacks.onMessage("¡Recogiste una orbe de oxígeno! El tanque se recargó.");
          }
        }

        if (!stationUsed && player.x + player.width >= mission.station) {
          stationUsed = true;
          oxygen = 100;
          callbacks.onMessage("¡Llegaste a la estación de recarga! Oxígeno al 100%.");
        }

        if (player.y > viewHeight + 80) {
          loseLife("Caíste en un cráter. Volviste al inicio con oxígeno completo.", floorY);
        }

        if (mission.jetpack && player.x > mission.jetpack.requiredGap[1] && !jetpackUsedInGap) {
          player.x = mission.jetpack.requiredGap[1] - player.width - 6;
          player.vx = 0;
          callbacks.onMessage("El cráter requiere el jetpack. Recogelo y mantené J durante el cruce.");
        }

        if (player.x + player.width >= worldLength - 78) {
          finished = true;
          player.vx = 0;
          clearKeys();
          callbacks.onComplete();
        }
      }
    }

    if (Math.ceil(oxygen) !== lastReportedOxygen) {
      lastReportedOxygen = Math.ceil(oxygen);
      callbacks.onOxygenChange(oxygen, collected, orbs.length);
    }

    const background = ctx.createLinearGradient(0, 0, 0, viewHeight);
    background.addColorStop(0, mission.sky[0]);
    background.addColorStop(1, mission.sky[1]);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    for (let i = 0; i < 34; i++) {
      let sx = (i * 139 + 31 - camera * 0.18) % (viewWidth + 80);
      if (sx < -2) sx += viewWidth + 80;
      const sy = (i * 53 + 17) % Math.max(1, floorY - 55);
      ctx.globalAlpha = 0.25 + (i % 4) * 0.13;
      ctx.fillStyle = "#e6f8ff";
      ctx.fillRect(sx, sy, i % 5 === 0 ? 3 : 2, i % 5 === 0 ? 3 : 2);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(9, 19, 35, .26)";
    for (let i = -1; i < Math.ceil(viewWidth / 380) + 2; i++) {
      const mx = i * 380 - (camera * 0.34 % 380);
      ctx.beginPath();
      ctx.moveTo(mx, floorY);
      ctx.lineTo(mx + 100, floorY - 48 - (i % 2) * 15);
      ctx.lineTo(mx + 220, floorY);
      ctx.closePath();
      ctx.fill();
    }

    camera = Math.max(0, Math.min(worldLength - viewWidth, player.x - viewWidth * 0.34));
    ctx.save();
    ctx.translate(-camera, 0);

    groundSegments.forEach(function (segment) {
      ctx.fillStyle = mission.ground;
      ctx.fillRect(segment.x, floorY, segment.w, viewHeight - floorY);
      ctx.fillStyle = mission.surface;
      ctx.fillRect(segment.x, floorY, segment.w, 4);
    });

    for (let x = Math.floor(camera / 95) * 95; x < camera + viewWidth + 100; x += 95) {
      const rockY = floorY + 9 + (Math.floor(x / 95) % 2) * 7;
      ctx.fillStyle = mission.rock;
      ctx.beginPath();
      ctx.ellipse(x + 24, rockY, 6 + (Math.floor(x / 95) % 3) * 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    mission.platforms.forEach(function (platform) {
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

    mission.blocks.forEach(function (block) {
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

    meteors.forEach(function (meteor) {
      const position = meteorPosition(meteor, floorY, time);
      if (position.x < camera - 60 || position.x > camera + viewWidth + 60) return;
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(time / 450 + (meteor[5] || 0));
      ctx.shadowColor = "#ff813f";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffb447";
      ctx.beginPath();
      ctx.moveTo(-position.radius - 12, -5);
      ctx.lineTo(-position.radius - 32, -12);
      ctx.lineTo(-position.radius - 19, 0);
      ctx.lineTo(-position.radius - 31, 10);
      ctx.closePath();
      ctx.fill();
      const meteorGradient = ctx.createRadialGradient(-5, -6, 2, 0, 0, position.radius);
      meteorGradient.addColorStop(0, "#ffe4a4");
      meteorGradient.addColorStop(.48, "#ea6a45");
      meteorGradient.addColorStop(1, "#743349");
      ctx.fillStyle = meteorGradient;
      ctx.beginPath();
      ctx.arc(0, 0, position.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,225,173,.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-3, -3, position.radius * .55, .3, 2.2);
      ctx.stroke();
      ctx.restore();
    });

    lasers.forEach(function (laser) {
      if (laser[0] < camera - 50 || laser[0] > camera + viewWidth + 50) return;
      const top = floorY - laser[1];
      const active = laserIsActive(laser, time);
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

    if (mission.jetpack && !jetpackCollected) {
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

    orbs.forEach(function (orb, index) {
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

    const goalX = worldLength - 58;
    ctx.save();
    ctx.shadowColor = mission.accent;
    ctx.shadowBlur = 22;
    ctx.strokeStyle = mission.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(goalX, floorY - 43, 18, 39, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#fff4ca";
    ctx.fillRect(goalX + 20, floorY - 75, 3, 73);
    ctx.fillStyle = mission.accent;
    ctx.beginPath();
    ctx.moveTo(goalX + 23, floorY - 72);
    ctx.lineTo(goalX + 47, floorY - 62);
    ctx.lineTo(goalX + 23, floorY - 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f3ffff";
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SALIDA", goalX, floorY - 94);

    if (invulnerability <= 0 || Math.floor(time / 100) % 2 === 0) drawPlayer(player.x, player.y, floorY, dt);
    ctx.restore();

    ctx.fillStyle = "#f3fbff";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PLANETA " + (mission.planet.split("·")[1] || "").trim() + " · GRAVEDAD " + mission.gravity.toString().replace(".", ",") + " m/s²", 14, viewHeight - 12);
    const progressWidth = Math.min(150, viewWidth * 0.3);
    ctx.fillStyle = "rgba(8, 18, 33, .65)";
    ctx.fillRect(viewWidth - progressWidth - 14, 14, progressWidth, 6);
    ctx.fillStyle = mission.accent;
    ctx.fillRect(viewWidth - progressWidth - 14, 14, progressWidth * Math.max(0, Math.min(1, player.x / worldLength)), 6);

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return { restart: restart };
}

