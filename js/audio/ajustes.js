/* Preferencias de audio: valores por defecto, lectura segura y guardado. */

export const STORAGE_KEY = "nuevoHogarAudio";

export const DEFAULTS = {
  volumen: 80,
  musica: true,
  efectos: true,
  volumenMusica: 55,
  volumenEfectos: 90,
};

export const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(maximo, Number(valor)));

function leerAjustes() {
  let guardados = {};
  try {
    guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch (_) {
    guardados = {};
  }
  return {
    volumen: limitar(guardados.volumen ?? DEFAULTS.volumen, 0, 100),
    musica: guardados.musica !== false,
    efectos: guardados.efectos !== false,
    volumenMusica: limitar(guardados.volumenMusica ?? DEFAULTS.volumenMusica, 0, 100),
    volumenEfectos: limitar(guardados.volumenEfectos ?? DEFAULTS.volumenEfectos, 0, 100),
  };
}

export const ajustes = leerAjustes();

export function guardarAjustes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ajustes));
  } catch (_) {
    /* El audio sigue funcionando aunque el navegador bloquee localStorage. */
  }
}

export function obtenerAjustes() {
  return { ...ajustes };
}

export function cambiarAjustes(cambios) {
  if (!cambios || typeof cambios !== "object") return obtenerAjustes();
  if ("volumen" in cambios) ajustes.volumen = limitar(cambios.volumen, 0, 100);
  if ("volumenMusica" in cambios) ajustes.volumenMusica = limitar(cambios.volumenMusica, 0, 100);
  if ("volumenEfectos" in cambios) ajustes.volumenEfectos = limitar(cambios.volumenEfectos, 0, 100);
  if ("musica" in cambios) ajustes.musica = Boolean(cambios.musica);
  if ("efectos" in cambios) ajustes.efectos = Boolean(cambios.efectos);
  guardarAjustes();
  return obtenerAjustes();
}
