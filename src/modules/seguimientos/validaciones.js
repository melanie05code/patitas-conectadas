const { texto } = require("../../utils/validadores");

const ESTADOS = ["Pendiente", "Enviado", "Todo bien", "Requiere atención"];
const RESULTADOS = ["Todo bien", "Requiere atención"];

function validarRevision(cuerpo) {
  const errores = [];
  const estado = texto(cuerpo.estado);
  const comentario = texto(cuerpo.comentario);
  if (!RESULTADOS.includes(estado)) errores.push("La revisión debe ser Todo bien o Requiere atención.");
  if (comentario.length < 3) errores.push("Escribe un comentario para el adoptante (al menos 3 caracteres).");
  else if (comentario.length > 500) errores.push("El comentario no puede superar 500 caracteres.");
  return { errores, datos: { estado, comentario } };
}

function leerFiltroEstados(valor) {
  const lista = texto(valor).split(",").map((estado) => estado.trim()).filter(Boolean);
  return lista.every((estado) => ESTADOS.includes(estado)) ? lista : null;
}

module.exports = { validarRevision, leerFiltroEstados };
