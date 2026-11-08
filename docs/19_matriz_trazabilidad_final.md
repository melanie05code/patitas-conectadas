# 19. Matriz de trazabilidad final

> Versión del producto: **`v1.0.0`** (todas las filas). Resultados del 2026-11-07: Jest 50/50 ([salida](evidencias/final/npm-test-cobertura.txt)), E2E 16/16 ([resultados](evidencias/final/e2e/resultados.json)) y verificaciones operativas 3/3 (doc [14](14_suite_vv_final.md)).
> Componente = módulo del backend (`src/modules/<módulo>`) y script de la página (`public/js/paginas/<página>.js`).

## 19.1 Requisitos funcionales

| Req. | Pantalla | Componente (backend · frontend) | Endpoint | Tabla(s) | Casos de prueba | Resultado | Evidencia | Versión |
|---|---|---|---|---|---|---|---|---|
| RF-01 Registro | `registro.html` | usuarios · `registro.js` | `POST /api/auth/registro` | `usuarios` | PR-01, PR-02, PR-03, E2E-01, E2E-10 | 5/5 Aprobado | [E2E-10](evidencias/final/e2e/E2E-10_registro_invalido.png), [A01](evidencias/final/manual/A01_registro.png) | v1.0.0 |
| RF-02 Inicio de sesión | `login.html` | usuarios · `login.js`, `comun.js` | `POST /api/auth/login` | `usuarios` | PR-04, PR-05, PR-06, E2E-01, E2E-09 | 5/5 Aprobado | [E2E-09](evidencias/final/e2e/E2E-09_login_invalido.png) | v1.0.0 |
| RF-03 Catálogo | `catalogo.html`, `catalogo-publico.html` | mascotas, tipos · `catalogo.js` | `GET /api/mascotas`, `GET /api/tipos-mascota` | `mascotas`, `tipos_mascota` | PR-07, PR-28, E2E-02 | 3/3 Aprobado | [E2E-02](evidencias/final/e2e/E2E-02_catalogo_filtrado.png) | v1.0.0 |
| RF-04 Detalle | `detalle.html` | mascotas · `detalle.js` | `GET /api/mascotas/:id` | `mascotas` | PR-08, E2E-02, E2E-12 | 3/3 Aprobado | [E2E-02 detalle](evidencias/final/e2e/E2E-02_detalle.png) | v1.0.0 |
| RF-05 Seguimiento (5 etapas) | `seguimiento.html` | solicitudes, entrevistas · `seguimiento.js` | `GET /api/solicitudes/:id` | `solicitudes`, `entrevistas` | PR-21, PR-41, E2E-05, E2E-15 | 4/4 Aprobado | [E2E-05](evidencias/final/e2e/E2E-05_seguimiento_con_entrevista.png), [E2E-15](evidencias/final/e2e/E2E-15_seguimiento_movil.png) | v1.0.0 |
| RF-06 Enviar solicitud | `solicitar.html` | solicitudes, perfiles · `solicitar.js` | `POST /api/solicitudes` | `solicitudes`, `mascotas`, `notificaciones` | PR-14, PR-15, PR-16, PR-20, PR-34, E2E-02, E2E-11, E2E-12 | 8/8 Aprobado | [E2E-02](evidencias/final/e2e/E2E-02_solicitud_enviada.png), [E2E-12](evidencias/final/e2e/E2E-12_mascota_no_disponible.png) | v1.0.0 |
| RF-07 Notificaciones | `notificaciones.html` y contador | notificaciones · `notificaciones.js` | `GET /api/notificaciones[/no-leidas/total]`, `PATCH .../leida[s]` | `notificaciones` | PR-14, PR-18, PR-22, PR-23, PR-41, PR-49 | 6/6 Aprobado | [A09](evidencias/final/manual/A09_notificaciones.png) | v1.0.0 |
| RF-08 Decidir solicitudes | `admin.html`, `admin-solicitud.html` | solicitudes · `admin.js`, `admin-solicitud.js` | `GET /api/admin/solicitudes[/:id]`, `PATCH .../estado` | `solicitudes`, `mascotas`, `notificaciones` | PR-17, PR-18, PR-19, PR-40, PR-42, PR-43, PR-46, E2E-06 | 8/8 Aprobado | [E2E-06](evidencias/final/e2e/E2E-06_solicitud_aprobada.png), [B09](evidencias/final/manual/B09_decision.png) | v1.0.0 |
| RF-09 Gestionar catálogo y tipos | `admin.html` | mascotas, tipos · `admin.js` | `POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota` | `mascotas`, `tipos_mascota` | PR-09 a PR-13, PR-32, E2E-03, E2E-14 | 8/8 Aprobado | [E2E-03](evidencias/final/e2e/E2E-03_mascota_creada_y_editada.png), [E2E-14](evidencias/final/e2e/E2E-14_foto_tipo_invalido.png) | v1.0.0 |
| RF-10 Historial propio | `mis-solicitudes.html` | solicitudes · `mis-solicitudes.js` | `GET /api/solicitudes/mias` | `solicitudes` | PR-14, E2E-02 | 2/2 Aprobado | [A06](evidencias/final/manual/A06_mis_solicitudes.png) | v1.0.0 |
| RF-11 Perfil del adoptante | `perfil.html` | perfiles · `perfil.js`, `solicitar.js` | `GET`/`PUT /api/perfil-adoptante` | `perfiles_adoptante` | PR-34, PR-35, PR-36, E2E-01, E2E-11 | 5/5 Aprobado | [E2E-01](evidencias/final/e2e/E2E-01_perfil_guardado.png), [E2E-11](evidencias/final/e2e/E2E-11_solicitar_sin_perfil.png) | v1.0.0 |
| RF-12 Entrevistas | `admin-solicitud.html` (calendario), `admin.html` (Agenda, Configuración), `seguimiento.html` | entrevistas, configuracion, solicitudes · `calendario.js`, `admin-solicitud.js`, `admin.js` | `PATCH /api/admin/solicitudes/:id/entrevista`, `.../entrevistada`, `GET /api/admin/entrevistas[/disponibilidad]`, `GET`/`PUT /api/admin/configuracion-refugio` | `entrevistas`, `configuracion_refugio`, `solicitudes` | PR-37 a PR-44, E2E-04, E2E-05, E2E-06 | 11/11 Aprobado | [E2E-04](evidencias/final/e2e/E2E-04_calendario_horarios.png), [B02](evidencias/final/manual/B02_agenda.png), [B04](evidencias/final/manual/B04_configuracion_refugio.png) | v1.0.0 |
| RF-13 Seguimiento post-adopción | `seguimiento.html` | seguimientos · `seguimiento.js` | `GET /api/solicitudes/:id/seguimientos`, `POST /api/seguimientos/:id/foto` | `seguimientos` | PR-45, PR-46, PR-47, PR-48, E2E-06, E2E-07, E2E-14 | 7/7 Aprobado | [E2E-07](evidencias/final/e2e/E2E-07_control_vista_previa.png) | v1.0.0 |
| RF-14 Revisión de seguimientos | `admin.html` (Seguimientos post-adopción) | seguimientos · `admin.js` | `GET`/`PATCH /api/admin/seguimientos` | `seguimientos`, `notificaciones` | PR-49, E2E-08 | 2/2 Aprobado | [E2E-08](evidencias/final/e2e/E2E-08_revision_control.png) | v1.0.0 |
| RF-15 Recordatorios | `notificaciones.html` | seguimientos, notificaciones, usuarios · `scripts/recordatorios.js` | (al iniciar sesión y en `GET /api/notificaciones`) · `npm run recordatorios` | `notificaciones`, `seguimientos` | PR-22, PR-50 | 2/2 Aprobado | [A09](evidencias/final/manual/A09_notificaciones.png) | v1.0.0 |

