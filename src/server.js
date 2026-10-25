const app = require("./app");
const { pool } = require("./config/db");
const { puerto, db } = require("./config/entorno");

async function iniciar() {
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    console.error(`No se pudo conectar a MySQL (${db.user}@${db.host}:${db.port}/${db.database}): ${error.message}`);
    process.exit(1);
  }
  app.listen(puerto, () => {
    console.log(`Patitas Conectadas escuchando en http://localhost:${puerto} (BD: ${db.database})`);
  });
}

iniciar();
