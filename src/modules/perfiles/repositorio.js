const { pool } = require("../../config/db");

const COLUMNAS = `usuario_id AS usuarioId, tipo_vivienda AS tipoVivienda, tiene_patio AS tienePatio, personas_hogar AS personasHogar,
  ingresos_estables AS ingresosEstables, tiene_otras_mascotas AS tieneOtrasMascotas, otras_mascotas_detalle AS otrasMascotasDetalle,
  experiencia_previa AS experienciaPrevia, experiencia_detalle AS experienciaDetalle, actualizado_en AS actualizadoEn`;

function convertir(fila) {
  if (!fila) return null;
  return {
    ...fila,
    tienePatio: Boolean(fila.tienePatio),
    ingresosEstables: Boolean(fila.ingresosEstables),
    tieneOtrasMascotas: Boolean(fila.tieneOtrasMascotas),
    experienciaPrevia: Boolean(fila.experienciaPrevia),
  };
}

async function buscarPorUsuario(usuarioId, conexion = pool) {
  const [filas] = await conexion.execute(`SELECT ${COLUMNAS} FROM perfiles_adoptante WHERE usuario_id = ?`, [usuarioId]);
  return convertir(filas[0]);
}

async function guardar(usuarioId, perfil) {
  await pool.execute(
    `INSERT INTO perfiles_adoptante
       (usuario_id, tipo_vivienda, tiene_patio, personas_hogar, ingresos_estables, tiene_otras_mascotas,
        otras_mascotas_detalle, experiencia_previa, experiencia_detalle)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) AS nuevo
     ON DUPLICATE KEY UPDATE
       tipo_vivienda = nuevo.tipo_vivienda, tiene_patio = nuevo.tiene_patio, personas_hogar = nuevo.personas_hogar,
       ingresos_estables = nuevo.ingresos_estables, tiene_otras_mascotas = nuevo.tiene_otras_mascotas,
       otras_mascotas_detalle = nuevo.otras_mascotas_detalle, experiencia_previa = nuevo.experiencia_previa,
       experiencia_detalle = nuevo.experiencia_detalle`,
    [
      usuarioId,
      perfil.tipoVivienda,
      perfil.tienePatio,
      perfil.personasHogar,
      perfil.ingresosEstables,
      perfil.tieneOtrasMascotas,
      perfil.otrasMascotasDetalle,
      perfil.experienciaPrevia,
      perfil.experienciaDetalle,
    ]
  );
  return buscarPorUsuario(usuarioId);
}

module.exports = { buscarPorUsuario, guardar };
