process.env.NODE_ENV = "test";

const fs = require("fs");
const path = require("path");
const { randomBytes } = require("crypto");
const { chromium } = require("playwright-core");
const { instalarBaseDatos } = require("../../database/instalar");
const app = require("../../src/app");
const { pool } = require("../../src/config/db");

const DESTINO = path.join(__dirname, "..", "..", "docs", "evidencias", "final", "e2e");
const FOTOS = path.join(__dirname, "..", "..", "database", "seed-fotos");
const CANAL = process.env.CAPTURAS_NAVEGADOR || "msedge";
const ADMIN = { email: "admin@patitas.com", password: process.env.SEED_ADMIN_PASSWORD };
const EDWIN = { email: "edwin.obando@correo.com", password: process.env.SEED_ADOPTANTE_PASSWORD };
const INCORRECTA = randomBytes(12).toString("base64url");
const CORTA = randomBytes(3).toString("hex");
const NUEVA = { nombre: "Valeria Prueba", email: `valeria.${Date.now()}@correo.com`, password: randomBytes(12).toString("base64url") };

const resultados = [];

async function caso(id, nombre, pasos) {
  const inicio = Date.now();
  try {
    await pasos();
    resultados.push({ id, nombre, estado: "Aprobado", duracionMs: Date.now() - inicio });
    console.log(`  OK    ${id} ${nombre}`);
  } catch (error) {
    resultados.push({ id, nombre, estado: "Fallido", duracionMs: Date.now() - inicio, error: error.message.split("\n")[0] });
    console.log(`  FALLA ${id} ${nombre}\n        ${error.message.split("\n")[0]}`);
  }
}

function esperar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

function diaHabil(desplazamiento) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + desplazamiento);
  if (fecha.getDay() === 0) fecha.setDate(fecha.getDate() + 1);
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

