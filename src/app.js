const path = require("path");
const express = require("express");
const helmet = require("helmet");
const { pool } = require("./config/db");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");
const rutasUsuarios = require("./modules/usuarios/rutas");
const rutasTipos = require("./modules/tipos/rutas");
const rutasMascotas = require("./modules/mascotas/rutas");
const { rutas: rutasSolicitudes, rutasAdmin: rutasAdminSolicitudes } = require("./modules/solicitudes/rutas");
const rutasNotificaciones = require("./modules/notificaciones/rutas");

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

app.use("/api/auth", rutasUsuarios);
app.use("/api/tipos-mascota", rutasTipos);
app.use("/api/mascotas", rutasMascotas);
app.use("/api/solicitudes", rutasSolicitudes);
app.use("/api/admin/solicitudes", rutasAdminSolicitudes);
app.use("/api/notificaciones", rutasNotificaciones);

app.use("/api", rutaNoEncontrada);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
