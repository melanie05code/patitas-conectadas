const { pool } = require("../../config/db");

const COLUMNAS = "id, solicitud_id AS solicitudId, texto, leida = 1 AS leida, creado_en AS creadoEn";

function convertir(fila) {
  return fila && { ...fila, leida: Boolean(fila.leida) };
}

async function crear({ usuarioId, solicitudId = null, texto }, conexion = pool) {
  const [resultado] = await conexion.execute(
    "INSERT INTO notificaciones (usuario_id, solicitud_id, texto) VALUES (?, ?, ?)",
    [usuarioId, solicitudId, texto]
  );
  return resultado.insertId;
}

async function listarPorUsuario(usuarioId) {
  const [filas] = await pool.execute(
    `SELECT ${COLUMNAS} FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC, id DESC`,
    [usuarioId]
  );
  return filas.map(convertir);
}

async function contarNoLeidas(usuarioId) {
  const [[fila]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = 0",
    [usuarioId]
  );
  return Number(fila.total);
}

async function buscarDueno(id) {
  const [filas] = await pool.execute("SELECT usuario_id AS usuarioId FROM notificaciones WHERE id = ?", [id]);
  return filas[0] ? filas[0].usuarioId : null;
}

async function marcarLeida(id) {
  await pool.execute("UPDATE notificaciones SET leida = 1 WHERE id = ?", [id]);
  const [filas] = await pool.execute(`SELECT ${COLUMNAS} FROM notificaciones WHERE id = ?`, [id]);
  return convertir(filas[0]);
}

async function marcarTodasLeidas(usuarioId) {
  const [resultado] = await pool.execute(
    "UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0",
    [usuarioId]
  );
  return resultado.affectedRows;
}

module.exports = { crear, listarPorUsuario, contarNoLeidas, buscarDueno, marcarLeida, marcarTodasLeidas };
