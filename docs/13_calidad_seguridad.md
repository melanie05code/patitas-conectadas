# 13. Calidad y seguridad del código

Análisis estático, de dependencias y de cobertura con **SonarCloud**, **DeepSource** y **Snyk**, integrado en GitHub Actions. Se trabajó en la rama `dev` y se documentó en el Pull Request [#12](https://github.com/melanie05code/patitas-conectadas/pull/12) hacia `main`.

## 13.1 Qué se analizó y cómo

| Herramienta | Qué revisa | Cómo se ejecuta |
|---|---|---|
| SonarCloud | Bugs, vulnerabilidades, security hotspots, code smells, duplicación y cobertura; Quality Gate | Job `sonarcloud` con `SonarSource/sonarqube-scan-action@v8.3.0` y [`sonar-project.properties`](../sonar-project.properties). El *Automatic Analysis* está desactivado. |
| DeepSource | Analizadores JavaScript, Secrets, SQL y Test Coverage | La GitHub App analiza cada PR según [`.deepsource.toml`](../.deepsource.toml); el job `deepsource` envía `coverage/lcov.info` con la CLI oficial. |
| Snyk | Open Source (dependencias de `package-lock.json`) y Snyk Code (SAST) | Job `snyk` con `snyk/actions/node@v1.0.0`: `snyk test` y `snyk code test`, resultados SARIF como artifact `snyk-resultados`. |

Pipeline [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), en push a `dev` y en pull requests hacia `main`, con jobs encadenados con `needs`:

1. **Tests**: Node 20 y servicio MySQL 8.0. La contraseña de root, la del usuario `patitas_app` y `JWT_SECRET` se generan en el propio job (`openssl rand`) y se enmascaran; no hay credenciales escritas en el YAML. Se ejecuta `npm ci` y `npm test` con cobertura, y se sube `coverage/lcov.info` como artifact.
2. **SonarCloud** (`needs: tests`): descarga la cobertura y analiza.
3. **DeepSource** (`needs: sonarcloud`): reporta la cobertura.
4. **Snyk** (`needs: deepsource`): dependencias y código con `--severity-threshold=high`. Durante el análisis inicial los pasos tenían `continue-on-error` para poder documentar los hallazgos.

Las credenciales reales del CI están solo en GitHub Secrets: `SONAR_TOKEN`, `SNYK_TOKEN` y `DEEPSOURCE_DSN`.

## 13.2 Análisis inicial

### Hallazgos reales en `main` (`be3f4d2`)

| Herramienta | Regla | Severidad | Cantidad | Dónde | Valoración |
|---|---|---|---|---|---|
| SonarCloud | `secrets:S8215` hash bcrypt en el código | Blocker | 2 | `database/02_seed.sql:17-18` | Real |
| SonarCloud | `javascript:S8786` regex con backtracking (ReDoS) | Major | 2 | `src/utils/validadores.js:1`, `database/migracion/transformar.js:1` | Real |
| SonarCloud | `javascript:S2068` contraseña en el código | Major | 1 | `tests/ayudantes.js:29` | Real |
| SonarCloud | `javascript:S9383` promesa sin `await`/`catch` | Major | 13 | `public/js/**`, `src/server.js:17` | Real, bajo impacto |
| SonarCloud | `Web:InputWithoutLabelCheck` y `Web:S6853` etiqueta sin `for` | Major | 11 + 9 | `login`, `registro`, `solicitar`, `catalogo*.html` | Real (accesibilidad) |
| Snyk Code | Use of Hardcoded Passwords / Credentials | Medium/Low | 11 + 5 | `datos-semilla.js`, `capturas.js`, `tests/*` | Real |
| Snyk Code | Path Traversal | High | 2 | `src/middlewares/errores.js:29`, `src/middlewares/subida.js:47` | Real (defensa en profundidad) |
| Snyk Code | Hardcoded Non-Cryptographic Secret | High | 1 | `src/modules/usuarios/servicio.js:9` | Falso positivo (hash señuelo) |
| Snyk Code | DOM XSS | Medium | 3 | `catalogo.js`, `detalle.js`, `seguimiento.js` | Falso positivo (`escaparHtml`) |
| Snyk Code | Path Traversal en la CLI de migración | Low | 4 + 1 | `database/migracion/migrar.js`, `tests/migracion.test.js` | Falso positivo (ruta la da quien ejecuta) |
| DeepSource | `JS-0125` variables no declaradas | Critical | 135 | `public/js/**` | Falso positivo (funciones compartidas entre scripts) |
| DeepSource | `JS-0016` funciones en bloques anidados | Major | 29 | `public/js/paginas/*`, `scripts/capturas.js` | Real (estilo) |
| DeepSource | `JS-0128` / `JS-0085` / `JS-0002` | Major/Minor | 11 / 3 / 3 | varios | Mayoría falsos positivos por entornos no declarados |
| DeepSource | `JS-0067` declaraciones en ámbito global | Minor | 169 | casi todo | Falso positivo en CommonJS |

Snyk Open Source: 0 vulnerabilidades en 102 dependencias.

### Fallos intencionales introducidos en `dev`

| Fallo | Commit | Detectado por |
|---|---|---|
| Command injection: `GET /api/admin/diagnostico?host=` con `exec("ping -c 1 " + host)` | `5c71e98` | SonarCloud `jssecurity:S2076` (Blocker), Snyk Code `javascript/CommandInjection` (High) |
| Código duplicado: copia de `campoTexto` en `src/modules/admin/validaciones.js` | `af77dce` | No detectado: 6 líneas, por debajo del umbral de duplicación |
| Dependencia vulnerable: `lodash@4.17.15` | `7be9150` | Snyk Open Source: 5 High y 3 Medium (prototype pollution, code injection, ReDoS) |
| Código nuevo sin pruebas | los tres anteriores | SonarCloud `new_coverage` 48,6 % < 80 %; DeepSource `TCV-001` (5) |

No se agregó ReDoS intencional (ya había dos reales) ni secretos intencionales (ya había credenciales reales).

Con esto, el análisis inicial del PR #12 (ejecución [40223779979](https://github.com/melanie05code/patitas-conectadas/actions/runs/40223779979)) dejó el Quality Gate de SonarCloud en **ERROR** (Security Rating E, cobertura 48,6 %), el check de Snyk en **fallido** y los checks de JavaScript y Test coverage de DeepSource en **fallido**.

## 13.3 Correcciones

| # | Hallazgo | Commit | Corrección y justificación | Impacto |
|---|---|---|---|---|
| 1 | Hashes bcrypt y contraseñas demo en el repositorio (S8215, S2068, Hardcoded Passwords) | `d73f7af` | `02_seed.sql` solo guarda marcadores (`@@SEED_ADMIN_PASSWORD@@`). `npm run db:instalar` calcula el hash bcrypt al instalar con las variables `SEED_ADMIN_PASSWORD` y `SEED_ADOPTANTE_PASSWORD` (documentadas en `.env.example` con valores `EJEMPLO_...`). Las pruebas generan contraseñas aleatorias en tiempo de ejecución; `scripts/capturas.js` las lee del entorno. README y docs 05, 06 y 12 ya no citan contraseñas. | −2 Blocker, −1 vulnerabilidad Sonar, −11 Snyk. Los hashes antiguos siguen en el historial de Git: se consideran revocados, porque las contraseñas demo ya no se versionan y cada instalación define las suyas. |
| 2 | Hash señuelo marcado como secreto (falso positivo de Snyk) | `6275460` | El hash que iguala los tiempos del login se genera con `randomBytes` en lugar de un texto fijo. | −1 High de Snyk Code sin cambiar el comportamiento. |
| 3 | Path Traversal en el borrado de archivos subidos | `c9e9c06` | `eliminarArchivo` reconstruye la ruta con `path.basename` dentro de la carpeta de fotos y solo borra si coincide con la ruta resuelta. | −2 High de Snyk Code. PR-29 prueba que no se borran archivos externos. |
| 4 | ReDoS en la validación de correo (S8786) | `3dae08b` | `esEmail` valida sin regex con backtracking (una sola `@`, sin espacios, un punto interior en el dominio). Se comprobó con 300 000 entradas aleatorias que acepta exactamente lo mismo que la regex anterior. `transformar.js` reutiliza la misma función. | −2 code smells Sonar. Entrada maliciosa de 30 000 caracteres: de unos 2,4 s a 0 ms (PR-30). |
| 5 | Command injection (intencional) | `8441cab`, `c4840d0` | Primero se pasó a `execFile` con argumentos separados y validación estricta del host. SonarCloud siguió marcando *Command Argument Tampering* (S6350) y el uso de `PATH` (S4036), así que **se eliminó el endpoint**: no forma parte de los requisitos del sistema y solo existía para el ejercicio. | −1 Blocker Sonar, −1 High Snyk Code. |
| 6 | Código duplicado (intencional) | `77af571` | `campoTexto` pasó a `src/utils/validadores.js` y la reutilizan los módulos. | Una sola implementación. |
| 7 | Dependencia vulnerable `lodash@4.17.15` (intencional) | `5153df8` | Se eliminó la dependencia; el recorte se hizo con `String.slice`. | −5 High y −3 Medium en dependencias. |
| 8 | Código sin cobertura | `bfc5666`, `c4840d0`, `2afc210` | Pruebas PR-29 (borrado seguro), PR-30 (correo sin ReDoS) y PR-31 (instalación exige las contraseñas por variable de entorno y `/api/salud`). Primero se agregaron PR-29 a PR-35; al eliminar el endpoint se quitaron las suyas y se renumeraron. | Cobertura del código nuevo 48,6 % → 95,8 %. 31 pruebas aprobadas. |
| 9 | Entornos no declarados en DeepSource (JS-0125, JS-0002, JS-0128) | `4d1ae9c`, `fb1283e` | `.deepsource.toml` declara `nodejs`, `browser`, `jest`, `module_system = "commonjs"` y `test_patterns = ["tests/**"]`. Los scripts del frontend declaran con directivas estándar de ESLint (`/* global */`, `/* exported */`) las funciones que comparten `comun.js` y `api.js`. | −135 JS-0125 y desaparecen los falsos positivos de console y variables sin usar. |
| 10 | Variables redeclaradas y sin usar (JS-0085, JS-0128) | `eec7aed` | `crypto` y `escape` se importan por desestructuración (`randomUUID`, `randomBytes`, `mysql.escape`); `respuestaDeSesion` filtra `passwordHash` sin variable sin usar. | −3 JS-0085, −1 JS-0128. |
| 11 | Umbral de Snyk | `7e3f5b5` | Se quitó `continue-on-error` y se agregó `--severity-threshold=high` a los dos pasos. | El job falla si aparece un hallazgo High. |
| 12 | Promesas sin manejar (S9383) | `7e26874` | Las llamadas de las páginas, cuyas funciones ya capturan sus errores, se marcan con `void`; `src/server.js` agrega un `.catch` que informa y termina el proceso. | −13 bugs Sonar. |
| 13 | Etiquetas sin `for` (accesibilidad) | `4b52187` | Cada `<label>` se asocia a su campo y el buscador del catálogo tiene `aria-label`. | −20 issues Sonar (11 bugs y 9 code smells). |
| 14 | Funciones en bloques anidados (JS-0016) | `c720b1a` | El código de cada página se movió a `iniciarPagina()`, que se llama con la misma condición; en `capturas.js` se usan funciones flecha. Se verificó en el navegador (Edge + Playwright) que todas las páginas cargan sin errores. | −29 JS-0016. |
| 15 | Cobertura de archivos sin pruebas unitarias | `5da589d` | `sonar.coverage.exclusions` y `collectCoverageFrom` excluyen `public/**` y `scripts/**` (frontend y capturas, verificados con Playwright) y los puntos de entrada `src/server.js` y `database/generar-seed.js`. | El Quality Gate mide la cobertura del código que sí tiene pruebas. |
| 16 | `qs@6.16.1` (Snyk, Medium, publicada el 2026-10-27 durante el análisis) | `c01ef35` | `npm update qs` → `6.17.1`, dentro del rango que ya pide Express. | 0 vulnerabilidades en dependencias. |

### Falsos positivos aceptados

- **Snyk Code DOM XSS (3, Medium):** el texto que se inserta en `innerHTML` pasa antes por `escaparHtml`.
- **Snyk Code Server Leak (1, Medium) en `errores.js:31`:** al cliente solo llegan mensajes de `ErrorApp` o textos fijos; el error interno nunca se envía.
- **Snyk Code Path Traversal (4 + 1, Low) en la CLI de migración y su prueba:** la ruta la da quien ejecuta el script en su equipo.
- **Snyk Code Hardcoded Credentials en pruebas (5, Low):** son correos de prueba con contraseñas aleatorias generadas en cada ejecución.
- **DeepSource JS-0067 (Minor):** en módulos CommonJS cada archivo tiene su propio ámbito; no son variables globales.
- **DeepSource JS-0098 (Minor):** `void` es la forma explícita que pide SonarCloud (S9383) para marcar promesas cuyo error ya se maneja dentro de la función.
- **DeepSource TCV-001 en archivos modificados:** DeepSource marca todas las líneas sin cubrir de cada archivo tocado (por ejemplo, ramas de error de la CLI de migración), aunque no sean líneas nuevas.

## 13.4 Antes / Después

| Indicador | Antes | Después |
|---|---|---|
| **SonarCloud** — Quality Gate | `main`: sin calcular · PR inicial: **ERROR** | PR #12: **Passed** |
| Bugs | 24 | 0 |
| Vulnerabilities | 3 (+1 Blocker intencional en el PR) | 0 |
| Security Hotspots | 0 | 0 |
| Code Smells | 11 | 0 |
| Duplications | 0,5 % | 0,6 % en los archivos del PR, 0,8 % en el código nuevo (umbral 3 %) |
| Coverage | sin dato · código nuevo del PR inicial 48,6 % | código nuevo 95,8 % · archivos del PR 78,7 % · Jest: 89,8 % de líneas |
| Reliability / Security / Maintainability / Security Review | C / E / A / A | A / A / A / A |
| **DeepSource** — ocurrencias | 405 (Bug risk 182, Anti-pattern 222, Secrets 1) | 192 resueltas y 48 marcadas en archivos modificados (21 TCV-001, 15 JS-0067, 12 JS-0098); total estimado 261 |
| Checks de DeepSource en el PR | JavaScript ❌, Test coverage ❌, SQL ✅, Secrets ✅ | JavaScript ❌, Test coverage ❌, SQL ✅, Secrets ✅ (solo por los falsos positivos de arriba; Bug risk introducidos: 0) |
| **Snyk Open Source** (High / Medium / Low) | `main` 0 / 0 / 0 · PR inicial 5 / 3 / 0 | 0 / 0 / 0 |
| **Snyk Code** (High / Medium / Low) | `main` 3 / 6 / 18 · PR inicial 4 / 6 / 18 | 0 / 4 / 10 |
| Check de Snyk en el PR | ❌ | ✅ (umbral `high`) |
| Pruebas | 28 | 31 (PR-29 a PR-31) |

SonarCloud no publica sin sesión las métricas de la rama `dev`, y el análisis de un PR solo cubre los archivos modificados. Los 38 issues de `main` estaban en archivos que este PR modifica, y en esos archivos el análisis final del PR da 0 bugs, 0 vulnerabilidades y 0 code smells. La cifra del proyecto completo se actualizará en el panel de `main` al fusionar.

## 13.5 Enlaces

- SonarCloud, PR #12: https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas&pullRequest=12
- SonarCloud, `main` (antes): https://sonarcloud.io/summary/overall?id=melanie05code_patitas-conectadas&branch=main
- DeepSource, repositorio: https://app.deepsource.com/gh/melanie05code/patitas-conectadas/
- DeepSource, ejecución inicial del PR: https://app.deepsource.com/gh/melanie05code/patitas-conectadas/run/993394f6-02c8-4304-b391-77a9786290c0/javascript/
- DeepSource, ejecución final del PR: https://app.deepsource.com/gh/melanie05code/patitas-conectadas/run/5a9ab90e-f6ec-4816-b7de-3efecd8d18cb/javascript/
- Snyk, check inicial del PR: https://app.snyk.io/org/melanie05code/pr-checks/7bf5e542-fd77-4580-b9f1-ee8ec14c6d2b
- Snyk, check final del PR: https://app.snyk.io/org/melanie05code/pr-checks/2c052064-2af1-42eb-a4bb-48cd2adc182f
- GitHub Actions, ejecución inicial: https://github.com/melanie05code/patitas-conectadas/actions/runs/40223779979
- GitHub Actions, ejecución final: https://github.com/melanie05code/patitas-conectadas/actions/runs/40998085724
