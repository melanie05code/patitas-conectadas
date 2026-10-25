const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

const esPrueba = process.env.NODE_ENV === "test";
const raizProyecto = path.join(__dirname, "..", "..");

function requerida(nombre) {
  const valor = process.env[nombre];
  if (valor === undefined || valor === "") {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa tu archivo .env (usa .env.example como guía).`);
  }
  return valor;
}

module.exports = {
  esPrueba,
  puerto: Number(process.env.PORT) || 3000,
  subidas: {
    directorio: path.join(raizProyecto, esPrueba ? "uploads-pruebas" : "uploads"),
    rutaPublica: "/uploads",
    carpetaMascotas: "mascotas",
    tamanoMaximo: 2 * 1024 * 1024,
  },
  jwt: {
    secreto: requerida("JWT_SECRET"),
    expira: process.env.JWT_EXPIRA || "4h",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: requerida("DB_USER"),
    password: process.env.DB_PASSWORD || "",
    database: esPrueba ? process.env.DB_NAME_TEST || "patitas_test" : process.env.DB_NAME || "patitas_conectadas",
  },
};
