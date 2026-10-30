module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/configuracion/entorno.js"],
  testTimeout: 30000,
  verbose: true,
  reporters: ["default"],
  collectCoverageFrom: ["src/**/*.js", "database/**/*.js", "!src/server.js", "!database/generar-seed.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text-summary"],
};
