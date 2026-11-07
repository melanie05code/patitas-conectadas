const fs = require("fs");
const path = require("path");
const { subidas } = require("../config/entorno");

const directorioMascotas = path.join(subidas.directorio, subidas.carpetaMascotas);
const prefijoMascotas = `${subidas.rutaPublica}/${subidas.carpetaMascotas}/`;

function asegurarDirectorioMascotas() {
  fs.mkdirSync(directorioMascotas, { recursive: true });
  return directorioMascotas;
}

function urlFotoMascota(nombreArchivo) {
  return `${prefijoMascotas}${nombreArchivo}`;
}

async function eliminarFotoMascota(fotoUrl) {
  if (!fotoUrl || !fotoUrl.startsWith(prefijoMascotas)) return;
  const archivo = path.join(directorioMascotas, path.basename(fotoUrl));
  await fs.promises.rm(archivo, { force: true });
}

async function eliminarArchivo(ruta) {
  if (!ruta) return;
  const archivo = path.join(directorioMascotas, path.basename(ruta));
  if (path.resolve(ruta) !== archivo) return;
  await fs.promises.rm(archivo, { force: true });
}

module.exports = { directorioMascotas, asegurarDirectorioMascotas, urlFotoMascota, eliminarFotoMascota, eliminarArchivo };
