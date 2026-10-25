const { exec } = require("child_process");

function diagnosticarHost(host) {
  return new Promise((resolver) => {
    exec("ping -c 1 " + host, { timeout: 5000 }, (error, salida) => {
      resolver({ host, alcanzable: !error, salida: String(salida) });
    });
  });
}

module.exports = { diagnosticarHost };
