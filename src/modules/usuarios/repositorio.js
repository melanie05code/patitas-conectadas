const { pool } = require("../../config/db");

const COLUMNAS_PUBLICAS = "id, nombre, email, rol, creado_en AS creadoEn";

async function buscarPorEmailConHash(email) {
  const [filas] = await pool.execute(
    `SELECT ${COLUMNAS_PUBLICAS}, password_hash AS passwordHash FROM usuarios WHERE email = ?`,
    [email]
  );
  return filas[0] || null;
}

async function buscarPorId(id) {
  const [filas] = await pool.execute(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`, [id]);
  return filas[0] || null;
}

async function existeEmail(email) {
  const [filas] = await pool.execute("SELECT 1 FROM usuarios WHERE email = ?", [email]);
  return filas.length > 0;
}

async function crear({ nombre, email, passwordHash, rol }) {
  const [resultado] = await pool.execute(
    "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
    [nombre, email, passwordHash, rol]
  );
  return resultado.insertId;
}

module.exports = { buscarPorEmailConHash, buscarPorId, existeEmail, crear };
