const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const usarPrueba = process.argv.includes("--test");
if (usarPrueba) process.env.NODE_ENV = "test";
const { db } = require("../src/config/entorno");

const CARPETA = path.join(__dirname, "migraciones");

function listarMigraciones() {
  return fs.readdirSync(CARPETA).filter((archivo) => /^\d{3}_[a-z0-9_]+\.sql$/.test(archivo)).sort();
}

async function aplicarMigraciones(conexion, { silencioso = false } = {}) {
  await conexion.query(`
    CREATE TABLE IF NOT EXISTS migraciones_esquema (
      nombre VARCHAR(100) NOT NULL,
      aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT pk_migraciones_esquema PRIMARY KEY (nombre)
    ) ENGINE = InnoDB`);
  const [filas] = await conexion.query("SELECT nombre FROM migraciones_esquema");
  const aplicadas = new Set(filas.map((fila) => fila.nombre));
  const nuevas = [];
  for (const archivo of listarMigraciones()) {
    if (aplicadas.has(archivo)) continue;
    await conexion.query(fs.readFileSync(path.join(CARPETA, archivo), "utf8"));
    await conexion.execute("INSERT INTO migraciones_esquema (nombre) VALUES (?)", [archivo]);
    nuevas.push(archivo);
    if (!silencioso) console.log(`Migración aplicada: ${archivo}`);
  }
  return nuevas;
}

async function migrar() {
  const conexion = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    charset: "utf8mb4",
    multipleStatements: true,
  });
  try {
    const nuevas = await aplicarMigraciones(conexion);
    console.log(nuevas.length ? `${nuevas.length} migración(es) aplicada(s) en ${db.database}.` : `La base ${db.database} ya estaba al día.`);
  } finally {
    await conexion.end();
  }
}

if (require.main === module) {
  migrar().catch((error) => {
    console.error(`Error al migrar la base de datos: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { aplicarMigraciones, listarMigraciones };
