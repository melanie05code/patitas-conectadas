# 🐾 Patitas Conectadas — Sistema de Gestión de Adopción de Mascotas

Aplicación web que centraliza el proceso de adopción de un refugio de mascotas:
- catálogo público con fotos reales;
- solicitudes de adopción con seguimiento;
- notificaciones al adoptante;
- un panel para que el refugio gestione mascotas, tipos de mascota y solicitudes.

Proyecto Final Integrador de la Universidad UCN (2026), **individual**, de Melanie Abigail Obando Rivera. Esta es la **primera versión implementada (Segundo Parcial)**. Evoluciona el prototipo del Hito 1, que guardaba todo en el `localStorage` del navegador, hacia una aplicación con backend, base de datos y autenticación reales.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20 o superior, Express 5 (API REST en capas `rutas → controlador → servicio → repositorio`) |
| Base de datos | MySQL 8.0 con `mysql2/promise` (pool de conexiones y transacciones) |
| Seguridad | bcrypt, JSON Web Tokens, Helmet (CSP estricta), express-rate-limit, consultas parametrizadas |
| Archivos | multer (fotos JPG, PNG o WEBP de hasta 2 MB) |
| Frontend | HTML + CSS + JavaScript (el prototipo del Hito 1 evolucionado), consumiendo la API con `fetch` |
| Pruebas | Jest + Supertest (31 pruebas, con cobertura) y Playwright para las capturas de evidencia |

## Requisitos previos

- **Node.js 20 o superior** (probado con Node 24) y npm.
- **MySQL 8.0** en ejecución. Todo se probó con MySQL 8.0; XAMPP/MariaDB 10.4+ debería funcionar, pero no se probó.
- **Git**.
- Para generar las capturas (`npm run capturas`): Microsoft Edge (viene con Windows) o Google Chrome.

## Instalación paso a paso (Windows / PowerShell)

1. **Clonar el repositorio e instalar dependencias**
   ```powershell
   git clone https://github.com/melanie05code/patitas-conectadas.git
   cd patitas-conectadas
   npm install
   ```

2. **Crear el usuario de base de datos de mínimo privilegio**: una sola vez, con un usuario administrador de MySQL. Cambia la contraseña por una propia.
   ```sql
   CREATE USER 'patitas_app'@'localhost' IDENTIFIED BY 'una-contraseña-segura';
   GRANT ALL PRIVILEGES ON patitas_conectadas.* TO 'patitas_app'@'localhost';
   GRANT ALL PRIVILEGES ON patitas_test.*       TO 'patitas_app'@'localhost';
   GRANT PROCESS ON *.* TO 'patitas_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Crear el archivo `.env`** a partir del ejemplo y completarlo:
   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```
   Completa `DB_PASSWORD` con la contraseña de `patitas_app`, `JWT_SECRET` con un texto largo y aleatorio, y `SEED_ADMIN_PASSWORD` / `SEED_ADOPTANTE_PASSWORD` con las contraseñas que tendrán los usuarios demo (los valores `EJEMPLO_...` del ejemplo deben cambiarse). Para generar un valor aleatorio:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. **Crear las tablas y cargar los datos semilla** (`database/01_schema.sql` y `database/02_seed.sql`):
   ```powershell
   npm run db:instalar        # base patitas_conectadas + fotos de las mascotas
   npm run db:instalar:test   # base de pruebas patitas_test
   ```
   El comando ejecuta los dos scripts con las credenciales del `.env`, calcula en ese momento el hash bcrypt de las contraseñas demo a partir de `SEED_ADMIN_PASSWORD` y `SEED_ADOPTANTE_PASSWORD` y copia las fotos de `database/seed-fotos/` a `uploads/mascotas/`. **Ojo:** recrea las tablas, así que borra los datos y las fotos que se hayan cargado antes.

   El repositorio no guarda contraseñas ni hashes: `02_seed.sql` solo tiene marcadores (`@@SEED_ADMIN_PASSWORD@@`), por eso el seed debe cargarse con `npm run db:instalar` y no ejecutando el archivo a mano.

## Cómo ejecutar

```powershell
npm run dev     # con recarga automática (nodemon)
npm start       # sin recarga
```

Abre http://localhost:3000. Para comprobar la conexión con la base de datos: http://localhost:3000/api/salud.

## Usuarios demo

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador del refugio | `admin@patitas.com` | la de `SEED_ADMIN_PASSWORD` en tu `.env` |
| Adoptante (con 4 solicitudes de ejemplo) | `edwin.obando@correo.com` | la de `SEED_ADOPTANTE_PASSWORD` en tu `.env` |

Las contraseñas se guardan con hash bcrypt. Son cuentas de demostración: **no deben existir en producción**. Las pruebas automáticas generan contraseñas aleatorias en cada ejecución si esas variables no están definidas.

## Pruebas

```powershell
npm test
```

Ejecuta las 31 pruebas (Jest + Supertest) con reporte de cobertura en `coverage/` contra la base **`patitas_test`**, que se reinstala antes de cada prueba. Nunca tocan `patitas_conectadas`. Resultado y detalle en [`docs/06_pruebas.md`](docs/06_pruebas.md).

