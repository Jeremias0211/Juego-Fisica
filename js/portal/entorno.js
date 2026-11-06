/* Detecta si la aplicación se está sirviendo como sitio estático (sin PHP).
   En GitHub Pages no hay backend, así que las cuentas y el ranking usan localStorage. */

export function esEntornoEstatico() {
  const host = location.hostname.toLowerCase();
  return (
    location.protocol === "file:" ||
    host.endsWith("github.io") ||
    host.endsWith("githubusercontent.com") ||
    host.endsWith("pages.dev") ||
    host.endsWith("netlify.app") ||
    host.endsWith("vercel.app")
  );
}
