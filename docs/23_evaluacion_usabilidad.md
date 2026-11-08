# 23. Evaluación de usabilidad (heurísticas de Nielsen)

> III Parcial · `v1.0.0` · fecha: 2026-11-07.
> **Método:** inspección heurística con las 10 heurísticas de Nielsen sobre los dos recorridos completos (adoptante y administrador), hecha por la autora con Edge (escritorio, 1280 px) y en una pantalla de celular de 390 px, con apoyo de las pruebas E2E. **No** es una prueba con usuarios externos: esa limitación queda en el informe final (doc 21).
> **Escala de severidad (Nielsen):** 0 no es problema · 1 cosmético · 2 menor · 3 mayor · 4 catastrófico.
> Hallazgos anteriores (Hito 1 y II Parcial, 1 a 10): ver [`02_alcance_requisitos.md` §2.5](02_alcance_requisitos.md). Todos siguen corregidos.

## 23.1 Hallazgos

| N.º | Heurística | Hallazgo | Severidad | Evidencia (ANTES) | Recomendación | Estado | Evidencia (DESPUÉS) |
|---|---|---|---|---|---|---|---|
| U1 | H1 Visibilidad del estado del sistema · H2 Coincidencia con el mundo real | El seguimiento tenía 3 pasos genéricos ("Solicitada → En revisión → Aprobada / Rechazada"), sin fechas por etapa ni información de la entrevista, que es lo que el adoptante necesita saber | 3 | [U1_antes_seguimiento_3_pasos.png](evidencias/final/usabilidad/U1_antes_seguimiento_3_pasos.png) (`main` en `be3f4d2`) | Mostrar las 5 etapas reales con su fecha y un aviso claro de la cita (día en texto, hora y lugar) | **Corregido** (PR #16) | [E2E-05](evidencias/final/e2e/E2E-05_seguimiento_con_entrevista.png), [A07](evidencias/final/manual/A07_seguimiento_entrevista.png) |
| U2 | H5 Prevención de errores | El admin podía aprobar una solicitud desde la lista con un clic, sin haber conocido al adoptante ni revisado sus condiciones | 3 | [U2_antes_aprobar_desde_lista.png](evidencias/final/usabilidad/U2_antes_aprobar_desde_lista.png) (`be3f4d2`) | Llevar la decisión al detalle con el perfil, y habilitar **Aprobar** solo después de marcar la entrevista como realizada (con aviso del motivo) | **Corregido** (PR #16) | [B09](evidencias/final/manual/B09_decision.png), PR-40 |
| U3 | H8 Estética y diseño minimalista · H4 Consistencia | En el encabezado del seguimiento, el icono de la mascota (SVG nuevo sin tamaño propio) ocupaba media pantalla y empujaba el contenido | 2 | [U3_antes_huella_gigante.png](evidencias/final/usabilidad/U3_antes_huella_gigante.png) (prueba de humo del 2026-11-07, antes de hacer el commit) | Usar el icono al tamaño del texto en los encabezados | **Corregido** antes de integrar la rama | [A07](evidencias/final/manual/A07_seguimiento_entrevista.png) |
| U4 | H6 Reconocer antes que recordar · H2 | Las fechas de los controles del año siguiente no mostraban el año ("viernes 8 de enero"), y el adoptante tenía que deducirlo | 2 | [U4_antes_fecha_sin_anio.png](evidencias/final/usabilidad/U4_antes_fecha_sin_anio.png) (control 3) | Agregar el año cuando la fecha no es del año en curso | **Corregido** antes de integrar la rama | [A08](evidencias/final/manual/A08_subir_foto_control.png) |
| U5 | H4 Consistencia y estándares (RNF-03) | En el celular, la barra del adoptante medía 411 px en una pantalla de 390 px: desplazamiento horizontal en todas las páginas (DEF-21) | 3 | Medición con Playwright: `scroll 411 > ancho 390` ([bitácora](15_bitacora_defectos.md) §15.2) | Barra con salto de línea en pantallas pequeñas | **Corregido** (`1cc3453`) | [E2E-15](evidencias/final/e2e/E2E-15_seguimiento_movil.png) |
| U6 | H4 Consistencia · H8 | Emojis como iconos funcionales (aprobar, rechazar, notificaciones, tipos de mascota, pie de página): se ven distinto según el sistema operativo, y algunos no se distinguen del texto | 2 | U1 y U2 (✔, ✕, 📍, 📞, emojis por tipo) | Iconos SVG propios con la paleta del sitio; los estados se distinguen por color **y** texto; solo la huella del logo | **Corregido** (PR #13) | [B01](evidencias/final/manual/B01_solicitudes_en_curso.png), [B09](evidencias/final/manual/B09_decision.png) |
| U7 | H9 Ayudar a reconocer, diagnosticar y recuperarse de errores | Cuando faltan varios datos del perfil, todos los mensajes aparecen juntos en un solo párrafo arriba del formulario, sin marcar qué campo corresponde a cada uno | 2 | [U6_errores_en_un_bloque.png](evidencias/final/usabilidad/U6_errores_en_un_bloque.png) | Mostrar cada mensaje junto a su campo y marcar el campo en rojo (`aria-invalid`) | **Pendiente** (acción futura; los mensajes ya dicen qué falta) | — |
| U8 | H7 Flexibilidad y eficiencia de uso | La agenda del admin muestra solo los próximos 7 días, sin navegar a otras semanas | 1 | [B02](evidencias/final/manual/B02_agenda.png) | Agregar "semana anterior / siguiente" | **Pendiente** (las citas lejanas se ven en el calendario de cada solicitud) | — |
| U9 | H10 Ayuda y documentación | No había ayuda sobre las etapas nuevas ni sobre qué hacer en cada control | 2 | [U1_antes_seguimiento_3_pasos.png](evidencias/final/usabilidad/U1_antes_seguimiento_3_pasos.png) (sin ningún texto guía) | Mensaje bajo la línea de tiempo según la etapa, textos guía en cada control y un manual con capturas | **Corregido** | [A07](evidencias/final/manual/A07_seguimiento_entrevista.png), [doc 17](17_manual_usuario.md) |

## 23.2 Resumen

| Severidad | Hallazgos | Corregidos | Pendientes |
|---|---|---|---|
| 3 (mayor) | 3 (U1, U2, U5) | 3 | 0 |
| 2 (menor) | 5 (U3, U4, U6, U7, U9) | 4 | 1 (U7) |
| 1 (cosmético) | 1 (U8) | 0 | 1 |
| **Total** | **9** | **7** | **2** |

## 23.3 Heurísticas sin hallazgos nuevos

- **H1:** el contador de notificaciones, los botones que se deshabilitan mientras se procesa y las alertas de éxito siguen funcionando.
- **H5:** el calendario deshabilita los días pasados, los domingos y los días sin atención, y bloquea los horarios ocupados; el backend vuelve a validar (PR-37 a PR-39).
