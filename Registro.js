document.addEventListener("DOMContentLoaded", () => {
  const usuario = document.getElementById("usuario"), correo = document.getElementById("correo"), password = document.getElementById("contrasena"), confirmar = document.getElementById("confirmarContrasena");
  const button = document.getElementById("btnCrear");
  document.getElementById("registroForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nombre = usuario.value.trim(), email = correo.value.trim(), clave = password.value;
    if (!nombre || !email || !clave || !confirmar.value) { alert("Completá todos los campos."); return; }
    if (clave !== confirmar.value) { alert("Las contraseñas no coinciden."); return; }
    if (clave.length < 4) { alert("La contraseña debe tener al menos 4 caracteres."); return; }
    button.disabled = true;
    try {
      let response;
      try {
        response = await fetch("../api/registrar.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: nombre, correo: email, contrasena: clave }) });
      } catch {
        throw new Error("No se pudo conectar con el servidor. En PowerShell, ejecutá npm.cmd run server y abrí http://localhost:3000/.");
      }
      let result;
      try { result = await response.json(); }
      catch { throw new Error("El servidor no devolvió una respuesta válida. Revisá que esté iniciado correctamente."); }
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo crear la cuenta.");
      alert("Cuenta creada correctamente. Iniciá sesión para continuar.");
      location.assign("Login.html");
    } catch (error) {
      alert(error.message || "No se pudo crear la cuenta. Comprobá que el servidor esté iniciado.");
    } finally { button.disabled = false; }
  });
  document.getElementById("btnLogin")?.addEventListener("click", () => location.href = "Login.html");
});
