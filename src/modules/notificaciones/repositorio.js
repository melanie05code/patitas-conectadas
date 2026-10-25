const { pool } = require("../../config/db");

async function crear({ usuarioId, solicitudId = null, texto }, conexion = pool) {
  const [resultado] = await conexion.execute(
    "INSERT INTO notificaciones (usuario_id, solicitud_id, texto) VALUES (?, ?, ?)",
    [usuarioId, solicitudId, texto]
  );
  return resultado.insertId;
}

module.exports = { crear };
