const { reiniciarBaseDatos, consultarUna, cerrarConexiones } = require("./ayudantes");
const { migrar, listarMigraciones } = require("../database/migrar-esquema");

afterAll(cerrarConexiones);

describe("Migraciones numeradas del esquema", () => {
  test("PR-33 db:migrar sobre una base al día no vuelve a aplicar migraciones y registra todas", async () => {
    await reiniciarBaseDatos();
    const salida = jest.spyOn(console, "log").mockImplementation(() => {});
    try {
      await migrar();
      expect(salida).toHaveBeenCalledWith(expect.stringContaining("ya estaba al día"));
    } finally {
      salida.mockRestore();
    }
    const fila = await consultarUna("SELECT COUNT(*) AS total FROM migraciones_esquema");
    expect(Number(fila.total)).toBe(listarMigraciones().length);
  });
});
