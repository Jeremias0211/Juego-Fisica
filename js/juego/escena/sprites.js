/* Carga las tiras del astronauta y entrega el fotograma que corresponde a cada estado. */

const BASE = new URL("../../../img/astronauta/", import.meta.url);

const ARCHIVOS = {
  quieto: ["quieto-1.png", "quieto-2.png", "quieto-3.png", "quieto-4.png"],
  corriendo: ["corriendo-1.png", "corriendo-2.png", "corriendo-3.png", "corriendo-4.png", "corriendo-5.png", "corriendo-6.png"],
  saltando: ["saltando-1.png", "saltando-2.png", "saltando-3.png", "saltando-4.png"],
  cayendo: ["cayendo-1.png", "cayendo-2.png", "cayendo-3.png"],
};

const animaciones = {};

Object.keys(ARCHIVOS).forEach((nombre) => {
  animaciones[nombre] = ARCHIVOS[nombre].map((archivo) => {
    const imagen = new Image();
    imagen.decoding = "async";
    imagen.src = new URL(archivo, BASE).href;
    return imagen;
  });
});

function lista(nombre) {
  return animaciones[nombre] || [];
}

export function imagenLista(imagen) {
  return Boolean(imagen && imagen.complete && imagen.naturalWidth > 0);
}

export function fotograma(nombre, indice) {
  const fotogramas = lista(nombre);
  if (!fotogramas.length) return null;
  const posicion = ((indice % fotogramas.length) + fotogramas.length) % fotogramas.length;
  const imagen = fotogramas[posicion];
  return imagenLista(imagen) ? imagen : null;
}

export function animacionLista(nombre) {
  return lista(nombre).some(imagenLista);
}
