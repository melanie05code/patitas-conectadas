const { campoTexto } = require("../../utils/validadores");
const { DIAS, minutosDelDia } = require("../../utils/fechas");

const PATRON_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const PATRON_TELEFONO_REFUGIO = /^\+?[0-9][0-9 -]{6,18}$/;

function validarConfiguracion(cuerpo) {
  const errores = [];
  const nombre = campoTexto(cuerpo, "nombre", "nombre del refugio", 3, 100, errores);
  const direccion = campoTexto(cuerpo, "direccion", "dirección", 5, 255, errores);
  const telefono = campoTexto(cuerpo, "telefono", "teléfono", 7, 20, errores);
  if (telefono && !PATRON_TELEFONO_REFUGIO.test(telefono)) errores.push("El teléfono del refugio solo puede tener números, espacios, guiones y el prefijo +.");

  const horaApertura = typeof cuerpo.horaApertura === "string" ? cuerpo.horaApertura.trim() : "";
  const horaCierre = typeof cuerpo.horaCierre === "string" ? cuerpo.horaCierre.trim() : "";
  if (!PATRON_HORA.test(horaApertura) || !PATRON_HORA.test(horaCierre)) errores.push("Las horas de apertura y cierre deben tener el formato HH:MM.");
  else if (minutosDelDia(horaApertura) >= minutosDelDia(horaCierre)) errores.push("La hora de apertura debe ser anterior a la de cierre.");

  const diasAtencion = Array.isArray(cuerpo.diasAtencion) ? [...new Set(cuerpo.diasAtencion)] : [];
  if (diasAtencion.length === 0 || !diasAtencion.every((dia) => DIAS.includes(dia))) errores.push("Elige al menos un día de atención válido.");

  const duracionCitaMin = Number(cuerpo.duracionCitaMin);
  if (!Number.isInteger(duracionCitaMin) || duracionCitaMin < 15 || duracionCitaMin > 240) errores.push("La duración de la cita debe estar entre 15 y 240 minutos.");

  return {
    errores,
    datos: { nombre, direccion, telefono, horaApertura, horaCierre, diasAtencion: DIAS.filter((dia) => diasAtencion.includes(dia)), duracionCitaMin },
  };
}

module.exports = { validarConfiguracion };
