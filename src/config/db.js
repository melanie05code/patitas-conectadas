const mysql = require("mysql2/promise");
const { db } = require("./entorno");

const pool = mysql.createPool({
  ...db,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

async function enTransaccion(trabajo) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = { pool, enTransaccion };
