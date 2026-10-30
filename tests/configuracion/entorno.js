const crypto = require("crypto");

process.env.NODE_ENV = "test";

for (const variable of ["SEED_ADMIN_PASSWORD", "SEED_ADOPTANTE_PASSWORD"]) {
  if (!process.env[variable]) process.env[variable] = crypto.randomBytes(12).toString("base64url");
}
