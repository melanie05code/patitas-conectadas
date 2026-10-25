class ErrorApp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = "ErrorApp";
    this.status = status;
  }
}

module.exports = ErrorApp;
