document.addEventListener("DOMContentLoaded", () => {

    const comenzar = document.getElementById("comenzar");
    const opciones = document.getElementById("opciones");
    const salir = document.getElementById("salir");
    const instrucciones = document.getElementById("instrucciones");
    const creditos = document.getElementById("creditos");

    const menuOpciones = document.getElementById("menuOpciones");
    const cerrarOpciones = document.getElementById("cerrarOpciones");


    // =========================
    // VERIFICAR SESIÓN
    // =========================

    const sesionActiva =
        localStorage.getItem("sesionActiva");
    const modoInvitado = localStorage.getItem("modoInvitado") === "true";


    if (sesionActiva !== "true" && !modoInvitado) {

        window.location.href = "Login.html";

        return;
    }


    // =========================
    // INICIAR MISIÓN
    // =========================

    if (comenzar) {

        comenzar.addEventListener("click", () => {

            window.location.href = "Historia.html";

        });

    }

    instrucciones?.addEventListener("click", () => { window.location.href = "Instrucciones.html"; });
    creditos?.addEventListener("click", () => { window.location.href = "Creditos.html"; });


    // =========================
    // ABRIR OPCIONES
    // =========================

    if (opciones && menuOpciones) {

        opciones.addEventListener("click", () => {

            menuOpciones.classList.add("activo");

        });

    }


    // =========================
    // CERRAR OPCIONES
    // =========================

    if (cerrarOpciones && menuOpciones) {

        cerrarOpciones.addEventListener("click", () => {

            menuOpciones.classList.remove("activo");

        });

    }


    // =========================
    // SALIR
    // =========================

    if (salir) {

        salir.addEventListener("click", () => {

            const confirmar = confirm(
                modoInvitado ? "¿Querés salir del modo invitado?" : "¿Querés cerrar la sesión?"
            );


            if (confirmar) {

                // Eliminar sesión

                if (sesionActiva === "true") {
                    fetch("../api/cerrar-sesion.php", { method: "POST" }).catch(() => {});
                }
                localStorage.removeItem("sesionActiva");
                localStorage.removeItem("modoInvitado");
                localStorage.removeItem("jugadorActual");


                // Volver al Login

                window.location.href = "Login.html";

            }

        });

    }

});
