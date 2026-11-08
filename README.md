# 🐾 Patitas Conectadas — Sistema de Gestión de Adopción de Mascotas

Aplicación web que centraliza el proceso de adopción de un refugio de mascotas:
- catálogo público con fotos reales;
- perfil del adoptante y solicitudes de adopción;
- entrevista presencial agendada en un calendario con horarios disponibles;
- decisión del refugio después de la entrevista;
- seguimiento post-adopción con fotos cada 3 meses y recordatorios;
- notificaciones internas y un panel para que el refugio gestione todo el proceso.

Proyecto Final Integrador de la Universidad UCN (2026), **individual**, de Melanie Abigail Obando Rivera. Versión **`v1.0.0`**, entrega final del III Parcial (Implementación y Validación de Software). Evoluciona el prototipo del Hito 1 (localStorage) y la primera versión con backend del II Parcial.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20 o superior, Express 5 (API REST en capas `rutas → controlador → servicio → repositorio`) |
| Base de datos | MySQL 8.0 con `mysql2/promise` (pool de conexiones, transacciones y migraciones numeradas) |
| Seguridad | bcrypt, JSON Web Tokens, Helmet (CSP estricta), express-rate-limit, consultas parametrizadas |
| Archivos | multer (fotos JPG, PNG o WEBP de hasta 2 MB, con verificación de firma) |
| Frontend | HTML + CSS + JavaScript sin librerías (calendario propio, iconos SVG), consumiendo la API con `fetch` |
| Pruebas | Jest + Supertest (50 casos, con cobertura) y Playwright (16 casos E2E) |
| Calidad | GitHub Actions con SonarCloud, DeepSource y Snyk |

## Requisitos previos

- **Node.js 20 o superior** (probado con Node 24.20) y npm.
- **MySQL 8.0** en ejecución (probado con 8.0.46). XAMPP/MariaDB 10.4+ debería funcionar, pero **no se probó**.
- **Git**.
- Para las pruebas E2E y las capturas: Microsoft Edge (viene con Windows) o Google Chrome.

## Instalación paso a paso (Windows / PowerShell)

> Verificado desde un clon limpio el 2026-11-07: [`docs/evidencias/final/instalacion_desde_cero.txt`](docs/evidencias/final/instalacion_desde_cero.txt).

