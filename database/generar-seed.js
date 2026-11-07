const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const datos = require("./datos-semilla");

function insertar(tabla, columnas, filas) {
  const valores = filas.map((fila) => `  (${fila.map((v) => mysql.escape(v)).join(", ")})`).join(",\n");
  return `INSERT INTO ${tabla} (${columnas.join(", ")}) VALUES\n${valores};\n`;
}

function generarSeed() {
  const usuarios = datos.usuarios.map((u) => [u.id, u.nombre, u.email, datos.marcadorContrasena(u.variableContrasena), u.rol]);

  const partes = [
    "USE patitas_conectadas;\n",
    "START TRANSACTION;\n",
    insertar("tipos_mascota", ["id", "nombre"], datos.tipos.map((t) => [t.id, t.nombre])),
    insertar("usuarios", ["id", "nombre", "email", "password_hash", "rol"], usuarios),
    insertar(
      "perfiles_adoptante",
      ["usuario_id", "tipo_vivienda", "tiene_patio", "personas_hogar", "ingresos_estables", "tiene_otras_mascotas", "otras_mascotas_detalle", "experiencia_previa", "experiencia_detalle"],
      datos.perfiles.map((p) => [p.usuarioId, p.tipoVivienda, p.tienePatio, p.personasHogar, p.ingresosEstables, p.tieneOtrasMascotas, p.otrasMascotasDetalle, p.experienciaPrevia, p.experienciaDetalle])
    ),
    insertar(
      "mascotas",
      ["id", "nombre", "tipo_id", "edad", "raza", "sexo", "descripcion", "estado", "foto_url"],
      datos.mascotas.map((m) => [m.id, m.nombre, m.tipoId, m.edad, m.raza, m.sexo, m.descripcion, m.estado, `/uploads/mascotas/${m.foto}`])
    ),
    insertar(
      "solicitudes",
      ["id", "mascota_id", "usuario_id", "telefono", "direccion", "motivo", "estado", "fecha", "respondida_en", "actualizado_en"],
      datos.solicitudes.map((s) => [s.id, s.mascotaId, s.usuarioId, s.telefono, s.direccion, s.motivo, s.estado, s.fecha, s.respondidaEn, s.actualizadoEn])
    ),
    insertar(
      "entrevistas",
      ["id", "solicitud_id", "fecha_hora", "lugar", "notas_admin", "realizada_en", "creado_en"],
      datos.entrevistas.map((e) => [e.id, e.solicitudId, e.fechaHora, e.lugar, e.notasAdmin, e.realizadaEn, e.creadoEn])
    ),
    insertar(
      "seguimientos",
      ["id", "solicitud_id", "numero", "fecha_programada", "foto_url", "enviado_en", "estado", "comentario_admin", "revisado_en"],
      datos.seguimientos.map((g) => [g.id, g.solicitudId, g.numero, g.fechaProgramada, g.fotoUrl, g.enviadoEn, g.estado, g.comentarioAdmin, g.revisadoEn])
    ),
    insertar(
      "notificaciones",
      ["id", "usuario_id", "solicitud_id", "texto", "leida", "creado_en"],
      datos.notificaciones.map((n) => [n.id, n.usuarioId, n.solicitudId, n.texto, n.leida, n.creadoEn])
    ),
    "COMMIT;\n",
  ];

  const destino = path.join(__dirname, "02_seed.sql");
  fs.writeFileSync(destino, partes.join("\n"), "utf8");
  console.log(`Seed generado en ${path.relative(process.cwd(), destino)}`);
}

generarSeed();
