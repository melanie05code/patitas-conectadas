process.env.NODE_ENV = "test";

const { randomBytes } = require("crypto");
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright-core");
const { instalarBaseDatos } = require("../database/instalar");
const app = require("../src/app");
const { pool } = require("../src/config/db");

const DESTINO = path.join(__dirname, "..", "docs", "evidencias");
const FOTOS = path.join(__dirname, "..", "database", "seed-fotos");
const CANAL = process.env.CAPTURAS_NAVEGADOR || "msedge";
const CONTRASENA_ADMIN = process.env.SEED_ADMIN_PASSWORD;
const CONTRASENA_ADOPTANTE = process.env.SEED_ADOPTANTE_PASSWORD;
const CONTRASENA_NUEVA = randomBytes(12).toString("base64url");
const CONTRASENA_INCORRECTA = randomBytes(12).toString("base64url");

async function principal() {
  fs.mkdirSync(DESTINO, { recursive: true });
  await instalarBaseDatos({ silencioso: true });
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const navegador = await chromium.launch({ channel: CANAL, headless: true });
  const generadas = [];

  async function capturar(objetivo, nombre, opciones = {}) {
    const ruta = path.join(DESTINO, `${nombre}.png`);
    const paginaDelElemento = typeof objetivo.page === "function" ? objetivo.page() : null;
    const fijarBarra = (posicion) => paginaDelElemento.evaluate((valor) => {
      const barra = document.querySelector(".topbar");
      if (barra) barra.style.position = valor;
    }, posicion);
    if (paginaDelElemento) await fijarBarra("static");
    await objetivo.screenshot({ path: ruta, ...opciones });
    if (paginaDelElemento) await fijarBarra("");
    generadas.push(`${nombre}.png`);
  }

  try {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
    const pagina = await contexto.newPage();
    pagina.on("dialog", (dialogo) => dialogo.accept());
    const alerta = (selector = "#alertBox") => pagina.waitForSelector(`${selector} .alert`);

    async function entrar(email, password, destino) {
      await pagina.goto(`${base}/login.html`);
      await pagina.evaluate(() => sessionStorage.clear());
      await pagina.goto(`${base}/login.html`);
      await pagina.fill("#email", email);
      await pagina.fill("#password", password);
      await Promise.all([pagina.waitForURL(`**/${destino}`), pagina.click("button[type=submit]")]);
      await pagina.waitForLoadState("networkidle");
    }

    async function salir() {
      await Promise.all([pagina.waitForURL("**/login.html"), pagina.click("#btnSalir")]);
    }

    await pagina.goto(`${base}/index.html`);
    await pagina.waitForFunction(() => document.getElementById("statAvailable").textContent !== "--");
    await capturar(pagina, "pantalla_inicio");

    await pagina.goto(`${base}/catalogo-publico.html`);
    const fotosCargadas = (cantidad) => pagina.waitForFunction((n) => {
      const fotos = [...document.querySelectorAll(".pet-photo img")];
      return fotos.length === n && fotos.every((i) => i.complete);
    }, cantidad);
    await fotosCargadas(8);
    await capturar(pagina, "pantalla_catalogo_publico");
    await capturar(pagina, "PR-28_catalogo_sin_adoptadas", { fullPage: true });
    await pagina.check("#verAdoptadas");
    await fotosCargadas(2);
    await capturar(pagina, "PR-28_ver_adoptadas");
    await pagina.uncheck("#verAdoptadas");
    await fotosCargadas(8);
    await pagina.click(".filter-chip:has-text('Gato')");
    await fotosCargadas(1);
    await capturar(pagina, "PR-07_catalogo_filtro_gato");

    await pagina.goto(`${base}/detalle.html?id=10`);
    await pagina.waitForFunction(() => document.querySelector(".detail-photo img")?.complete);
    await capturar(pagina, "PR-08_detalle_mascota", { fullPage: true });

    await pagina.goto(`${base}/registro.html`);
    await pagina.fill("#name", "Ana López");
    await pagina.fill("#email", "edwin.obando@correo.com");
    await pagina.fill("#password", CONTRASENA_NUEVA);
    await pagina.fill("#password2", CONTRASENA_NUEVA);
    await pagina.click("button[type=submit]");
    await alerta();
    await capturar(pagina, "PR-02_registro_correo_duplicado");
    await pagina.fill("#email", "ana.lopez@correo.com");
    await Promise.all([pagina.waitForURL("**/catalogo.html"), pagina.click("button[type=submit]")]);
    await pagina.waitForSelector(".pet-card img");
    await capturar(pagina, "PR-01_registro_exitoso");
    await salir();

    await pagina.fill("#email", "edwin.obando@correo.com");
    await pagina.fill("#password", CONTRASENA_INCORRECTA);
    await pagina.click("button[type=submit]");
    await alerta();
    await capturar(pagina, "PR-05_login_error");

    await entrar("edwin.obando@correo.com", CONTRASENA_ADOPTANTE, "catalogo.html");
    await pagina.waitForSelector("#contadorNotificaciones:not(.hidden)");
    await pagina.waitForFunction(() => [...document.querySelectorAll(".pet-photo img")].every((i) => i.complete));
    await capturar(pagina, "pantalla_catalogo_adoptante");

    await pagina.goto(`${base}/solicitar.html?id=2`);
    await pagina.waitForSelector("#petBanner img");
    await pagina.fill("#phone", "88881234");
    await pagina.fill("#address", "Barrio Altamira, Managua");
    await pagina.fill("#reason", "Quiero darle un hogar con patio y mucho cariño.");
    await pagina.evaluate(() => document.getElementById("phone").removeAttribute("pattern"));
    await pagina.click("#reqForm button[type=submit]");
    await alerta();
    await capturar(pagina, "PR-15_telefono_invalido");
    await pagina.fill("#phone", "8888-1234");
    await Promise.all([pagina.waitForURL("**/mis-solicitudes.html?enviada=1"), pagina.click("#reqForm button[type=submit]")]);
    await pagina.waitForSelector("#list .card");
    await capturar(pagina, "PR-14_solicitud_enviada");

    await pagina.click("#list .card:has-text('Cjotas')");
    await pagina.waitForSelector(".timeline .step");
    const idCjotas = new URL(pagina.url()).searchParams.get("id");
    await capturar(pagina, "PR-21_seguimiento_en_revision", { fullPage: true });

    await pagina.goto(`${base}/solicitar.html?id=4`);
    await alerta();
    await capturar(pagina, "PR-16_mascota_no_disponible");

    await pagina.goto(`${base}/notificaciones.html`);
    await pagina.waitForSelector(".notif");
    await capturar(pagina, "PR-22_notificaciones");
    await salir();

    await entrar("admin@patitas.com", CONTRASENA_ADMIN, "admin.html");
    await pagina.waitForSelector("#pendingList [data-responder]");
    await pagina.waitForSelector("#petList .miniatura img");
    await capturar(pagina, "PR-04_login_valido_admin");
    await pagina.click("#pendingList .row-flex:has-text('Cjotas') [data-estado='Aprobada']");
    await alerta("#alertaSolicitudes");
    await capturar(pagina.locator(".card").first(), "PR-18_solicitud_aprobada");

    const tarjetaTipos = pagina.locator(".card:has(#formTipo)");
    await pagina.fill("#t_nombre", "perro");
    await pagina.click("#btnGuardarTipo");
    await alerta("#alertaTipos");
    await capturar(tarjetaTipos, "PR-09_tipo_duplicado");
    await pagina.click("#listaTipos tr:has-text('Conejo') [data-alternar-tipo]");
    await pagina.waitForSelector("#alertaTipos .alert.success");
    await capturar(tarjetaTipos, "PR-13_tipo_desactivado");

    const tarjetaMascotas = pagina.locator(".card:has(#formMascota)");
    const capturarFormulario = async (nombre) => {
      await pagina.evaluate(() => document.getElementById("petList").classList.add("hidden"));
      await capturar(tarjetaMascotas, nombre);
      await pagina.evaluate(() => document.getElementById("petList").classList.remove("hidden"));
    };
    await pagina.click("#btnNuevaMascota");
    const notaTxt = path.join(DESTINO, "nota-temporal.txt");
    fs.writeFileSync(notaTxt, "esto no es una imagen");
    await pagina.setInputFiles("#m_foto", notaTxt);
    fs.rmSync(notaTxt, { force: true });
    await alerta("#alertaMascotas");
    await capturarFormulario("PR-12_foto_invalida");
    await pagina.fill("#m_nombre", "Tigrillo");
    await pagina.selectOption("#m_tipo", { label: "🐱 Gato" });
    await pagina.fill("#m_edad", "8 meses");
    await pagina.fill("#m_raza", "Común atigrado");
    await pagina.fill("#m_descripcion", "Gatito juguetón y curioso, rescatado de la calle.");
    await pagina.setInputFiles("#m_foto", path.join(FOTOS, "calenturiento.jpg"));
    await pagina.waitForSelector("#vistaPrevia:not(.hidden)");
    await capturarFormulario("PR-11_formulario_con_vista_previa");
    await pagina.click("#formMascota button[type=submit]");
    await pagina.waitForSelector("#alertaMascotas .alert.success");
    await pagina.waitForFunction(() => [...document.querySelectorAll("#petList img")].every((i) => i.complete));
    await capturar(tarjetaMascotas, "PR-11_mascota_con_foto");
    await pagina.goto(`${base}/admin.html`);
    await pagina.waitForSelector("#petList .miniatura img");
    await pagina.waitForFunction(() => [...document.querySelectorAll("img")].every((i) => i.complete));
    await capturar(pagina, "pantalla_panel_admin", { fullPage: true });
    await salir();

    await entrar("edwin.obando@correo.com", CONTRASENA_ADOPTANTE, "catalogo.html");
    await pagina.goto(`${base}/seguimiento.html?id=${idCjotas}`);
    await pagina.waitForSelector(".step.current");
    await capturar(pagina, "PR-18_seguimiento_aprobada", { fullPage: true });
    await contexto.close();

    const movil = await navegador.newContext({ ...devices["iPhone 13"] });
    const paginaMovil = await movil.newPage();
    await paginaMovil.goto(`${base}/catalogo-publico.html`);
    await paginaMovil.waitForFunction(() => [...document.querySelectorAll(".pet-photo img")].slice(0, 2).every((i) => i.complete));
    await capturar(paginaMovil, "pantalla_movil_catalogo");
    await paginaMovil.goto(`${base}/detalle.html?id=1`);
    await paginaMovil.waitForFunction(() => document.querySelector(".detail-photo img")?.complete);
    await capturar(paginaMovil, "pantalla_movil_detalle", { fullPage: true });
    await movil.close();
  } finally {
    await navegador.close();
    servidor.close();
    await pool.end();
  }
  return generadas;
}

principal()
  .then((generadas) => {
    console.log(`Se generaron ${generadas.length} capturas en docs/evidencias/:`);
    generadas.forEach((nombre) => console.log(`  - ${nombre}`));
  })
  .catch((error) => {
    console.error(`No se pudieron generar las capturas: ${error.message}`);
    process.exitCode = 1;
  });