1. **Clonar el repositorio e instalar las dependencias exactas del `package-lock.json`**
   ```powershell
   git clone https://github.com/melanie05code/patitas-conectadas.git
   cd patitas-conectadas
   npm ci
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

   | Variable | Qué poner |
   |---|---|
   | `DB_PASSWORD` | La contraseña de `patitas_app` |
   | `JWT_SECRET` | Un texto largo y aleatorio (ver el comando de abajo) |
   | `SEED_ADMIN_PASSWORD`, `SEED_ADOPTANTE_PASSWORD`, `SEED_ADOPTANTE2_PASSWORD` | Las contraseñas de los 3 usuarios demo. **Hay que cambiar los valores `EJEMPLO_...`**: el instalador se niega a usarlos |
   | `SEGUIMIENTO_INTERVALO_DIAS`, `SEGUIMIENTO_CANTIDAD` | Controles post-adopción: cada cuántos días y cuántos (por defecto 90 y 4) |
   | `DB_NAME`, `DB_NAME_TEST`, `PORT`, `JWT_EXPIRA`, `MYSQLDUMP_PATH` | Se pueden dejar como están |

   Para generar un valor aleatorio:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. **Crear la base de datos** (esquema, migraciones, datos semilla y fotos):
   ```powershell
   npm run db:instalar        # base patitas_conectadas
   npm run db:instalar:test   # base de pruebas patitas_test
   ```
   El instalador:
   - aplica `database/01_schema.sql` y las migraciones de `database/migraciones/` (001 a 004);
   - carga `02_seed.sql`, calculando en ese momento el hash bcrypt de las contraseñas `SEED_*`;
   - copia las fotos de `database/seed-fotos/` a `uploads/mascotas/`.

   **Ojo:** recrea todas las tablas, así que borra los datos y las fotos que hubiera.

   El seed usa **fechas relativas** al día de la instalación: por ejemplo, la entrevista de demostración siempre queda 3 días después.

   **¿Ya tienes una base del II Parcial con datos?** No la reinstales: respáldala ([`docs/18_respaldo_recuperacion.md`](docs/18_respaldo_recuperacion.md)) y aplica solo las migraciones pendientes:
   ```powershell
   npm run db:migrar
   ```

## Cómo ejecutar

```powershell
npm start       # sin recarga
npm run dev     # con recarga automática (nodemon)
```

Abre http://localhost:3000. Para comprobar la conexión con la base de datos: http://localhost:3000/api/salud.

## Usuarios demo

Datos **ficticios**. Las contraseñas son las que definiste en tu `.env`; no están en el repositorio.

| Rol | Correo | Contraseña | Qué tiene para probar |
|---|---|---|---|
| Administrador del refugio | `admin@patitas.com` | `SEED_ADMIN_PASSWORD` | Solicitudes en curso, agenda, calendario, revisión de controles y configuración |
| Adoptante | `edwin.obando@correo.com` (Edwin Obando) | `SEED_ADOPTANTE_PASSWORD` | Entrevista de Mechudo en 3 días a las 10:30 a. m.; Encantador y Lara adoptados (el control 2 de Lara está vencido: sube su foto); Princesa Sucia rechazada después de la entrevista |
| Adoptante | `ana.martinez@correo.com` (Ana Martínez) | `SEED_ADOPTANTE2_PASSWORD` | Solicitud de Vaquita en *Solicitada*: el admin puede agendarle la entrevista |

Son cuentas de demostración: **no deben existir en producción**.

## Pruebas

```powershell
npm test            # 50 casos Jest + Supertest con cobertura, contra patitas_test
npm run test:e2e    # 16 casos E2E con Playwright y Edge; capturas en docs/evidencias/final/e2e/
```

Ninguna de las dos toca `patitas_conectadas`. Resultado del 2026-11-07: **50/50 y 16/16**, con 93,5 % de líneas cubiertas. Detalle en [`docs/14_suite_vv_final.md`](docs/14_suite_vv_final.md).

## Calidad y seguridad

[![Calidad y seguridad](https://github.com/melanie05code/patitas-conectadas/actions/workflows/ci.yml/badge.svg)](https://github.com/melanie05code/patitas-conectadas/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=bugs)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Vulnerabilidades](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Cobertura](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=coverage)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=melanie05code_patitas-conectadas&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas)

El pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) corre en cada push a `dev` y `main` y en cada Pull Request hacia `main`: **Tests** (MySQL 8.0, credenciales generadas en el job) → **SonarCloud** → **DeepSource** → **Snyk** (umbral de severidad alta). Análisis y correcciones en [`docs/13_calidad_seguridad.md`](docs/13_calidad_seguridad.md); informe final en [`docs/21_informe_final_calidad.md`](docs/21_informe_final_calidad.md).

## Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run db:migrar` / `db:migrar:test` | Aplica las migraciones pendientes sin borrar datos |
| `npm run db:seed` | Regenera `database/02_seed.sql` desde `database/datos-semilla.js` |
| `npm run recordatorios` | Genera, sin duplicar, los recordatorios de los controles post-adopción vencidos (también se generan al iniciar sesión y al consultar las notificaciones) |
| `npm run capturas` / `capturas:manual` | Capturas de evidencia y del manual con Playwright, sobre `patitas_test` |
| `npm run medir:tiempos` | Mide los tiempos de respuesta (RNF-01) |
| `npm run migrar` | Migra los datos del `localStorage` del prototipo (ver [`docs/08_migracion.md`](docs/08_migracion.md)) |

## Estructura de carpetas

