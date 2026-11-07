const { pool } = require("../../config/db");

const COLUMNAS = `e.id, e.solicitud_id AS solicitudId, e.fecha_hora AS fechaHora, e.lugar, e.notas_admin AS notasAdmin,
  e.realizada_en AS realizadaEn, e.cancelada_en AS canceladaEn, e.creado_en AS creadoEn, e.actualizado_en AS actualizadoEn`;

async function buscarPorSolicitud(solicitudId, conexion = pool) {
  const [filas] = await conexion.execute(`SELECT ${COLUMNAS} FROM entrevistas e WHERE e.solicitud_id = ?`, [solicitudId]);
  return filas[0] || null;
}

async function crear({ solicitudId, fechaHora, lugar }, conexion) {
  const [resultado] = await conexion.execute(
    "INSERT INTO entrevistas (solicitud_id, fecha_hora, lugar) VALUES (?, ?, ?)",
    [solicitudId, fechaHora, lugar]
  );
  return resultado.insertId;
}

async function reprogramar(solicitudId, { fechaHora, lugar }, conexion) {
  await conexion.execute("UPDATE entrevistas SET fecha_hora = ?, lugar = ? WHERE solicitud_id = ?", [fechaHora, lugar, solicitudId]);
}

async function marcarRealizada(solicitudId, notas, conexion) {
  await conexion.execute(
    "UPDATE entrevistas SET realizada_en = NOW(), notas_admin = COALESCE(?, notas_admin) WHERE solicitud_id = ?",
    [notas, solicitudId]
  );
}

async function cerrarPorRechazo(solicitudId, motivo, conexion) {
  await conexion.execute(
    `UPDATE entrevistas
     SET cancelada_en = IF(realizada_en IS NULL, NOW(), cancelada_en),
         notas_admin = IF(? IS NULL, notas_admin, CONCAT_WS('\n', notas_admin, ?))
     WHERE solicitud_id = ?`,
    [motivo, motivo, solicitudId]
  );
}

async function horasOcupadas(fecha, conexion = pool) {
  const [filas] = await conexion.execute(
    "SELECT DATE_FORMAT(horario_ocupado, '%H:%i') AS hora FROM entrevistas WHERE horario_ocupado >= ? AND horario_ocupado < ? + INTERVAL 1 DAY",
    [fecha, fecha]
  );
  return new Set(filas.map((fila) => fila.hora));
}

async function horarioOcupado(fechaHora, solicitudId, conexion) {
  const [filas] = await conexion.execute(
    "SELECT 1 FROM entrevistas WHERE horario_ocupado = ? AND solicitud_id <> ?",
    [fechaHora, solicitudId]
  );
  return filas.length > 0;
}

async function listarEntre(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT ${COLUMNAS}, s.estado AS estadoSolicitud, m.nombre AS mascotaNombre, u.nombre AS adoptanteNombre
     FROM entrevistas e
     INNER JOIN solicitudes s ON s.id = e.solicitud_id
     INNER JOIN mascotas m ON m.id = s.mascota_id
     INNER JOIN usuarios u ON u.id = s.usuario_id
     WHERE e.cancelada_en IS NULL AND e.fecha_hora >= ? AND e.fecha_hora < ?
     ORDER BY e.fecha_hora`,
    [desde, hasta]
  );
  return filas;
}

module.exports = { buscarPorSolicitud, crear, reprogramar, marcarRealizada, cerrarPorRechazo, horasOcupadas, horarioOcupado, listarEntre };
