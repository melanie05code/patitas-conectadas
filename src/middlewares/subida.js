const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const ErrorApp = require("../utils/ErrorApp");
const { subidas } = require("../config/entorno");
const { asegurarDirectorioMascotas, eliminarArchivo } = require("../utils/archivos");

const FORMATOS = {
  "image/jpeg": { extension: ".jpg", firma: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: ".png", firma: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: ".webp", firma: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
};
const MENSAJE_FORMATO = "La foto debe ser una imagen JPG, PNG o WEBP.";

const cargador = multer({
  storage: multer.diskStorage({
    destination: (req, archivo, listo) => listo(null, asegurarDirectorioMascotas()),
    filename: (req, archivo, listo) => listo(null, `${crypto.randomUUID()}${FORMATOS[archivo.mimetype].extension}`),
  }),
  limits: { fileSize: subidas.tamanoMaximo, files: 1 },
  fileFilter: (req, archivo, listo) => {
    if (FORMATOS[archivo.mimetype]) listo(null, true);
    else listo(new ErrorApp(400, MENSAJE_FORMATO));
  },
}).single("foto");

async function verificarFirma(archivo) {
  const manejador = await fs.promises.open(archivo.path, "r");
  try {
    const { buffer } = await manejador.read(Buffer.alloc(12), 0, 12, 0);
    return FORMATOS[archivo.mimetype].firma(buffer);
  } finally {
    await manejador.close();
  }
}

function subirFotoMascota(req, res, next) {
  cargador(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      const mensaje = error.code === "LIMIT_FILE_SIZE"
        ? `La foto no puede superar ${subidas.tamanoMaximo / (1024 * 1024)} MB.`
        : "Solo se puede subir una foto en el campo 'foto'.";
      return next(new ErrorApp(400, mensaje));
    }
    if (error) return next(error);
    if (req.file && !(await verificarFirma(req.file))) {
      await eliminarArchivo(req.file.path);
      req.file = undefined;
      return next(new ErrorApp(400, MENSAJE_FORMATO));
    }
    next();
  });
}

module.exports = { subirFotoMascota };
