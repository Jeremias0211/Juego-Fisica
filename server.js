/* Punto de entrada del servidor alternativo Node + SQLite.
   La implementación está dividida en la carpeta servidor/.
   También levanta el puente WebSocket del mando Android (puerto 3001). */

const { iniciarServidor } = require("./servidor");
const { iniciarPuenteMando } = require("./servidor/mando");

iniciarServidor();
iniciarPuenteMando();
