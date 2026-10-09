document.addEventListener("DOMContentLoaded", () => {
  const usuario = document.getElementById("usuario"), correo = document.getElementById("correo"), password = document.getElementById("contrasena"), confirmar = document.getElementById("confirmarContrasena");
  const button = document.getElementById("btnCrear");
  button?.addEventListener("click", async () => {
    const nombre = usuario.value.trim(), email = correo.value.trim(), clave = password.value;
    if (!nombre || !email || !clave || !confirmar.value) { alert("Completá todos los campos."); return; }
    if (clave !== confirmar.value) { alert("Las contraseñas no coinciden."); return; }
    if (clave.length < 4) { alert("La contraseña debe tener al menos 4 caracteres."); return; }
    button.disabled = true;
    try {
      const response = await fetch("../api/registrar.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: nombre, correo: email, contrasena: clave }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo crear la cuenta.");
      alert("Cuenta creada correctamente. Iniciá sesión para continuar.");
      location.assign("Login.html");
    } catch (error) {
      alert(`${error.message} Asegurate de abrir el juego desde Apache/XAMPP y de haber importado database/nuevo_hogar.sql.`);
    } finally { button.disabled = false; }
  });
  document.getElementById("btnLogin")?.addEventListener("click", () => location.href = "Login.html");
});
