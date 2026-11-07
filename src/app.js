const path = require("path");
const express = require("express");
const helmet = require("helmet");
const { pool } = require("./config/db");
const { subidas } = require("./config/entorno");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");
const rutasUsuarios = require("./modules/usuarios/rutas");
const rutasTipos = require("./modules/tipos/rutas");
const rutasMascotas = require("./modules/mascotas/rutas");
const { rutas: rutasSolicitudes, rutasAdmin: rutasAdminSolicitudes } = require("./modules/solicitudes/rutas");
const rutasNotificaciones = require("./modules/notificaciones/rutas");
const rutasPerfiles = require("./modules/perfiles/rutas");
const rutasEntrevistas = require("./modules/entrevistas/rutas");
const rutasConfiguracion = require("./modules/configuracion/rutas");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
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
app.use("/api/perfil-adoptante", rutasPerfiles);
app.use("/api/admin/entrevistas", rutasEntrevistas);
app.use("/api/admin/configuracion-refugio", rutasConfiguracion);

app.use("/api", rutaNoEncontrada);
app.use(subidas.rutaPublica, express.static(subidas.directorio, { index: false, dotfiles: "deny", maxAge: "1d" }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
