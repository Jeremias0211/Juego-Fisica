const comenzar = document.getElementById("comenzar");
const opciones = document.getElementById("opciones");
const salir = document.getElementById("salir");


if (comenzar) {

    comenzar.addEventListener("click", () => {

        window.location.href = "Historia.html";

    });

}


if (opciones) {

    opciones.addEventListener("click", () => {

        alert("Opciones");

    });

}


if (salir) {

    salir.addEventListener("click", () => {

        alert("Salir");

    });

}