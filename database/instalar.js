const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const { usuarios, marcadorContrasena } = require("./datos-semilla");

const usarPrueba = process.argv.includes("--test");
if (usarPrueba) process.env.NODE_ENV = "test";
const { db } = require("../src/config/entorno");
const { asegurarDirectorioMascotas } = require("../src/utils/archivos");

const BD_ORIGINAL = "patitas_conectadas";
const FOTOS_SEMILLA = path.join(__dirname, "seed-fotos");
const RONDAS_BCRYPT = 10;
const hashesCalculados = new Map();

function leerScript(nombre) {
  const sql = fs.readFileSync(path.join(__dirname, nombre), "utf8");
  return sql.replace(new RegExp(`\\b${BD_ORIGINAL}\\b`, "g"), db.database);
}

async function hashContrasenaSemilla(variable) {
  const contrasena = process.env[variable];
  if (!contrasena) {
    throw new Error(`Falta la variable de entorno ${variable} con la contraseña del usuario demo. Revisa tu archivo .env (usa .env.example como guía).`);
  }
  const clave = `${variable}:${contrasena}`;
  if (!hashesCalculados.has(clave)) hashesCalculados.set(clave, await bcrypt.hash(contrasena, RONDAS_BCRYPT));
  return hashesCalculados.get(clave);
}

async function aplicarContrasenasSemilla(sql) {
  let resultado = sql;
  for (const { variableContrasena } of usuarios) {
    const hash = await hashContrasenaSemilla(variableContrasena);
    resultado = resultado.split(mysql.escape(marcadorContrasena(variableContrasena))).join(mysql.escape(hash));
  }
  return resultado;
}

function copiarFotosSemilla() {
  const destino = asegurarDirectorioMascotas();
  for (const archivo of fs.readdirSync(destino)) fs.rmSync(path.join(destino, archivo), { force: true });
  for (const archivo of fs.readdirSync(FOTOS_SEMILLA)) fs.copyFileSync(path.join(FOTOS_SEMILLA, archivo), path.join(destino, archivo));
}

async function instalarBaseDatos({ conSeed = true, silencioso = false } = {}) {
  const seed = conSeed ? await aplicarContrasenasSemilla(leerScript("02_seed.sql")) : null;
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
    if (seed) {
      await conexion.query(seed);
      copiarFotosSemilla();
    }
    if (!silencioso) console.log(`Base de datos ${db.database} instalada${conSeed ? " con datos semilla y fotos" : ""}.`);
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