## 19.2 Requisitos no funcionales

| Req. | Cómo se cumple | Componente | Casos de prueba | Resultado | Evidencia | Versión |
|---|---|---|---|---|---|---|
| RNF-01 Seguimiento en < 2 s | Consultas por PK e índices | repositorios | PR-21, VO-01 | Aprobado: máx. 86,7 ms en local | [`rendimiento_rnf01.txt`](evidencias/final/rendimiento_rnf01.txt) | v1.0.0 |
| RNF-02 Contraseñas cifradas | bcrypt (API, migración ETL, seed) | usuarios, `instalar.js` | PR-01, PR-25, PR-31 | Aprobado | [`npm-test-cobertura.txt`](evidencias/final/npm-test-cobertura.txt) | v1.0.0 |
| RNF-03 Responsive | `viewport`, `@media`, línea de tiempo vertical, barra con salto de línea | `styles.css` | E2E-15 | Aprobado (tras DEF-21) | [E2E-15](evidencias/final/e2e/E2E-15_seguimiento_movil.png) | v1.0.0 |
| RNF-04 Solo el admin administra | `requiereAuth` + `requiereRol` | middlewares | PR-10, PR-17, PR-36, PR-43, PR-44, PR-47, PR-49, E2E-13 | Aprobado | [E2E-13](evidencias/final/e2e/E2E-13_adoptante_redirigido.png) | v1.0.0 |

## 19.3 Otros elementos verificados

| Elemento | Casos | Resultado |
|---|---|---|
| Migración ETL desde localStorage | PR-24 a PR-27 | Aprobado |
| Migraciones del esquema | PR-32, PR-33 | Aprobado |
| Seguridad (Path Traversal, ReDoS, instalación) | PR-29, PR-30, PR-31 | Aprobado |
| Interfaz sin errores de JavaScript | E2E-16 | Aprobado |
| Respaldo y recuperación | VO-02 | Aprobado |
| Instalación desde cero | VO-03 | Aprobado |

## 19.4 Requisitos sin caso de prueba

**Todos los RF-01 a RF-15 y los RNF-01 a RNF-04 tienen al menos un caso automatizado ejecutado hoy.** Lo que queda sin caso dedicado:
- **RF-12, criterio 5 (Agenda semanal agrupada por día en la interfaz):** la API se prueba en PR-43, y la pantalla solo tiene la captura del manual ([B02](evidencias/final/manual/B02_agenda.png)), sin una aserción E2E propia.
- **RF-15 con `npm run recordatorios` como proceso aparte:** PR-50 llama a la misma función del script; la ejecución por línea de comandos se verificó a mano (dos corridas: 1 y 0 recordatorios) y no tiene prueba automatizada.
- **RNF-01 con concurrencia o en producción:** no se midió (ver doc 21).
