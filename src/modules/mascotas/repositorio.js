const { pool } = require("../../config/db");

const SELECCION = `
  SELECT m.id, m.nombre, m.edad, m.raza, m.sexo, m.descripcion, m.estado, m.foto_url AS fotoUrl,
         m.creado_en AS creadoEn, m.actualizado_en AS actualizadoEn,
         t.id AS tipoId, t.nombre AS tipoNombre, t.icono AS tipoIcono
  FROM mascotas m
  INNER JOIN tipos_mascota t ON t.id = m.tipo_id`;

function convertir(fila) {
  if (!fila) return null;
  const { tipoId, tipoNombre, tipoIcono, ...mascota } = fila;
  return { ...mascota, tipo: { id: tipoId, nombre: tipoNombre, icono: tipoIcono } };
}

async function listar({ tipoId, busqueda, estado }) {
  const condiciones = [];
  const parametros = [];
  if (tipoId) {
    condiciones.push("m.tipo_id = ?");
    parametros.push(tipoId);
  }
  if (estado) {
    condiciones.push("m.estado = ?");
    parametros.push(estado);
  }
  if (busqueda) {
    condiciones.push("m.nombre LIKE ?");
    parametros.push(`%${busqueda.replace(/[\\%_]/g, "\\$&")}%`);
  }
  const donde = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  const [filas] = await pool.execute(
    `${SELECCION} ${donde} ORDER BY FIELD(m.estado, 'Disponible', 'En proceso', 'Adoptada'), m.nombre`,
    parametros
  );
  return filas.map(convertir);
}

async function buscarPorId(id, conexion = pool) {
  const [filas] = await conexion.execute(`${SELECCION} WHERE m.id = ?`, [id]);
  return convertir(filas[0]);
}

async function bloquearPorId(id, conexion) {
  const [filas] = await conexion.execute("SELECT id, estado, tipo_id AS tipoId, foto_url AS fotoUrl FROM mascotas WHERE id = ? FOR UPDATE", [id]);
  return filas[0] || null;
}

async function resumenSolicitudes(mascotaId, conexion) {
  const [[fila]] = await conexion.execute(
    `SELECT SUM(estado = 'En revisión') AS enRevision, SUM(estado = 'Aprobada') AS aprobadas
     FROM solicitudes WHERE mascota_id = ?`,
    [mascotaId]
  );
  return { enRevision: Number(fila.enRevision) || 0, aprobadas: Number(fila.aprobadas) || 0 };
}

async function contarPorEstado() {
  const [filas] = await pool.query("SELECT estado, COUNT(*) AS total FROM mascotas GROUP BY estado");
  return Object.fromEntries(filas.map((f) => [f.estado, Number(f.total)]));
}

async function crear({ nombre, tipoId, edad, raza, sexo, descripcion, fotoUrl = null }) {
  const [resultado] = await pool.execute(
    "INSERT INTO mascotas (nombre, tipo_id, edad, raza, sexo, descripcion, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nombre, tipoId, edad, raza, sexo, descripcion, fotoUrl]
  );
  return resultado.insertId;
}

async function actualizar(id, { nombre, tipoId, edad, raza, sexo, descripcion, estado }, conexion = pool) {
  await conexion.execute(
    "UPDATE mascotas SET nombre = ?, tipo_id = ?, edad = ?, raza = ?, sexo = ?, descripcion = ?, estado = ? WHERE id = ?",
    [nombre, tipoId, edad, raza, sexo, descripcion, estado, id]
  );
}

module.exports = { listar, buscarPorId, bloquearPorId, resumenSolicitudes, contarPorEstado, crear, actualizar };
