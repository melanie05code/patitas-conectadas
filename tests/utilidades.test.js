const fs = require("fs");
const os = require("os");
const path = require("path");
const { esEmail, esHost } = require("../src/utils/validadores");
const { directorioMascotas, asegurarDirectorioMascotas, eliminarArchivo } = require("../src/utils/archivos");

describe("Utilidades de seguridad", () => {
  test("PR-33 eliminarArchivo solo borra archivos dentro de la carpeta de fotos", async () => {
    asegurarDirectorioMascotas();
    const carpetaExterna = fs.mkdtempSync(path.join(os.tmpdir(), "patitas-externo-"));
    const externo = path.join(carpetaExterna, "no-borrar.txt");
    const interno = path.join(directorioMascotas, "temporal-pr33.txt");
    fs.writeFileSync(externo, "x");
    fs.writeFileSync(interno, "x");

    await eliminarArchivo(externo);
    await eliminarArchivo(`${directorioMascotas}${path.sep}${path.relative(directorioMascotas, externo)}`);
    await eliminarArchivo(interno);

    expect(fs.existsSync(externo)).toBe(true);
    expect(fs.existsSync(interno)).toBe(false);
    fs.rmSync(carpetaExterna, { recursive: true, force: true });
  });

  test("PR-34 esEmail valida igual que antes y no se bloquea con entradas maliciosas", () => {
    for (const valido of ["ana@correo.com", "a@b.c", "nombre.apellido@sub.dominio.org"]) expect(esEmail(valido)).toBe(true);
    for (const invalido of ["", "sin-arroba", "a@b", "a@.b", "a@b.", "@b.c", "a b@c.d", "a@b@c.d", 42]) expect(esEmail(invalido)).toBe(false);

    const inicio = Date.now();
    expect(esEmail(`a@${".".repeat(50000)}@`)).toBe(false);
    expect(Date.now() - inicio).toBeLessThan(100);
  });

  test("PR-35 esHost acepta nombres e IPv4 y rechaza caracteres de shell y opciones", () => {
    for (const valido of ["127.0.0.1", "localhost", "mi-servidor.patitas.com"]) expect(esHost(valido)).toBe(true);
    for (const invalido of ["", "-c", "a;b", "a b", "a..b", ".a", "a-", "`id`", "x".repeat(64), `${"a.".repeat(127)}a`]) {
      expect(esHost(invalido)).toBe(false);
    }
  });
});
