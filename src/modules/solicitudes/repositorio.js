const { pool } = require("../../config/db");

const SELECCION = `
  SELECT s.id, s.estado, s.telefono, s.direccion, s.motivo, s.fecha, s.actualizado_en AS actualizadoEn,
         m.id AS mascotaId, m.nombre AS mascotaNombre, m.estado AS mascotaEstado, m.foto_url AS mascotaFotoUrl,
         t.nombre AS tipoNombre, t.icono AS tipoIcono,
         u.id AS usuarioId, u.nombre AS usuarioNombre, u.email AS usuarioEmail
  FROM solicitudes s
  INNER JOIN mascotas m ON m.id = s.mascota_id
  INNER JOIN tipos_mascota t ON t.id = m.tipo_id
  INNER JOIN usuarios u ON u.id = s.usuario_id`;

function convertir(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    estado: fila.estado,
    telefono: fila.telefono,
    direccion: fila.direccion,
    motivo: fila.motivo,
    fecha: fila.fecha,
    actualizadoEn: fila.actualizadoEn,
    mascota: {
      id: fila.mascotaId,
      nombre: fila.mascotaNombre,
      estado: fila.mascotaEstado,
      fotoUrl: fila.mascotaFotoUrl,
      tipo: { nombre: fila.tipoNombre, icono: fila.tipoIcono },
    },
    usuario: { id: fila.usuarioId, nombre: fila.usuarioNombre, email: fila.usuarioEmail },
  };
}

async function buscarPorId(id, conexion = pool) {
  const [filas] = await conexion.execute(`${SELECCION} WHERE s.id = ?`, [id]);
  return convertir(filas[0]);
}

async function listarPorUsuario(usuarioId) {
  const [filas] = await pool.execute(`${SELECCION} WHERE s.usuario_id = ? ORDER BY s.fecha DESC, s.id DESC`, [usuarioId]);
  return filas.map(convertir);
}

async function listar({ estado }) {
  const donde = estado ? "WHERE s.estado = ?" : "";
  const [filas] = await pool.execute(`${SELECCION} ${donde} ORDER BY s.fecha ASC, s.id ASC`, estado ? [estado] : []);
  return filas.map(convertir);
}

async function existeActiva(usuarioId, mascotaId, conexion) {
  const [filas] = await conexion.execute(
    "SELECT 1 FROM solicitudes WHERE usuario_id = ? AND mascota_id = ? AND estado = 'En revisión'",
    [usuarioId, mascotaId]
  );
  return filas.length > 0;
}

async function bloquearPorId(id, conexion) {
  const [filas] = await conexion.execute(
    "SELECT id, estado, mascota_id AS mascotaId, usuario_id AS usuarioId FROM solicitudes WHERE id = ? FOR UPDATE",
    [id]
  );
  return filas[0] || null;
}

async function crear({ mascotaId, usuarioId, telefono, direccion, motivo }, conexion) {
  const [resultado] = await conexion.execute(
    "INSERT INTO solicitudes (mascota_id, usuario_id, telefono, direccion, motivo) VALUES (?, ?, ?, ?, ?)",
    [mascotaId, usuarioId, telefono, direccion, motivo]
  );
  return resultado.insertId;
}

async function cambiarEstado(id, estado, conexion) {
  await conexion.execute("UPDATE solicitudes SET estado = ? WHERE id = ?", [estado, id]);
}

module.exports = { buscarPorId, listarPorUsuario, listar, existeActiva, bloquearPorId, crear, cambiarEstado };
