document.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("jugadorActual");
  const guestMode = localStorage.getItem("modoInvitado") === "true";
  if ((localStorage.getItem("sesionActiva") !== "true" && !guestMode) || !user) {
    location.href = "Login.html";
    return;
  }

  const missions = [
    {
      planet: "PLANETA 1 · MERCURIO",
      title: "Impulso: cráteres de Mercurio",
      description: "Activá con E las plataformas amarillas junto a los bordes: el impulso extra te permite cruzar los cráteres largos.",
      formula: "Física: impulso = cambio de cantidad de movimiento · E sobre una plataforma amarilla",
      fact: "¡Mercurio completado! Venus quedó desbloqueado.",
      gravity: 3.7, jumpSpeed: 300, impulseSpeed: 440, drain: 9.5, world: 2520,
      sky: ["#10213c", "#512d49"], ground: "#744654", surface: "#f0a079", rock: "#a85e61", accent: "#73f0d1",
      gaps: [[620, 1120], [1420, 1920]],
      blocks: [[250, 42], [430, 56], [1190, 48], [1320, 42], [1985, 54], [2160, 44], [2310, 48]],
      platforms: [[1128, 118, 88], [1930, 132, 72]],
      orbs: [[500, 82], [1190, 112], [1665, 96], [2210, 92]],
      lasers: [[1285, 126, 2.4, 0.4, 0.52], [2075, 118, 2.8, 1.1, 0.48]],
      station: 1240, refill: 36,
      ability: { type: "impulse", key: "E", label: "IMPULSO", hint: "E sobre una plataforma amarilla junto al borde" },
      impulsePads: [570, 1370]
    },
    {
      planet: "PLANETA 2 · VENUS",
      title: "Gravedad entre nubes",
      description: "Los cráteres de Venus son más anchos que un salto normal. Activá E en el aire para reducir la gravedad por unos segundos y llegar a las plataformas elevadas.",
      formula: "Física: gravedad de 8,90 m/s² · E activa un pulso de baja gravedad durante el salto",
      fact: "¡Venus completado! La gravedad cambió tu recorrido y llegaste a salvo.",
      gravity: 8.9, drain: 9.7, world: 2580,
      sky: ["#351e42", "#a45252"], ground: "#7a4b50", surface: "#f5ba79", rock: "#b96553", accent: "#82f4dc",
      gaps: [[500, 850], [1190, 1540], [1900, 2250]],
      blocks: [[260, 45], [805, 60], [1010, 44], [1510, 52], [2070, 58], [2300, 40]],
      platforms: [[635, 130, 80], [925, 110, 65], [1255, 125, 86], [1645, 130, 72], [1940, 128, 82]],
      orbs: [[420, 88], [875, 128], [1550, 115], [2200, 98]],
      lasers: [[940, 132, 2.6, 0.2, 0.5], [1750, 124, 2.9, 1.4, 0.46]],
      station: 1110, refill: 36,
      ability: { type: "gravity", key: "E", label: "PULSO GRAVITATORIO", hint: "E reduce la gravedad durante el salto; esperá entre pulsos" },
      gravityPulse: { duration: 1.8, factor: 0.3, cooldown: 3.2 }
    },
    {
      planet: "PLANETA 3 · LUNA",
      title: "Inercia lunar",
      description: "La gravedad lunar es baja y el astronauta conserva su velocidad. Cruzá los cráteres usando plataformas móviles y E para frenar antes de aterrizar.",
      formula: "Física: inercia y gravedad lunar · E aplica el freno inercial",
      fact: "¡Luna completada! Controlaste la inercia y alcanzaste la salida.",
      gravity: 1.62, jumpSpeed: 185, drain: 9.4, world: 3380,
      sky: ["#101c32", "#34495d"], ground: "#394653", surface: "#c1d8e8", rock: "#596879", accent: "#a8e9ff",
      gaps: [[620, 1320], [1520, 2220], [2420, 3120]],
      blocks: [[315, 50], [500, 38], [1370, 60], [1470, 46], [2270, 52], [2360, 44], [3170, 50]],
      platforms: [],
      orbs: [[565, 105], [1090, 95], [1810, 122], [2980, 92]],
      lasers: [[1130, 110, 2.5, 0.7, 0.5], [2115, 120, 2.7, 1.5, 0.5]],
      station: 1420, refill: 36,
      ability: { type: "brake", key: "E", label: "FRENO INERCIAL", hint: "E frena el deslizamiento; soltá D antes de aterrizar" },
      inertia: true,
      movingPlatforms: [[1040, 78, 72, 18, 1, 0], [1940, 76, 70, 18, 0.85, 1.2], [2840, 74, 72, 17, 0.9, 2.1]]
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
      lasers: [[975, 125, 2.7, 0.8, 0.5], [2390, 126, 2.8, 1.7, 0.48], [2530, 118, 2.5, 2.2, 0.5]],
      station: 1190, refill: 38,
      ability: { type: "jetpack", key: "J", label: "JETPACK", hint: "Recogé la mochila y mantené J o el botón JETPACK" },
      jetpack: { pickup: [835, 74], requiredGap: [1270, 1980], burn: 32, thrust: 1100, maxRise: 520 }
    },
    {
      planet: "PLANETA 5 · JÚPITER",
      title: "Asistencia gravitatoria",
      description: "Júpiter tiene una gravedad muy alta: los saltos normales no cruzan los cortes. Acercate a cada campo violeta y activá E para recibir un impulso gravitatorio hacia adelante.",
      formula: "Física: atracción gravitatoria · E junto a un campo violeta impulsa la trayectoria",
      fact: "¡Júpiter completado! Superaste la alta gravedad y llegaste a la ruta de rescate.",
      gravity: 24.79, drain: 9.3, world: 2550,
      sky: ["#261d34", "#76503c"], ground: "#705044", surface: "#eeb771", rock: "#a35e49", accent: "#7ef5d8",
      gaps: [[650, 830], [1350, 1530], [2070, 2250]],
      blocks: [[260, 28], [410, 26], [880, 32], [1120, 28], [1580, 30], [1810, 28], [2330, 32], [2490, 26]],
      platforms: [],
      orbs: [[475, 74], [970, 102], [1740, 88], [2395, 94]],
      lasers: [[1080, 118, 2.5, 0.9, 0.52], [1900, 130, 2.9, 1.8, 0.48]],
      station: 1240, refill: 38,
      ability: { type: "slingshot", key: "E", label: "ASISTENCIA", hint: "Acercate a un campo violeta y presioná E para impulsarte" },
      gravityWells: [[740, 140, 155, 280], [1440, 128, 155, 300], [2160, 135, 155, 320]]
    },
    {
      planet: "PLANETA 6 · SATURNO",
      title: "Energía para el nuevo hogar",
      description: "Recolectá tres celdas de energía para activar la baliza final y abrir el portal de Saturno.",
      formula: "Física: energía almacenada · La salida necesita tres celdas para activarse",
      fact: "¡Misión cumplida! Cargaste y activaste la baliza para llegar al nuevo hogar.",
      gravity: 10.44, drain: 9.5, world: 2700,
      sky: ["#15223b", "#644759"], ground: "#59465b", surface: "#f0c17c", rock: "#906178", accent: "#8ff4dd",
      gaps: [[590, 690], [1290, 1400], [1970, 2080]],
      blocks: [[260, 46], [445, 54], [875, 42], [1080, 58], [1510, 48], [1740, 56], [2210, 44], [2415, 50]],
      platforms: [[715, 126, 65], [1415, 132, 70], [2095, 132, 64]],
      orbs: [[500, 90], [1040, 112], [1670, 118], [2350, 100]],
      lasers: [[1155, 124, 2.6, 0.6, 0.5], [1840, 132, 2.7, 1.7, 0.5], [2460, 116, 2.9, 2.2, 0.48]],
      station: 1270, refill: 40,
      energyCells: [[550, 90], [1160, 105], [1810, 108]],
      ability: { type: "energy", key: "E", label: "ACTIVAR BALIZA", hint: "Reuní 3 celdas, acercate al portal y presioná E" },
      requiredEnergy: 3
    }
  ];

  if (!guestMode) {
    try {
      const response = await fetch("../api/progreso.php", { cache: "no-store" });
      const serverProgress = await response.json();
      if (response.ok && serverProgress.ok) window.JuegoDB.mergeServerProgress(user, serverProgress);
    } catch (_) { /* La partida puede continuar con el progreso local. */ }
  }

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
  const pauseButton = document.getElementById("botonPausa");
  const abilityButton = document.getElementById("botonHabilidad");
  const helpControls = document.getElementById("ayudaControles");
  const pauseOverlay = document.getElementById("pausaOverlay");
  const resumeButton = document.getElementById("reanudarJuego");
  const fuelFill = document.getElementById("barraCombustible");
  const fuelValue = document.getElementById("valorCombustible");
  const hearts = document.getElementById("corazones");
  const energyCounter = document.getElementById("contadorEnergia");
  const jetpackPanel = document.getElementById("jetpackPanel");
  const jetpackFill = document.getElementById("barraJetpack");
  const jetpackValue = document.getElementById("valorJetpack");
  let solved = progress.completados.includes(level);
  let paused = false;
  const launch = JuegoDB.startLevel(user, level, 15);
  const noFuel = !launch.ok;
  next.textContent = level === missions.length ? "VER FINAL DE MISIÓN →" : "VOLVER AL MAPA · NIVEL " + (level + 1) + " DESBLOQUEADO →";
  next.hidden = !solved;
  next.addEventListener("click", () => {
    location.href = !noFuel && level === missions.length ? "Final.html" : "Niveles.html";
  });
  retry.addEventListener("click", () => game.restartLevel());

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
  function updateEnergyHud(collected, required) {
    energyCounter.hidden = !mission.energyCells;
    if (mission.energyCells) energyCounter.textContent = "⚡ " + collected + " / " + required + " celdas";
  }
  updateFuelHud(launch.combustible ?? progress.combustible ?? 100);
  updateHearts(3);
  updateJetpackHud(100, false);
  updateEnergyHud(0, mission.requiredEnergy || 0);
  abilityButton.textContent = mission.jetpack ? "JETPACK · MANTENER J" : mission.ability.label + " · " + mission.ability.key;
  abilityButton.title = mission.ability.hint;
  abilityButton.setAttribute("aria-label", mission.ability.hint);
  abilityButton.setAttribute("aria-keyshortcuts", mission.ability.key);
  abilityButton.hidden = Boolean(mission.jetpack && window.matchMedia("(pointer: coarse)").matches);
  helpControls.textContent = "A / D: moverse · W o ESPACIO: saltar · Orbes O₂: recargar · " + mission.ability.hint + " · P: pausar";

  platformMessage.textContent = solved
    ? "Nivel completado. Podés volver a jugar o regresar al mapa."
    : (mission.jetpack
      ? "El oxígeno baja. Recogé el jetpack antes del cráter y mantené J para cruzar el tramo largo."
      : "Tenés 3 vidas. Esquivá los rayos láser, superá los cráteres y recogé orbes para recargar oxígeno.");
  if (!solved && launch.cobrado) platformMessage.textContent += " Se gastaron 15% de combustible de la nave.";

  if (!launch.ok) {
    pauseButton.hidden = true;
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
    if (!guestMode) fetch("../api/puntuaciones.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nivel: level }),
    }).catch(() => {});
    solved = true;
    const updated = JuegoDB.progress(user);
    updateFuelHud(updated.combustible);
    status.textContent = "PLANETA " + level + " / 6 · " + updated.puntuacion + " PUNTOS";
    platformMessage.textContent = "✅ " + mission.fact + " +100 puntos · Combustible recuperado: " + updated.combustible + "%";
    next.hidden = false;
  }

  const sceneHost = document.getElementById("contenedorEscena");
  const game = new p5((sketch) => animatePlatformer(sketch, mission, {
    onOxygenChange: function (value, collected, total) {
      updateOxygenHud(value, collected, total);
    },
    onMessage: function (message) {
      platformMessage.textContent = message;
    },
    onLivesChange: updateHearts,
    onJetpackChange: updateJetpackHud,
    onEnergyChange: updateEnergyHud,
    onGameOver: function () {
      platformMessage.textContent = "Perdiste las 3 vidas. Reintentá el nivel; no se vuelve a cobrar el combustible de esta misión.";
      retry.hidden = false;
      pauseButton.disabled = true;
    },
    onRestart: function () {
      retry.hidden = true;
      pauseButton.disabled = false;
      next.hidden = !solved;
    },
    onPauseChange: function (isPaused) {
      paused = isPaused;
      pauseOverlay.hidden = !isPaused;
      pauseButton.textContent = isPaused ? "▶ REANUDAR" : "⏸ PAUSAR";
      pauseButton.setAttribute("aria-expanded", String(isPaused));
      if (isPaused) resumeButton.focus();
      else pauseButton.focus();
    },
    onComplete: function () {
      pauseButton.disabled = true;
      completeLevel();
    },
  }, sceneHost), sceneHost);
  pauseButton.addEventListener("click", () => paused ? game.resumeGame() : game.pauseGame());
  if (mission.jetpack) {
    abilityButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      abilityButton.setPointerCapture?.(event.pointerId);
      game.setJetpack(true);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
      abilityButton.addEventListener(eventName, () => game.setJetpack(false));
    });
  } else {
    abilityButton.addEventListener("click", () => game.useAbility());
  }
  resumeButton.addEventListener("click", () => game.resumeGame());
});

