document.addEventListener("DOMContentLoaded", () => {

    const comenzar = document.getElementById("comenzar");
    const opciones = document.getElementById("opciones");
    const salir = document.getElementById("salir");

    const menuOpciones = document.getElementById("menuOpciones");
    const cerrarOpciones = document.getElementById("cerrarOpciones");


    // INICIAR MISIÓN

    if (comenzar) {

        comenzar.addEventListener("click", () => {
            window.location.href = "historia.html";
        });

    }


    // ABRIR OPCIONES

    if (opciones && menuOpciones) {

        opciones.addEventListener("click", () => {

            menuOpciones.classList.add("activo");

        });

    }


    // CERRAR OPCIONES

    if (cerrarOpciones && menuOpciones) {

        cerrarOpciones.addEventListener("click", () => {

            menuOpciones.classList.remove("activo");

        });

    }


    // SALIR

    if (salir) {

        salir.addEventListener("click", () => {

            alert("Gracias por jugar.");

        });

    }

});