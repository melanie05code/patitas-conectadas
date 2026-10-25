# 7. Control de versiones (Git y GitHub)

## 7.1 Repositorio

- **URL:** https://github.com/melanie05code/patitas-conectadas
- **Rama principal:** `main` (solo recibe cambios mediante Pull Requests en esta etapa)
- **Proyecto individual:** toda la autoría corresponde a una sola integrante, **Melanie Abigail Obando Rivera**, y a su cuenta de GitHub `melanie05code`. En el historial aparecen dos correos, ambos vinculados a esa cuenta: el correo privado de GitHub (`185583292+melanie05code@users.noreply.github.com`), usado en los commits hechos desde la terminal, y el correo principal de la cuenta, que GitHub usa en los commits hechos desde su web en el Hito 1 y en los merges de los Pull Requests.
- **Historial completo:** 110 commits a la fecha de este documento (commit `2913291`), de los cuales 87 son del Segundo Parcial (sin contar los merges).

## 7.2 Flujo de trabajo

1. Una **rama por funcionalidad**, creada desde `main` actualizada.
2. **Commits pequeños**, cada uno con un título de una sola línea que describe el cambio real, con el prefijo de la convención y redactado en pasado con «se» (sin cuerpo).
3. Verificación antes de integrar: pruebas manuales o scripts de verificación, y desde la rama de pruebas, `npm test`.
4. **Pull Request** con `gh pr create`, indicando los requisitos que cubre, e integración con `gh pr merge --merge --delete-branch`. Se usa merge commit (no squash) para que en `main` se vean todos los commits de cada rama.
5. Los documentos v1 y el prototipo se movieron con `git mv` en commits propios para **conservar su historial** (`git log --follow docs/hito1/Alcance-v1.md` muestra los commits del Hito 1).

## 7.3 Ramas y Pull Requests

