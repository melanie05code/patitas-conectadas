const fs = require("fs");
const os = require("os");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { db } = require("../../src/config/entorno");
const t = require("./transformar");

const BD_PRODUCCION = process.env.DB_NAME || "patitas_conectadas";
const BD_PRUEBAS = process.env.DB_NAME_TEST || "patitas_test";
const ARCHIVO_EJEMPLO = path.join(__dirname, "respaldo_localstorage.ejemplo.json");
const DIRECTORIO_RESPALDOS = path.join(__dirname, "respaldos");
const REPORTE_POR_DEFECTO = path.join(__dirname, "migracion_reporte.txt");
const RONDAS_BCRYPT = 10;
const ENTIDADES = ["usuarios", "mascotas", "solicitudes", "notificaciones"];

function crearReporte() {
  const conteos = Object.fromEntries(ENTIDADES.map((e) => [e, { origen: 0, insertados: 0, vinculados: 0, descartados: 0 }]));
  return {
    conteos,
    insertados: Object.fromEntries(ENTIDADES.map((e) => [e, []])),
    descartes: [],
    vinculos: [],
    avisos: [],
    validaciones: [],
    descartar(entidad, idOrigen, motivo) {
      conteos[entidad].descartados++;
      this.descartes.push(`[${entidad}] id origen ${idOrigen}: ${motivo}`);
    },
    vincular(entidad, idOrigen, motivo) {
      conteos[entidad].vinculados++;
      this.vinculos.push(`[${entidad}] id origen ${idOrigen}: ${motivo}`);
    },
    insertar(entidad, idDestino) {
      conteos[entidad].insertados++;
      this.insertados[entidad].push(idDestino);
    },
    avisar(entidad, idOrigen, mensaje) {
      this.avisos.push(`[${entidad}] id origen ${idOrigen}: ${mensaje}`);
    },
  };
}

function marcaDeTiempo(fecha = new Date()) {
  return t.aDatetime(fecha).replace(/:/g, "").replace(" ", "_").slice(0, 15);
}

function ejecutarMysqldump(bd, archivoSql) {
  const ejecutable = process.env.MYSQLDUMP_PATH || "mysqldump";
  const credenciales = path.join(os.tmpdir(), `patitas-dump-${randomUUID()}.cnf`);
  fs.writeFileSync(credenciales, `[client]\nuser="${db.user}"\npassword="${db.password}"\nhost="${db.host}"\nport=${db.port}\n`, { mode: 0o600 });
  return new Promise((resolver, rechazar) => {
    const proceso = spawn(ejecutable, [
      `--defaults-extra-file=${credenciales}`,
      "--no-tablespaces",
      "--single-transaction",
      "--skip-comments",
      `--result-file=${archivoSql}`,
      bd,
    ]);
    let errores = "";
    proceso.stderr.on("data", (dato) => { errores += dato; });
    proceso.on("error", (error) => {
      fs.rmSync(credenciales, { force: true });
      rechazar(new Error(`No se pudo ejecutar mysqldump (${ejecutable}): ${error.message}`));
    });
    proceso.on("close", (codigo) => {
      fs.rmSync(credenciales, { force: true });
      if (codigo === 0) resolver();
      else rechazar(new Error(`mysqldump terminó con código ${codigo}: ${errores.trim()}`));
    });
  });
}

async function respaldar({ archivo, bd, directorioRespaldos, marca }) {
  const carpeta = path.join(directorioRespaldos, marca);
  fs.mkdirSync(carpeta, { recursive: true });
  const copiaJson = path.join(carpeta, `respaldo_localstorage_${marca}.json`);
  fs.copyFileSync(archivo, copiaJson);
  const volcado = path.join(carpeta, `${bd}_${marca}.sql`);
  await ejecutarMysqldump(bd, volcado);
  return { carpeta, copiaJson, volcado, tamanoVolcado: fs.statSync(volcado).size };
}

function extraer(archivo) {
  const contenido = JSON.parse(fs.readFileSync(archivo, "utf8"));
  const datos = contenido.datos || contenido;
  const referencia = contenido.exportadoEn ? new Date(contenido.exportadoEn) : fs.statSync(archivo).mtime;
  if (Number.isNaN(referencia.getTime())) throw new Error("La fecha de exportación del respaldo no es válida.");
  return {
    origen: contenido.origen || "desconocido",
    referencia,
    usuarios: t.leerColeccion(datos, "pc_users"),
    mascotas: t.leerColeccion(datos, "pc_pets"),
    solicitudes: t.leerColeccion(datos, "pc_requests"),
    notificaciones: t.leerColeccion(datos, "pc_notifications"),
  };
}

