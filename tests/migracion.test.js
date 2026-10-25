const fs = require("fs");
const os = require("os");
const path = require("path");
const bcrypt = require("bcrypt");
const { reiniciarBaseDatos, consultarUna, cerrarConexiones } = require("./ayudantes");
const { migrar } = require("../database/migracion/migrar");
const t = require("../database/migracion/transformar");

let carpetaTemporal;

function opciones(extra = {}) {
  return {
    directorioRespaldos: path.join(carpetaTemporal, "respaldos"),
    salidaReporte: path.join(carpetaTemporal, "reporte.txt"),
    ...extra,
  };
}

function contarTablas() {
  return consultarUna(
    `SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios, (SELECT COUNT(*) FROM mascotas) AS mascotas,
            (SELECT COUNT(*) FROM solicitudes) AS solicitudes, (SELECT COUNT(*) FROM notificaciones) AS notificaciones`
  );
}

beforeEach(async () => {
  await reiniciarBaseDatos();
  carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), "patitas-migracion-"));
});
afterEach(() => fs.rmSync(carpetaTemporal, { recursive: true, force: true }));
afterAll(cerrarConexiones);

describe("Migración de datos desde el localStorage del prototipo", () => {
  test("PR-24 las transformaciones normalizan correos, teléfonos y fechas relativas", () => {
    const referencia = new Date(2026, 7, 28, 16, 0, 0);

    expect(t.normalizarEmail("  Maria.Lopez@Correo.com ")).toBe("maria.lopez@correo.com");
    expect(t.normalizarEmail("correo-invalido")).toBeNull();
    expect(t.normalizarTelefono("8765 4321")).toBe("8765-4321");
    expect(t.normalizarTelefono("+505 8765-4321")).toBe("8765-4321");
    expect(t.normalizarTelefono("88-12")).toBeNull();
    expect(t.convertirFecha("Hace 2 horas", referencia)).toEqual({ fecha: "2026-08-28 14:00:00", exacta: false });
    expect(t.convertirFecha("Ayer", referencia)).toEqual({ fecha: "2026-08-27 16:00:00", exacta: false });
    expect(t.convertirFecha("Hace 2 días", referencia)).toEqual({ fecha: "2026-08-26 16:00:00", exacta: false });
    expect(t.convertirFecha("2026-08-20", referencia)).toEqual({ fecha: "2026-08-20 00:00:00", exacta: true });
    expect(t.convertirFecha("fecha desconocida", referencia)).toBeNull();
  });

  test("PR-25 la migración de prueba hace respaldo, carga, valida y se acepta", async () => {
    const resultado = await migrar(opciones());

    expect(resultado.aceptada).toBe(true);
    expect(fs.existsSync(resultado.respaldo.copiaJson)).toBe(true);
    expect(fs.readFileSync(resultado.respaldo.volcado, "utf8")).toContain("CREATE TABLE `solicitudes`");
    expect(resultado.reporte.conteos).toEqual({
      usuarios: { origen: 5, insertados: 2, vinculados: 2, descartados: 1 },
      mascotas: { origen: 8, insertados: 8, vinculados: 0, descartados: 0 },
      solicitudes: { origen: 7, insertados: 5, vinculados: 0, descartados: 2 },
      notificaciones: { origen: 6, insertados: 5, vinculados: 0, descartados: 1 },
    });
    expect(resultado.reporte.validaciones.every((v) => v.ok)).toBe(true);
    const juan = await consultarUna("SELECT password_hash FROM usuarios WHERE email = 'juan@correo.com'");
    expect(await bcrypt.compare("123456", juan.password_hash)).toBe(true);
    expect(fs.readFileSync(path.join(carpetaTemporal, "reporte.txt"), "utf8")).toContain("ACEPTADA");
  });

  test("PR-26 si una validación falla, la migración hace rollback y el destino no cambia", async () => {
    const antes = await contarTablas();

    const resultado = await migrar(opciones({ maxDescartes: 0 }));

    expect(resultado.aceptada).toBe(false);
    expect(resultado.estado).toMatch(/^RECHAZADA/);
    expect(resultado.reporte.validaciones.find((v) => !v.ok).nombre).toContain("umbral");
    expect(await contarTablas()).toEqual(antes);
  });

  test("PR-27 la migración se niega a correr contra producción sin confirmación expresa", async () => {
    await expect(migrar(opciones({ bd: "patitas_conectadas" }))).rejects.toThrow("--confirmar-produccion");
    await expect(migrar(opciones({ bd: "mysql" }))).rejects.toThrow("no permitida");
  });
});
