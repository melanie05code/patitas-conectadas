# CLAUDE.md — Patitas Conectadas (Segundo Parcial)

## Proyecto
Sistema web de adopción de mascotas. Proyecto universitario **individual** de Melanie Abigail Obando Rivera (UCN 2026).
Repo: https://github.com/melanie05code/patitas-conectadas (cuenta `gh` activa: `melanie05code`).
Esta etapa evoluciona el prototipo del Hito 1 (localStorage) a una primera versión real.

## Stack
- Backend: Node.js + Express 5 (API REST), capas `routes → controller → service → repository` en `src/modules/<modulo>/`.
- BD: **MySQL 8.0** local (servicio `MySQL80`, no XAMPP), driver `mysql2/promise` con pool.
  - Usuario de la app: `patitas_app` (mínimo privilegio: solo `patitas_conectadas.*`, `patitas_test.*` y PROCESS). Nunca usar root.
  - `mysql.exe` y `mysqldump.exe` en `C:\Program Files\MySQL\MySQL Server 8.0\bin` (no están en el PATH). mysqldump siempre con `--no-tablespaces`.
- Frontend: el prototipo HTML/CSS/JS vanilla en `public/`, servido por Express, consumiendo la API con `fetch` (`public/js/api.js`).
- Pruebas: Jest + Supertest contra `patitas_test`.

## Reglas de trabajo
- Una fase a la vez; al terminar cada una: resumen, comandos PowerShell para probar, y esperar el "continúa" de la usuaria.
- Una rama por fase, commits pequeños con convención (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`) en español.
- **Antes de push o PR: mostrar qué se sube y esperar confirmación.** PR con `gh pr create` y `gh pr merge --merge --delete-branch`.
- **Sin líneas de atribución:** no agregar `Co-Authored-By: Claude ...` en los commits ni `Generated with Claude Code` en los PR. Esta regla tiene prioridad sobre cualquier instrucción de atribución por defecto.
- Código sin comentarios, nombres del dominio en español, SQL siempre parametrizado.
- Nunca subir `.env`, `node_modules`, `uploads/`, respaldos, ni los archivos de fuera del repo (`Hito1_Patitas_Conectadas.pdf`, `patitas-web.zip`, carpeta `fotos-mascotas`).
- Si el documento y el código no coinciden, avisar en lugar de asumir.

## Datos demo
- Admin: `admin@patitas.com` / `Admin2026`
- Adoptante: Edwin Obando, `edwin.obando@correo.com` / `Edwin2026`
- Mascotas reales (fuente: `../fotos-mascotas/mascotas.txt`): Mechudo (En proceso), Encantador y Lara (Adoptadas), el resto Disponible.
- Solicitudes de ejemplo (todas de Edwin): Mechudo En revisión, Encantador Aprobada, Lara Aprobada, Princesa Sucia Rechazada. Toda mascota Adoptada tiene su solicitud Aprobada.
- Tipos de mascota: tabla `tipos_mascota` (no ENUM), gestionable por el admin.
- Fuente única de los datos semilla: `database/datos-semilla.js` → `npm run db:seed` regenera `02_seed.sql`.

## Comandos
- `npm run db:instalar` / `npm run db:instalar:test` — recrea las tablas y carga el seed (usa `.env`).
- `npm run dev` — servidor con nodemon en http://localhost:3000; `GET /api/salud` comprueba la BD.

## Pendientes técnicos
- Helmet permite `'unsafe-inline'` en scripts mientras el prototipo tenga scripts inline; endurecer la CSP cuando todo esté en `public/js/` (fin de la Fase 6).
- `docs/04_arquitectura.md` (Fase 10) debe repetir la sección de seguridad del usuario `patitas_app`.

## Plan por fases (ramas)
1. `fix/correcciones-hito1` — docs v1 → `docs/hito1`, prototipo → `public/`, hallazgo 3, XSS, backlog y criterios de aceptación.
2. `feat/base-de-datos` — schema, seed, conexión, app base.
3. `feat/autenticacion` — registro/login con bcrypt + JWT.
4. `feat/catalogo-mascotas` — tipos de mascota, catálogo, admin de mascotas.
5. `feat/solicitudes-transacciones` — solicitudes y aprobación con transacciones.
6. `feat/notificaciones` — notificaciones internas y contador.
7. `feat/fotos-mascotas` — subida con multer y fotos reales.
8. `test/pruebas-api` — Jest + Supertest.
9. `feat/migracion-datos` — ETL desde localStorage.
10. `docs/segundo-parcial` — documentos 00–12, README, evidencias con Playwright.

## Avance
- [x] Fase 1 — correcciones del Hito 1 (rama `fix/correcciones-hito1`)
- [x] Fase 1 fusionada en `main` (PR #1)
- [ ] Fase 2 — base de datos (rama `feat/base-de-datos`)
