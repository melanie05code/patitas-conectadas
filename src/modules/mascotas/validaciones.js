const { texto, campoTexto, enteroPositivo } = require("../../utils/validadores");

const SEXOS = ["Macho", "Hembra"];
const ESTADOS = ["Disponible", "En proceso", "Adoptada"];

function validarMascota(cuerpo, { conEstado }) {
  const errores = [];
  const datos = {
    nombre: campoTexto(cuerpo, "nombre", "nombre", 1, 60, errores),
    edad: campoTexto(cuerpo, "edad", "edad", 1, 30, errores),
    raza: campoTexto(cuerpo, "raza", "raza", 1, 80, errores),
    descripcion: campoTexto(cuerpo, "descripcion", "descripción", 1, 2000, errores),
    tipoId: enteroPositivo(cuerpo.tipoId),
    sexo: texto(cuerpo.sexo),
  };
  if (datos.descripcion.length > 0 && datos.descripcion.length < 10) {
    errores.push("La descripción debe tener al menos 10 caracteres.");
  }
  if (!datos.tipoId) errores.push("Selecciona un tipo de mascota válido.");
  if (!SEXOS.includes(datos.sexo)) errores.push("El sexo debe ser Macho o Hembra.");
  if (conEstado) {
    datos.estado = texto(cuerpo.estado);
    if (!ESTADOS.includes(datos.estado)) errores.push("El estado debe ser Disponible, En proceso o Adoptada.");
    datos.quitarFoto = cuerpo.quitarFoto === true || cuerpo.quitarFoto === "true";
  }
  return { errores, datos };
}

const validarCreacion = (cuerpo) => validarMascota(cuerpo, { conEstado: false });
const validarEdicion = (cuerpo) => validarMascota(cuerpo, { conEstado: true });

function leerFiltroEstados(valor) {
  const estados = [...new Set(texto(valor).split(",").map((e) => e.trim()).filter(Boolean))];
  return estados.every((e) => ESTADOS.includes(e)) ? estados : null;
}

module.exports = { validarCreacion, validarEdicion, leerFiltroEstados, ESTADOS };