async function contarTablas(conexion) {
  const [[fila]] = await conexion.query(
    `SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios, (SELECT COUNT(*) FROM mascotas) AS mascotas,
            (SELECT COUNT(*) FROM solicitudes) AS solicitudes, (SELECT COUNT(*) FROM notificaciones) AS notificaciones`
  );
  return Object.fromEntries(Object.entries(fila).map(([k, v]) => [k, Number(v)]));
}

async function cargarUsuarios(conexion, origen, mapa, reporte) {
  const [existentes] = await conexion.query("SELECT id, email FROM usuarios");
  const porEmail = new Map(existentes.map((u) => [u.email, u.id]));
  const vistos = new Map();
  for (const usuario of origen) {
    reporte.conteos.usuarios.origen++;
    const nombre = String(usuario.name ?? usuario.nombre ?? "").trim();
    const email = t.normalizarEmail(usuario.email);
    const password = usuario.password ?? usuario.passwordHash;
    if (!email) { reporte.descartar("usuarios", usuario.id, `correo inválido (${JSON.stringify(usuario.email)})`); continue; }
    if (nombre.length < 2) { reporte.descartar("usuarios", usuario.id, "nombre vacío o demasiado corto"); continue; }
    if (vistos.has(email)) {
      mapa.set(usuario.id, vistos.get(email));
      reporte.vincular("usuarios", usuario.id, `correo duplicado en el origen (${email}); se unifica con la primera cuenta`);
      continue;
    }
    if (porEmail.has(email)) {
      mapa.set(usuario.id, porEmail.get(email));
      vistos.set(email, porEmail.get(email));
      reporte.vincular("usuarios", usuario.id, `${email} ya existía en el destino; se vincula sin modificarlo`);
      continue;
    }
    if (!password) { reporte.descartar("usuarios", usuario.id, "sin contraseña"); continue; }
    let passwordHash = password;
    if (!t.esHashBcrypt(password)) {
      passwordHash = await bcrypt.hash(String(password), RONDAS_BCRYPT);
      reporte.avisar("usuarios", usuario.id, "contraseña en texto plano: se guardó con hash bcrypt");
      if (String(password).length < 8) reporte.avisar("usuarios", usuario.id, "contraseña de menos de 8 caracteres: se recomienda pedir que la cambie");
    }
    const rol = usuario.role === "admin" || usuario.rol === "admin" ? "admin" : "adoptante";
    const [resultado] = await conexion.execute(
      "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, passwordHash, rol]
    );
    mapa.set(usuario.id, resultado.insertId);
    vistos.set(email, resultado.insertId);
    reporte.insertar("usuarios", resultado.insertId);
  }
}

async function cargarMascotas(conexion, origen, mapa, reporte) {
  const [tipos] = await conexion.query("SELECT id, nombre FROM tipos_mascota");
  const tipoPorNombre = new Map(tipos.map((tipo) => [t.sinAcentos(tipo.nombre), tipo.id]));
  const tipoOtro = tipoPorNombre.get("otro");
  const [existentes] = await conexion.query("SELECT id, nombre, tipo_id AS tipoId FROM mascotas");
  const porClave = new Map(existentes.map((m) => [`${t.sinAcentos(m.nombre)}|${m.tipoId}`, m.id]));
  for (const mascota of origen) {
    reporte.conteos.mascotas.origen++;
    const nombre = String(mascota.name ?? mascota.nombre ?? "").trim();
    if (!nombre) { reporte.descartar("mascotas", mascota.id, "sin nombre"); continue; }
    if (mapa.has(mascota.id)) { reporte.descartar("mascotas", mascota.id, "id repetido en el origen"); continue; }
    const tipoTexto = mascota.type ?? mascota.tipo;
    let tipoId = tipoPorNombre.get(t.sinAcentos(tipoTexto));
    if (!tipoId) {
      tipoId = tipoOtro;
      reporte.avisar("mascotas", mascota.id, `tipo desconocido (${JSON.stringify(tipoTexto)}): se asigna "Otro"`);
    }
    const clave = `${t.sinAcentos(nombre)}|${tipoId}`;
    if (porClave.has(clave)) {
      mapa.set(mascota.id, porClave.get(clave));
      reporte.vincular("mascotas", mascota.id, `${nombre} ya existía en el destino con el mismo tipo; se vincula`);
      continue;
    }
    let estado = t.normalizarEstado(mascota.status ?? mascota.estado, t.ESTADOS_MASCOTA);
    if (!estado) {
      estado = "Disponible";
      reporte.avisar("mascotas", mascota.id, `estado desconocido (${JSON.stringify(mascota.status)}): se asigna "Disponible"`);
    }
    const sexo = t.sinAcentos(mascota.sex ?? mascota.sexo) === "hembra" ? "Hembra" : "Macho";
    const descripcion = String(mascota.desc ?? mascota.descripcion ?? "").trim() || "Sin descripción registrada en el prototipo.";
    const [resultado] = await conexion.execute(
      "INSERT INTO mascotas (nombre, tipo_id, edad, raza, sexo, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, tipoId, String(mascota.age ?? mascota.edad ?? "Sin dato").trim() || "Sin dato", String(mascota.breed ?? mascota.raza ?? "Sin dato").trim() || "Sin dato", sexo, descripcion, estado]
    );
    mapa.set(mascota.id, resultado.insertId);
    porClave.set(clave, resultado.insertId);
    reporte.insertar("mascotas", resultado.insertId);
  }
}