| PR | Rama | Título | Qué cubre | Commits | Integrado |
|---|---|---|---|---|---|
| [#1](https://github.com/melanie05code/patitas-conectadas/pull/1) | `fix/correcciones-hito1` | fix: correcciones del Hito 1 (backlog, hallazgo 3, XSS, criterios de aceptación) | Correcciones del Hito 1: backlog (PB-08), hallazgo 3, XSS, criterios de aceptación RF-01 a RF-10, reorganización con `git mv` | 11 | 2026-10-25 |
| [#2](https://github.com/melanie05code/patitas-conectadas/pull/2) | `feat/base-de-datos` | feat: base de datos MySQL, datos semilla y servidor Express base | PB-05/PB-06: esquema MySQL, datos semilla con bcrypt, servidor Express, usuario `patitas_app` | 8 | 2026-10-25 |
| [#3](https://github.com/melanie05code/patitas-conectadas/pull/3) | `feat/autenticacion` | feat: autenticación segura con bcrypt y JWT | RF-01, RF-02, RNF-02: registro y login con bcrypt + JWT, límite de intentos | 9 | 2026-10-25 |
| [#4](https://github.com/melanie05code/patitas-conectadas/pull/4) | `feat/catalogo-mascotas` | feat: catálogo de mascotas y tipos administrables | RF-03, RF-04, RF-09, PB-16: catálogo, detalle, tipos de mascota, viewport (RNF-03) | 9 | 2026-10-25 |
| [#5](https://github.com/melanie05code/patitas-conectadas/pull/5) | `feat/solicitudes-transacciones` | feat: solicitudes de adopción con transacciones | RF-05, RF-06, RF-08, RF-10: solicitudes con transacciones, concurrencia y rollback | 7 | 2026-10-25 |
| [#6](https://github.com/melanie05code/patitas-conectadas/pull/6) | `feat/notificaciones` | feat: notificaciones internas con contador de no leídas | RF-07, PB-09: notificaciones internas, CSP estricta, fin del uso de localStorage | 5 | 2026-10-25 |
| [#7](https://github.com/melanie05code/patitas-conectadas/pull/7) | `feat/fotos-mascotas` | feat: fotos reales de las mascotas y subida desde el panel | PB-10, hallazgo 4: fotos reales y subida con multer | 9 | 2026-10-25 |
| [#8](https://github.com/melanie05code/patitas-conectadas/pull/8) | `test/pruebas-api` | test: pruebas automáticas de la API con Jest y Supertest | Pruebas automáticas PR-01 a PR-23 con Jest + Supertest | 6 | 2026-10-25 |
| [#9](https://github.com/melanie05code/patitas-conectadas/pull/9) | `feat/migracion-datos` | feat: migración de datos desde el localStorage del prototipo | Migración ETL desde el localStorage del prototipo (PR-24 a PR-27) | 5 | 2026-10-25 |
| [#10](https://github.com/melanie05code/patitas-conectadas/pull/10) | `docs/segundo-parcial` | docs: documentación del Segundo Parcial, README y evidencias | Documentos 00 a 12, README, capturas con Playwright, catálogo sin adoptadas (hallazgo 16, PR-28) | 18 | 2026-10-25 |
| [#11](https://github.com/melanie05code/patitas-conectadas/pull/11) | `docs/correccion-historial` | docs: actualización de hashes y títulos tras la corrección del historial | Hashes, enlaces y títulos de commits citados en la documentación, actualizados al historial corregido | 1 | (este PR) |

## 7.4 Convención de commits

Formato `tipo: se + verbo en pasado + qué cambió` (inspirado en *Conventional Commits*), en español y en una sola línea.

| Tipo | Uso | Commits del Segundo Parcial |
|---|---|---|
| `feat` | Funcionalidad nueva | 33 |
| `fix` | Corrección de un error o de un hallazgo | 8 |
| `docs` | Documentación y evidencias | 28 |
| `test` | Pruebas automáticas | 7 |
| `refactor` | Reorganización sin cambiar el comportamiento | 3 |
| `chore` | Configuración, dependencias y archivos de apoyo | 8 |

Ejemplos reales:

```
feat: se agregaron las solicitudes de adopción con transacciones (RF-05, RF-06, RF-08, RF-10)
fix: se agregó la redirección desde login y registro cuando ya hay sesión (hallazgo 3)
fix: se corrigió el catálogo para mostrar solo mascotas disponibles o en proceso y separar las adoptadas
test: se agregaron las pruebas de solicitudes, transacciones, rollback y concurrencia (PR-14 a PR-21)
refactor: se eliminó la capa de localStorage y se aplicó la CSP estricta de Helmet
chore: se movieron los documentos v1 del Hito 1 a docs/hito1
```

## 7.5 Historial (`git log --oneline --graph`)

Commits del Hito 1 (antes de esta etapa):

```
46a86f2 feat: se agregó el prototipo navegable del Hito 1 (HTML, CSS y JS con localStorage)
6827327 Update requisitos-v1.md
494e48f Update Alcance-v1.md
10f71a7 Update README.md
9ef29c2 Rename componentes-v1.png to Componentes-v1.png
df9ab4d Rename arquitectura-v1.png to Arquitectura-v1.png
de6e473 Rename alcance-v1.md to Alcance-v1.md
4574c28 Rename justificacion-arquitectura-v1.md to justificacion de arquitectura-v1.md
886a314 Update README.md
3095e03 Add files via upload
1746fff Add files via upload
1ae856d Add files via upload
b99cfa7 Initial commit
```

Segundo Parcial, desde la subida del prototipo (`46a86f2`) hasta el commit `2913291`:

```
*   2913291 Merge pull request #10 from melanie05code/docs/segundo-parcial
|\  
| * db51fb9 docs: se documentó el control de versiones: ramas, Pull Requests, convención e historial
| * 195bc8e docs: se regeneró la salida de npm test con las 28 pruebas
| * ce5534a docs: se reescribió el README con instalación, ejecución, pruebas, usuarios demo y estructura
| * bee1e90 docs: se aclaró que la base de datos se probó con MySQL 8.0 y no con XAMPP/MariaDB
| * d1f8380 docs: se agregaron la portada con índice, las conclusiones y los enlaces y anexos
| * eaaacb5 docs: se agregaron el plan de capacitación por rol y la estrategia de implementación (piloto + incremental)
| * dcb0d36 docs: se agregaron ejemplos de inserción, consulta y actualización en la base de datos
| * 9e36144 docs: se cerraron las filas pendientes de correcciones con sus Pull Requests
| * 1f83ff9 docs: se registró el hallazgo del catálogo con mascotas adoptadas, se actualizaron los criterios de RF-03 y RF-04 y se agregó PR-28
| * f0e1aa5 docs: se regeneraron las capturas con el catálogo sin adoptadas y se agregaron las de PR-28
| * 567910e test: se agregó la prueba de la vista por defecto del catálogo y de las adoptadas (PR-28)
| * 80baeb5 fix: se corrigió el catálogo para mostrar solo mascotas disponibles o en proceso y separar las adoptadas
| * 7b4ddf8 feat: se agregó el filtro de mascotas y tipos por varios estados (estado=Disponible,En proceso)
| * 7f436cc docs: se documentaron la arquitectura actualizada, la seguridad y la matriz de trazabilidad
| * 536ee3b docs: se describieron las funcionalidades implementadas y los dos flujos completos
| * 9b748e8 docs: se enlazaron las capturas de evidencia en la tabla de pruebas
| * a9e4e97 docs: se agregaron las capturas de evidencia de pantallas, pruebas y vista móvil
| * 3090fb5 chore: se agregó el script de capturas de evidencia con Playwright (npm run capturas)
|/  
*   3863f20 Merge pull request #9 from melanie05code/feat/migracion-datos
|\  
| * 161808e docs: se documentaron la migración y su resultado real, y se agregaron PR-24 a PR-27 a la tabla de pruebas
| * f62ec08 test: se agregaron las pruebas de la migración: transformaciones, aceptación, rollback y entorno seguro (PR-24 a PR-27)
| * 9029516 feat: se agregaron el exportador del localStorage del prototipo y el respaldo de ejemplo con casos de prueba
| * f3c2f9a feat: se agregó el script de migración ETL con respaldo, transacción, validación y rollback
| * 518da40 feat: se agregaron las transformaciones de la migración (correo, teléfono, estados y fechas relativas)
|/  
*   bc9ec02 Merge pull request #8 from melanie05code/test/pruebas-api
|\  
| * 6b16800 docs: se agregaron la tabla de pruebas PR-01 a PR-23 y la salida de npm test como evidencia
| * 2427143 test: se agregaron las pruebas de notificaciones (PR-22 y PR-23)
| * 1546f04 test: se agregaron las pruebas de solicitudes, transacciones, rollback y concurrencia (PR-14 a PR-21)
| * a06b77c test: se agregaron las pruebas de catálogo, tipos de mascota y subida de fotos (PR-07 a PR-13)
| * 4498ae3 test: se agregaron las pruebas de registro, inicio de sesión y límite de intentos (PR-01 a PR-06)
| * 5b8763f test: se configuraron Jest y Supertest contra la base de datos patitas_test
|/  
*   f0f077c Merge pull request #7 from melanie05code/feat/fotos-mascotas
|\  
| * 9876855 docs: se documentó el manejo de fotos y se cerraron PB-10 y el hallazgo 4
| * d559a28 feat: se agregaron en el panel la subida, el reemplazo y la eliminación de la foto de una mascota (PB-10, RF-09)
| * 3ca1b84 feat: se mostraron las fotos reales en el catálogo, el detalle y las solicitudes (hallazgo 4)
| * f89ea84 feat: se agregaron las fotos de las mascotas con respaldo al ícono del tipo y el envío de formularios con archivos
| * 6d9c5e5 feat: se asignaron las fotos reales en los datos semilla y se configuró su copia al instalar la base de datos
| * eed391c feat: se agregaron en la API la subida, el reemplazo y la eliminación de la foto de una mascota (PB-10, RF-09)
| * dfe6f85 feat: se agregó el middleware de subida de fotos con validación de tipo, tamaño y firma del archivo
| * a6d9ee0 chore: se agregó multer para la subida de fotos
| * 9fb9734 chore: se agregaron las fotos reales de las 10 mascotas del refugio para los datos semilla (PB-10)
|/  
*   4185328 Merge pull request #6 from melanie05code/feat/notificaciones
|\  
| * 12c4baf docs: se actualizó el estado de RF-07, PB-06 y PB-09 tras las notificaciones
| * cebeece refactor: se eliminó la capa de localStorage y se aplicó la CSP estricta de Helmet
| * 2006432 feat: se conectó la página de notificaciones con la API y se permitió marcarlas como leídas (RF-07)
| * e4b4986 feat: se agregaron el contador de notificaciones sin leer en la barra y las fechas relativas
| * 4466e57 feat: se agregó la API de notificaciones internas con contador de no leídas (RF-07)
|/  
*   21fe179 Merge pull request #5 from melanie05code/feat/solicitudes-transacciones
|\  
| * 5fc3beb docs: se documentaron las transacciones, el manejo de duplicados y el estado de RF-05, RF-06, RF-08 y RF-10
| * 2c2acac fix: se dio el estilo del sitio a los enlaces de regreso con la clase link-line
| * 570a941 feat: se agregaron la aprobación y el rechazo de solicitudes desde el panel con la API (RF-08)
| * 4e901cb feat: se conectaron solicitar, mis solicitudes y seguimiento con la API (RF-05, RF-06, RF-10)
| * b1cb0d8 feat: se agregaron el formato de fechas y el número de solicitud en el frontend
| * 669f332 feat: se agregaron las solicitudes de adopción con transacciones (RF-05, RF-06, RF-08, RF-10)
| * 6a39eb1 feat: se agregaron el cambio de estado de mascota y la creación de notificaciones dentro de transacciones
|/  
*   bf9501c Merge pull request #4 from melanie05code/feat/catalogo-mascotas
|\  
| * c57bb88 docs: se actualizó el estado de RF-03, RF-04, RF-09, RNF-03 y del backlog tras el catálogo
| * 0fcbf83 fix: se evitó que los enlaces de la barra de navegación se partieran en pantallas pequeñas
| * c8ea256 fix: se agregó la meta viewport a todas las páginas para que el diseño responsive funcione en móviles (RNF-03)
| * 808cdda feat: se agregó la gestión de mascotas y tipos de mascota en el panel de administración (RF-09, PB-16)
| * cd094fa feat: se conectaron el inicio, el catálogo y el detalle con la API de mascotas (RF-03, RF-04)
| * 9c859fe feat: se agregaron ayudantes de estado e ícono por tipo y estilos para los formularios del panel
| * 9a6a0bf feat: se agregó la API de mascotas con filtros, detalle y gestión del administrador (RF-03, RF-04, RF-09)
| * 8ad60a9 feat: se agregó la API de tipos de mascota administrables (PB-16)
| * 91b466a feat: se agregó un middleware para validar los identificadores numéricos en las rutas
|/  
*   dd2dd6d Merge pull request #3 from melanie05code/feat/autenticacion
|\  
| * b3cb82e docs: se actualizó el estado de RF-01, RF-02, RNF-02 y del backlog tras la autenticación
| * a8d81d4 refactor: se quitaron los usuarios y contraseñas en texto plano del almacenamiento local (RNF-02)
| * 67aca17 feat: se conectaron el login y el registro con la API de autenticación (RF-01, RF-02)
| * 207df8f feat: se agregaron los módulos comun.js y api.js para la sesión con token y las llamadas a la API
| * 1ca687e feat: se agregaron el registro, el inicio de sesión y el perfil con bcrypt y JWT (RF-01, RF-02, RNF-02)
| * 9068fab feat: se agregaron la generación de JWT y los middlewares requiereAuth y requiereRol (RNF-04)
| * 2d32ec3 feat: se agregaron los validadores y el middleware de validación en el servidor
| * 1b0d47d chore: se agregaron jsonwebtoken y express-rate-limit para la autenticación
| * 16f28ad chore: se quitó el archivo de configuración local del repositorio
|/  
*   a456074 Merge pull request #2 from melanie05code/feat/base-de-datos
|\  
| * 40ec540 docs: se anotó en el archivo de contexto del proyecto la regla de no agregar líneas de atribución
| * 3e40c92 docs: se registró el avance de la fase 2 en el archivo de contexto del proyecto
| * 1ed97c3 docs: se documentaron el modelo de datos y el usuario de mínimo privilegio patitas_app
| * d038a3d feat: se agregó el servidor Express con pool MySQL, manejo central de errores y /api/salud
| * f0ed6b8 feat: se agregó el instalador de base de datos para desarrollo y pruebas
| * 1a66082 feat: se agregaron los datos semilla con mascotas reales y su generador con bcrypt
| * 35be89e feat: se agregó el script de base de datos con tablas, PK, FK, UNIQUE, CHECK e índices
| * 110d4bb chore: se agregaron las dependencias del backend (express 5, mysql2, bcrypt, helmet, dotenv)
|/  
*   d16c2a4 Merge pull request #1 from melanie05code/fix/correcciones-hito1
|\  
| * e995a9c docs: se registró el avance de la fase 1 en el archivo de contexto del proyecto
| * a25540a docs: se agregó la tabla de correcciones con evidencia verificable
| * 3c0c52f docs: se actualizó el backlog y se agregaron los criterios de aceptación RF-01 a RF-10
| * 3a33f24 fix: se escaparon los datos de usuario antes de insertarlos con innerHTML (XSS)
| * c5decd5 fix: se hizo pública la ficha de detalle de la mascota (RF-04)
| * 2766d62 fix: se exigió una contraseña de al menos 8 caracteres en el registro
| * a4194f6 fix: se agregó la redirección desde login y registro cuando ya hay sesión (hallazgo 3)
| * b1398bf docs: se agregó el archivo de contexto del proyecto con el plan por fases
| * 5509db0 chore: se agregaron package.json, .gitignore y .env.example con el usuario patitas_app
| * 8e76180 refactor: se migró el prototipo del Hito 1 a public/ para servirlo con Express
| * 9044d4b chore: se movieron los documentos v1 del Hito 1 a docs/hito1
|/  
* 46a86f2 feat: se agregó el prototipo navegable del Hito 1 (HTML, CSS y JS con localStorage)
```

Para ver el historial actualizado en cualquier momento:

```powershell
git log --oneline --graph --all
```

## 7.6 Corrección del historial

Al cerrar el Segundo Parcial se reescribió el historial de `main` para corregir el correo de autor de los commits hechos desde la terminal, que tenía un identificador de cuenta equivocado y no quedaban vinculados a `melanie05code`, y para unificar los títulos en pasado con «se». El contenido de los archivos no cambió: el árbol de cada commit es idéntico al original. Los commits del Hito 1 hechos desde la web conservan su hash y su firma de GitHub. Los hashes citados en esta documentación corresponden al historial corregido y se actualizaron en el [PR #11](https://github.com/melanie05code/patitas-conectadas/pull/11).
