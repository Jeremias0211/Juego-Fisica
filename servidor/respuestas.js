/* Respuestas JSON, validación de origen y lectura segura del cuerpo. */

const LIMITE_CUERPO = 16 * 1024;

function responderJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}

function normalizarHost(valor) {
  return String(valor || "")
    .toLowerCase()
    .replace(/:(?:80|443)$/, "");
}

/* Acepta solamente peticiones del mismo sitio. Si el navegador no envía
   Origin, se usa Sec-Fetch-Site como respaldo. La cookie SameSite=Lax
   sigue siendo la segunda barrera contra CSRF. */
function origenPermitido(request) {
  if (request.method === "GET" || request.method === "HEAD") return true;

  const origen = request.headers.origin;
  if (origen) {
    try {
      const url = new URL(origen);
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      return normalizarHost(url.host) === normalizarHost(request.headers.host);
    } catch {
      return false;
    }
  }

  const sitio = String(request.headers["sec-fetch-site"] || "").toLowerCase();
  return !sitio || sitio === "same-origin" || sitio === "none";
}

function exigirOrigen(request, response) {
  if (origenPermitido(request)) return true;

  responderJson(response, 403, {
    ok: false,
    error: "La solicitud no proviene de este sitio.",
  });
  return false;
}

async function leerJson(request) {
  const tipo = String(request.headers["content-type"] || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (tipo !== "application/json") {
    const error = new Error("La solicitud debe enviarse como JSON.");
    error.status = 415;
    throw error;
  }

  const codificacion = String(request.headers["content-encoding"] || "identity").toLowerCase();
  if (codificacion !== "identity") {
    const error = new Error("La codificación de la solicitud no es compatible.");
    error.status = 415;
    throw error;
  }

  const declarado = Number(request.headers["content-length"]);
  if (Number.isFinite(declarado) && declarado > LIMITE_CUERPO) {
    const error = new Error("La solicitud es demasiado grande.");
    error.status = 413;
    throw error;
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > LIMITE_CUERPO) {
      const error = new Error("La solicitud es demasiado grande.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    const error = new Error("La solicitud no contiene datos válidos.");
    error.status = 400;
    throw error;
  }
}

module.exports = { responderJson, leerJson, origenPermitido, exigirOrigen };