```
patitas-conectadas/
├─ src/
│  ├─ app.js, server.js
│  ├─ config/              Variables de entorno, pool de MySQL y transacciones
│  ├─ middlewares/         Autenticación, roles, validación, subida de fotos, errores
│  ├─ modules/             usuarios, perfiles, tipos, mascotas, solicitudes, entrevistas,
│  │                       configuracion, seguimientos, notificaciones
│  └─ utils/               ErrorApp, validadores, fechas, JWT, archivos
├─ public/                 Páginas HTML, css/ y js/ (comun.js, api.js, calendario.js, paginas/)
├─ database/
│  ├─ 01_schema.sql        Esquema base (II Parcial)
│  ├─ migraciones/         001 a 004 (III Parcial)
│  ├─ 02_seed.sql          Datos semilla (generado; sin contraseñas)
│  ├─ datos-semilla.js     Fuente de los datos semilla
│  ├─ instalar.js, migrar-esquema.js, generar-seed.js
│  ├─ seed-fotos/          Fotos reales de las mascotas
│  └─ migracion/           Exportador del localStorage y ETL
├─ tests/                  Jest (PR-01 a PR-50) y e2e/ (E2E-01 a E2E-16)
├─ scripts/                Capturas, medición de tiempos y recordatorios
├─ docs/                   Documentación 00 a 23, evidencias/ y docs/hito1/
├─ CHANGELOG.md
└─ .env.example
```

## Requisitos → API → pantallas

| RF | Descripción | Endpoint principal | Pantalla |
|---|---|---|---|
| RF-01 | Registro de adoptantes | `POST /api/auth/registro` | `registro.html` |
| RF-02 | Inicio de sesión | `POST /api/auth/login` | `login.html` |
| RF-03 | Catálogo | `GET /api/mascotas`, `GET /api/tipos-mascota` | `catalogo-publico.html`, `catalogo.html` |
| RF-04 | Ficha de detalle | `GET /api/mascotas/:id` | `detalle.html` |
| RF-05 | Seguimiento (5 etapas) | `GET /api/solicitudes/:id` | `seguimiento.html` |
| RF-06 | Enviar solicitud | `POST /api/solicitudes` | `solicitar.html` |
| RF-07 | Notificaciones | `GET /api/notificaciones`, `PATCH /api/notificaciones/:id/leida` | `notificaciones.html` |
| RF-08 | Decidir solicitudes (admin) | `GET /api/admin/solicitudes[/:id]`, `PATCH /api/admin/solicitudes/:id/estado` | `admin.html`, `admin-solicitud.html` |
| RF-09 | Gestionar catálogo y tipos (admin) | `POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota` | `admin.html` |
| RF-10 | Historial propio | `GET /api/solicitudes/mias` | `mis-solicitudes.html` |
| RF-11 | Perfil del adoptante | `GET`/`PUT /api/perfil-adoptante` | `perfil.html` |
| RF-12 | Entrevistas (admin) | `PATCH /api/admin/solicitudes/:id/entrevista` y `/entrevistada`, `GET /api/admin/entrevistas[/disponibilidad]`, `GET`/`PUT /api/admin/configuracion-refugio` | `admin-solicitud.html`, `admin.html` |
| RF-13 | Seguimiento post-adopción | `GET /api/solicitudes/:id/seguimientos`, `POST /api/seguimientos/:id/foto` | `seguimiento.html` |
| RF-14 | Revisión de controles (admin) | `GET`/`PATCH /api/admin/seguimientos` | `admin.html` |
| RF-15 | Recordatorios | al iniciar sesión y en `GET /api/notificaciones`; `npm run recordatorios` | `notificaciones.html` |

Matriz completa en [`docs/19_matriz_trazabilidad_final.md`](docs/19_matriz_trazabilidad_final.md).

## Documentación

Empieza por la portada: [`docs/00_portada.md`](docs/00_portada.md). Para usar el sistema: [manual de usuario](docs/17_manual_usuario.md). Cambios por versión: [`CHANGELOG.md`](CHANGELOG.md).
