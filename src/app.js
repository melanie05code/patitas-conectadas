const path = require("path");
const express = require("express");
const helmet = require("helmet");
const { pool } = require("./config/db");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");

const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/salud", async (req, res) => {
  const [[fila]] = await pool.query("SELECT DATABASE() AS baseDatos, NOW() AS horaServidor");
  res.json({ estado: "ok", ...fila });
});

app.use("/api", rutaNoEncontrada);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
