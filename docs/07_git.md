# 7. Control de versiones (Git y GitHub)

## 7.1 Repositorio

- **URL:** https://github.com/melanie05code/patitas-conectadas
- **Rama principal:** `main` (solo recibe cambios mediante Pull Requests en esta etapa)
- **Proyecto individual:** todas las contribuciones son de una sola integrante, **Melanie Abigail Obando Rivera** (cuenta `melanie05code`). En el historial aparecen dos identidades de autor de la misma cuenta: los commits hechos desde la web de GitHub en el Hito 1 y los hechos desde la terminal en el Segundo Parcial.
- **Historial completo:** 108 commits a la fecha de este documento (commit `6e72a1d`), de los cuales 86 son del Segundo Parcial (sin contar los merges).

## 7.2 Flujo de trabajo

1. Una **rama por funcionalidad**, creada desde `main` actualizada.
2. **Commits pequeños** con la convención descrita abajo, mensajes en español que describen el cambio real.
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
| [#10](https://github.com/melanie05code/patitas-conectadas/pull/10) | `docs/segundo-parcial` | docs: documentación del Segundo Parcial, README y evidencias | Documentos 00 a 12, README, capturas con Playwright, catálogo sin adoptadas (hallazgo 16, PR-28) | 17+ | (este PR) |

## 7.4 Convención de commits

Formato `tipo: descripción en español` (inspirado en *Conventional Commits*).

| Tipo | Uso | Commits del Segundo Parcial |
|---|---|---|
| `feat` | Funcionalidad nueva | 33 |
| `fix` | Corrección de un error o de un hallazgo | 8 |
| `docs` | Documentación y evidencias | 27 |
| `test` | Pruebas automáticas | 7 |
| `refactor` | Reorganización sin cambiar el comportamiento | 3 |
| `chore` | Configuración, dependencias y archivos de apoyo | 8 |

Ejemplos reales:

```
feat: agregar solicitudes de adopción con transacciones (RF-05, RF-06, RF-08, RF-10)
fix: redirigir desde login y registro cuando ya hay sesión (hallazgo 3)
fix: mostrar en el catálogo solo mascotas disponibles o en proceso y separar las adoptadas
test: agregar pruebas de solicitudes, transacciones, rollback y concurrencia (PR-14 a PR-21)
refactor: eliminar la capa de localStorage y aplicar la CSP estricta de Helmet
chore: mover documentos v1 del Hito 1 a docs/hito1
```

## 7.5 Historial (`git log --oneline --graph`)

Commits del Hito 1 (antes de esta etapa):

```
5c340fd feat: agregar prototipo navegable del Hito 1 (HTML, CSS y JS con localStorage)
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

Segundo Parcial, desde la subida del prototipo (`5c340fd`) hasta el commit `6e72a1d`:

```
* 6e72a1d docs: regenerar la salida de npm test con las 28 pruebas
* c7c8312 docs: reescribir el README con instalación, ejecución, pruebas, usuarios demo y estructura
* ad717c8 docs: aclarar que la base de datos se probó con MySQL 8.0 y no con XAMPP/MariaDB
* 867d830 docs: agregar portada con índice, conclusiones y enlaces y anexos
* 7241916 docs: agregar plan de capacitación por rol y estrategia de implementación (piloto + incremental)
* 7e9dde7 docs: agregar ejemplos de inserción, consulta y actualización en la base de datos
* 9cf6c75 docs: cerrar las filas pendientes de correcciones con sus Pull Requests
* a34d42a docs: registrar el hallazgo del catálogo con mascotas adoptadas, actualizar criterios de RF-03 y RF-04 y agregar PR-28
* 8eece04 docs: regenerar las capturas con el catálogo sin adoptadas y agregar las de PR-28
* 2fb6ac5 test: agregar prueba de la vista por defecto del catálogo y de las adoptadas (PR-28)
* b495c58 fix: mostrar en el catálogo solo mascotas disponibles o en proceso y separar las adoptadas
* 0654b07 feat: filtrar mascotas y tipos por varios estados (estado=Disponible,En proceso)
* 17a6db0 docs: documentar la arquitectura actualizada, la seguridad y la matriz de trazabilidad
* 60f7940 docs: describir las funcionalidades implementadas y los dos flujos completos
* 8d00aae docs: enlazar las capturas de evidencia en la tabla de pruebas
* 8bed8d1 docs: agregar capturas de evidencia de pantallas, pruebas y vista móvil
* 9fef3a2 chore: agregar script de capturas de evidencia con Playwright (npm run capturas)
*   56c9192 Merge pull request #9 from melanie05code/feat/migracion-datos
|\  
| * 3329f16 docs: documentar la migración y su resultado real, y agregar PR-24 a PR-27 a la tabla de pruebas
| * 2fc9873 test: agregar pruebas de la migración: transformaciones, aceptación, rollback y entorno seguro (PR-24 a PR-27)
| * af4a431 feat: agregar exportador del localStorage del prototipo y respaldo de ejemplo con casos de prueba
| * d1da986 feat: agregar script de migración ETL con respaldo, transacción, validación y rollback
| * a79f9ef feat: agregar transformaciones de la migración (correo, teléfono, estados y fechas relativas)
|/  
*   e9b3e15 Merge pull request #8 from melanie05code/test/pruebas-api
|\  
| * c9b2731 docs: agregar tabla de pruebas PR-01 a PR-23 y la salida de npm test como evidencia
| * ec06786 test: agregar pruebas de notificaciones (PR-22 y PR-23)
| * 34cf6d5 test: agregar pruebas de solicitudes, transacciones, rollback y concurrencia (PR-14 a PR-21)
| * a6d9ed1 test: agregar pruebas de catálogo, tipos de mascota y subida de fotos (PR-07 a PR-13)
| * aedb0d2 test: agregar pruebas de registro, inicio de sesión y límite de intentos (PR-01 a PR-06)
| * bd11936 test: configurar Jest y Supertest contra la base de datos patitas_test
|/  
*   92b4b4e Merge pull request #7 from melanie05code/feat/fotos-mascotas
|\  
| * f2ed7f2 docs: documentar el manejo de fotos y cerrar PB-10 y el hallazgo 4
| * 499a11b feat: subir, reemplazar o quitar la foto de una mascota desde el panel (PB-10, RF-09)
| * f9489e8 feat: mostrar las fotos reales en catálogo, detalle y solicitudes (hallazgo 4)
| * 07543c8 feat: mostrar fotos de mascotas con respaldo al ícono del tipo y enviar formularios con archivos
| * a831d9f feat: asignar las fotos reales en los datos semilla y copiarlas al instalar la base de datos
| * 8a18412 feat: subir, reemplazar o quitar la foto de una mascota desde la API (PB-10, RF-09)
| * 9ccecba feat: agregar middleware de subida de fotos con validación de tipo, tamaño y firma del archivo
| * 935ce08 chore: agregar multer para la subida de fotos
| * 1430967 chore: agregar las fotos reales de las 10 mascotas del refugio para los datos semilla (PB-10)
|/  
*   cac563d Merge pull request #6 from melanie05code/feat/notificaciones
|\  
| * a1b2d13 docs: actualizar estado de RF-07, PB-06 y PB-09 tras las notificaciones
| * fa873c5 refactor: eliminar la capa de localStorage y aplicar la CSP estricta de Helmet
| * 4da8b5f feat: conectar la página de notificaciones con la API y permitir marcarlas como leídas (RF-07)
| * f9f4fa5 feat: mostrar contador de notificaciones sin leer en la barra y fechas relativas
| * f778c41 feat: agregar API de notificaciones internas con contador de no leídas (RF-07)
|/  
*   eab5f5b Merge pull request #5 from melanie05code/feat/solicitudes-transacciones
|\  
| * 67cbdfd docs: documentar transacciones, manejo de duplicados y estado de RF-05, RF-06, RF-08 y RF-10
| * df25896 fix: dar el estilo del sitio a los enlaces de regreso con clase link-line
| * 512dcdc feat: aprobar y rechazar solicitudes desde el panel usando la API (RF-08)
| * 2a20e95 feat: conectar solicitar, mis solicitudes y seguimiento con la API (RF-05, RF-06, RF-10)
| * bba7394 feat: agregar formato de fechas y número de solicitud en el frontend
| * 9c80e16 feat: agregar solicitudes de adopción con transacciones (RF-05, RF-06, RF-08, RF-10)
| * f3fb4ce feat: agregar cambio de estado de mascota y creación de notificaciones dentro de transacciones
|/  
*   83d5c70 Merge pull request #4 from melanie05code/feat/catalogo-mascotas
|\  
| * 706cf4d docs: actualizar estado de RF-03, RF-04, RF-09, RNF-03 y backlog tras el catálogo
| * 0fbc9e8 fix: evitar que los enlaces de la barra de navegación se partan en pantallas pequeñas
| * e31575b fix: agregar meta viewport a todas las páginas para que el diseño responsive funcione en móviles (RNF-03)
| * 8aacf4e feat: gestionar mascotas y tipos de mascota desde el panel de administración (RF-09, PB-16)
| * 5a39696 feat: conectar inicio, catálogo y detalle con la API de mascotas (RF-03, RF-04)
| * b346970 feat: agregar ayudantes de estado e ícono por tipo y estilos para formularios del panel
| * 8ff2a54 feat: agregar API de mascotas con filtros, detalle y gestión del administrador (RF-03, RF-04, RF-09)
| * 43c3e64 feat: agregar API de tipos de mascota administrables (PB-16)
| * a218857 feat: agregar middleware para validar identificadores numéricos en las rutas
|/  
*   4d4157e Merge pull request #3 from melanie05code/feat/autenticacion
|\  
| * 6a73346 docs: actualizar estado de RF-01, RF-02, RNF-02 y backlog tras la autenticación
| * 67cb4b4 refactor: quitar usuarios y contraseñas en texto plano del almacenamiento local (RNF-02)
| * d07b3ec feat: conectar login y registro con la API de autenticación (RF-01, RF-02)
| * 76c5979 feat: agregar módulos comun.js y api.js para sesión con token y llamadas a la API
| * bf2df74 feat: agregar registro, inicio de sesión y perfil con bcrypt y JWT (RF-01, RF-02, RNF-02)
| * aae5f14 feat: agregar generación de JWT y middlewares requiereAuth y requiereRol (RNF-04)
| * 16cb164 feat: agregar validadores y middleware de validación en el servidor
| * d0d8ca5 chore: agregar jsonwebtoken y express-rate-limit para la autenticación
| * aa4c74e chore: quitar archivo de configuración local del repositorio
|/  
*   7debc7c Merge pull request #2 from melanie05code/feat/base-de-datos
|\  
| * 04099bb docs: anotar en CLAUDE.md la regla de no agregar líneas de atribución
| * 2fb0a96 docs: registrar avance de la fase 2 en CLAUDE.md
| * 6b81904 docs: documentar modelo de datos y usuario de mínimo privilegio patitas_app
| * 5352bf1 feat: agregar servidor Express con pool MySQL, manejo central de errores y /api/salud
| * e8be366 feat: agregar instalador de base de datos para desarrollo y pruebas
| * 3d22f14 feat: agregar datos semilla con mascotas reales y generador con bcrypt
| * f2a2f02 feat: agregar script de base de datos con tablas, PK, FK, UNIQUE, CHECK e índices
| * 8513abc chore: agregar dependencias del backend (express 5, mysql2, bcrypt, helmet, dotenv)
|/  
*   e8abef7 Merge pull request #1 from melanie05code/fix/correcciones-hito1
|\  
| * 82622fe docs: registrar avance de la fase 1 en CLAUDE.md
| * 40312c3 docs: agregar tabla de correcciones con evidencia verificable
| * 45cd9ed docs: actualizar backlog y agregar criterios de aceptación RF-01 a RF-10
| * b283da1 fix: escapar datos de usuario antes de insertarlos con innerHTML (XSS)
| * c0dde85 fix: hacer pública la ficha de detalle de la mascota (RF-04)
| * baabeff fix: exigir contraseña de al menos 8 caracteres en el registro
| * 3af2de7 fix: redirigir desde login y registro cuando ya hay sesión (hallazgo 3)
| * fb61fd6 docs: agregar CLAUDE.md con contexto del proyecto y plan por fases
| * fada4a1 chore: agregar package.json, .gitignore y .env.example con usuario patitas_app
| * 922b293 refactor: migrar prototipo del Hito 1 a public/ para servirlo con Express
| * edb3c5b chore: mover documentos v1 del Hito 1 a docs/hito1
|/  
* 5c340fd feat: agregar prototipo navegable del Hito 1 (HTML, CSS y JS con localStorage)
```

Para ver el historial actualizado en cualquier momento:

```powershell
git log --oneline --graph --all
```
