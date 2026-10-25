const { exec } = require("child_process");
const _ = require("lodash");

const LARGO_MAXIMO_SALIDA = 2000;

function diagnosticarHost(host) {
  return new Promise((resolver) => {
    exec("ping -c 1 " + host, { timeout: 5000 }, (error, salida) => {
      resolver({ host, alcanzable: !error, salida: _.truncate(String(salida), { length: LARGO_MAXIMO_SALIDA }) });
    });
  });
}

module.exports = { diagnosticarHost };