async function cargarSolicitudes(conexion, origen, mapas, referencia, reporte) {
  const [existentes] = await conexion.query(
    "SELECT usuario_id AS u, mascota_id AS m, DATE_FORMAT(fecha, '%Y-%m-%d') AS f, estado FROM solicitudes"
  );
  const claves = new Set(existentes.map((s) => `${s.u}|${s.m}|${s.f}|${s.estado}`));
  const enRevision = new Set(existentes.filter((s) => s.estado === "En revisión").map((s) => s.m));
  const aprobadas = new Set(existentes.filter((s) => s.estado === "Aprobada").map((s) => s.m));
  for (const solicitud of origen) {
    reporte.conteos.solicitudes.origen++;
    const usuarioId = mapas.usuarios.get(solicitud.userId ?? solicitud.usuarioId);
    const mascotaId = mapas.mascotas.get(solicitud.petId ?? solicitud.mascotaId);
    if (!usuarioId || !mascotaId) {
      reporte.descartar("solicitudes", solicitud.id, `huérfana: ${!usuarioId ? `usuario ${solicitud.userId} inexistente` : `mascota ${solicitud.petId} inexistente`}`);
      continue;
    }
    const telefono = t.normalizarTelefono(solicitud.phone ?? solicitud.telefono);
    if (!telefono) { reporte.descartar("solicitudes", solicitud.id, `teléfono inválido (${JSON.stringify(solicitud.phone)})`); continue; }
    if (telefono !== solicitud.phone) reporte.avisar("solicitudes", solicitud.id, `teléfono normalizado de "${solicitud.phone}" a "${telefono}"`);
    const direccion = String(solicitud.address ?? solicitud.direccion ?? "").trim();
    const motivo = String(solicitud.reason ?? solicitud.motivo ?? "").trim();
    if (direccion.length < 5) { reporte.descartar("solicitudes", solicitud.id, "dirección vacía o demasiado corta"); continue; }
    if (motivo.length < 10) { reporte.descartar("solicitudes", solicitud.id, "motivo vacío o demasiado corto"); continue; }
    const estado = t.normalizarEstado(solicitud.status ?? solicitud.estado, t.ESTADOS_SOLICITUD);
    if (!estado) { reporte.descartar("solicitudes", solicitud.id, `estado desconocido (${JSON.stringify(solicitud.status)})`); continue; }
    let fecha = t.convertirFecha(solicitud.date ?? solicitud.fecha, referencia);
    if (!fecha) {
      fecha = { fecha: t.aDatetime(referencia), exacta: false };
      reporte.avisar("solicitudes", solicitud.id, `fecha ilegible (${JSON.stringify(solicitud.date)}): se usa la fecha de exportación`);
    }
    const clave = `${usuarioId}|${mascotaId}|${fecha.fecha.slice(0, 10)}|${estado}`;
    if (claves.has(clave)) { reporte.descartar("solicitudes", solicitud.id, "duplicada: ya existe la misma solicitud en el destino"); continue; }
    if (estado === "En revisión" && enRevision.has(mascotaId)) { reporte.descartar("solicitudes", solicitud.id, "la mascota ya tiene otra solicitud En revisión"); continue; }
    if (estado === "Aprobada" && aprobadas.has(mascotaId)) { reporte.descartar("solicitudes", solicitud.id, "la mascota ya tiene otra solicitud Aprobada"); continue; }
    const [resultado] = await conexion.execute(
      "INSERT INTO solicitudes (mascota_id, usuario_id, telefono, direccion, motivo, estado, fecha, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [mascotaId, usuarioId, telefono, direccion, motivo, estado, fecha.fecha, fecha.fecha]
    );
    claves.add(clave);
    if (estado === "En revisión") enRevision.add(mascotaId);
    if (estado === "Aprobada") aprobadas.add(mascotaId);
    reporte.insertar("solicitudes", resultado.insertId);
  }
}

