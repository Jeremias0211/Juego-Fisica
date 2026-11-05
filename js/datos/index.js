/* API pública de la base local. Se mantiene window.JuegoDB por compatibilidad. */

import { read, find, create } from "./almacen.js";
import { startLevel, complete, progress, mergeServerProgress, reset } from "./progreso.js";

export const JuegoDB = {
  read,
  find,
  create,
  startLevel,
  complete,
  progress,
  mergeServerProgress,
  reset,
};

/* Los scripts que todavía no usan import pueden seguir accediendo desde window. */
window.JuegoDB = JuegoDB;

export default JuegoDB;
