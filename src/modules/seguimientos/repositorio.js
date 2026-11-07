const { pool } = require("../../config/db");

const COLUMNAS = `g.id, g.solicitud_id AS solicitudId, g.numero, DATE_FORMAT(g.fecha_programada, '%Y-%m-%d') AS fechaProgramada,
  g.foto_url AS fotoUrl, g.enviado_en AS enviadoEn, g.estado, g.comentario_admin AS comentarioAdmin, g.revisado_en AS revisadoEn,
  g.fecha_programada <= CURDATE() AS habilitado`;

function convertir(fila) {
  return fila && { ...fila, habilitado: Boolean(fila.habilitado) };
}

async function crearPlan(solicitudId, { cantidad, intervaloDias }, conexion) {
  const filas = Array.from({ length: cantidad }, (_, i) => [solicitudId, i + 1, (i + 1) * intervaloDias]);
  await conexion.execute(
    `INSERT INTO seguimientos (solicitud_id, numero, fecha_programada) VALUES ${filas.map(() => "(?, ?, CURDATE() + INTERVAL ? DAY)").join(", ")}`,
    filas.flat()
  );
}

async function listarPorSolicitud(solicitudId) {
  const [filas] = await pool.execute(`SELECT ${COLUMNAS} FROM seguimientos g WHERE g.solicitud_id = ? ORDER BY g.numero`, [solicitudId]);
  return filas.map(convertir);
}

async function bloquearPorId(id, conexion) {
  const [filas] = await conexion.execute(
    `SELECT ${COLUMNAS}, s.usuario_id AS usuarioId, m.nombre AS mascotaNombre
     FROM seguimientos g
     INNER JOIN solicitudes s ON s.id = g.solicitud_id
     INNER JOIN mascotas m ON m.id = s.mascota_id
     WHERE g.id = ? FOR UPDATE`,
    [id]
  );
  return convertir(filas[0]) || null;
}

async function buscarPorId(id, conexion = pool) {
  const [filas] = await conexion.execute(`SELECT ${COLUMNAS} FROM seguimientos g WHERE g.id = ?`, [id]);
  return convertir(filas[0]) || null;
}

async function registrarFoto(id, fotoUrl, conexion) {
  await conexion.execute("UPDATE seguimientos SET foto_url = ?, enviado_en = NOW(), estado = 'Enviado' WHERE id = ?", [fotoUrl, id]);
}

async function registrarRevision(id, { estado, comentario }, conexion) {
  await conexion.execute(
    "UPDATE seguimientos SET estado = ?, comentario_admin = ?, revisado_en = NOW() WHERE id = ?",
    [estado, comentario, id]
  );
}

async function listarParaAdmin(estados) {
  const donde = estados.length ? `WHERE g.estado IN (${estados.map(() => "?").join(", ")})` : "";
  const [filas] = await pool.execute(
    `SELECT ${COLUMNAS}, m.nombre AS mascotaNombre, u.nombre AS adoptanteNombre
     FROM seguimientos g
     INNER JOIN solicitudes s ON s.id = g.solicitud_id
     INNER JOIN mascotas m ON m.id = s.mascota_id
     INNER JOIN usuarios u ON u.id = s.usuario_id
     ${donde}
     ORDER BY g.fecha_programada, g.id`,
    estados
  );
  return filas.map(convertir);
}

async function generarRecordatorios(usuarioId = null) {
  const [resultado] = await pool.execute(
    `INSERT IGNORE INTO notificaciones (usuario_id, solicitud_id, texto, recordatorio_seguimiento_id)
     SELECT s.usuario_id, s.id,
            CONCAT('Recordatorio: el control ', g.numero, ' de ', m.nombre, ' está pendiente desde el ',
                   DATE_FORMAT(g.fecha_programada, '%d/%m/%Y'), '. Sube una foto en tu seguimiento.'),
            g.id
     FROM seguimientos g
     INNER JOIN solicitudes s ON s.id = g.solicitud_id
     INNER JOIN mascotas m ON m.id = s.mascota_id
     WHERE g.estado = 'Pendiente' AND g.fecha_programada <= CURDATE()
       AND (? IS NULL OR s.usuario_id = ?)
       AND NOT EXISTS (SELECT 1 FROM notificaciones n WHERE n.recordatorio_seguimiento_id = g.id)`,
    [usuarioId, usuarioId]
  );
  return resultado.affectedRows;
}

module.exports = {
  crearPlan,
  listarPorSolicitud,
  bloquearPorId,
  buscarPorId,
  registrarFoto,
  registrarRevision,
  listarParaAdmin,
  generarRecordatorios,
};
