# 15. Bitácora de defectos

> III Parcial · versión `v1.0.0` · responsable de todas las correcciones: **Melanie Obando**.
> Fuentes: [`01_correcciones.md`](01_correcciones.md), los hallazgos **reales** de [`13_calidad_seguridad.md`](13_calidad_seguridad.md) y los defectos que salieron hoy (2026-11-07) en la suite final.
> Los fallos **inyectados a propósito** para validar las herramientas van aparte, en la sección 15.3.

Severidad: **Crítica** (pérdida o exposición de datos, o el sistema no funciona) · **Alta** (falla una regla de negocio o la seguridad) · **Media** (funciona con un error visible o de calidad) · **Baja** (estilo, accesibilidad menor, documentación).

Las fechas de identificación de las observaciones del I Parcial no se registraron: se indica "Retroalimentación del I Parcial". En los hallazgos de inspección del II Parcial (DEF-07 a DEF-12) se usa la fecha del commit de corrección, porque la de identificación tampoco se anotó. Los hallazgos de las herramientas (DEF-13 a DEF-17) tienen la fecha del análisis inicial del PR #12 (2026-10-25), y los de hoy, la fecha de hoy.

## 15.1 Defectos corregidos

| ID | Requisito | Severidad | Cómo se reproduce (antes de corregir) | Origen | Responsable | Fecha de identificación | Corrección | Prueba de regresión | Estado final |
|---|---|---|---|---|---|---|---|---|---|
| DEF-01 | RNF-02 | Crítica | En el prototipo, abrir DevTools → Application → localStorage `pc_users`: contraseñas en texto plano | Revisión docente | M. Obando | Retroalimentación del I Parcial | bcrypt + JWT, el navegador solo guarda el token · [`1ca687e`](https://github.com/melanie05code/patitas-conectadas/commit/1ca687e) (2026-10-25) | PR-01, PR-04 | Cerrado |
| DEF-02 | RF-01, RF-06 | Alta | Desactivar JavaScript o llamar a la API directamente con datos inválidos: se aceptaban | Revisión docente | M. Obando | Retroalimentación del I Parcial | Validación en el servidor con 400/401/403/404/409 · [`2d32ec3`](https://github.com/melanie05code/patitas-conectadas/commit/2d32ec3), [`669f332`](https://github.com/melanie05code/patitas-conectadas/commit/669f332) | PR-03, PR-15, PR-35 | Cerrado |
| DEF-03 | Documentación | Baja | El backlog marcaba PB-08 como "Pendiente" aunque el hallazgo 5 estaba corregido | Revisión docente | M. Obando | Retroalimentación del I Parcial | Backlog revisado contra el código · `docs/02` §2.4 | Inspección del doc 02 | Cerrado |
| DEF-04 | Documentación | Media | Solo RF-06 y RF-08 tenían criterios de aceptación | Revisión docente | M. Obando | Retroalimentación del I Parcial | Criterios Dado/Cuando/Entonces de RF-01 a RF-15 · `docs/02` §2.6 | Matriz `19` | Cerrado |
| DEF-05 | Usabilidad (hallazgo 3) | Media | Con sesión iniciada, abrir `login.html`: se mostraba el menú autenticado | Revisión docente | M. Obando | Retroalimentación del I Parcial | Redirección a la pantalla principal · [`a4194f6`](https://github.com/melanie05code/patitas-conectadas/commit/a4194f6) | E2E-09, E2E-13 | Cerrado |
| DEF-06 | PB-10 | Media | Catálogo con íconos en lugar de fotos reales | Revisión docente | M. Obando | Retroalimentación del I Parcial | Subida de fotos validada y fotos reales · [`dfe6f85`](https://github.com/melanie05code/patitas-conectadas/commit/dfe6f85) | PR-11, PR-12, E2E-03 | Cerrado |
| DEF-07 | RF-04 | Media | Desde el catálogo público, abrir una mascota sin sesión: pedía iniciar sesión | Inspección | M. Obando | 2026-10-24 | Detalle público · [`c5decd5`](https://github.com/melanie05code/patitas-conectadas/commit/c5decd5) | PR-08 | Cerrado |
| DEF-08 | Seguridad | Alta | Los datos del usuario (nombre, motivo) se insertaban con `innerHTML` sin escapar: riesgo de XSS | Inspección | M. Obando | 2026-10-24 | `escaparHtml` en todas las páginas · [`3a33f24`](https://github.com/melanie05code/patitas-conectadas/commit/3a33f24) | E2E-16 | Cerrado |
| DEF-09 | RF-01 | Media | Registrarse con una contraseña de 6 caracteres: se aceptaba | Inspección | M. Obando | 2026-10-24 | Mínimo de 8 en el formulario y en el servidor · [`2766d62`](https://github.com/melanie05code/patitas-conectadas/commit/2766d62) | PR-03 | Cerrado |
| DEF-10 | RNF-03 | Media | Abrir el sitio en un celular: se veía con ancho de escritorio (faltaba `viewport`) | Inspección | M. Obando | 2026-10-25 | `<meta name="viewport">` · [`c8ea256`](https://github.com/melanie05code/patitas-conectadas/commit/c8ea256) | E2E-15 | Cerrado |
| DEF-11 | Seguridad | Media | Los scripts inline obligaban a permitir `'unsafe-inline'` en la CSP | Inspección | M. Obando | 2026-10-25 | Scripts en archivos y CSP estricta de Helmet · [`cebeece`](https://github.com/melanie05code/patitas-conectadas/commit/cebeece) | E2E-16 (0 errores de CSP) | Cerrado |
| DEF-12 | RF-03 | Media | Abrir "Mascotas disponibles": aparecían también las adoptadas | Inspección | M. Obando | 2026-10-25 | Filtro por defecto y vista "Ver adoptadas" · [`80baeb5`](https://github.com/melanie05code/patitas-conectadas/commit/80baeb5) | PR-28 | Cerrado |
| DEF-13 | Seguridad | Crítica | Leer `database/02_seed.sql`: hashes bcrypt y contraseñas demo versionados (S8215, S2068) | SonarCloud, Snyk | M. Obando | 2026-10-25 | Marcadores en el seed y contraseñas por variable de entorno · [`d73f7af`](https://github.com/melanie05code/patitas-conectadas/commit/d73f7af) | PR-31 | Cerrado (los hashes viejos siguen en el historial: ver residuales) |
| DEF-14 | Seguridad | Alta | Llamar a `eliminarArchivo("../../otro")`: borraba fuera de la carpeta de fotos (Path Traversal) | Snyk | M. Obando | 2026-10-25 | Ruta reconstruida con `basename` y comparada · [`c9e9c06`](https://github.com/melanie05code/patitas-conectadas/commit/c9e9c06) | PR-29 | Cerrado |
| DEF-15 | Seguridad | Alta | Validar un correo malicioso de 30 000 caracteres: unos 2,4 s de CPU (ReDoS, S8786) | SonarCloud | M. Obando | 2026-10-25 | Validación sin backtracking · [`3dae08b`](https://github.com/melanie05code/patitas-conectadas/commit/3dae08b) | PR-30 | Cerrado |
| DEF-16 | Calidad | Media | Promesas sin `await`/`catch` (S9383, 13 casos) y etiquetas sin `for` (20 casos) | SonarCloud | M. Obando | 2026-10-25 | [`7e26874`](https://github.com/melanie05code/patitas-conectadas/commit/7e26874), [`4b52187`](https://github.com/melanie05code/patitas-conectadas/commit/4b52187) | Análisis de Sonar del PR #12 (0 bugs) | Cerrado |
| DEF-17 | Calidad | Baja | Funciones en bloques anidados (JS-0016, 29), variables redeclaradas o sin usar (JS-0085, JS-0128) | DeepSource | M. Obando | 2026-10-25 | [`c720b1a`](https://github.com/melanie05code/patitas-conectadas/commit/c720b1a), [`eec7aed`](https://github.com/melanie05code/patitas-conectadas/commit/eec7aed) | Análisis de DeepSource del PR #12 | Cerrado |
| DEF-18 | Calidad | Media | El PR #13 dejaba sin probar `migrar()` (CLI de migraciones): cobertura del código nuevo de 69 % < 80 % | SonarCloud | M. Obando | 2026-11-07 | Prueba PR-33 · [`73e97ce`](https://github.com/melanie05code/patitas-conectadas/commit/73e97ce) | PR-33 y CI (86,2 %, Quality Gate OK) | Cerrado |
| DEF-19 | Migración | Alta | Ejecutar el ETL después de la migración 003: las solicitudes "En revisión" del prototipo se descartaban como "estado desconocido" | Prueba (PR-25) | M. Obando | 2026-11-07 | Equivalencia "En revisión" → "Solicitada" · [`abdbdcb`](https://github.com/melanie05code/patitas-conectadas/commit/abdbdcb) | PR-25, PR-26 | Cerrado |
| DEF-20 | BD | Baja | `UPDATE … actualizado_en = actualizado_en` en la migración 003 (S1656, Reliability C en el Quality Gate del PR #16) | SonarCloud | M. Obando | 2026-11-07 | Asignación de izquierda a derecha sin autoasignación · [`88b3125`](https://github.com/melanie05code/patitas-conectadas/commit/88b3125) | Suite completa en el CI del PR #16 | Cerrado |
| DEF-21 | RNF-03 | Media | Con sesión de adoptante, abrir cualquier página en una pantalla de 390 px: la barra mide 411 px y aparece desplazamiento horizontal (se introdujo al agregar "Mi perfil") | Prueba (E2E-15) | M. Obando | 2026-11-07 | La barra hace salto de línea en el celular · [`1cc3453`](https://github.com/melanie05code/patitas-conectadas/commit/1cc3453) | E2E-15 y E2E completa (16/16) | Cerrado |
| DEF-22 | Seguridad, instalación | Media | Copiar `.env.example` sin cambiar `SEED_*` y ejecutar `npm run db:instalar`: se instalaba con contraseñas demo publicadas en el repositorio | Inspección (instalación desde cero) | M. Obando | 2026-11-07 | El instalador rechaza los valores `EJEMPLO_` · [`7931c1a`](https://github.com/melanie05code/patitas-conectadas/commit/7931c1a) | PR-31, VO-03 | Cerrado |
| DEF-23 | Seguridad (calidad) | Baja | Las pruebas nuevas (E2E-09, E2E-10 y PR-31) y dos documentos de evidencia (esta bitácora y `instalacion_desde_cero.txt`) contenían contraseñas de ejemplo literales o pares `VARIABLE=valor`; el check **DeepSource: Secrets** del PR #18 pasó a rojo (SCT-A000, *Hardcoded credential*). El `exclude_patterns` de `docs/**` no aplica al analizador de secretos | DeepSource | M. Obando | 2026-11-07 | Valores aleatorios generados en cada ejecución · [`6974314`](https://github.com/melanie05code/patitas-conectadas/commit/6974314), [`4e73fc5`](https://github.com/melanie05code/patitas-conectadas/commit/4e73fc5), [`1021bf5`](https://github.com/melanie05code/patitas-conectadas/commit/1021bf5) | E2E completa (16/16), PR-31; DeepSource Secrets en verde en el CI del PR #18 | Cerrado |
| DEF-24 | RF-02, seguridad | Media | Abrir `login.html`: debajo del formulario aparecían dos usuarios demo con contraseñas (`Admin…`/`Edwin…`) que ya no funcionaban desde DEF-13 y DEF-22, porque cada instalación define las suyas en el `.env` | Inspección (revisión final de pantallas) | M. Obando | 2026-11-07 | Texto eliminado; las cuentas demo solo se documentan en el README y en las notas del release, sin contraseñas · [`6162620`](https://github.com/melanie05code/patitas-conectadas/commit/6162620) | E2E-09, PR-05 (captura) y búsqueda de credenciales en `public/` sin resultados | Cerrado |

## 15.2 Evidencia ANTES → modificación → DESPUÉS

### DEF-21 · Barra de navegación desbordada en el celular

**ANTES:** medición con Playwright (Edge, 390 × 844, sesión de Edwin) el 2026-11-07:
```
seguimiento.html?id=1 {"scroll":411,"ancho":390,"anchos":["NAV. right=411","A. right=397","SPAN.contador right=397"]}
catalogo.html         {"scroll":407,"ancho":390,"anchos":["NAV. right=407","A. right=393","SPAN.contador right=393"]}
```
E2E-15 → **Fallido** ("Hay desplazamiento horizontal en móvil").

**Modificación** ([`1cc3453`](https://github.com/melanie05code/patitas-conectadas/commit/1cc3453), `public/css/styles.css`):
```css
@media (max-width: 600px) {
  .topbar nav { display: flex; flex-wrap: wrap; row-gap: 6px; max-width: 100%; }
  .topbar nav a { margin-left: 0; margin-right: 14px; }
}
```

**DESPUÉS:** `"scroll":390,"ancho":390,"anchos":[]` en las 6 páginas medidas; E2E-15 **Aprobado**. Captura: [`E2E-15_seguimiento_movil.png`](evidencias/final/e2e/E2E-15_seguimiento_movil.png).

### DEF-24 · El login mostraba credenciales demo desactualizadas

**ANTES:** `public/login.html` tenía, debajo del enlace de registro, un párrafo con "Demo admin" y "Demo adoptante": correo y contraseña de cada cuenta. Esas contraseñas eran las del Hito 1; desde DEF-13 y DEF-22 cada instalación toma las suyas de las variables `SEED_*`, así que el texto mostraba datos falsos y anunciaba cuentas reales.

**Modificación** ([`6162620`](https://github.com/melanie05code/patitas-conectadas/commit/6162620), `public/login.html`): se eliminó el párrafo. Una búsqueda de `admin@patitas`, `edwin.obando` y `Demo` en `public/` ya no devuelve resultados. Las cuentas demo quedan en el README (sección *Usuarios demo*), que nombra la variable de cada contraseña sin su valor.

**DESPUÉS:** la pantalla solo tiene el formulario y el enlace de registro ([`PR-05_login_error.png`](evidencias/PR-05_login_error.png), [`E2E-09_login_invalido.png`](evidencias/final/e2e/E2E-09_login_invalido.png)); E2E-09 y la suite E2E completa (16/16) aprobadas.

### DEF-22 · La instalación aceptaba las contraseñas de ejemplo

**ANTES:** con la variable de la contraseña del admin en su valor de ejemplo (`EJEMPLO_…` de `.env.example`), `npm run db:instalar` terminaba "instalada con datos semilla", con una contraseña de administrador publicada en el repositorio.

**Modificación** ([`7931c1a`](https://github.com/melanie05code/patitas-conectadas/commit/7931c1a), `database/instalar.js`):
```js
if (contrasena.startsWith("EJEMPLO_")) {
  throw new Error(`La variable ${variable} todavía tiene el valor de ejemplo de .env.example. Cámbiala por una contraseña propia.`);
}
```

**DESPUÉS** ([`instalacion_desde_cero.txt`](evidencias/final/instalacion_desde_cero.txt)):
```
Error al instalar la base de datos: La variable SEED_ADMIN_PASSWORD todavía tiene el valor de ejemplo de .env.example. Cámbiala por una contraseña propia.
```
PR-31 lo verifica en cada ejecución.

### DEF-19 · El ETL descartaba las solicitudes "En revisión"

**ANTES:** después de la migración 003, la corrida de prueba del ETL mostró:
```
solicitudes          7          3          0           4
- [solicitudes] id origen 101: estado desconocido ("En revisión")
- [solicitudes] id origen 1724590800000: estado desconocido ("En revisión")
```
PR-25 → **Fallido** (se esperaban 5 insertadas y 2 descartadas).

**Modificación** ([`abdbdcb`](https://github.com/melanie05code/patitas-conectadas/commit/abdbdcb), `database/migracion/transformar.js`):
```js
const ESTADOS_SOLICITUD = ["Solicitada", "Aprobada", "Rechazada"];
const EQUIVALENCIAS_ESTADO = { "en revision": "Solicitada" };
```

**DESPUÉS:** `solicitudes 7 5 0 2`; PR-25 y PR-26 **Aprobados**.

### DEF-14 · Path Traversal al borrar archivos subidos

**ANTES** (`src/utils/archivos.js`): `if (ruta) await fs.promises.rm(ruta, { force: true });` borraba cualquier ruta que recibiera.

**Modificación** ([`c9e9c06`](https://github.com/melanie05code/patitas-conectadas/commit/c9e9c06)):
```js
const archivo = path.join(directorioMascotas, path.basename(ruta));
if (path.resolve(ruta) !== archivo) return;
await fs.promises.rm(archivo, { force: true });
```

**DESPUÉS:** Snyk Code, −2 High. PR-29 crea un archivo fuera de la carpeta de fotos, intenta borrarlo con y sin `../` y comprueba que sigue existiendo.

### DEF-15 · ReDoS en la validación del correo

**ANTES:** `const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;`. Una entrada maliciosa de 30 000 caracteres tardaba unos 2,4 s.

**Modificación** ([`3dae08b`](https://github.com/melanie05code/patitas-conectadas/commit/3dae08b)): una sola `@`, sin espacios y un punto interior en el dominio, sin expresiones con backtracking.

**DESPUÉS:** PR-30 valida 50 000 caracteres maliciosos en menos de 100 ms y conserva el mismo resultado en 12 correos de referencia.

## 15.3 Fallos inyectados intencionalmente para validar las herramientas

> **No son defectos del producto.** Se agregaron a propósito en la rama `dev` del PR #12 para comprobar que SonarCloud, Snyk y DeepSource los detectaban, y después se corrigieron. Detalle en [`13_calidad_seguridad.md`](13_calidad_seguridad.md) §13.2.

| ID | Fallo inyectado | Commit que lo introdujo | ¿Lo detectó? | Corrección |
|---|---|---|---|---|
| INY-01 | Command injection: `exec("ping -c 1 " + host)` en `GET /api/admin/diagnostico` | `5c71e98` | Sí: SonarCloud S2076 (Blocker) y Snyk Code (High) | Primero `execFile` con validación ([`8441cab`](https://github.com/melanie05code/patitas-conectadas/commit/8441cab)); después se eliminó el endpoint ([`c4840d0`](https://github.com/melanie05code/patitas-conectadas/commit/c4840d0)) |
| INY-02 | Código duplicado: copia de `campoTexto` | `af77dce` | **No**: 6 líneas, por debajo del umbral de duplicación de SonarCloud | Reutilización desde `validadores.js` ([`77af571`](https://github.com/melanie05code/patitas-conectadas/commit/77af571)) |
| INY-03 | Dependencia vulnerable `lodash@4.17.15` | `7be9150` | Sí: Snyk Open Source (5 High, 3 Medium) | Dependencia eliminada ([`5153df8`](https://github.com/melanie05code/patitas-conectadas/commit/5153df8)) |
| INY-04 | Código nuevo sin pruebas | los tres anteriores | Sí: SonarCloud `new_coverage` 48,6 % y DeepSource TCV-001 | Pruebas PR-29 a PR-31 ([`bfc5666`](https://github.com/melanie05code/patitas-conectadas/commit/bfc5666)) |

No se inyectó ReDoS (ya había dos reales, DEF-15) ni secretos (ya existían credenciales reales, DEF-13).

## 15.4 Defectos y riesgos residuales

| ID | Descripción | Severidad | Por qué queda abierto | Mitigación |
|---|---|---|---|---|
| RES-01 | Los checks **DeepSource: JavaScript** y **DeepSource: Test coverage** salen en rojo en cada PR | Baja | Revisado hoy: fallan por JS-0067 ("declaración en ámbito global", que en CommonJS cada archivo tiene su propio ámbito), JS-0098 (el `void` que exige SonarCloud S9383) y TCV-001, que marca todas las líneas sin cubrir de cada archivo tocado aunque no sean nuevas. Los Bug risk introducidos son 0. Silenciarlos requiere marcar las reglas en el panel web de DeepSource (necesita la sesión de la dueña) o poner comentarios `skipcq` en el código, que va contra la regla de "código sin comentarios" | SonarCloud (Quality Gate OK), Snyk y Jest siguen bloqueando lo importante; pendiente marcar los falsos positivos en el panel |
| RES-02 | Los hashes bcrypt viejos de los usuarios demo siguen en el historial de Git | Media | Reescribir el historial publicado rompe los enlaces de commits de los documentos | Se consideran revocados: cada instalación define sus contraseñas (DEF-13, DEF-22) |
| RES-03 | 20 vulnerabilidades bajas o moderadas en dependencias **de desarrollo** (glob, minimatch y deepmerge, que vienen de Jest) | Baja | No hay versión compatible sin cambiar de versión mayor de Jest; `npm audit --omit=dev` da 0 | Snyk con umbral alto, 0 High; no se instalan en producción |
| RES-04 | Restaurar un respaldo truncado de `mysqldump` **termina con código 0** y deja una restauración parcial | Media | Comportamiento de `mysql` al cortarse el archivo entre sentencias (comprobado hoy, VO-02) | Procedimiento del doc 18: verificar sha256 y la línea `Dump completed` antes de restaurar |
| RES-05 | Cobertura de ramas de Jest del 67 % (servicio de mascotas al 45 %) | Baja | La edición de mascotas con foto se cubre por E2E y no por Jest | E2E-03; acción futura en el informe 21 |
| RES-06 | La hora de las entrevistas usa la hora local del servidor | Baja | El sistema es de un solo refugio y el servidor está en su zona horaria | Documentado en el doc 04 (decisiones técnicas) |
| RES-07 | Snyk Code mantiene 4 Medium y 10 Low que son falsos positivos (DOM XSS con `escaparHtml`, ruta de la CLI de migración) | Baja | Ya analizados en el doc 13 §13.3 | Revisión manual documentada |

## 15.5 Resumen

| | Cantidad |
|---|---|
| Defectos reales corregidos | **24** (DEF-01 a DEF-24), 7 de ellos encontrados hoy (DEF-18 a DEF-24) |
| Fallos inyectados (no son defectos) | 4, todos corregidos; 3 detectados por las herramientas |
| Residuales | **7** (RES-01 a RES-07), ninguno crítico |
