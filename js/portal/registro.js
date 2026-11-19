/* Formulario de creación de una cuenta nueva. */

import { JuegoDB } from "../datos/index.js";
import { guardarCredencial } from "./credenciales.js";
import { esEntornoEstatico } from "./entorno.js";
import { activarSesion } from "./sesion.js";
import { validarCuenta } from "./validacion-cuenta.js";

async function registrarLocal(nombre, email, clave) {
  const db = JuegoDB.read();
  const buscado = nombre.trim().toLowerCase();
  const existe = (db.jugadores || []).some(
    (persona) => String(persona.usuario).toLowerCase() === buscado
  );

  if (existe) {
    throw new Error("Ese usuario ya está registrado en este dispositivo.");
  }

  const correoBuscado = email.toLowerCase();
  const correoExiste = (db.jugadores || []).some(
    (persona) => String(persona.correo || "").toLowerCase() === correoBuscado
  );
  if (correoExiste) {
    throw new Error("Ese correo ya está registrado en este dispositivo.");
  }

  const resultado = JuegoDB.create({ usuario: nombre, correo: email });
  if (!resultado.ok) throw new Error(resultado.error);

  const guardado = await guardarCredencial(nombre, clave);
  if (!guardado) throw new Error("No se pudo guardar la contraseña local.");

  activarSesion(resultado.player?.usuario || nombre);
  location.assign("Index.html");
}

async function registrarEnServidor(nombre, email, clave) {
  const response = await fetch("../api/registrar.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: nombre, correo: email, contrasena: clave }),
  });

  const tipo = response.headers.get("content-type") || "";
  if (!tipo.includes("application/json")) {
    throw new Error("El servidor no respondió correctamente. Revisá la conexión e intentá de nuevo.");
  }

  const result = await response.json();
  if (!response.ok || !result.ok) {
    const error = new Error(result.error || "No se pudo crear la cuenta.");
    error.servidor = true;
    throw error;
  }
  return result;
}

function iniciarRegistro() {
  const usuario = document.getElementById("usuario");
  const correo = document.getElementById("correo");
  const password = document.getElementById("contrasena");
  const confirmar = document.getElementById("confirmarContrasena");
  const button = document.getElementById("btnCrear");

  document.getElementById("registroForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = usuario.value.trim();
    const email = correo.value.trim();
    const clave = password.value;

    if (!nombre || !email || !clave || !confirmar.value) {
      alert("Completá todos los campos.");
      return;
    }

    const revision = validarCuenta(nombre, email, clave);
    if (!revision.ok) {
      alert(revision.error);
      const destino = revision.error.toLowerCase().includes("contraseña") ? password : correo;
      destino?.focus();
      return;
    }

    if (clave !== confirmar.value) {
      alert("Las contraseñas no coinciden.");
      confirmar.focus();
      return;
    }

    button.disabled = true;
    try {
      if (esEntornoEstatico()) {
        await registrarLocal(nombre, revision.correo, clave);
        return;
      }

      let result;
      try {
        result = await registrarEnServidor(nombre, revision.correo, clave);
      } catch (error) {
        /* Fuera de un sitio estático no se crean cuentas locales: se informa el error real. */
        if (error.servidor) throw error;
        throw new Error("No se pudo conectar con el servidor del juego. Revisá tu conexión e intentá de nuevo.");
      }

      activarSesion(result.usuario || nombre);
      if (result.avisoCorreo) alert(result.avisoCorreo);
      location.assign("Index.html");
    } catch (error) {
      alert(error.message || "No se pudo crear la cuenta. Comprobá que el servidor esté iniciado.");
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("btnLogin")?.addEventListener("click", () => location.href = "Login.html");
}

iniciarRegistro();
