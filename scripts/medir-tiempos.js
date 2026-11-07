process.env.NODE_ENV = "test";

const fs = require("fs");
const path = require("path");
const { instalarBaseDatos } = require("../database/instalar");
const app = require("../src/app");
const { pool } = require("../src/config/db");

const REPETICIONES = 50;
const LIMITE_MS = 2000;
const SALIDA = path.join(__dirname, "..", "docs", "evidencias", "final", "rendimiento_rnf01.txt");

function percentil(valores, p) {
  const ordenados = [...valores].sort((a, b) => a - b);
  return ordenados[Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1)];
}

async function principal() {
  await instalarBaseDatos({ silencioso: true });
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@patitas.com", password: process.env.SEED_ADMIN_PASSWORD }),
  });
  const { token } = await login.json();
  const cabeceras = { Authorization: `Bearer ${token}` };
  const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const rutas = [
    ["Catálogo público", "/api/mascotas?estado=Disponible,En%20proceso", {}],
    ["Detalle de mascota", "/api/mascotas/1", {}],
    ["Página catalogo.html", "/catalogo.html", {}],
    ["Solicitudes en curso (admin)", "/api/admin/solicitudes?estado=Solicitada,Entrevista%20programada,Entrevistada", cabeceras],
    ["Detalle de solicitud (admin)", "/api/admin/solicitudes/1", cabeceras],
    ["Disponibilidad de horarios", `/api/admin/entrevistas/disponibilidad?fecha=${manana}`, cabeceras],
    ["Seguimientos de una solicitud", "/api/solicitudes/4/seguimientos", cabeceras],
  ];
  const lineas = [
    `Medición de tiempos de respuesta (RNF-01: menos de ${LIMITE_MS / 1000} s)`,
    `Fecha: ${new Date().toISOString()} | Node ${process.version} | ${REPETICIONES} peticiones secuenciales por ruta | servidor y MySQL 8.0 en el mismo equipo (localhost), base patitas_test con los datos semilla`,
    "",
    "Ruta | mín (ms) | mediana (ms) | p95 (ms) | máx (ms) | cumple",
  ];
  let cumpleTodo = true;
  try {
    for (const [nombre, ruta, encabezados] of rutas) {
      const tiempos = [];
      for (let i = 0; i < REPETICIONES; i++) {
        const inicio = performance.now();
        const respuesta = await fetch(`${base}${ruta}`, { headers: encabezados });
        await respuesta.arrayBuffer();
        if (!respuesta.ok) throw new Error(`${ruta} respondió ${respuesta.status}`);
        tiempos.push(performance.now() - inicio);
      }
      const maximo = Math.max(...tiempos);
      const cumple = maximo < LIMITE_MS;
      cumpleTodo &&= cumple;
      lineas.push(`${nombre} | ${Math.min(...tiempos).toFixed(1)} | ${percentil(tiempos, 50).toFixed(1)} | ${percentil(tiempos, 95).toFixed(1)} | ${maximo.toFixed(1)} | ${cumple ? "Sí" : "No"}`);
    }
  } finally {
    servidor.close();
    await pool.end();
  }
  lineas.push("", `Resultado: ${cumpleTodo ? "todas las rutas medidas responden en menos de 2 s" : "alguna ruta superó los 2 s"}.`);
  lineas.push("Limitación: medición local sin concurrencia ni red real; no demuestra el rendimiento con muchos usuarios simultáneos ni en un servidor de producción.");
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, `${lineas.join("\n")}\n`);
  console.log(lineas.join("\n"));
}

principal().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
