# Relevamiento y estado contrastado

Fecha de referencia: 2 de octubre de 2026.

Este documento resume el contraste entre la implementación actual y la documentación. “Implementado” describe código presente; “verificado” requiere ejecutar la prueba indicada o comprobar el entorno real.

## Implementado

- Next.js 15, React 19, TypeScript y Node 22.23+.
- Autenticación propia con SQLite, `scrypt`, sesiones con token hash y aislamiento por propietario.
- Sitios con documento versionado (`schemaVersion: 1`), migración de lectura, borrador y publicación independiente.
- Editor por bloques con 21 tipos, undo/redo, duplicación, reordenamiento, autoguardado y recuperación local.
- Nueve plantillas en tres familias públicas.
- Imágenes JPG/PNG/WebP de hasta 8 MB, procesadas a WebP y almacenadas bajo `PLATFORM_DATA_DIR/media`.
- Formularios y newsletter con leads, honeypot, rate limiting persistente y bandeja privada.
- Planes y suscripciones manuales en SQLite.
- CMS Payload/PostgreSQL histórico separado del constructor.
- Docker, Compose productivo, Caddy y workflow GitHub Actions hacia GHCR/VPS.

## Contraste corregido

- La propiedad de medios se valida para logo, portada, proyectos, galería, logos y equipo.
- El Compose raíz conserva el stack histórico de Payload/PostgreSQL y monta la persistencia de la plataforma en `/app/data`.
- El Compose productivo monta `forma_data` en `/app/data`, que contiene SQLite y medios.
- CI ejecuta typecheck, tests unitarios y build antes de construir la imagen.
- La documentación distingue configuración de despliegue de despliegue efectivamente verificado en un VPS.

## Verificado en este checkout

- `npm run typecheck`: correcto.
- `npm test`: correcto, 11 pruebas.
- `npm run build`: correcto.
- `npm run test:e2e`: correcto, 10 recorridos.
- `git diff --check`: correcto.

## Pendientes reales

- Verificar el flujo completo en un VPS real, incluyendo reinicio, backup y restauración de `/app/data`.
- Aplicar límites de sitios y almacenamiento de los planes.
- Añadir biblioteca, borrado y limpieza segura de medios.
- Validar `formId`, campos publicados y consentimiento de newsletter en servidor.
- Resolver rate limiting atómico, concurrencia entre pestañas y sandbox del preview.
- Incorporar recuperación de contraseña, verificación de email, pagos y dominios personalizados.

## Fuentes actualizadas

- Arquitectura: `docs/architecture.md`.
- Handoff operativo: `docs/next-chat.md`.
- Editor: `docs/editor-audit.md`.
- CTAs: `docs/cta-audit.md`.
- Despliegue: `deploy/README.md`.
