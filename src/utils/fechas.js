const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DIAS_TEXTO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const PATRON_FECHA_HORA = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

function dosDigitos(valor) {
  return String(valor).padStart(2, "0");
}

function aFechaSql(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

function aFechaHoraSql(fecha) {
  return `${aFechaSql(fecha)} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;
}

function leerFecha(texto) {
  const partes = PATRON_FECHA.exec(typeof texto === "string" ? texto.trim() : "");
  if (!partes) return null;
  const [anio, mes, dia] = partes.slice(1).map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
  return fecha;
}

function leerFechaHora(texto) {
  const partes = PATRON_FECHA_HORA.exec(typeof texto === "string" ? texto.trim() : "");
  if (!partes) return null;
  const [anio, mes, dia, hora, minuto] = partes.slice(1, 6).map(Number);
  const fecha = new Date(anio, mes - 1, dia, hora, minuto, 0);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia
    || fecha.getHours() !== hora || fecha.getMinutes() !== minuto) return null;
  return fecha;
}

function minutosDelDia(horaSql) {
  const [hora, minuto] = String(horaSql).split(":").map(Number);
  return hora * 60 + minuto;
}

function horaDesdeMinutos(minutos) {
  return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
}

function nombreDia(fecha) {
  return DIAS[fecha.getDay()];
}

function horaEnTexto(fecha) {
  const horas = fecha.getHours();
  const sufijo = horas < 12 ? "a. m." : "p. m.";
  const hora12 = horas % 12 === 0 ? 12 : horas % 12;
  return `${hora12}:${dosDigitos(fecha.getMinutes())} ${sufijo}`;
}

function fechaEnTexto(fecha) {
  return `${DIAS_TEXTO[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

function sumarDias(fecha, dias) {
  const copia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  copia.setDate(copia.getDate() + dias);
  return copia;
}

module.exports = {
  DIAS,
  aFechaSql,
  aFechaHoraSql,
  leerFecha,
  leerFechaHora,
  minutosDelDia,
  horaDesdeMinutos,
  nombreDia,
  horaEnTexto,
  fechaEnTexto,
  sumarDias,
};
