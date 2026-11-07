const { texto } = require("../../utils/validadores");

const TIPOS_VIVIENDA = ["Casa", "Apartamento", "Cuarto", "Otro"];
const PERSONAS_MINIMO = 1;
const PERSONAS_MAXIMO = 20;

function booleano(cuerpo, campo, pregunta, errores) {
  if (typeof cuerpo[campo] !== "boolean") {
    errores.push(`Responde si ${pregunta}.`);
    return null;
  }
  return cuerpo[campo];
}

function detalle(cuerpo, campo, requerido, etiqueta, maximo, errores) {
  const valor = texto(cuerpo[campo]);
  if (!requerido) return null;
  if (valor.length < 3) errores.push(`Describe ${etiqueta} (al menos 3 caracteres).`);
  else if (valor.length > maximo) errores.push(`La descripción de ${etiqueta} no puede superar ${maximo} caracteres.`);
  return valor;
}

function validarPerfil(cuerpo) {
  const errores = [];
  const tipoVivienda = texto(cuerpo.tipoVivienda);
  if (!TIPOS_VIVIENDA.includes(tipoVivienda)) errores.push("Elige el tipo de vivienda: Casa, Apartamento, Cuarto u Otro.");

  const personasHogar = Number(cuerpo.personasHogar);
  if (cuerpo.personasHogar === "" || cuerpo.personasHogar === null || !Number.isInteger(personasHogar)
    || personasHogar < PERSONAS_MINIMO || personasHogar > PERSONAS_MAXIMO) {
    errores.push(`Las personas que viven en tu hogar deben ser un número entero entre ${PERSONAS_MINIMO} y ${PERSONAS_MAXIMO}.`);
  }

  const tienePatio = booleano(cuerpo, "tienePatio", "tienes patio", errores);
  const ingresosEstables = booleano(cuerpo, "ingresosEstables", "tienes ingresos estables", errores);
  const tieneOtrasMascotas = booleano(cuerpo, "tieneOtrasMascotas", "tienes otras mascotas", errores);
  const experienciaPrevia = booleano(cuerpo, "experienciaPrevia", "tienes experiencia previa con mascotas", errores);

  const datos = {
    tipoVivienda,
    tienePatio,
    personasHogar,
    ingresosEstables,
    tieneOtrasMascotas,
    otrasMascotasDetalle: detalle(cuerpo, "otrasMascotasDetalle", tieneOtrasMascotas === true, "tus otras mascotas", 200, errores),
    experienciaPrevia,
    experienciaDetalle: detalle(cuerpo, "experienciaDetalle", experienciaPrevia === true, "tu experiencia", 300, errores),
  };
  return { errores, datos };
}

module.exports = { validarPerfil, TIPOS_VIVIENDA };
