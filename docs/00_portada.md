# 🐾 Patitas Conectadas

## Sistema de Gestión de Adopción de Mascotas

### III Parcial — Entrega final (`v1.0.0`)

**Asignatura:** Implementación y Validación de Software · **Docente:** Ing. Luis Octavio Tenorio

**Proyecto Final Integrador**

**Integrante:** Melanie Abigail Obando Rivera *(proyecto individual)*

**Universidad:** UCN

**Fecha:** 7 de noviembre de 2026

**Repositorio:** https://github.com/melanie05code/patitas-conectadas

---

## Contenido

| Nº | Sección | Archivo |
|---|---|---|
| 1 | Correcciones aplicadas a partir de la retroalimentación | [`01_correcciones.md`](01_correcciones.md) |
| 2 | Alcance y requisitos actualizados (backlog y criterios de aceptación) | [`02_alcance_requisitos.md`](02_alcance_requisitos.md) |
| 3 | Funcionalidades implementadas | [`03_funcionalidades.md`](03_funcionalidades.md) |
| 4 | Arquitectura actualizada y matriz de trazabilidad | [`04_arquitectura.md`](04_arquitectura.md) |
| 5 | Base de datos | [`05_base_datos.md`](05_base_datos.md) |
| 6 | Pruebas | [`06_pruebas.md`](06_pruebas.md) |
| 7 | Control de versiones (Git y GitHub) | [`07_git.md`](07_git.md) |
| 8 | Migración de datos | [`08_migracion.md`](08_migracion.md) |
| 9 | Plan de capacitación | [`09_capacitacion.md`](09_capacitacion.md) |
| 10 | Estrategia de implementación | [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md) |
| 11 | Conclusiones | [`11_conclusiones.md`](11_conclusiones.md) |
| 12 | Enlaces y anexos | [`12_enlaces_anexos.md`](12_enlaces_anexos.md) |
| 13 | Calidad y seguridad del código (SonarCloud, DeepSource, Snyk) | [`13_calidad_seguridad.md`](13_calidad_seguridad.md) |
| 14 | **Suite final de V&V** (69 casos ejecutados) | [`14_suite_vv_final.md`](14_suite_vv_final.md) |
| 15 | Bitácora de defectos | [`15_bitacora_defectos.md`](15_bitacora_defectos.md) |
| 16 | Producto final (terminado, parcial y excluido) | [`16_producto_final.md`](16_producto_final.md) |
| 17 | Manual de usuario (adoptante y administrador) | [`17_manual_usuario.md`](17_manual_usuario.md) |
| 18 | Respaldo y recuperación | [`18_respaldo_recuperacion.md`](18_respaldo_recuperacion.md) |
| 19 | Matriz de trazabilidad final | [`19_matriz_trazabilidad_final.md`](19_matriz_trazabilidad_final.md) |
| 20 | Matriz de correcciones (I, II y III Parcial) | [`20_matriz_correcciones.md`](20_matriz_correcciones.md) |
| 21 | Informe final de calidad | [`21_informe_final_calidad.md`](21_informe_final_calidad.md) |
| 22 | Autoverificación con la rúbrica | [`22_autoverificacion_rubrica.md`](22_autoverificacion_rubrica.md) |
| 23 | Evaluación de usabilidad (Nielsen) | [`23_evaluacion_usabilidad.md`](23_evaluacion_usabilidad.md) |

Registro de cambios por versión: [`CHANGELOG.md`](../CHANGELOG.md).

## Resumen

Patitas Conectadas centraliza el proceso de adopción de un refugio de mascotas: catálogo público con fotos reales, perfil del adoptante, solicitudes con entrevista presencial agendada en un calendario, decisión del refugio, seguimiento post-adopción con fotos y recordatorios, notificaciones y un panel para que el refugio gestione todo el proceso.

**En el III Parcial (`v1.0.0`):** proceso de adopción completo (RF-11 a RF-15), interfaz sin emojis, integración del análisis de calidad y seguridad, migraciones numeradas del esquema, **50 pruebas Jest + 16 E2E con Playwright** (todas aprobadas el 2026-11-07), respaldo y restauración probados, y documentación de cierre (14 a 23).

**Antes, en el Segundo Parcial:**

el prototipo del Hito 1, que simulaba los datos en el navegador, pasó a ser una aplicación real:
- backend **Node.js + Express**;
- base de datos **MySQL 8.0** con integridad referencial y transacciones;
- autenticación con **bcrypt + JWT**;
- validación en el servidor;
- **28 pruebas automáticas**;
- migración de los datos del prototipo;
- un historial de Git con **10 ramas integradas por Pull Request**.
