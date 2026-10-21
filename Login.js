document.addEventListener("DOMContentLoaded", () => {
  const usuario = document.getElementById("usuario"), contrasena = document.getElementById("contrasena"), button = document.getElementById("btnIngresar");
  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nombre = usuario.value.trim(), clave = contrasena.value;
    if (!nombre || !clave) { alert("Completá usuario y contraseña."); return; }
    button.disabled = true;
    try {
      let response;
      try {
        response = await fetch("../api/iniciar-sesion.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: nombre, contrasena: clave }) });
      } catch {
        throw new Error("No se pudo conectar con el servidor. En PowerShell, ejecutá npm.cmd run server y abrí http://localhost:3000/.");
      }
      let result;
      try { result = await response.json(); }
      catch { throw new Error("El servidor no devolvió una respuesta válida. Revisá que esté iniciado correctamente."); }
      if (!response.ok || !result.ok) throw new Error(result.error || "Usuario o contraseña incorrectos.");
      localStorage.setItem("sesionActiva", "true"); localStorage.setItem("jugadorActual", result.usuario);
      location.assign("Index.html");
    } catch (error) { alert(error.message); }
    finally { button.disabled = false; }
  });
  document.getElementById("btnRegistrarse")?.addEventListener("click", () => location.href = "Registro.html");
});