## Calidad y seguridad

[![Calidad y seguridad](https://github.com/melanie05code/patitas-conectadas/actions/workflows/ci.yml/badge.svg)](https://github.com/melanie05code/patitas-conectadas/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=bugs)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Vulnerabilidades](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Cobertura](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=coverage)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)

El pipeline de GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) corre en cada push a `dev` y en cada Pull Request hacia `main`, en este orden:

1. **Tests**: `npm test` con cobertura sobre MySQL 8.0, con credenciales generadas en el propio job.
2. **SonarCloud**: análisis estático y cobertura (`sonar-project.properties`).
3. **DeepSource**: envío de la cobertura (`.deepsource.toml`); el análisis de código lo hace la GitHub App de DeepSource sobre el PR.
4. **Snyk**: `snyk test` (dependencias) y `snyk code test` (código) con umbral de severidad alta, y los resultados SARIF como artifact.

El análisis completo, las correcciones y la comparación antes/después están en [`docs/13_calidad_seguridad.md`](docs/13_calidad_seguridad.md).

## Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run db:seed` | Regenera `database/02_seed.sql` (hashes bcrypt incluidos) a partir de `database/datos-semilla.js` |
| `npm run capturas` | Genera las capturas de evidencia en `docs/evidencias/`, usando `patitas_test` y Edge (o Chrome con `CAPTURAS_NAVEGADOR=chrome`) |
| `npm run migrar` | Migra datos del `localStorage` del prototipo. Por defecto usa el respaldo de ejemplo contra `patitas_test`; opciones `--archivo`, `--simular`, `--max-descartes`, `--bd patitas_conectadas --confirmar-produccion`. Ver [`docs/08_migracion.md`](docs/08_migracion.md) |

## Estructura de carpetas

```
patitas-conectadas/
├─ src/
│  ├─ app.js               Express: seguridad, rutas, estáticos y errores
│  ├─ server.js            Arranque del servidor
│  ├─ config/              Variables de entorno, pool de MySQL y transacciones
│  ├─ middlewares/         Autenticación, roles, validación, subida de fotos, errores
│  ├─ modules/             usuarios, tipos, mascotas, solicitudes, notificaciones
│  │                       (rutas, controlador, servicio, repositorio y validaciones)
│  └─ utils/               ErrorApp, validadores, JWT, archivos
├─ public/                 Páginas HTML, css/ y js/ (comun.js, api.js, paginas/)
├─ database/
│  ├─ 01_schema.sql        CREATE DATABASE/TABLE, PK, FK, UNIQUE, NOT NULL, CHECK, índices
│  ├─ 02_seed.sql          Datos semilla (generado)
│  ├─ datos-semilla.js     Fuente de los datos semilla
│  ├─ seed-fotos/          Fotos reales de las 10 mascotas
│  ├─ instalar.js          Instalador de la base de datos (npm run db:instalar)
│  └─ migracion/           Exportador del localStorage y ETL (migrar.js)
├─ tests/                  Pruebas automáticas (PR-01 a PR-31)
├─ scripts/capturas.js     Capturas de evidencia con Playwright
├─ docs/                   Documentación del Segundo Parcial (00 a 12), evidencias y docs/hito1/
├─ .env.example            Plantilla de variables de entorno (el .env real no se sube)
└─ package.json
```

## Requisitos → API → pantallas

| RF | Descripción | Endpoint principal | Pantalla |
|---|---|---|---|
| RF-01 | Registro de adoptantes | `POST /api/auth/registro` | `registro.html` |
| RF-02 | Inicio de sesión | `POST /api/auth/login` | `login.html` |
| RF-03 | Catálogo de mascotas | `GET /api/mascotas?estado=Disponible,En proceso`, `GET /api/tipos-mascota` | `catalogo-publico.html`, `catalogo.html` |
| RF-04 | Ficha de detalle | `GET /api/mascotas/:id` | `detalle.html` |
| RF-05 | Seguimiento de solicitud | `GET /api/solicitudes/:id` | `seguimiento.html` |
| RF-06 | Enviar solicitud | `POST /api/solicitudes` | `solicitar.html` |
| RF-07 | Notificaciones | `GET /api/notificaciones`, `PATCH /api/notificaciones/:id/leida` | `notificaciones.html` |
| RF-08 | Responder solicitudes (admin) | `GET`/`PATCH /api/admin/solicitudes` | `admin.html` |
| RF-09 | Gestionar catálogo y tipos (admin) | `POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota` | `admin.html` |
| RF-10 | Historial propio | `GET /api/solicitudes/mias` | `mis-solicitudes.html` |

La matriz completa, con módulos, tablas y pruebas, está en [`docs/04_arquitectura.md`](docs/04_arquitectura.md).

## Documentación

Empieza por la portada: [`docs/00_portada.md`](docs/00_portada.md). Tiene el índice de las 13 secciones, desde las correcciones hasta el análisis de calidad y seguridad del código ([`docs/13_calidad_seguridad.md`](docs/13_calidad_seguridad.md)). Los documentos originales del Hito 1 están en [`docs/hito1/`](docs/hito1/).
