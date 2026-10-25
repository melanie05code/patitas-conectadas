const { texto } = require("../../utils/validadores");

const ICONO_POR_DEFECTO = "🐾";

function validarTipo(cuerpo) {
  const errores = [];
  const nombre = texto(cuerpo.nombre);
  const icono = texto(cuerpo.icono) || ICONO_POR_DEFECTO;

  if (nombre.length < 2) errores.push("El nombre del tipo debe tener al menos 2 caracteres.");
  else if (nombre.length > 40) errores.push("El nombre del tipo no puede superar 40 caracteres.");

  if ([...icono].length > 4) errores.push("El ícono debe ser un emoji o un símbolo corto.");

  const datos = { nombre, icono };
  if (cuerpo.activo !== undefined) {
    if (typeof cuerpo.activo !== "boolean") errores.push("El campo activo debe ser verdadero o falso.");
    else datos.activo = cuerpo.activo;
  }

  return { errores, datos };
}

module.exports = { validarTipo };