async function cargarNotificaciones(conexion, origen, mapas, referencia, reporte) {
  const [existentes] = await conexion.query(
    "SELECT usuario_id AS u, texto, DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') AS c FROM notificaciones"
  );
  const claves = new Set(existentes.map((n) => `${n.u}|${n.texto}|${n.c}`));
  for (const notificacion of origen) {
    reporte.conteos.notificaciones.origen++;
    const usuarioId = mapas.usuarios.get(notificacion.userId ?? notificacion.usuarioId);
    if (!usuarioId) { reporte.descartar("notificaciones", notificacion.id, `huérfana: usuario ${notificacion.userId} inexistente`); continue; }
    let texto = String(notificacion.text ?? notificacion.texto ?? "").trim();
    if (!texto) { reporte.descartar("notificaciones", notificacion.id, "sin texto"); continue; }
    if (texto.length > 255) {
      texto = texto.slice(0, 255);
      reporte.avisar("notificaciones", notificacion.id, "texto recortado a 255 caracteres");
    }
    let fecha = t.convertirFecha(notificacion.date ?? notificacion.fecha, referencia);
    if (!fecha) {
      fecha = { fecha: t.aDatetime(referencia), exacta: false };
      reporte.avisar("notificaciones", notificacion.id, `fecha ilegible (${JSON.stringify(notificacion.date)}): se usa la fecha de exportación`);
    } else if (!fecha.exacta) {
      reporte.avisar("notificaciones", notificacion.id, `fecha relativa "${notificacion.date}" convertida a ${fecha.fecha}`);
    }
    const clave = `${usuarioId}|${texto}|${fecha.fecha}`;
    if (claves.has(clave)) { reporte.descartar("notificaciones", notificacion.id, "duplicada: ya existe en el destino"); continue; }
    const [resultado] = await conexion.execute(
      "INSERT INTO notificaciones (usuario_id, texto, leida, creado_en) VALUES (?, ?, 1, ?)",
      [usuarioId, texto, fecha.fecha]
    );
    claves.add(clave);
    reporte.insertar("notificaciones", resultado.insertId);
  }
}

