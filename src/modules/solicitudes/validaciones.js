const { texto, esTelefono, enteroPositivo } = require("../../utils/validadores");

const ESTADOS = ["En revisión", "Aprobada", "Rechazada"];
const RESPUESTAS = ["Aprobada", "Rechazada"];

function validarSolicitud(cuerpo) {
  const errores = [];
  const datos = {
    mascotaId: enteroPositivo(cuerpo.mascotaId),
    telefono: texto(cuerpo.telefono),
    direccion: texto(cuerpo.direccion),
    motivo: texto(cuerpo.motivo),
  };

  if (!datos.mascotaId) errores.push("Indica la mascota que quieres adoptar.");

  if (!datos.telefono) errores.push("El teléfono es obligatorio.");
  else if (!esTelefono(datos.telefono)) errores.push("El teléfono debe tener el formato 8888-1234.");

  if (!datos.direccion) errores.push("La dirección es obligatoria.");
  else if (datos.direccion.length < 5) errores.push("La dirección debe tener al menos 5 caracteres.");
  else if (datos.direccion.length > 200) errores.push("La dirección no puede superar 200 caracteres.");

  if (!datos.motivo) errores.push("Cuéntanos por qué quieres adoptar a esta mascota.");
  else if (datos.motivo.length < 10) errores.push("El motivo debe tener al menos 10 caracteres.");
  else if (datos.motivo.length > 1000) errores.push("El motivo no puede superar 1000 caracteres.");

  return { errores, datos };
}

function validarRespuesta(cuerpo) {
  const estado = texto(cuerpo.estado);
  const errores = RESPUESTAS.includes(estado) ? [] : ["La respuesta debe ser Aprobada o Rechazada."];
  return { errores, datos: { estado } };
}

module.exports = { validarSolicitud, validarRespuesta, ESTADOS };
