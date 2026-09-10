document.addEventListener("DOMContentLoaded", () => {

    const btnIngresar = document.getElementById("btnIngresar");
    const btnRegistrarse = document.getElementById("btnRegistrarse");

    const usuario = document.getElementById("usuario");
    const contrasena = document.getElementById("contrasena");


    // =========================
    // INGRESAR
    // =========================

    if (btnIngresar) {

        btnIngresar.addEventListener("click", () => {

            const nombreUsuario = usuario.value.trim();
            const password = contrasena.value;


            // Verificar campos vacíos

            if (
                nombreUsuario === "" ||
                password === ""
            ) {

                alert("Completá usuario y contraseña.");

                return;
            }


            // Buscar usuario registrado

            const usuarioGuardado =
                localStorage.getItem("usuario");


            // Si no existe ningún usuario

            if (!usuarioGuardado) {

                alert(
                    "No existe ninguna cuenta registrada. Primero tenés que registrarte."
                );

                return;
            }


            // Convertir los datos guardados a objeto

            const datosUsuario =
                JSON.parse(usuarioGuardado);


            // Verificar usuario y contraseña

            if (
                datosUsuario.usuario.toLowerCase() ===
                nombreUsuario.toLowerCase() &&
                datosUsuario.contrasena === password
            ) {


                // Guardamos la sesión

                localStorage.setItem(
                    "sesionActiva",
                    "true"
                );


                // Guardamos el nombre del jugador

                localStorage.setItem(
                    "jugadorActual",
                    datosUsuario.usuario
                );


                alert(
                    "Bienvenido/a " +
                    datosUsuario.usuario +
                    "!"
                );


                // Ir al inicio del juego

                window.location.href = "index.html";

            } else {

                alert("Usuario o contraseña incorrectos.");

            }

        });

    }


    // =========================
    // IR A REGISTRO
    // =========================

    if (btnRegistrarse) {

        btnRegistrarse.addEventListener("click", () => {

            window.location.href = "Registro.html";

        });

    }

});