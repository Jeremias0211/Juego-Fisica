/* Prepara el lienzo, el zoom y las coordenadas visibles de cada fotograma. */

export function prepararVista(p, canvas) {
  const ctx = p.drawingContext;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return null;

  const dpr = (typeof p.pixelDensity === "function" && p.pixelDensity()) || window.devicePixelRatio || 1;
  const bufferW = Math.round(width * dpr);
  const bufferH = Math.round(height * dpr);
  if (Math.abs(canvas.width - bufferW) > 1 || Math.abs(canvas.height - bufferH) > 1) {
    canvas.width = bufferW;
    canvas.height = bufferH;
  }

  const zoomAncho = width / 820;
  const zoomAlto = height / 380;
  const zoom = Math.max(0.5, Math.min(1.12, zoomAncho, zoomAlto));
  const viewWidth = width / zoom;
  const viewHeight = height / zoom;
  const floorY = viewHeight - 30;

  ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  return { ctx, width, height, dpr, zoom, viewWidth, viewHeight, floorY };
}
