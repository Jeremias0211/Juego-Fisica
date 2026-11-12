/* Formulario de inicio de sesión y acceso como invitado. */

import { JuegoDB } from "../datos/index.js";
import { verificarCredencial } from "./credenciales.js";
import { esEntornoEstatico } from "./entorno.js";

function activarSesion(nombre) {
  localStorage.setItem("sesionActiva", "true");
  localStorage.setItem("jugadorActual", nombre);
  localStorage.removeItem("modoInvitado");
  location.assign("Index.html");
}

async function iniciarSesionLocal(nombre, clave) {
  const revision = await verificarCredencial(nombre, clave);
  if (!revision.ok) throw new Error(revision.error);

  const buscado = nombre.trim().toLowerCase();
  const db = JuegoDB.read();
  const jugador = (db.jugadores || []).find(
    (persona) => String(persona.usuario).toLowerCase() === buscado
  );

  if (!jugador) {
    throw new Error("No se encontró el progreso de esa cuenta local. Volvé a crearla.");
  }

  activarSesion(jugador.usuario);
}

async function pedirSesionAlServidor(nombre, clave) {
  const response = await fetch("../api/iniciar-sesion.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: nombre, contrasena: clave }),
  });

  const tipo = response.headers.get("content-type") || "";
  if (!tipo.includes("application/json")) {
    throw new Error("El servidor no respondió correctamente. Revisá la conexión e intentá de nuevo.");
  }

  const result = await response.json();
  if (!response.ok || !result.ok) {
    const error = new Error(result.error || "Usuario o contraseña incorrectos.");
    error.servidor = true;
    throw error;
  }
  return result;
}

function iniciarLogin() {
  const usuario = document.getElementById("usuario");
  const contrasena = document.getElementById("contrasena");
  const button = document.getElementById("btnIngresar");

  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = usuario.value.trim();
    const clave = contrasena.value;
    if (!nombre || !clave) {
      alert("Completá usuario y contraseña.");
      return;
    }

    button.disabled = true;
    try {
      if (esEntornoEstatico()) {
        await iniciarSesionLocal(nombre, clave);
        return;
      }

      let result = null;
      try {
        result = await pedirSesionAlServidor(nombre, clave);
      } catch (error) {
        /* Fuera de un sitio estático no se crean cuentas locales: se informa el error real. */
        if (error.servidor) throw error;
        throw new Error("No se pudo conectar con el servidor del juego. Revisá tu conexión e intentá de nuevo.");
      }

      activarSesion(result.usuario);
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("btnRegistrarse")?.addEventListener("click", () => location.href = "Registro.html");
  document.getElementById("btnInvitado")?.addEventListener("click", () => {
    localStorage.removeItem("sesionActiva");
    localStorage.setItem("modoInvitado", "true");
    localStorage.setItem("jugadorActual", "Invitado");
    location.assign("Index.html");
  });
}

iniciarLogin();