async function principal() {
  fs.rmSync(DESTINO, { recursive: true, force: true });
  fs.mkdirSync(DESTINO, { recursive: true });
  await instalarBaseDatos({ silencioso: true });
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const navegador = await chromium.launch({ channel: CANAL, headless: true });
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 860 } });
  const pagina = await contexto.newPage();
  const erroresConsola = [];
  pagina.on("pageerror", (error) => erroresConsola.push(error.message));
  pagina.on("dialog", (dialogo) => dialogo.accept());

  const captura = async (nombre, selector = null) => {
    const ruta = path.join(DESTINO, `${nombre}.png`);
    await pagina.evaluate(() => { const barra = document.querySelector(".topbar"); if (barra) barra.style.position = "static"; });
    if (selector) await pagina.locator(selector).first().screenshot({ path: ruta });
    else await pagina.screenshot({ path: ruta, fullPage: true });
    return `e2e/${nombre}.png`;
  };
  const salir = () => pagina.evaluate(() => sessionStorage.clear());
  const entrar = async ({ email, password }) => {
    await pagina.goto(`${base}/index.html`);
    await salir();
    await pagina.goto(`${base}/login.html`);
    await pagina.fill("#email", email);
    await pagina.fill("#password", password);
    await pagina.click("#loginForm button[type=submit]");
    await pagina.waitForURL((url) => !url.pathname.endsWith("login.html"));
  };
  const textoDe = (selector) => pagina.locator(selector).first().innerText();
  let solicitudNueva = null;
  let mascotaNueva = null;

  try {
    console.log("Pruebas E2E (Playwright + Edge)");

    await caso("E2E-01", "Adoptante: registro, inicio de sesión y perfil completo", async () => {
      await pagina.goto(`${base}/registro.html`);
      await pagina.fill("#name", NUEVA.nombre);
      await pagina.fill("#email", NUEVA.email);
      await pagina.fill("#password", NUEVA.password);
      await pagina.fill("#password2", NUEVA.password);
      await pagina.click("#regForm button[type=submit]");
      await pagina.waitForURL((url) => !url.pathname.endsWith("registro.html"));
      await salir();
      await entrar(NUEVA);
      await pagina.goto(`${base}/perfil.html`);
      await pagina.selectOption("#p_vivienda", "Casa");
      await pagina.fill("#p_personas", "3");
      await pagina.check("input[name=p_patio][value=si]");
      await pagina.check("input[name=p_ingresos][value=si]");
      await pagina.check("input[name=p_otras][value=no]");
      await pagina.check("input[name=p_experiencia][value=si]");
      await pagina.fill("#p_experiencia_detalle", "Tuve un perro durante doce años.");
      await pagina.click("#btnGuardarPerfil");
      await pagina.waitForSelector("#alertBox .alert.success");
      await captura("E2E-01_perfil_guardado", ".container");
    });

    await caso("E2E-02", "Adoptante: catálogo con filtro, detalle y solicitud", async () => {
      await pagina.goto(`${base}/catalogo.html`);
      await pagina.waitForSelector(".pet-card");
      await pagina.click('.filter-chip:has-text("Perro")');
      await pagina.fill("#search", "Hambriento");
      await pagina.waitForFunction(() => document.querySelectorAll(".pet-card").length === 1);
      await captura("E2E-02_catalogo_filtrado", ".container");
      await pagina.click(".pet-card");
      await pagina.waitForSelector('#detailCard a[href^="solicitar.html"]');
      await captura("E2E-02_detalle", ".container");
      await pagina.click('#detailCard a[href^="solicitar.html"]');
      await pagina.waitForSelector("#petBanner .avatar");
      await pagina.fill("#phone", "8123-4567");
      await pagina.fill("#address", "Reparto Schick, Managua");
      await pagina.fill("#reason", "Tengo patio grande y tiempo para pasearlo todos los días.");
      await pagina.click("#reqForm button[type=submit]");
      await pagina.waitForURL(/mis-solicitudes\.html/);
      await pagina.waitForSelector("#list a[href^='seguimiento.html']");
      solicitudNueva = Number(new URL(await pagina.locator("#list a[href^='seguimiento.html']").first().getAttribute("href"), base).searchParams.get("id"));
      await captura("E2E-02_solicitud_enviada", ".container");
      const [[fila]] = await pool.query("SELECT s.estado, m.estado AS mascota FROM solicitudes s JOIN mascotas m ON m.id = s.mascota_id WHERE s.id = ?", [solicitudNueva]);
      esperar(fila.estado === "Solicitada" && fila.mascota === "En proceso", `Estado inesperado en la BD: ${JSON.stringify(fila)}`);
    });

    await caso("E2E-03", "Admin: crear y editar una mascota con foto", async () => {
      await entrar(ADMIN);
      await pagina.goto(`${base}/admin.html`);
      await pagina.click("#btnNuevaMascota");
      await pagina.fill("#m_nombre", "Canela");
      await pagina.selectOption("#m_tipo", { label: "Perro" });
      await pagina.fill("#m_edad", "1 año");
      await pagina.fill("#m_raza", "Mestiza");
      await pagina.selectOption("#m_sexo", "Hembra");
      await pagina.fill("#m_descripcion", "Perrita tranquila y cariñosa, rescatada en el mercado.");
      await pagina.setInputFiles("#m_foto", path.join(FOTOS, "dormilona.jpg"));
      await pagina.click("#formMascota button[type=submit]");
      await pagina.waitForSelector("#alertaMascotas .alert.success");
      const [[creada]] = await pool.query("SELECT id, foto_url AS fotoUrl FROM mascotas WHERE nombre = 'Canela'");
      mascotaNueva = creada.id;
      esperar(/^\/uploads\/mascotas\/.+\.jpg$/.test(creada.fotoUrl), "La foto no quedó guardada");
      await pagina.click(`[data-editar-mascota="${mascotaNueva}"]`);
      await pagina.fill("#m_edad", "14 meses");
      await pagina.click("#formMascota button[type=submit]");
      await pagina.waitForSelector("#alertaMascotas .alert.success");
      const [[editada]] = await pool.query("SELECT edad FROM mascotas WHERE id = ?", [mascotaNueva]);
      esperar(editada.edad === "14 meses", "La edición no se guardó");
      await captura("E2E-03_mascota_creada_y_editada", ".card:has(#formMascota)");
    });

    await caso("E2E-04", "Admin: agendar la entrevista en el calendario", async () => {
      await pagina.goto(`${base}/admin-solicitud.html?id=${solicitudNueva}`);
      await pagina.waitForSelector("#calendario .calendario");
      const dia = diaHabil(4);
      if (!(await pagina.locator(`[data-dia="${dia}"]`).count())) await pagina.click('[data-mover="1"]');
      await pagina.click(`[data-dia="${dia}"]`);
      await pagina.waitForSelector("[data-hora]");
      await pagina.click('[data-hora="11:00"]');
      await captura("E2E-04_calendario_horarios", ".container");
      await pagina.click("#btnConfirmarEntrevista");
      await pagina.waitForSelector("#alertBox .alert.success");
      await pagina.waitForSelector(".badge:has-text('Entrevista programada')");
      await captura("E2E-04_entrevista_agendada", ".container");
    });

    await caso("E2E-05", "Adoptante: ve la entrevista en su seguimiento", async () => {
      await entrar(NUEVA);
      await pagina.goto(`${base}/seguimiento.html?id=${solicitudNueva}`);
      await pagina.waitForSelector(".tarjeta-entrevista");
      const tarjeta = await textoDe(".tarjeta-entrevista");
      esperar(tarjeta.includes("11:00 a. m.") && tarjeta.includes("Barrio Las Flores"), `Tarjeta inesperada: ${tarjeta}`);
      esperar(await pagina.locator(".etapa.actual:has-text('Entrevista programada')").count() === 1, "La etapa actual no es Entrevista programada");
      await captura("E2E-05_seguimiento_con_entrevista", ".container");
    });

    await caso("E2E-06", "Admin: marcar entrevistada y aprobar; la mascota queda Adoptada con 4 controles", async () => {
      await entrar(ADMIN);
      await pagina.goto(`${base}/admin-solicitud.html?id=${solicitudNueva}`);
      await pagina.fill("#notasAdmin", "Familia preparada y con patio cercado.");
      await pagina.click('[data-accion="entrevistada"]');
      await pagina.waitForSelector('[data-accion="aprobar"]:not([disabled])');
      await pagina.click('[data-accion="aprobar"]');
      await pagina.waitForSelector(".badge:has-text('Aprobada')");
      await captura("E2E-06_solicitud_aprobada", ".container");
      const [[fila]] = await pool.query(
        "SELECT m.estado AS mascota, (SELECT COUNT(*) FROM seguimientos g WHERE g.solicitud_id = s.id) AS controles FROM solicitudes s JOIN mascotas m ON m.id = s.mascota_id WHERE s.id = ?",
        [solicitudNueva]
      );
      esperar(fila.mascota === "Adoptada" && Number(fila.controles) === 4, `Resultado inesperado: ${JSON.stringify(fila)}`);
    });

    await caso("E2E-07", "Adoptante: sube la foto de un control vencido", async () => {
      await entrar(EDWIN);
      await pagina.goto(`${base}/seguimiento.html?id=4`);
      await pagina.waitForSelector('input[data-control="6"]');
      await pagina.setInputFiles('input[data-control="6"]', path.join(FOTOS, "lara.jpg"));
      await pagina.waitForSelector("#vista-6 img");
      await captura("E2E-07_control_vista_previa", "#seguimientos");
      await pagina.click('[data-enviar="6"]');
      await pagina.waitForFunction(() => !document.querySelector('[data-enviar="6"]'));
      await captura("E2E-07_control_enviado", "#seguimientos");
    });

    await caso("E2E-08", "Admin: revisa el control como Todo bien", async () => {
      await entrar(ADMIN);
      await pagina.goto(`${base}/admin.html`);
      await pagina.waitForSelector(".revision-control");
      await pagina.fill("#comentario-6", "Lara se ve sana y activa.");
      await captura("E2E-08_revision_control", "#listaSeguimientos");
      await pagina.click('[data-revisar="6"][data-resultado="Todo bien"]');
      await pagina.waitForSelector("#alertaSeguimientos .alert.success");
      const [[fila]] = await pool.query("SELECT estado, comentario_admin AS comentario FROM seguimientos WHERE id = 6");
      esperar(fila.estado === "Todo bien" && fila.comentario === "Lara se ve sana y activa.", `Control inesperado: ${JSON.stringify(fila)}`);
    });

    await caso("E2E-09", "Negativo: inicio de sesión con contraseña incorrecta", async () => {
      await pagina.goto(`${base}/index.html`);
      await salir();
      await pagina.goto(`${base}/login.html`);
      await pagina.fill("#email", ADMIN.email);
      await pagina.fill("#password", INCORRECTA);
      await pagina.click("#loginForm button[type=submit]");
      await pagina.waitForSelector("#alertBox .alert.error");
      esperar((await textoDe("#alertBox")).includes("Correo o contraseña incorrectos"), "Mensaje inesperado");
      esperar(pagina.url().endsWith("login.html"), "No debía salir de login");
      await captura("E2E-09_login_invalido", ".container");
    });

    await caso("E2E-10", "Negativo: registro con datos inválidos", async () => {
      await pagina.goto(`${base}/registro.html`);
      await pagina.fill("#name", "A");
      await pagina.fill("#email", "correo-sin-arroba");
      await pagina.fill("#password", CORTA);
      await pagina.fill("#password2", `${CORTA}x`);
      await pagina.click("#regForm button[type=submit]");
      await pagina.waitForTimeout(500);
      const valido = await pagina.evaluate(() => document.getElementById("regForm").checkValidity());
      const alerta = await pagina.locator("#alertBox .alert.error").count();
      esperar(!valido || alerta === 1, "El formulario aceptó datos inválidos");
      esperar(pagina.url().endsWith("registro.html"), "No debía salir de registro");
      const api = await pagina.evaluate(async (clave) => {
        const r = await fetch("/api/auth/registro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: "A", email: "correo-sin-arroba", password: clave }) });
        return r.status;
      }, CORTA);
      esperar(api === 400, `La API respondió ${api}`);
      const [[fila]] = await pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE email = 'correo-sin-arroba'");
      esperar(Number(fila.total) === 0, "Se guardó un usuario inválido");
      await captura("E2E-10_registro_invalido", ".container");
    });

    await caso("E2E-11", "Negativo: solicitar sin perfil lleva a completar el perfil", async () => {
      await pagina.goto(`${base}/registro.html`);
      await pagina.fill("#name", "Sin Perfil");
      await pagina.fill("#email", `sin.perfil.${Date.now()}@correo.com`);
      await pagina.fill("#password", NUEVA.password);
      await pagina.fill("#password2", NUEVA.password);
      await pagina.click("#regForm button[type=submit]");
      await pagina.waitForURL((url) => !url.pathname.endsWith("registro.html"));
      await pagina.goto(`${base}/solicitar.html?id=2`);
      await pagina.waitForURL(/perfil\.html\?volver=/);
      await pagina.waitForSelector("#alertBox .alert");
      await captura("E2E-11_solicitar_sin_perfil", ".container");
    });

    await caso("E2E-12", "Negativo: solicitar una mascota que no está disponible", async () => {
      await entrar(EDWIN);
      await pagina.goto(`${base}/detalle.html?id=1`);
      await pagina.waitForSelector("#detailCard button[disabled]");
      await pagina.goto(`${base}/solicitar.html?id=1`);
      await pagina.waitForSelector("#alertBox .alert.error");
      esperar(await pagina.locator("#reqForm button[type=submit][disabled]").count() === 1, "El formulario no se bloqueó");
      await captura("E2E-12_mascota_no_disponible", ".container");
    });

    await caso("E2E-13", "Negativo: un adoptante que entra al panel admin es redirigido", async () => {
      await pagina.goto(`${base}/admin.html`);
      await pagina.waitForURL((url) => !url.pathname.endsWith("admin.html"));
      await pagina.goto(`${base}/admin-solicitud.html?id=1`);
      await pagina.waitForURL((url) => !url.pathname.endsWith("admin-solicitud.html"));
      const estado = await pagina.evaluate(async () => {
        const { token } = JSON.parse(sessionStorage.getItem("pc_sesion"));
        return (await fetch("/api/admin/solicitudes", { headers: { Authorization: `Bearer ${token}` } })).status;
      });
      esperar(estado === 403, `La API respondió ${estado}`);
      await captura("E2E-13_adoptante_redirigido");
    });

    await caso("E2E-14", "Negativo: foto de tipo inválido y foto mayor a 2 MB", async () => {
      const texto = path.join(DESTINO, "no-es-imagen.txt");
      const grande = path.join(DESTINO, "foto-grande.jpg");
      fs.writeFileSync(texto, "esto no es una imagen");
      fs.writeFileSync(grande, Buffer.concat([fs.readFileSync(path.join(FOTOS, "lara.jpg")), Buffer.alloc(2 * 1024 * 1024)]));
      try {
        await entrar(ADMIN);
        await pagina.goto(`${base}/admin.html`);
        await pagina.click("#btnNuevaMascota");
        await pagina.setInputFiles("#m_foto", texto);
        await pagina.waitForSelector("#alertaMascotas .alert.error");
        await captura("E2E-14_foto_tipo_invalido", ".card:has(#formMascota)");
        await entrar(EDWIN);
        await pagina.goto(`${base}/seguimiento.html?id=2`);
        await pagina.waitForSelector("#seguimientos");
        const respuesta = await pagina.evaluate(async () => {
          const { token } = JSON.parse(sessionStorage.getItem("pc_sesion"));
          const datos = new FormData();
          datos.append("foto", new Blob([new Uint8Array(2 * 1024 * 1024 + 10)], { type: "image/jpeg" }), "grande.jpg");
          const r = await fetch("/api/seguimientos/6/foto", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: datos });
          return { status: r.status, cuerpo: await r.json() };
        });
        esperar(respuesta.status === 400 && respuesta.cuerpo.error === "La foto no puede superar 2 MB.", `Respuesta inesperada: ${JSON.stringify(respuesta)}`);
        await pagina.goto(`${base}/seguimiento.html?id=4`);
        await pagina.waitForSelector("#seguimientos");
      } finally {
        fs.rmSync(texto, { force: true });
        fs.rmSync(grande, { force: true });
      }
    });

    await caso("E2E-15", "Interfaz móvil: línea de tiempo vertical y sin desbordes", async () => {
      await entrar(EDWIN);
      await pagina.setViewportSize({ width: 390, height: 844 });
      await pagina.goto(`${base}/seguimiento.html?id=1`);
      await pagina.waitForSelector(".linea-tiempo");
      const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      esperar(!desborde, "Hay desplazamiento horizontal en móvil");
      await captura("E2E-15_seguimiento_movil");
      await pagina.setViewportSize({ width: 1280, height: 860 });
    });

    await caso("E2E-16", "Sin errores de JavaScript en las páginas recorridas", async () => {
      esperar(erroresConsola.length === 0, `Errores: ${erroresConsola.join(" | ")}`);
    });
  } finally {
    await navegador.close();
    servidor.close();
    await pool.end();
  }

  const aprobados = resultados.filter((r) => r.estado === "Aprobado").length;
  const resumen = {
    fecha: new Date().toISOString(),
    node: process.version,
    navegador: CANAL,
    ejecutados: resultados.length,
    aprobados,
    fallidos: resultados.length - aprobados,
    resultados,
  };
  fs.writeFileSync(path.join(DESTINO, "resultados.json"), `${JSON.stringify(resumen, null, 2)}\n`);
  console.log(`\nE2E: ${resumen.ejecutados} ejecutados, ${resumen.aprobados} aprobados, ${resumen.fallidos} fallidos.`);
  if (resumen.fallidos > 0) process.exitCode = 1;
}

principal().catch((error) => {
  console.error(`No se pudieron ejecutar las pruebas E2E: ${error.message}`);
  process.exitCode = 1;
});
