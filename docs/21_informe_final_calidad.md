# 21. Informe final de calidad

> Patitas Conectadas `v1.0.0` · III Parcial · 2026-11-07.
> Se separa lo **demostrado** (con una ejecución o una medición de hoy y su evidencia) de lo **proyectado** (lo que se espera, pero no se comprobó).

## 21.1 Requisitos cumplidos

| Grupo | Requisitos | Estado | Evidencia |
|---|---|---|---|
| Base (Hito 1 y II Parcial) | RF-01 a RF-10 | **Demostrado**: implementados y con pruebas aprobadas hoy | [Matriz 19](19_matriz_trazabilidad_final.md) |
| Ampliación (III Parcial) | RF-11 a RF-15, y RF-05, RF-07 y RF-08 actualizados | **Demostrado**: implementados; PR-34 a PR-50 y E2E-01 a E2E-08 aprobados | [Suite 14](14_suite_vv_final.md) |
| No funcionales | RNF-01 a RNF-04 | **Demostrado en local** (ver los matices de 21.5) | Matriz 19 §19.2 |

**Suite de hoy:** 69 casos ejecutados, 69 aprobados, 0 fallidos, 0 bloqueados (50 Jest + 16 E2E + 3 verificaciones operativas). Cobertura de Jest sobre `src/` y `database/`: 93,48 % de líneas, 67,26 % de ramas.

## 21.2 Defectos

| | Cantidad | Detalle |
|---|---|---|
| Defectos reales corregidos | 23 | DEF-01 a DEF-23 ([bitácora](15_bitacora_defectos.md)) |
| ... encontrados hoy por la suite final | 6 | DEF-18 (cobertura), DEF-19 (ETL), DEF-20 (SonarCloud), DEF-21 (celular), DEF-22 (contraseñas de ejemplo), DEF-23 (contraseñas literales en pruebas, DeepSource Secrets) |
| Fallos inyectados para validar herramientas | 4 | INY-01 a INY-04; no son defectos del producto |
| Residuales | 7 | RES-01 a RES-07, ninguno crítico |
| Hallazgos de usabilidad (III Parcial) | 9 | 7 corregidos y 2 pendientes de severidad 1–2 ([doc 23](23_evaluacion_usabilidad.md)) |

## 21.3 Métricas antes / después

### SonarCloud

