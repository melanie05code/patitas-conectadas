const { texto, esTelefono, enteroPositivo } = require("../../utils/validadores");

const ESTADOS = ["Solicitada", "Entrevista programada", "Entrevistada", "Aprobada", "Rechazada"];
const ESTADOS_ACTIVOS = ["Solicitada", "Entrevista programada", "Entrevistada"];
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

function notaOpcional(cuerpo, campo, etiqueta, errores) {
  const valor = texto(cuerpo[campo]);
  if (valor.length > 1000) errores.push(`${etiqueta} no puede superar 1000 caracteres.`);
  return valor || null;
}

function validarRespuesta(cuerpo) {
  const estado = texto(cuerpo.estado);
  const errores = RESPUESTAS.includes(estado) ? [] : ["La respuesta debe ser Aprobada o Rechazada."];
  const motivo = notaOpcional(cuerpo, "motivo", "El motivo", errores);
  return { errores, datos: { estado, motivo } };
}

function validarAgenda(cuerpo) {
  const fechaHora = texto(cuerpo.fechaHora);
  return { errores: fechaHora ? [] : ["Elige el día y la hora de la entrevista."], datos: { fechaHora } };
}

function validarEntrevistada(cuerpo) {
  const errores = [];
  return { errores, datos: { notas: notaOpcional(cuerpo, "notas", "Las notas de la entrevista", errores) } };
}

function leerFiltroEstados(valor) {
  const lista = texto(valor).split(",").map((estado) => estado.trim()).filter(Boolean);
  return lista.every((estado) => ESTADOS.includes(estado)) ? lista : null;
}

module.exports = { validarSolicitud, validarRespuesta, validarAgenda, validarEntrevistada, leerFiltroEstados, ESTADOS, ESTADOS_ACTIVOS };
