# PatitasConectadas — Sistema de Gestión de Adopción de Mascotas

Proyecto universitario: Avance 1 del Proyecto Integrador — análisis de requisitos y arquitectura inicial de un sistema de adopción de mascotas.

## Estructura del repositorio

```
/proyecto
   /docs
      alcance-v1.md                     # Alcance del proyecto v1.0
      requisitos-v1.md                  # Listado de requisitos funcionales
      arquitectura-v1.png               # Diagrama de arquitectura inicial
      componentes-v1.png                # Diagrama de componentes/módulos
      trazabilidad-v1.xlsx              # Matriz de trazabilidad requisito-pantalla-módulo-datos
      justificacion-arquitectura-v1.md  # Justificación de decisiones arquitectónicas
   /prototipo
      prototipo-v1.md                   # Descripción de pantallas del prototipo
   README.md
```

## Resumen del proyecto
- **Frontend:** React (SPA)
- **Backend:** Node.js + Express (API REST, arquitectura en capas: Controladores → Servicios → Repositorios)
- **Base de datos:** MongoDB
- **Arquitectura:** Cliente-servidor por capas + organización modular (Usuarios, Mascotas, Solicitudes, Seguimiento, Notificaciones)

## Módulos principales
| Módulo | Responsabilidad |
|---|---|
| Usuarios | Registro y autenticación de adoptantes |
| Mascotas | Catálogo, ficha de mascota, gestión desde administración |
| Solicitudes | Crear solicitud de adopción, aprobar/rechazar, historial |
| Seguimiento | Consultar y actualizar el estado de una solicitud |
| Notificaciones | Alertas de cambio de estado (módulo transversal) |

## Actores
| Rol | Descripción |
|---|---|
| Adoptante | Se registra, consulta mascotas y solicita adopción |
| Administrador (refugio) | Gestiona mascotas y responde solicitudes |

## Estado actual
Versión 1.0 — Alcance, requisitos, arquitectura inicial y matriz de trazabilidad completos. Pendiente: prototipo de alta fidelidad (ver nota en `/prototipo/prototipo-v1.md`).
