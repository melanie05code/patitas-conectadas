const { texto } = require("../../utils/validadores");

function validarTipo(cuerpo) {
  const errores = [];
  const nombre = texto(cuerpo.nombre);

  if (nombre.length < 2) errores.push("El nombre del tipo debe tener al menos 2 caracteres.");
  else if (nombre.length > 40) errores.push("El nombre del tipo no puede superar 40 caracteres.");

  const datos = { nombre };
  if (cuerpo.activo !== undefined) {
    if (typeof cuerpo.activo !== "boolean") errores.push("El campo activo debe ser verdadero o falso.");
    else datos.activo = cuerpo.activo;
  }

  return { errores, datos };
}

module.exports = { validarTipo };
