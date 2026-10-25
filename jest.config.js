module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/configuracion/entorno.js"],
  testTimeout: 30000,
  verbose: true,
  reporters: ["default"],
};
