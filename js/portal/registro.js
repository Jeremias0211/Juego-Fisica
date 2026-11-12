/* Formulario de creación de una cuenta nueva. */

import { JuegoDB } from "../datos/index.js";
import { guardarCredencial } from "./credenciales.js";
import { esEntornoEstatico } from "./entorno.js";

async function registrarLocal(nombre, email, clave) {
  const db = JuegoDB.read();
  const buscado = nombre.trim().toLowerCase();
  const existe = (db.jugadores || []).some(
    (persona) => String(persona.usuario).toLowerCase() === buscado
  );

  if (existe) {
    throw new Error("Ese usuario ya está registrado en este dispositivo.");
  }

  const resultado = JuegoDB.create({ usuario: nombre, correo: email });
  if (!resultado.ok) throw new Error(resultado.error);

  const guardado = await guardarCredencial(nombre, clave);
  if (!guardado) throw new Error("No se pudo guardar la contraseña local.");

  localStorage.removeItem("modoInvitado");
  alert("Cuenta local creada en este dispositivo. Iniciá sesión para continuar.");
  location.assign("Login.html");
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
    if (clave !== confirmar.value) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (clave.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    button.disabled = true;
    try {
      if (esEntornoEstatico()) {
        await registrarLocal(nombre, email, clave);
        return;
      }

      let result;
      try {
        result = await registrarEnServidor(nombre, email, clave);
      } catch (error) {
        /* Fuera de un sitio estático no se crean cuentas locales: se informa el error real. */
        if (error.servidor) throw error;
        throw new Error("No se pudo conectar con el servidor del juego. Revisá tu conexión e intentá de nuevo.");
      }

      localStorage.removeItem("modoInvitado");
      const mensaje = result.correoEnviado
        ? "Cuenta creada correctamente. Te enviamos un correo de bienvenida. Iniciá sesión para continuar."
        : "Cuenta creada correctamente. Iniciá sesión para continuar." +
          (result.avisoCorreo ? "\n\n" + result.avisoCorreo : "");
      alert(mensaje);
      location.assign("Login.html");
    } catch (error) {
      alert(error.message || "No se pudo crear la cuenta. Comprobá que el servidor esté iniciado.");
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("btnLogin")?.addEventListener("click", () => location.href = "Login.html");
}

iniciarRegistro();
