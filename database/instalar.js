const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const usarPrueba = process.argv.includes("--test");
if (usarPrueba) process.env.NODE_ENV = "test";
const { db } = require("../src/config/entorno");

const BD_ORIGINAL = "patitas_conectadas";

function leerScript(nombre) {
  const sql = fs.readFileSync(path.join(__dirname, nombre), "utf8");
  return sql.replace(new RegExp(`\\b${BD_ORIGINAL}\\b`, "g"), db.database);
}

async function instalarBaseDatos({ conSeed = true, silencioso = false } = {}) {
  const conexion = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    charset: "utf8mb4",
    multipleStatements: true,
  });
  try {
    await conexion.query(leerScript("01_schema.sql"));
    if (conSeed) await conexion.query(leerScript("02_seed.sql"));
    if (!silencioso) console.log(`Base de datos ${db.database} instalada${conSeed ? " con datos semilla" : ""}.`);
  } finally {
    await conexion.end();
  }
}

if (require.main === module) {
  instalarBaseDatos({ conSeed: !process.argv.includes("--sin-seed") }).catch((error) => {
    console.error(`Error al instalar la base de datos: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { instalarBaseDatos };
