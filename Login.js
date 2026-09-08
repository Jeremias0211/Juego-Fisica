// =========================
// BOTÓN INGRESAR
// =========================

const btnIngresar = document.getElementById("btnIngresar");

btnIngresar.addEventListener("click", function () {

    const usuario = document.getElementById("usuario").value.trim();

    const contrasena = document.getElementById("contrasena").value.trim();


    // Verificar campos vacíos

    if (usuario === "" || contrasena === "") {

        alert("Completá el usuario y la contraseña.");

        return;
    }


    // Por ahora mostramos los datos
    // para comprobar que funciona.

    console.log("Usuario:", usuario);
    console.log("Contraseña:", contrasena);


    /*
        MÁS ADELANTE ACÁ VAMOS A CONECTAR
        EL LOGIN CON EL SISTEMA DE USUARIOS.

        Por ejemplo:

        window.location.href = "index.html";
    */

});


// =========================
// BOTÓN REGISTRARSE
// =========================

const btnRegistrarse = document.getElementById("btnRegistrarse");

btnRegistrarse.addEventListener("click", function () {

    window.location.href = "Registro.html";

});