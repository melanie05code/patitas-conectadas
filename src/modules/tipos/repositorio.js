const { pool } = require("../../config/db");

const SELECCION = `
  SELECT t.id, t.nombre, t.icono, t.activo = 1 AS activo, COUNT(m.id) AS totalMascotas
  FROM tipos_mascota t
  LEFT JOIN mascotas m ON m.tipo_id = t.id`;

function convertir(fila) {
  return fila && { ...fila, activo: Boolean(fila.activo), totalMascotas: Number(fila.totalMascotas) };
}

async function listar({ soloActivos, soloConMascotas }) {
  const condiciones = soloActivos ? "WHERE t.activo = 1" : "";
  const filtroMascotas = soloConMascotas ? "HAVING COUNT(m.id) > 0" : "";
  const [filas] = await pool.query(`${SELECCION} ${condiciones} GROUP BY t.id ${filtroMascotas} ORDER BY t.id`);
  return filas.map(convertir);
}

async function buscarPorId(id, conexion = pool) {
  const [filas] = await conexion.execute(`${SELECCION} WHERE t.id = ? GROUP BY t.id`, [id]);
  return convertir(filas[0]) || null;
}

async function crear({ nombre, icono }) {
  const [resultado] = await pool.execute("INSERT INTO tipos_mascota (nombre, icono) VALUES (?, ?)", [nombre, icono]);
  return resultado.insertId;
}

async function actualizar(id, { nombre, icono, activo }) {
  const [resultado] = await pool.execute(
    "UPDATE tipos_mascota SET nombre = ?, icono = ?, activo = COALESCE(?, activo) WHERE id = ?",
    [nombre, icono, activo === undefined ? null : activo, id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, crear, actualizar };
