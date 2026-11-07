const { pool } = require("../../config/db");

const COLUMNAS = `nombre, direccion, telefono, TIME_FORMAT(hora_apertura, '%H:%i') AS horaApertura,
  TIME_FORMAT(hora_cierre, '%H:%i') AS horaCierre, dias_atencion AS diasAtencion, duracion_cita_min AS duracionCitaMin,
  actualizado_en AS actualizadoEn`;

function convertir(fila) {
  if (!fila) return null;
  return { ...fila, diasAtencion: fila.diasAtencion ? fila.diasAtencion.split(",") : [] };
}

async function obtener(conexion = pool) {
  const [filas] = await conexion.execute(`SELECT ${COLUMNAS} FROM configuracion_refugio WHERE id = 1`);
  return convertir(filas[0]);
}

async function actualizar(datos) {
  await pool.execute(
    `UPDATE configuracion_refugio
     SET nombre = ?, direccion = ?, telefono = ?, hora_apertura = ?, hora_cierre = ?, dias_atencion = ?, duracion_cita_min = ?
     WHERE id = 1`,
    [datos.nombre, datos.direccion, datos.telefono, datos.horaApertura, datos.horaCierre, datos.diasAtencion.join(","), datos.duracionCitaMin]
  );
  return obtener();
}

module.exports = { obtener, actualizar };