async function validar(conexion, reporte, { maxDescartes }) {
  const resultados = [];
  for (const entidad of ENTIDADES) {
    const c = reporte.conteos[entidad];
    const suma = c.insertados + c.vinculados + c.descartados;
    resultados.push({ nombre: `Conteo ${entidad}: origen = insertados + vinculados + descartados`, ok: suma === c.origen, detalle: `${c.origen} = ${c.insertados} + ${c.vinculados} + ${c.descartados}` });
    const ids = reporte.insertados[entidad];
    let enDestino = 0;
    if (ids.length) {
      const [[fila]] = await conexion.query(`SELECT COUNT(*) AS total FROM ${entidad} WHERE id IN (?)`, [ids]);
      enDestino = Number(fila.total);
    }
    resultados.push({ nombre: `Registros de ${entidad} presentes en el destino`, ok: enDestino === ids.length, detalle: `${enDestino} de ${ids.length}` });
  }
  const [duplicados] = await conexion.query("SELECT email FROM usuarios GROUP BY email HAVING COUNT(*) > 1");
  resultados.push({ nombre: "Sin correos duplicados en usuarios", ok: duplicados.length === 0, detalle: `${duplicados.length} duplicados` });
  const [[huerfanasSolicitudes]] = await conexion.query(
    `SELECT COUNT(*) AS total FROM solicitudes s
     LEFT JOIN usuarios u ON u.id = s.usuario_id LEFT JOIN mascotas m ON m.id = s.mascota_id
     WHERE u.id IS NULL OR m.id IS NULL`
  );
  resultados.push({ nombre: "Sin solicitudes huérfanas (sin usuario o mascota)", ok: Number(huerfanasSolicitudes.total) === 0, detalle: `${huerfanasSolicitudes.total} huérfanas` });
  const [[huerfanasNotificaciones]] = await conexion.query(
    "SELECT COUNT(*) AS total FROM notificaciones n LEFT JOIN usuarios u ON u.id = n.usuario_id WHERE u.id IS NULL"
  );
  resultados.push({ nombre: "Sin notificaciones huérfanas", ok: Number(huerfanasNotificaciones.total) === 0, detalle: `${huerfanasNotificaciones.total} huérfanas` });
  const totalDescartes = reporte.descartes.length;
  if (maxDescartes !== null) {
    resultados.push({ nombre: `Descartes dentro del umbral aceptado (máximo ${maxDescartes})`, ok: totalDescartes <= maxDescartes, detalle: `${totalDescartes} descartados` });
  }
  if (reporte.insertados.mascotas.length) {
    const [inconsistentes] = await conexion.query(
      `SELECT m.nombre, m.estado FROM mascotas m WHERE m.id IN (?) AND (
         (m.estado = 'Adoptada' AND NOT EXISTS (SELECT 1 FROM solicitudes s WHERE s.mascota_id = m.id AND s.estado = 'Aprobada')) OR
         (m.estado = 'En proceso' AND NOT EXISTS (SELECT 1 FROM solicitudes s WHERE s.mascota_id = m.id AND s.estado = 'En revisión')))`,
      [reporte.insertados.mascotas]
    );
    for (const m of inconsistentes) reporte.avisos.push(`[mascotas] ${m.nombre} está "${m.estado}" sin la solicitud correspondiente en el origen`);
  }
  reporte.validaciones = resultados;
  return resultados.every((r) => r.ok);
}

function textoDelReporte(r) {
  const filas = ENTIDADES.map((e) => {
    const c = r.reporte.conteos[e];
    return `  ${e.padEnd(15)} ${String(c.origen).padStart(6)} ${String(c.insertados).padStart(10)} ${String(c.vinculados).padStart(10)} ${String(c.descartados).padStart(11)}`;
  });
  const lista = (titulo, elementos) => [`${titulo} (${elementos.length})`, ...(elementos.length ? elementos.map((e) => `  - ${e}`) : ["  (ninguno)"])];
  const tablas = (titulo, conteo) => `  ${titulo.padEnd(9)} usuarios=${conteo.usuarios}  mascotas=${conteo.mascotas}  solicitudes=${conteo.solicitudes}  notificaciones=${conteo.notificaciones}`;
  return [
    "MIGRACIÓN DE DATOS — PATITAS CONECTADAS",
    "=".repeat(60),
    `Fecha de ejecución : ${t.aDatetime(r.inicio)}`,
    `Archivo de origen  : ${r.archivo}`,
    `Origen declarado   : ${r.origen}`,
    `Fecha de referencia: ${t.aDatetime(r.referencia)} (para convertir fechas relativas)`,
    `Base de datos      : ${r.bd}${r.bd === BD_PRUEBAS ? " (entorno de pruebas)" : " (PRODUCCIÓN)"}`,
    `Modo               : ${r.simular ? "simulación (siempre rollback)" : "real"}`,
    "",
    "1. RESPALDO",
    r.respaldo ? `  Copia del JSON : ${r.respaldo.copiaJson}` : "  (no realizado)",
    r.respaldo ? `  mysqldump      : ${r.respaldo.volcado} (${(r.respaldo.tamanoVolcado / 1024).toFixed(1)} KB)` : "",
    "",
    "2-4. EXTRACCIÓN, TRANSFORMACIÓN Y CARGA",
    "  entidad         origen insertados vinculados descartados",
    ...filas,
    "",
    ...lista("Registros vinculados a datos existentes", r.reporte.vinculos),
    "",
    ...lista("Registros descartados", r.reporte.descartes),
    "",
    ...lista("Transformaciones y avisos", r.reporte.avisos),
    "",
    "5. VALIDACIÓN",
    ...(r.reporte.validaciones.length ? r.reporte.validaciones.map((v) => `  [${v.ok ? "OK" : "FALLA"}] ${v.nombre} — ${v.detalle}`) : ["  (no se llegó a validar)"]),
    "",
    "Conteos en el destino",
    tablas("antes:", r.antes),
    r.despues ? tablas("después:", r.despues) : "",
    "",
    "6. DECISIÓN",
    `  ${r.estado}`,
    r.error ? `  Motivo: ${r.error}` : "",
    "",
  ].join("\n");
}

