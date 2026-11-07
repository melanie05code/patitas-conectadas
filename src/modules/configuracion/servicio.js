const repositorio = require("./repositorio");

function obtener(conexion) {
  return repositorio.obtener(conexion);
}

function actualizar(datos) {
  return repositorio.actualizar(datos);
}

module.exports = { obtener, actualizar };
