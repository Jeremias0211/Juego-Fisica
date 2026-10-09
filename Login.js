document.addEventListener("DOMContentLoaded", () => {
  const usuario = document.getElementById("usuario"), contrasena = document.getElementById("contrasena"), button = document.getElementById("btnIngresar");
  button?.addEventListener("click", async () => {
    const nombre = usuario.value.trim(), clave = contrasena.value;
    if (!nombre || !clave) { alert("Completá usuario y contraseña."); return; }
    button.disabled = true;
    try {
      const response = await fetch("../api/iniciar-sesion.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: nombre, contrasena: clave }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Usuario o contraseña incorrectos.");
      localStorage.setItem("sesionActiva", "true"); localStorage.setItem("jugadorActual", result.usuario);
      location.assign("Index.html");
    } catch (error) { alert(error.message); }
    finally { button.disabled = false; }
  });
  document.getElementById("btnRegistrarse")?.addEventListener("click", () => location.href = "Registro.html");
});