async function migrar(opciones = {}) {
  const archivo = path.resolve(opciones.archivo || ARCHIVO_EJEMPLO);
  const bd = opciones.bd || BD_PRUEBAS;
  if (![BD_PRODUCCION, BD_PRUEBAS].includes(bd)) throw new Error(`Base de datos no permitida: ${bd}. Usa ${BD_PRUEBAS} o ${BD_PRODUCCION}.`);
  if (bd === BD_PRODUCCION && !opciones.confirmarProduccion) {
    throw new Error(`Para migrar a la base de datos de producción (${BD_PRODUCCION}) agrega --confirmar-produccion. Prueba primero contra ${BD_PRUEBAS}.`);
  }
  const resultado = {
    inicio: new Date(),
    archivo,
    bd,
    simular: Boolean(opciones.simular),
    reporte: crearReporte(),
    estado: "FALLIDA",
  };
  const marca = marcaDeTiempo(resultado.inicio);

  resultado.respaldo = await respaldar({ archivo, bd, directorioRespaldos: opciones.directorioRespaldos || DIRECTORIO_RESPALDOS, marca });
  const origen = extraer(archivo);
  resultado.origen = origen.origen;
  resultado.referencia = origen.referencia;

  const conexion = await mysql.createConnection({ host: db.host, port: db.port, user: db.user, password: db.password, database: bd, charset: "utf8mb4", dateStrings: true });
  try {
    resultado.antes = await contarTablas(conexion);
    await conexion.beginTransaction();
    try {
      const mapas = { usuarios: new Map(), mascotas: new Map() };
      await cargarUsuarios(conexion, origen.usuarios, mapas.usuarios, resultado.reporte);
      await cargarMascotas(conexion, origen.mascotas, mapas.mascotas, resultado.reporte);
      await cargarSolicitudes(conexion, origen.solicitudes, mapas, origen.referencia, resultado.reporte);
      await cargarNotificaciones(conexion, origen.notificaciones, mapas, origen.referencia, resultado.reporte);
      const valido = await validar(conexion, resultado.reporte, { maxDescartes: opciones.maxDescartes ?? null });
      if (valido && !resultado.simular) {
        await conexion.commit();
        resultado.estado = "ACEPTADA — se confirmó la transacción (COMMIT)";
      } else {
        await conexion.rollback();
        resultado.estado = valido
          ? "SIMULACIÓN — las validaciones pasaron, pero se revirtió todo (ROLLBACK)"
          : "RECHAZADA — una o más validaciones fallaron; se revirtió todo (ROLLBACK)";
      }
      resultado.aceptada = valido && !resultado.simular;
      resultado.valida = valido;
    } catch (error) {
      await conexion.rollback();
      resultado.estado = "FALLIDA — error durante la carga; se revirtió todo (ROLLBACK)";
      resultado.error = error.message;
      resultado.valida = false;
    }
    resultado.despues = await contarTablas(conexion);
  } finally {
    await conexion.end();
  }

  resultado.texto = textoDelReporte(resultado);
  const salida = opciones.salidaReporte || REPORTE_POR_DEFECTO;
  fs.writeFileSync(salida, resultado.texto, "utf8");
  fs.writeFileSync(path.join(resultado.respaldo.carpeta, "migracion_reporte.txt"), resultado.texto, "utf8");
  resultado.archivoReporte = salida;
  return resultado;
}

function leerArgumentos(argv) {
  const valor = (nombre) => {
    const i = argv.indexOf(nombre);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const max = valor("--max-descartes");
  return {
    archivo: valor("--archivo"),
    bd: valor("--bd"),
    confirmarProduccion: argv.includes("--confirmar-produccion"),
    simular: argv.includes("--simular"),
    maxDescartes: max === undefined ? null : Number(max),
  };
}

if (require.main === module) {
  migrar(leerArgumentos(process.argv.slice(2)))
    .then((resultado) => {
      console.log(resultado.texto);
      console.log(`Reporte guardado en ${path.relative(process.cwd(), resultado.archivoReporte)}`);
      process.exitCode = resultado.valida ? 0 : 1;
    })
    .catch((error) => {
      console.error(`La migración no se ejecutó: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = { migrar, extraer };
