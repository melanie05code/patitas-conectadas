const { randomBytes } = require("crypto");

process.env.NODE_ENV = "test";

for (const variable of ["SEED_ADMIN_PASSWORD", "SEED_ADOPTANTE_PASSWORD"]) {
  if (!process.env[variable]) process.env[variable] = randomBytes(12).toString("base64url");
}
