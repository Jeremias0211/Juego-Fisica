// =========================
// BOTÓN CREAR CUENTA
// =========================

const btnCrear = document.getElementById("btnCrear");


btnCrear.addEventListener("click", function () {

    const usuario =
        document.getElementById("usuario").value.trim();

    const correo =
        document.getElementById("correo").value.trim();

    const contrasena =
        document.getElementById("contrasena").value.trim();

    const confirmarContrasena =
        document.getElementById("confirmarContrasena").value.trim();


    // =========================
    // CAMPOS VACÍOS
    // =========================

    if (
        usuario === "" ||
        correo === "" ||
        contrasena === "" ||
        confirmarContrasena === ""
    ) {

        alert("Completá todos los campos.");

        return;
    }


    // =========================
    // CONTRASEÑAS
    // =========================

    if (contrasena !== confirmarContrasena) {

        alert("Las contraseñas no coinciden.");

        return;
    }


    // =========================
    // CONTRASEÑA MÍNIMA
    // =========================

    if (contrasena.length < 6) {

        alert("La contraseña debe tener al menos 6 caracteres.");

        return;
    }


    // =========================
    // REGISTRO CORRECTO
    // =========================

    alert("¡Cuenta creada correctamente!");


    console.log("Usuario:", usuario);
    console.log("Correo:", correo);


    /*
        MÁS ADELANTE ACÁ VAMOS A GUARDAR
        EL USUARIO EN LA BASE DE DATOS.

        También podremos guardar:

        - Nombre de usuario
        - Correo
        - Contraseña
        - Nivel
        - Puntuación
        - Progreso
        - Avatar

    */


    // Volver al login

    window.location.href = "Login.html";

});



// =========================
// BOTÓN INICIAR SESIÓN
// =========================

const btnLogin = document.getElementById("btnLogin");


btnLogin.addEventListener("click", function () {

    window.location.href = "Login.html";

});