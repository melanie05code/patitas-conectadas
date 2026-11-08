process.env.NODE_ENV = "test";

const fs = require("fs");
const path = require("path");
const { randomBytes } = require("crypto");
const { chromium } = require("playwright-core");
const { instalarBaseDatos } = require("../database/instalar");
const app = require("../src/app");
const { pool } = require("../src/config/db");

const DESTINO = path.join(__dirname, "..", "docs", "evidencias", "final", "manual");
const FOTOS = path.join(__dirname, "..", "database", "seed-fotos");
const CANAL = process.env.CAPTURAS_NAVEGADOR || "msedge";

async function principal() {
  fs.rmSync(DESTINO, { recursive: true, force: true });
  fs.mkdirSync(DESTINO, { recursive: true });
  await instalarBaseDatos({ silencioso: true });
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const navegador = await chromium.launch({ channel: CANAL, headless: true });
  const pagina = await (await navegador.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  pagina.on("dialog", (dialogo) => dialogo.accept());
  const generadas = [];

  const foto = async (nombre, selector = ".container") => {
    await pagina.evaluate(() => { const barra = document.querySelector(".topbar"); if (barra) barra.style.position = "static"; });
    await pagina.locator(selector).first().screenshot({ path: path.join(DESTINO, `${nombre}.png`) });
    generadas.push(nombre);
  };
  const entrar = async (email, password) => {
    await pagina.goto(`${base}/index.html`);
    await pagina.evaluate(() => sessionStorage.clear());
    await pagina.goto(`${base}/login.html`);
    await pagina.fill("#email", email);
    await pagina.fill("#password", password);
    await pagina.click("#loginForm button[type=submit]");
    await pagina.waitForURL((url) => !url.pathname.endsWith("login.html"));
  };

  try {
    const clave = randomBytes(12).toString("base64url");
    await pagina.goto(`${base}/registro.html`);
    await pagina.fill("#name", "Lucía Prueba");
    await pagina.fill("#email", "lucia.prueba@correo.com");
    await pagina.fill("#password", clave);
    await pagina.fill("#password2", clave);
    await foto("A01_registro");
    await pagina.click("#regForm button[type=submit]");
    await pagina.waitForURL((url) => !url.pathname.endsWith("registro.html"));
    await pagina.goto(`${base}/perfil.html`);
    await pagina.selectOption("#p_vivienda", "Apartamento");
    await pagina.fill("#p_personas", "2");
    await pagina.check("input[name=p_patio][value=no]");
    await pagina.check("input[name=p_ingresos][value=si]");
    await pagina.check("input[name=p_otras][value=si]");
    await pagina.check("input[name=p_experiencia][value=no]");
    await pagina.fill("#p_otras_detalle", "Un gato adulto");
    await foto("A02_mi_perfil");
    await pagina.click("#btnGuardarPerfil");
    await pagina.waitForSelector("#alertBox .alert.success");
    await pagina.goto(`${base}/catalogo.html`);
    await pagina.waitForFunction(() => [...document.querySelectorAll(".pet-photo img")].every((i) => i.complete));
    await pagina.click('.filter-chip:has-text("Gato")');
    await pagina.waitForTimeout(400);
    await foto("A03_catalogo_filtro");
    await pagina.goto(`${base}/detalle.html?id=7`);
    await pagina.waitForSelector('#detailCard a[href^="solicitar.html"]');
    await foto("A04_detalle");
    await pagina.goto(`${base}/solicitar.html?id=7`);
    await pagina.waitForSelector("#petBanner .avatar");
    await pagina.fill("#phone", "8456-7890");
    await pagina.fill("#address", "Colonia Centroamérica, Managua");
    await pagina.fill("#reason", "Trabajo desde casa y quiero un gato curioso que me acompañe.");
    await foto("A05_solicitar");
    await pagina.click("#reqForm button[type=submit]");
    await pagina.waitForURL(/mis-solicitudes/);
    await pagina.waitForSelector("#list .card");
    await foto("A06_mis_solicitudes");

    await entrar("edwin.obando@correo.com", process.env.SEED_ADOPTANTE_PASSWORD);
    await pagina.goto(`${base}/seguimiento.html?id=1`);
    await pagina.waitForSelector(".tarjeta-entrevista");
    await foto("A07_seguimiento_entrevista");
    await pagina.goto(`${base}/seguimiento.html?id=4`);
    await pagina.waitForSelector('input[data-control="6"]');
    await pagina.setInputFiles('input[data-control="6"]', path.join(FOTOS, "lara.jpg"));
    await pagina.waitForSelector("#vista-6 img");
    await foto("A08_subir_foto_control", "#seguimientos");
    await pagina.click('[data-enviar="6"]');
    await pagina.waitForFunction(() => !document.querySelector('[data-enviar="6"]'));
    await pagina.goto(`${base}/notificaciones.html`);
    await pagina.waitForSelector(".notif");
    await foto("A09_notificaciones");

    await entrar("admin@patitas.com", process.env.SEED_ADMIN_PASSWORD);
    await pagina.waitForSelector("#pendingList table");
    await pagina.waitForSelector("#agenda .agenda-dia");
    await foto("B01_solicitudes_en_curso", ".card:has(#pendingList)");
    await foto("B02_agenda", ".card:has(#agenda)");
    await pagina.fill("#comentario-6", "Lara se ve sana y activa.");
    await foto("B03_revision_control", ".card:has(#listaSeguimientos)");
    await pagina.click('[data-revisar="6"][data-resultado="Todo bien"]');
    await pagina.waitForSelector("#alertaSeguimientos .alert.success");
    await foto("B04_configuracion_refugio", ".card:has(#formRefugio)");
    await foto("B05_gestion_mascotas", ".card:has(#formMascota)");
    await foto("B06_tipos_mascota", ".card:has(#formTipo)");
    const [[nueva]] = await pool.query("SELECT id FROM solicitudes WHERE mascota_id = 7 AND estado = 'Solicitada'");
    await pagina.goto(`${base}/admin-solicitud.html?id=${nueva.id}`);
    await pagina.waitForSelector("#calendario .calendario");
    await pagina.click("#calendario [data-dia]:not([disabled]) >> nth=1");
    await pagina.click("[data-hora]:not([disabled]) >> nth=4");
    await foto("B07_detalle_y_calendario");
    await pagina.click("#btnConfirmarEntrevista");
    await pagina.waitForSelector("#alertBox .alert.success");
    await foto("B08_entrevista_agendada", ".card:has(#notasAdmin)");
    await pagina.fill("#notasAdmin", "Entrevista sin observaciones.");
    await pagina.click('[data-accion="entrevistada"]');
    await pagina.waitForSelector('[data-accion="aprobar"]:not([disabled])');
    await foto("B09_decision", ".card:has(#notasAdmin)");
    await pagina.click('[data-accion="aprobar"]');
    await pagina.waitForSelector(".badge:has-text('Aprobada')");
    await foto("B10_aprobada");
  } finally {
    await navegador.close();
    servidor.close();
    await pool.end();
  }
  console.log(`Capturas del manual (${generadas.length}) en ${path.relative(process.cwd(), DESTINO)}`);
}

principal().catch((error) => {
  console.error(`No se pudieron generar las capturas del manual: ${error.message}`);
  process.exitCode = 1;
});
