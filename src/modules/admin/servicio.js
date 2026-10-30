const { execFile } = require("child_process");

const LARGO_MAXIMO_SALIDA = 2000;
const OPCION_CANTIDAD = process.platform === "win32" ? "-n" : "-c";

function diagnosticarHost(host) {
  return new Promise((resolver) => {
    execFile("ping", [OPCION_CANTIDAD, "1", host], { timeout: 5000 }, (error, salida) => {
      resolver({ host, alcanzable: !error, salida: String(salida).slice(0, LARGO_MAXIMO_SALIDA) });
    });
  });
}

module.exports = { diagnosticarHost };
