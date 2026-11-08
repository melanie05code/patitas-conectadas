# 22. Autoverificación con la rúbrica del III Parcial

> Guía para el docente: dónde está la evidencia de cada criterio. **No incluye calificación propia.**

## 22.1 Calidad y funcionamiento (15 puntos)

| Qué se pide | Dónde está la evidencia |
|---|---|
| El sistema funciona de punta a punta | Flujo completo en E2E-01 a E2E-08 ([doc 14 §14.4](14_suite_vv_final.md)), capturas en [`evidencias/final/e2e/`](evidencias/final/e2e/) |
| Reglas de negocio correctas | PR-34 a PR-50 (perfil, horarios, etapas, aprobación solo después de la entrevista, controles, recordatorios) |
| Integridad y transacciones | PR-19, PR-20, PR-39, PR-46 (rollback y concurrencia) · [doc 05 §5.8](05_base_datos.md) |
| Validación en el backend y manejo de errores | PR-03, PR-15, PR-35, PR-37, PR-38, PR-48, E2E-10, E2E-14 |
| Seguridad (roles, dueño, fotos, contraseñas) | PR-10, PR-17, PR-36, PR-47, PR-49, E2E-13 · [doc 04 §4.4](04_arquitectura.md) |
| Calidad estática y dependencias | Quality Gate OK en los PR #12 a #17, Snyk sin High · [doc 21 §21.3](21_informe_final_calidad.md) |
| Defectos detectados y corregidos | 22 corregidos, 7 residuales justificados · [doc 15](15_bitacora_defectos.md) |
| Interfaz sin emojis, coherente y responsive | PR #13, PR-32, E2E-15 · [doc 23](23_evaluacion_usabilidad.md) |

## 22.2 Diseño y arquitectura (10 puntos)

| Qué se pide | Dónde está la evidencia |
|---|---|
| Arquitectura en capas y módulos | [doc 04 §4.2](04_arquitectura.md) (diagrama y responsabilidades) · `src/modules/*/{rutas,controlador,servicio,repositorio}.js` |
| Decisiones técnicas justificadas | [doc 04 §4.7](04_arquitectura.md): capas, validación, errores, sesiones/tokens, bcrypt, `.env`, transacciones, migraciones, fechas, seed, recordatorios y calendario |
| Despliegue y pipeline de CI | [doc 04 §4.5 y §4.6](04_arquitectura.md) · [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Modelo de datos | [doc 05](05_base_datos.md): ER, restricciones, acciones referenciales, índices, **diccionario de datos** (§5.12) y migraciones (§5.13) |
| Ampliación del alcance justificada | [doc 02 §2.1](02_alcance_requisitos.md) (Ampliación del alcance) |

## 22.3 V&V y trazabilidad (12,5 puntos)

| Qué se pide | Dónde está la evidencia |
|---|---|
| Suite con casos positivos, negativos, límite, integración, roles, persistencia y reglas de negocio | [doc 14](14_suite_vv_final.md): 69 casos con código, requisito, tipo, precondiciones, entradas, pasos, esperado, obtenido, estado, fecha, ejecutor y evidencia |
| Resumen cuantitativo y cobertura | doc 14 §14.2: 69 ejecutadas / 69 aprobadas / 0 fallidas / 0 bloqueadas; cobertura de Jest de 93,48 % de líneas (alcance indicado) |
| Valores límite | doc 14 §14.6 (personas 0/1/20/21, foto de 2 MB, horarios 09:00/15:30/16:00, longitudes 200/201 y 300/301, campos vacíos, teléfono) |
| Regresión | doc 14 §14.7 (antes y después por defecto) |
| Pruebas E2E | `npm run test:e2e` · [`tests/e2e/adopcion.e2e.js`](../tests/e2e/adopcion.e2e.js) · [`resultados.json`](evidencias/final/e2e/resultados.json) |
| Trazabilidad requisito → prueba → evidencia → versión | [doc 19](19_matriz_trazabilidad_final.md), incluidos los requisitos sin caso dedicado (§19.4) |
| Bitácora de defectos con ANTES → DESPUÉS | [doc 15 §15.2](15_bitacora_defectos.md) (5 defectos con fragmento de código, salida y commit); fallos inyectados aparte (§15.3) |
| Evaluación de usabilidad | [doc 23](23_evaluacion_usabilidad.md) (Nielsen, severidad, ANTES → DESPUÉS) |

## 22.4 Documentación y reproducibilidad (7,5 puntos)

| Qué se pide | Dónde está la evidencia |
|---|---|
| Instalación reproducible | [README](../README.md) verificado desde un clon limpio: [`instalacion_desde_cero.txt`](evidencias/final/instalacion_desde_cero.txt) |
| Producto final (terminado, parcial y excluido) | [doc 16](16_producto_final.md) |
| Manual de usuario con capturas reales | [doc 17](17_manual_usuario.md) (adoptante y administrador, una sección por tarea) |
| Respaldo y recuperación ejecutados | [doc 18](18_respaldo_recuperacion.md) · [`respaldo_recuperacion.txt`](evidencias/final/respaldo_recuperacion.txt) |
| Corrección de las observaciones anteriores | [doc 20](20_matriz_correcciones.md) (I Parcial con observaciones del docente; II Parcial con autoinspección y herramientas) |
| Informe de calidad que separa lo demostrado de lo proyectado | [doc 21 §21.4 y §21.5](21_informe_final_calidad.md) |
| Historial de versiones | [`CHANGELOG.md`](../CHANGELOG.md), release `v1.0.0` ([doc 12](12_enlaces_anexos.md)) |
| Commits y PR por rama | PR #1 a #17 y el PR de cierre · [doc 07](07_git.md) |

## 22.5 Defensa (5 puntos)

| Qué se pide | Dónde está la evidencia |
|---|---|
| Demostración en vivo | Usuarios demo y guion sugerido: [doc 16 §16.5](16_producto_final.md) (agendar la entrevista de Vaquita, aprobar la de Mechudo, subir y revisar el control de Lara) |
| Video de defensa | [doc 12](12_enlaces_anexos.md): **(pendiente)** |
| Respuestas sobre decisiones y limitaciones | [doc 04 §4.7](04_arquitectura.md), [doc 21 §21.5 a §21.7](21_informe_final_calidad.md) |
