document.addEventListener("DOMContentLoaded", () => {

    const btnCrear = document.getElementById("btnCrear");
    const btnLogin = document.getElementById("btnLogin");

    const usuario = document.getElementById("usuario");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const confirmarContrasena = document.getElementById("confirmarContrasena");


    // =========================
    // CREAR CUENTA
    // =========================

    if (btnCrear) {

        btnCrear.addEventListener("click", () => {

            const nombreUsuario = usuario.value.trim();
            const email = correo.value.trim();
            const password = contrasena.value;
            const confirmar = confirmarContrasena.value;


            // Verificar campos vacíos

            if (
                nombreUsuario === "" ||
                email === "" ||
                password === "" ||
                confirmar === ""
            ) {

                alert("Completá todos los campos.");

                return;
            }


            // Verificar contraseña

            if (password !== confirmar) {

                alert("Las contraseñas no coinciden.");

                return;
            }


            // Verificar longitud

            if (password.length < 4) {

                alert("La contraseña debe tener al menos 4 caracteres.");

                return;
            }


            // Verificar si ya existe un usuario

            const usuarioGuardado = localStorage.getItem("usuario");

            if (usuarioGuardado) {

                const datosUsuario = JSON.parse(usuarioGuardado);

                if (
                    datosUsuario.usuario.toLowerCase() ===
                    nombreUsuario.toLowerCase()
                ) {

                    alert("Ese usuario ya está registrado.");

                    return;
                }
            }


            // Crear objeto del usuario

            const nuevoUsuario = {

                usuario: nombreUsuario,
                correo: email,
                contrasena: password

            };


            // Guardar usuario

            localStorage.setItem(
                "usuario",
                JSON.stringify(nuevoUsuario)
            );


            alert("Cuenta creada correctamente.");


            // Ir al Login

            window.location.href = "Login.html";

        });

    }


    // =========================
    // VOLVER AL LOGIN
    // =========================

    if (btnLogin) {

        btnLogin.addEventListener("click", () => {

            window.location.href = "Login.html";

        });

    }

});