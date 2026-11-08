# 20. Matriz de correcciones

> Correcciones aplicadas desde el I Parcial hasta `v1.0.0`. Cada fila enlaza a un commit, un PR o un documento del repositorio https://github.com/melanie05code/patitas-conectadas.

## 20.1 I Parcial (Hito 1) — observaciones del docente

| N.º | Observación del docente | Cambio realizado | Evidencia | Estado |
|---|---|---|---|---|
| I-1 | PB-08 seguía "Pendiente" en el backlog aunque el hallazgo 5 (validación del teléfono) estaba corregido | Se revisó el backlog completo contra el código; PB-08 pasó a *Completado* | [`02` §2.4](02_alcance_requisitos.md) · DEF-03 | Corregido |
| I-2 | Usuarios y contraseñas en localStorage en texto plano (incumple RNF-02) | Backend con bcrypt y JWT; el navegador solo guarda el token en `sessionStorage` | [`1ca687e`](https://github.com/melanie05code/patitas-conectadas/commit/1ca687e) · PR-01 · DEF-01 | Corregido |
| I-3 | Criterios de aceptación incompletos (solo RF-06 y RF-08) | Criterios Dado/Cuando/Entonces para RF-01 a RF-10 (II Parcial) y RF-11 a RF-15 (III Parcial) | [`02` §2.6](02_alcance_requisitos.md) · DEF-04 | Corregido |
| I-4 | Falta evidencia de commits y de la evolución del repositorio | Commits pequeños con convención, una rama por funcionalidad y PR por rama: 17 PR integrados al cierre | [PR #1](https://github.com/melanie05code/patitas-conectadas/pull/1) a [PR #17](https://github.com/melanie05code/patitas-conectadas/pull/17) · [`07_git.md`](07_git.md) | Corregido |
| I-5 | La validación crítica debe estar en el backend | Validación en el servidor de todos los endpoints, más CHECK/UNIQUE en la BD | [`2d32ec3`](https://github.com/melanie05code/patitas-conectadas/commit/2d32ec3), [`669f332`](https://github.com/melanie05code/patitas-conectadas/commit/669f332) · PR-03, PR-35 · DEF-02 | Corregido |
| I-6 | Hallazgo 3 pendiente: menú autenticado en Registro/Login con sesión | Redirección a la pantalla principal | [`a4194f6`](https://github.com/melanie05code/patitas-conectadas/commit/a4194f6) · DEF-05 | Corregido |
| I-7 | Hallazgo 4 parcial / PB-10: faltan fotografías reales | Subida segura de fotos y fotos reales de las 10 mascotas | [`dfe6f85`](https://github.com/melanie05code/patitas-conectadas/commit/dfe6f85) · PR-11, PR-12 · DEF-06 | Corregido |
| I-8 | Arquitectura propuesta con MongoDB | MySQL 8.0 con esquema, FK, UNIQUE, CHECK y transacciones (justificado) | [PR #2](https://github.com/melanie05code/patitas-conectadas/pull/2) · [`04` §4.1](04_arquitectura.md) · [`05`](05_base_datos.md) | Corregido |
| I-9 | Arquitectura propuesta con React | Se mantuvo y evolucionó el prototipo HTML/CSS/JS validado con usuarios (justificado) | [PR #3](https://github.com/melanie05code/patitas-conectadas/pull/3) a [PR #6](https://github.com/melanie05code/patitas-conectadas/pull/6) · [`04` §4.1](04_arquitectura.md) | Corregido |

Detalle original: [`01_correcciones.md`](01_correcciones.md).

## 20.2 II Parcial — autoinspección y herramientas de calidad

**El II Parcial no tuvo revisión docente porque no se entregó.** En su lugar se aplicaron las correcciones de la **autoinspección** (revisión propia del código y de la interfaz) y de las **herramientas de calidad** (SonarCloud, Snyk y DeepSource en el PR #12).

| N.º | Origen | Hallazgo | Cambio realizado | Evidencia | Estado |
|---|---|---|---|---|---|
| II-1 | Autoinspección | El detalle exigía sesión aunque el catálogo público enlazaba a él | Detalle público | [`c5decd5`](https://github.com/melanie05code/patitas-conectadas/commit/c5decd5) · DEF-07 | Corregido |
| II-2 | Autoinspección | Riesgo de XSS por `innerHTML` | `escaparHtml` en todas las páginas | [`3a33f24`](https://github.com/melanie05code/patitas-conectadas/commit/3a33f24) · DEF-08 | Corregido |
| II-3 | Autoinspección | Contraseñas de 6 caracteres aceptadas | Mínimo de 8 | [`2766d62`](https://github.com/melanie05code/patitas-conectadas/commit/2766d62) · DEF-09 | Corregido |
| II-4 | Autoinspección | Sin `viewport` (RNF-03) | Meta `viewport` en todas las páginas | [`c8ea256`](https://github.com/melanie05code/patitas-conectadas/commit/c8ea256) · DEF-10 | Corregido |
| II-5 | Autoinspección | Scripts inline incompatibles con una CSP estricta | Scripts en archivos y CSP de Helmet | [`cebeece`](https://github.com/melanie05code/patitas-conectadas/commit/cebeece) · DEF-11 | Corregido |
| II-6 | Autoinspección | El catálogo "Mascotas disponibles" mostraba las adoptadas | Filtro por defecto y "Ver adoptadas" | [`80baeb5`](https://github.com/melanie05code/patitas-conectadas/commit/80baeb5) · PR-28 · DEF-12 | Corregido |
| II-7 | Autoinspección | Faltaba un camino para migrar los datos del prototipo | ETL con respaldo, validación y rollback | [`08_migracion.md`](08_migracion.md) · PR-24 a PR-27 | Corregido |
| II-8 | SonarCloud, Snyk | Hashes y contraseñas demo en el repositorio | Marcadores y variables de entorno | [`d73f7af`](https://github.com/melanie05code/patitas-conectadas/commit/d73f7af) · DEF-13 | Corregido |
| II-9 | Snyk | Path Traversal al borrar archivos | Ruta reconstruida y comparada | [`c9e9c06`](https://github.com/melanie05code/patitas-conectadas/commit/c9e9c06) · PR-29 · DEF-14 | Corregido |
| II-10 | SonarCloud | ReDoS en la validación del correo | Validación sin backtracking | [`3dae08b`](https://github.com/melanie05code/patitas-conectadas/commit/3dae08b) · PR-30 · DEF-15 | Corregido |
| II-11 | SonarCloud | Promesas sin manejar y etiquetas sin `for` | `void`/`.catch` y etiquetas asociadas | [`7e26874`](https://github.com/melanie05code/patitas-conectadas/commit/7e26874), [`4b52187`](https://github.com/melanie05code/patitas-conectadas/commit/4b52187) · DEF-16 | Corregido |
| II-12 | DeepSource | Funciones en bloques anidados, variables sin usar, entornos no declarados | Refactor y `.deepsource.toml` | [`c720b1a`](https://github.com/melanie05code/patitas-conectadas/commit/c720b1a), [`eec7aed`](https://github.com/melanie05code/patitas-conectadas/commit/eec7aed), [`4d1ae9c`](https://github.com/melanie05code/patitas-conectadas/commit/4d1ae9c) · DEF-17 | Corregido |
| II-13 | Snyk | `qs@6.16.1` vulnerable (publicada durante el análisis) | Actualizada a 6.17.1 | [`c01ef35`](https://github.com/melanie05code/patitas-conectadas/commit/c01ef35) | Corregido |
| II-14 | DeepSource | Checks JavaScript y Test coverage en rojo por falsos positivos | Analizado; queda como residual | [`15` RES-01](15_bitacora_defectos.md) | Residual justificado |

Detalle del análisis: [`13_calidad_seguridad.md`](13_calidad_seguridad.md).

## 20.3 III Parcial — correcciones de la suite final (2026-11-07)

| N.º | Origen | Hallazgo | Cambio | Evidencia | Estado |
|---|---|---|---|---|---|
| III-1 | SonarCloud | Cobertura del código nuevo de 69 % en el PR #13 | Prueba PR-33 | [`73e97ce`](https://github.com/melanie05code/patitas-conectadas/commit/73e97ce) · DEF-18 | Corregido |
| III-2 | Prueba PR-25 | El ETL descartaba las solicitudes "En revisión" | Equivalencia → "Solicitada" | [`abdbdcb`](https://github.com/melanie05code/patitas-conectadas/commit/abdbdcb) · DEF-19 | Corregido |
| III-3 | SonarCloud | Autoasignación en la migración 003 | Asignación sin autoasignación | [`88b3125`](https://github.com/melanie05code/patitas-conectadas/commit/88b3125) · DEF-20 | Corregido |
| III-4 | E2E-15 | La barra desborda en el celular | Salto de línea en la barra | [`1cc3453`](https://github.com/melanie05code/patitas-conectadas/commit/1cc3453) · DEF-21 | Corregido |
| III-5 | Instalación desde cero | Se aceptaban las contraseñas de ejemplo | El instalador las rechaza | [`7931c1a`](https://github.com/melanie05code/patitas-conectadas/commit/7931c1a) · DEF-22 | Corregido |
| III-6 | Instalación desde cero | El README pedía `npm install`, no mencionaba las migraciones ni las variables nuevas | README actualizado | [`README.md`](../README.md) · [evidencia](evidencias/final/instalacion_desde_cero.txt) | Corregido |
| III-7 | Evaluación heurística | 9 hallazgos (U1 a U9) | 7 corregidos y 2 pendientes de severidad ≤ 2 | [`23_evaluacion_usabilidad.md`](23_evaluacion_usabilidad.md) | 7 corregidos / 2 pendientes |
