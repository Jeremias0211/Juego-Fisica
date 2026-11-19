/* Generador de código QR para compartir el juego.
   Se carga después de vendor/qrcode/qrcode.min.js. */

(function () {
  const contenedor = document.getElementById("qr");
  const enlaceActual = document.getElementById("enlaceActual");
  const entrada = document.getElementById("urlPersonalizada");
  const botonDescargar = document.getElementById("descargar");
  const botonCopiar = document.getElementById("copiar");
  const botonGenerar = document.getElementById("generar");
  let urlActual = "";
  let qr = null;

  function esSitioPublicado() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  function urlPorDefecto() {
    if (location.protocol === "file:") {
      return "https://juancarballo7.github.io/Juego-Fisica/";
    }
    // En GitHub Pages la raíz incluye el nombre del repositorio.
    return new URL("./", location.href).href;
  }

  function normalizar(valor) {
    try {
      const url = new URL(valor.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      return url.href;
    } catch (_) {
      return null;
    }
  }

  function dibujar(valor) {
    const url = normalizar(valor);
    if (!url) {
      alert("Escribí una dirección válida que empiece con http:// o https://.");
      return;
    }

    urlActual = url;
    contenedor.innerHTML = "";
    qr = new QRCode(contenedor, {
      text: url,
      width: 1024,
      height: 1024,
      colorDark: "#040814",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    enlaceActual.textContent = url;
    entrada.value = url;
    botonDescargar.disabled = false;
  }

  function descargar() {
    const canvas = contenedor.querySelector("canvas");
    if (!canvas) {
      alert("Primero generá el código QR.");
      return;
    }
    const enlace = document.createElement("a");
    enlace.download = "qr-nuevo-hogar.png";
    enlace.href = canvas.toDataURL("image/png");
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(urlActual);
      botonCopiar.textContent = "Enlace copiado";
      window.setTimeout(() => { botonCopiar.textContent = "Copiar enlace del juego"; }, 1800);
    } catch (_) {
      window.prompt("Copiá el enlace del juego:", urlActual);
    }
  }

  const inicial = urlPorDefecto();
  entrada.value = inicial;
  dibujar(inicial);

  botonGenerar.addEventListener("click", () => dibujar(entrada.value));
  entrada.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dibujar(entrada.value);
    }
  });
  botonDescargar.addEventListener("click", descargar);
  botonCopiar.addEventListener("click", copiar);

  if (!esSitioPublicado()) {
    botonDescargar.disabled = false;
  }
})();
