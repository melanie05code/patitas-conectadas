const repositorio = require("./repositorio");
const servicioConfiguracion = require("../configuracion/servicio");
const ErrorApp = require("../../utils/ErrorApp");
const fechas = require("../../utils/fechas");

const MENSAJE_OCUPADO = "Ese horario ya está ocupado. Elige otro.";

function horariosDelDia(configuracion) {
  const apertura = fechas.minutosDelDia(configuracion.horaApertura);
  const cierre = fechas.minutosDelDia(configuracion.horaCierre);
  const horarios = [];
  for (let inicio = apertura; inicio + configuracion.duracionCitaMin <= cierre; inicio += configuracion.duracionCitaMin) {
    horarios.push(fechas.horaDesdeMinutos(inicio));
  }
  return horarios;
}

function descripcionHorario(configuracion) {
  return `de ${configuracion.horaApertura} a ${configuracion.horaCierre}, con citas de ${configuracion.duracionCitaMin} minutos`;
}

async function disponibilidad(textoFecha) {
  const fecha = fechas.leerFecha(textoFecha);
  if (!fecha) throw new ErrorApp(400, "Indica una fecha válida con el formato AAAA-MM-DD.");
  const configuracion = await servicioConfiguracion.obtener();
  const fechaSql = fechas.aFechaSql(fecha);
  const atiende = configuracion.diasAtencion.includes(fechas.nombreDia(fecha));
  if (!atiende) return { fecha: fechaSql, atiende: false, horarios: [] };

  const ocupadas = await repositorio.horasOcupadas(fechaSql);
  const ahora = new Date();
  const horarios = horariosDelDia(configuracion).map((hora) => {
    const momento = fechas.leerFechaHora(`${fechaSql} ${hora}`);
    let estado = "libre";
    if (momento <= ahora) estado = "pasado";
    else if (ocupadas.has(hora)) estado = "ocupado";
    return { hora, estado };
  });
  return { fecha: fechaSql, atiende: true, horarios };
}

async function validarHorario(textoFechaHora, solicitudId, conexion) {
  const momento = fechas.leerFechaHora(textoFechaHora);
  if (!momento) throw new ErrorApp(400, "Indica la fecha y hora de la entrevista con el formato AAAA-MM-DD HH:MM.");
  if (momento <= new Date()) throw new ErrorApp(400, "La entrevista debe agendarse en una fecha y hora futuras.");
  const configuracion = await servicioConfiguracion.obtener(conexion);
  if (!configuracion.diasAtencion.includes(fechas.nombreDia(momento))) {
    throw new ErrorApp(400, "El refugio no atiende ese día. Elige otro día de atención.");
  }
  const hora = fechas.horaDesdeMinutos(momento.getHours() * 60 + momento.getMinutes());
  if (!horariosDelDia(configuracion).includes(hora)) {
    throw new ErrorApp(400, `Ese horario está fuera del horario de atención (${descripcionHorario(configuracion)}).`);
  }
  const fechaHora = fechas.aFechaHoraSql(momento);
  if (await repositorio.horarioOcupado(fechaHora, solicitudId, conexion)) throw new ErrorApp(409, MENSAJE_OCUPADO);
  return { fechaHora, momento, lugar: configuracion.direccion };
}

async function agenda(textoDesde, dias = 7) {
  const desde = textoDesde ? fechas.leerFecha(textoDesde) : new Date();
  if (!desde) throw new ErrorApp(400, "Indica una fecha válida con el formato AAAA-MM-DD.");
  const inicio = fechas.sumarDias(desde, 0);
  const fin = fechas.sumarDias(inicio, dias);
  const entrevistas = await repositorio.listarEntre(fechas.aFechaSql(inicio), fechas.aFechaSql(fin));
  return { desde: fechas.aFechaSql(inicio), hasta: fechas.aFechaSql(fechas.sumarDias(fin, -1)), entrevistas };
}

module.exports = { disponibilidad, validarHorario, agenda, MENSAJE_OCUPADO };