| Indicador | Antes (`main` `be3f4d2`, análisis del 2026-10-25) | Después |
|---|---|---|
| Quality Gate | Sin calcular en `main`; **ERROR** en el PR #12 inicial (Security E, cobertura 48,6 %) | **OK** en los 5 PR integrados: #12, #13, #14, #16 y #17 |
| Bugs | 24 | 0 nuevos en cada PR (#12 dejó en 0 los archivos que tocó) |
| Vulnerabilidades | 3 | 0 nuevas en cada PR |
| Code smells | 11 | 0 nuevos en cada PR |
| Security hotspots | 0 | 0 |
| Cobertura del código nuevo | 48,6 % (PR #12 inicial) | #12 95,8 % · #13 86,2 % · #14 100 % · #16 92,7 % · #17 86,4 % |
| Duplicación del código nuevo | — | 0,0 % a 0,9 % (umbral 3 %) |
| Reliability / Security / Maintainability | C / E / A | A / A / A en el código nuevo de cada PR |

**Limitación de la medición:** la rama `main` no se volvía a analizar porque el workflow solo corría en `dev` y en los PR. Hoy se agregó `main` a los disparadores ([`a7d5ee3`](https://github.com/melanie05code/patitas-conectadas/commit/a7d5ee3)). Las cifras del **proyecto completo** después del cierre se verán en el panel de SonarCloud al fusionar el PR de cierre; aquí solo se informan las de los PR, que sí se midieron.

### Snyk

| Indicador | Antes | Después (CI del PR #17) |
|---|---|---|
| Open Source (High / Medium / Low) | `main` 0 / 0 / 0 · PR #12 inicial 5 / 3 / 0 (lodash inyectado) | **0 vulnerabilidades** en 102 dependencias ("no vulnerable paths found") |
| Code, umbral High | `main` 3 High | **0** (Total issues: 0 con `--severity-threshold=high`) |
| Code, Medium y Low | 6 / 18 | 4 / 10 en el cierre del PR #12, todos falsos positivos documentados (RES-07) |
| `npm audit --omit=dev` | — | 0 vulnerabilidades en producción; 20 bajas o moderadas en desarrollo (RES-03) |

### DeepSource

| Indicador | Antes | Después |
|---|---|---|
| Ocurrencias | 405 (Bug risk 182, Anti-pattern 222, Secrets 1) | 192 resueltas en el PR #12; total estimado 261 |
| Check Secrets | **Falla** en `main` (credenciales del seed) | **Pasa** desde el PR #12 |
| Check SQL | Pasa | Pasa |
| Checks JavaScript y Test coverage | Fallan | **Siguen fallando** por falsos positivos (JS-0067, JS-0098, TCV-001 en líneas viejas) → RES-01. Bug risk introducidos: 0 |

Las cifras de DeepSource posteriores al PR #12 no se pudieron consultar hoy: el panel requiere la sesión de la dueña del repositorio y la API pública no las expone.

### Pruebas

| Indicador | II Parcial | III Parcial (hoy) |
|---|---|---|
| Casos Jest | 28 → 31 (PR #12) | **50** |
| Casos E2E automatizados | 0 (solo capturas) | **16** |
| Cobertura de líneas (Jest) | 89,8 % | **93,48 %** |
| Requisitos con caso de prueba | RF-01 a RF-10 | RF-01 a RF-15 y RNF-01 a RNF-04 |

## 21.4 Lo demostrado

- **Funcionalidad:** el proceso completo (registro → perfil → solicitud → entrevista en el calendario → entrevistada → aprobada → controles → foto → revisión → recordatorio) funciona de punta a punta en el navegador contra la API y MySQL (E2E-01 a E2E-08).
- **Integridad y concurrencia:** las transacciones hacen rollback completo ante fallos forzados (PR-19, PR-46); dos peticiones simultáneas no ocupan la misma mascota ni el mismo horario (PR-20, PR-39); los recordatorios no se duplican (PR-50).
- **Seguridad verificada por pruebas:** permisos por rol y por dueño (PR-10, PR-17, PR-36, PR-47, PR-49, E2E-13); validación en el backend aunque se salte el navegador (PR-03, PR-35, E2E-10); fotos validadas por firma y tamaño (PR-12, PR-48, E2E-14); sin Path Traversal en el borrado (PR-29); sin ReDoS en el correo (PR-30); contraseñas con bcrypt (PR-01).
- **Rendimiento local:** 7 rutas × 50 peticiones con un máximo de 86,7 ms y p95 ≤ 23,9 ms ([evidencia](evidencias/final/rendimiento_rnf01.txt)).
- **Reproducibilidad:** instalación desde un clon limpio siguiendo el README ([evidencia](evidencias/final/instalacion_desde_cero.txt)).
- **Recuperación:** respaldo, pérdida simulada y restauración con conteos idénticos ([evidencia](evidencias/final/respaldo_recuperacion.txt)).

## 21.5 Lo proyectado o no demostrado

| Afirmación | Por qué no se puede afirmar | Qué haría falta |
|---|---|---|
| "El sistema es seguro" | Solo se probaron los casos de la suite y el análisis estático; no hubo pruebas de penetración ni revisión externa | Pentest con OWASP ZAP y revisión de dependencias en producción |
| "Responde en menos de 2 s con muchos usuarios" | RNF-01 se midió en local, secuencial y sin red real | Prueba de carga (por ejemplo, autocannon o k6) en el servidor real |
| "Está disponible para el refugio" | No hay despliegue en un servidor, HTTPS, monitoreo ni respaldos automáticos | Servidor con HTTPS y proxy inverso, respaldos programados y monitoreo |
| "Los adoptantes lo encuentran fácil de usar" | La evaluación heurística la hizo la autora; no hubo prueba con usuarios reales en el III Parcial | Prueba de usabilidad con 3 a 5 adoptantes y personal del refugio |
| "Funciona en XAMPP/MariaDB" | Solo se probó con MySQL 8.0 | Ejecutar la suite contra MariaDB 10.4+ |

## 21.6 Riesgos que permanecen

| Riesgo | Probabilidad | Impacto | Mitigación actual |
|---|---|---|---|
| Restauración parcial silenciosa con un respaldo dañado (RES-04) | Baja | Alto | Verificar el SHA-256 y `Dump completed` (doc 18) |
| Hashes de las contraseñas demo viejas en el historial de Git (RES-02) | Baja | Medio | Las contraseñas demo ya no se usan; cada instalación define las suyas |
| Adoptante que no entra al sistema y no ve el recordatorio | Media | Medio | Parcial: el panel solo muestra los controles **enviados**; la API `GET /api/admin/seguimientos?estado=Pendiente` lista los pendientes, pero no hay pantalla para los vencidos. Correo y lista de vencidos quedan como acciones futuras |
| Checks de DeepSource en rojo que ocultan un problema real futuro (RES-01) | Media | Bajo | SonarCloud y Snyk bloquean; marcar los falsos positivos en el panel |
| Desfase de hora si el servidor está en otra zona horaria (RES-06) | Baja | Medio | Documentado; el servidor debe usar la hora del refugio |

## 21.7 Limitaciones

- Un solo refugio y una sola zona horaria; notificaciones solo internas.
- Despliegue local sin HTTPS; sin respaldos automáticos.
- El E2E necesita Edge o Chrome instalados y no corre en el CI.
- La cobertura de ramas (67 %) es menor que la de líneas.
- La evaluación de usabilidad es heurística, sin usuarios externos.

## 21.8 Acciones futuras (priorizadas)

1. Marcar en DeepSource los falsos positivos JS-0067, JS-0098 y TCV-001 para que sus checks reflejen el estado real (RES-01).
2. Envío de correo para los recordatorios y los cambios de etapa (PB-09), y una lista de controles vencidos en el panel del admin.
3. Mensajes de error junto a cada campo (U7) y navegación por semanas en la agenda (U8).
4. Ejecutar el E2E en el CI con un navegador headless instalado en el job.
5. Subir la cobertura de ramas, empezando por `mascotas/servicio.js`.
6. Despliegue con HTTPS, respaldos programados y una prueba de carga para RNF-01.
7. Prueba de usabilidad con usuarios reales del refugio.
