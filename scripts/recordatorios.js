const usarPrueba = process.argv.includes("--test");
if (usarPrueba) process.env.NODE_ENV = "test";

const { pool } = require("../src/config/db");
const { db } = require("../src/config/entorno");
const { generarRecordatorios } = require("../src/modules/seguimientos/servicio");

async function principal() {
  const creados = await generarRecordatorios(null);
  console.log(`${creados} recordatorio(s) nuevo(s) de seguimiento en ${db.database}.`);
}

principal()
  .catch((error) => {
    console.error(`Error al generar los recordatorios: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