function animatePlatformer(p, mission, callbacks, sceneHost) {
  let canvas = null;
  let ctx = null;
  const keys = new Set();
  const player = { x: 34, y: 0, vx: 0, vy: 0, width: 34, height: 48, grounded: false };
  const orbs = mission.orbs.map(function (orb) {
    return { x: orb[0], lift: orb[1], collected: false };
  });
  const energyCells = (mission.energyCells || []).map(function (cell) { return { x: cell[0], lift: cell[1], collected: false }; });
  const impulsePads = (mission.impulsePads || []).map(function (x) { return { x: x, activated: false }; });
  const lasers = mission.lasers || [];
  const worldLength = mission.world;
  const speed = 265;
  const baseGravity = 910;
  const gravity = baseGravity * mission.gravity / 9.8;
  const jumpSpeed = mission.jumpSpeed || 420;
  let lastTime = 0;
  let gameTime = 0;
  let paused = false;
  let lastFloor = null;
  let walkTime = 0;
  let oxygen = 100;
  let collected = 0;
  let energyCollected = 0;
  let exitActivated = false;
  let exitMessageShown = false;
  let gravityPulseRemaining = 0;
  let abilityCooldown = 0;
  let abilityRunRemaining = 0;
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

  function controlar(name, activo) {
    if (!activo) {
      keys.delete(name);
      const boton = document.querySelector(`[data-control="${name}"]`);
      boton?.classList.remove("activo");
      return;
    }
    if (paused || finished || gameOver) return;
    if (name === "jetpack") {
      if (!mission.jetpack || !jetpackCollected || jetpackFuel <= 0) return;
      if (!keys.has("jetpack") && player.grounded) {
        player.vy = -jumpSpeed * 0.68;
        player.grounded = false;
      }
    } else if (name === "jump" && !keys.has("jump") && player.grounded) {
      player.vy = -jumpSpeed;
      player.grounded = false;
    }
    keys.add(name);
    document.querySelector(`[data-control="${name}"]`)?.classList.add("activo");
  }

  function useAbility() {
    if (paused || finished || gameOver || !mission.ability) return;
    const type = mission.ability.type;
    if (type === "jetpack") {
      callbacks.onMessage("Mantené J o el botón JETPACK mientras tengas carga.");
      return;
    }
    if (abilityCooldown > 0) {
      callbacks.onMessage("La habilidad todavía se está recargando.");
      return;
    }
    if (type === "impulse") {
      if (!player.grounded) {
        callbacks.onMessage("Activá el impulso cuando estés en el suelo, sobre una plataforma amarilla.");
        return;
      }
      const pad = impulsePads.find((item) => !item.activated && Math.abs(player.x + player.width / 2 - item.x) < 54);
      if (!pad) {
        callbacks.onMessage("Acercate a una plataforma amarilla junto al borde y presioná E.");
        return;
      }
      pad.activated = true;
      player.vy = -mission.impulseSpeed;
      player.grounded = false;
      callbacks.onMessage("¡Impulso activado! La plataforma te lanzó para cruzar el cráter.");
      return;
    }
    if (type === "gravity") {
      gravityPulseRemaining = mission.gravityPulse.duration;
      abilityCooldown = mission.gravityPulse.cooldown;
      callbacks.onMessage("¡Pulso gravitatorio! La gravedad de Venus se redujo por un momento.");
      return;
    }
    if (type === "brake") {
      player.vx = 0;
      keys.delete("left");
      keys.delete("right");
      abilityCooldown = 0.7;
      callbacks.onMessage("Freno inercial aplicado: soltaste el movimiento horizontal para alinear el aterrizaje.");
      return;
    }
    if (type === "slingshot") {
      const nearest = (mission.gravityWells || []).map((well) => ({
        well,
        distance: Math.hypot(well[0] - (player.x + player.width / 2), lastFloor - well[1] - (player.y + player.height / 2)),
      })).sort((a, b) => a.distance - b.distance)[0];
      if (!nearest || nearest.distance > nearest.well[2] + 35) {
        callbacks.onMessage("Acercate a un campo gravitatorio violeta antes de activar la asistencia.");
        return;
      }
      player.vy = Math.min(player.vy, -900);
      abilityRunRemaining = 0.82;
      abilityCooldown = 1.4;
      callbacks.onMessage("¡Asistencia gravitatoria! El campo curvó tu trayectoria hacia adelante.");
      return;
    }
    if (type === "energy") {
      if (player.x + player.width < worldLength - 205) {
        callbacks.onMessage("Acercate al portal para activar la baliza.");
        return;
      }
      if (energyCollected < mission.requiredEnergy) {
        callbacks.onMessage("La baliza necesita " + mission.requiredEnergy + " celdas de energía; tenés " + energyCollected + ".");
        return;
      }
      exitActivated = true;
      callbacks.onMessage("¡Baliza activada! Avanzá hasta el portal para completar Saturno.");
    }
  }

  function onKeyDown(event) {
    if (event.target.closest && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    if (key === "p") {
      event.preventDefault();
      if (event.repeat) return;
      if (paused) resumeGame(); else pauseGame();
      return;
    }
    if (paused) return;
    if (key === "e") {
      event.preventDefault();
      if (!event.repeat) useAbility();
      return;
    }
    const jump = key === "w" || key === "arrowup" || event.code === "Space";
    const left = key === "a" || key === "arrowleft";
    const right = key === "d" || key === "arrowright";
    const jetpack = key === "j";
    if (!jump && !left && !right && !jetpack) return;
    if (event.code === "Space" && event.target.closest && event.target.closest("button, a")) return;
    if (event.code === "Space" || key.indexOf("arrow") === 0) event.preventDefault();
    if (jetpack) { event.preventDefault(); controlar("jetpack", true); return; }
    if (left) controlar("left", true);
    if (right) controlar("right", true);
    if (jump) controlar("jump", true);
  }

  function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") controlar("left", false);
    if (key === "d" || key === "arrowright") controlar("right", false);
    if (key === "w" || key === "arrowup" || event.code === "Space") controlar("jump", false);
    if (key === "j") controlar("jetpack", false);
  }

  function clearKeys() {
    keys.clear();
    document.querySelectorAll("[data-control].activo").forEach((button) => button.classList.remove("activo"));
  }

  function pauseGame() {
    if (paused || finished || gameOver) return;
    paused = true;
    clearKeys();
    p.noLoop();
    callbacks.onPauseChange(true);
  }

  function resumeGame() {
    if (!paused || finished || gameOver) return;
    paused = false;
    lastTime = p.millis();
    callbacks.onPauseChange(false);
    p.loop();
  }

  p.pauseGame = pauseGame;
  p.resumeGame = resumeGame;
  p.useAbility = useAbility;
  p.setJetpack = function (active) { controlar("jetpack", active); };
  document.querySelectorAll(".controles-tactiles [data-control]").forEach((button) => {
    const control = button.dataset.control;
    if (control === "jetpack") button.hidden = !mission.jetpack;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      controlar(control, true);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
      button.addEventListener(eventName, (event) => {
        event.preventDefault();
        controlar(control, false);
      });
    });
  });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearKeys);
  callbacks.onLivesChange(lives);
  callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
  callbacks.onEnergyChange(energyCollected, mission.requiredEnergy || 0);

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

  function getRects(floorY, time) {
    const rects = [];
    mission.blocks.forEach(function (block) {
      rects.push({ x: block[0], y: floorY - block[1], w: block[2] || 48, h: block[1], type: "block" });
    });
    mission.platforms.forEach(function (platform) {
      rects.push({ x: platform[0], y: floorY - platform[2], w: platform[1], h: 14, type: "platform" });
    });
    (mission.movingPlatforms || []).forEach(function (platform, index) {
      const y = floorY - platform[2] + Math.sin(time / 1000 * platform[4] + platform[5]) * platform[3];
      rects.push({ x: platform[0], y: y, w: platform[1], h: 14, type: "moving-platform", index: index });
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
    energyCollected = 0;
    exitActivated = false;
    gravityPulseRemaining = 0;
    abilityCooldown = 0;
    abilityRunRemaining = 0;
    exitMessageShown = false;
    stationUsed = false;
    orbs.forEach(function (orb) { orb.collected = false; });
    energyCells.forEach(function (cell) { cell.collected = false; });
    impulsePads.forEach(function (pad) { pad.activated = false; });
    jetpackCollected = false;
    jetpackFuel = 100;
    jetpackUsedInGap = false;
    invulnerability = 1.4;
    clearKeys();
    callbacks.onOxygenChange(oxygen, collected, orbs.length);
    callbacks.onJetpackChange(jetpackFuel, jetpackCollected);
    callbacks.onEnergyChange(energyCollected, mission.requiredEnergy || 0);
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
  p.restartLevel = restart;

  function laserIsActive(laser, time) {
    const period = laser[2] || 2.5;
    const phase = laser[3] || 0;
    const ratio = laser[4] || 0.5;
    const step = ((time / 1000 + phase) % period + period) % period;
    return step < period * ratio;
  }

  function collidesWithHazard(floorY, time) {
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

  function draw(time, dt) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (!width || !height) return;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const zoom = Math.max(0.72, Math.min(1.12, width / 720));
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
    const floorY = viewHeight - 30;

    if (lastFloor === null) {
      player.y = floorY - player.height;
      player.grounded = true;
    } else if (lastFloor !== floorY) {
      player.y += floorY - lastFloor;
    }
    lastFloor = floorY;

    const rects = getRects(floorY, time);
    const rectsAnteriores = getRects(floorY, time - dt * 1000);
    const previousX = player.x;
    let previousY = player.y;
    if (player.grounded && dt > 0) {
      rects.filter(function (rect) { return rect.type === "moving-platform"; }).forEach(function (rect) {
        const anterior = rectsAnteriores.find(function (item) { return item.type === "moving-platform" && item.index === rect.index; });
        const sobreLaPlataforma = player.x + player.width > rect.x + 3 && player.x < rect.x + rect.w - 3;
        if (anterior && sobreLaPlataforma && Math.abs(previousY + player.height - anterior.y) < 8) player.y += rect.y - anterior.y;
      });
    }
    previousY = player.y;

    if (!finished && !gameOver && dt > 0) {
      if (invulnerability > 0) invulnerability = Math.max(0, invulnerability - dt);
      if (gravityPulseRemaining > 0) gravityPulseRemaining = Math.max(0, gravityPulseRemaining - dt);
      if (abilityCooldown > 0) abilityCooldown = Math.max(0, abilityCooldown - dt);
      if (abilityRunRemaining > 0) abilityRunRemaining = Math.max(0, abilityRunRemaining - dt);
      oxygen = Math.max(0, oxygen - mission.drain * dt);
      if (oxygen <= 0) {
        loseLife("Se terminó el oxígeno. El traje te devolvió al inicio con el tanque lleno.", floorY);
      } else {
        const direction = ((keys.has("right") || abilityRunRemaining > 0) ? 1 : 0) - (keys.has("left") ? 1 : 0);
        if (mission.inertia) {
          if (direction) player.vx = Math.max(-speed, Math.min(speed, player.vx + direction * speed * 3.2 * dt));
          else player.vx = Math.abs(player.vx) < 12 ? 0 : player.vx - Math.sign(player.vx) * 470 * dt;
        } else {
          player.vx = direction * speed;
        }
        player.x = Math.max(0, Math.min(worldLength - player.width, player.x + player.vx * dt));
        if ((player.x <= 0 && player.vx < 0) || (player.x >= worldLength - player.width && player.vx > 0)) player.vx = 0;

        rects.forEach(function (rect) {
          const vertical = player.y + player.height > rect.y + 2 && player.y < rect.y + rect.h - 1;
          const horizontal = player.x + player.width > rect.x && player.x < rect.x + rect.w;
          if (!vertical || !horizontal) return;
          if (player.vx > 0 && previousX + player.width <= rect.x + 2) { player.x = rect.x - player.width; player.vx = 0; }
          else if (player.vx < 0 && previousX >= rect.x + rect.w - 2) { player.x = rect.x + rect.w; player.vx = 0; }
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
        (mission.gravityWells || []).forEach(function (well) {
          const dx = well[0] - (player.x + player.width / 2);
          const dy = floorY - well[1] - (player.y + player.height / 2);
          const distance = Math.hypot(dx, dy);
          if (distance > 1 && distance < well[2]) {
            const acceleration = well[3] * (1 - distance / well[2]);
            player.vx = Math.max(-speed * 1.5, Math.min(speed * 1.5, player.vx + dx / distance * acceleration * dt));
            player.vy = Math.max(-800, Math.min(1000, player.vy + dy / distance * acceleration * dt));
          }
        });
        const effectiveGravity = gravityPulseRemaining > 0 ? gravity * mission.gravityPulse.factor : gravity;
        player.vy += effectiveGravity * dt;
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

        for (let i = 0; i < energyCells.length; i++) {
          const cell = energyCells[i];
          if (cell.collected) continue;
          const cellY = floorY - cell.lift;
          const dx = player.x + player.width / 2 - cell.x;
          const dy = player.y + player.height / 2 - cellY;
          if (dx * dx + dy * dy < 36 * 36) {
            cell.collected = true;
            energyCollected++;
            exitMessageShown = false;
            callbacks.onEnergyChange(energyCollected, mission.requiredEnergy);
            callbacks.onMessage("Celda de energía recolectada: " + energyCollected + " / " + mission.requiredEnergy + ".");
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

        if (mission.requiredEnergy && energyCollected < mission.requiredEnergy && player.x + player.width >= worldLength - 78) {
          player.x = worldLength - player.width - 80;
          player.vx = 0;
          if (!exitMessageShown) {
            callbacks.onMessage("La salida sigue sin energía. Reuní las " + mission.requiredEnergy + " celdas para activarla.");
            exitMessageShown = true;
          }
        } else if (mission.requiredEnergy && !exitActivated && player.x + player.width >= worldLength - 145) {
          player.x = worldLength - player.width - 145;
          player.vx = 0;
          if (!exitMessageShown) {
            callbacks.onMessage("Reuniste la energía. Presioná E o tocá ACTIVAR BALIZA junto al portal.");
            exitMessageShown = true;
          }
        } else if (player.x + player.width >= worldLength - 78) {
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

    (mission.movingPlatforms || []).forEach(function (platform, index) {
      const rect = rects.find(function (item) { return item.type === "moving-platform" && item.index === index; });
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

    impulsePads.forEach(function (pad) {
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

    (mission.gravityWells || []).forEach(function (well, index) {
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

    energyCells.forEach(function (cell, index) {
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

    const goalX = worldLength - 58;
    ctx.save();
    ctx.shadowColor = mission.accent;
    ctx.shadowBlur = 22;
    const exitLocked = Boolean(mission.requiredEnergy && !exitActivated);
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
    const exitLabel = mission.requiredEnergy && energyCollected < mission.requiredEnergy ? "3 CELDAS" : (exitLocked ? "E · ACTIVAR" : "SALIDA");
    ctx.fillText(exitLabel, goalX, floorY - 94);

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

  }

  function alturaEscena() {
    const altoAsignado = Math.floor(sceneHost.clientHeight);
    if (altoAsignado > 0) return altoAsignado;
    const tactil = window.innerWidth <= 680;
    return Math.round(window.innerHeight * (tactil ? 0.32 : 0.42));
  }

  p.setup = function () {
    p.pixelDensity(window.devicePixelRatio || 1);
    const initialWidth = Math.max(1, sceneHost.clientWidth);
    const renderer = p.createCanvas(initialWidth, alturaEscena());
    renderer.id("escena");
    canvas = renderer.elt;
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("aria-label", "Nivel 2D. A y D para moverse, W o espacio para saltar, P para pausar.");
    ctx = p.drawingContext;
    p.resizeCanvas(initialWidth, alturaEscena(), true);
    p.frameRate(60);
    lastFloor = null;
  };
  p.draw = function () {
    if (!canvas || !ctx || paused) return;
    const frameTime = p.millis();
    const dt = lastTime ? Math.min((frameTime - lastTime) / 1000, 0.04) : 0;
    lastTime = frameTime;
    gameTime += dt * 1000;
    draw(gameTime, dt);
  };
  p.windowResized = function () {
    if (!canvas) return;
    p.resizeCanvas(Math.max(1, sceneHost.clientWidth), alturaEscena(), true);
    lastFloor = null;
  };
  return { restart: restart };
}

