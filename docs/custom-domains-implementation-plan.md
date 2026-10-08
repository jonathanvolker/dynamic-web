# Plan de implementación: dominios personalizados

Fecha de referencia: 8 de octubre de 2026.

## Estado actual

El soporte es parcial y no debe considerarse listo para producción:

- `platform_domains` ya se crea en PostgreSQL con `hostname`, token, estado y fechas.
- El panel permite asociar un hostname `www.*` a un sitio del usuario con capacidad `customDomain`.
- La verificación manual consulta el CNAME mediante DNS y pasa el dominio a `verified`.
- La página pública busca un sitio publicado por `Host` cuando el hostname está `verified` o `active`.
- Caddy ya tiene `on_demand_tls` y consulta `/api/domains/allow`; el Compose productivo expone 80/443 y conserva los datos de Caddy.
- No hay evidencia de pruebas de dominio, ejecución en VPS, renovación TLS, observabilidad ni procedimiento de rollback.
- El alcance actual no incluye el dominio raíz (`cliente.com`), wildcard, transferencia de dominios, DNS gestionado por la plataforma ni automatización de certificados fuera de Caddy.

## Decisiones necesarias

1. Confirmar el contrato público: solo `www.cliente.com` mediante CNAME en esta primera entrega; dejar el apex para una fase posterior.
2. Fijar `FORMA_CNAME_TARGET` en cada entorno y documentar el valor operativo. No usar el fallback de ejemplo en producción.
3. Definir los estados y transiciones permitidos (`pending`, `verified`, `active`, `error`) y cuándo un dominio verificado pasa a `active`.
4. Decidir si la verificación seguirá siendo manual desde el panel o tendrá reintento/sondeo; mantenerla server-side.
5. Confirmar la política de dominios duplicados, reemplazo y eliminación, incluida la limpieza al borrar un sitio.
6. Confirmar que Profesional es el único plan habilitado y que el enforcement seguirá ocurriendo en acciones/API, no solo en la UI.
7. Definir el hostname canónico de la plataforma, redirecciones y separación de cookies/rutas entre la plataforma y sitios publicados.
8. Acordar métricas, logs y responsable operativo para fallos DNS, TLS y resolución por `Host`.

## Fases

### 0. Cierre de contrato y entorno

- Resolver las decisiones anteriores.
- Validar DNS, firewall, `PUBLIC_URL`, `DOMAIN`, `COOKIE_SECURE` y `FORMA_CNAME_TARGET` en un VPS de staging.
- Confirmar que el proxy conserva `/data` y `/config` de Caddy entre reinicios.

### 1. Completar el módulo de aplicación

- Revisar validación y normalización de hostnames, ownership, duplicados y eliminación/reemplazo.
- Formalizar las transiciones de estado y el manejo de errores/reintentos DNS.
- Verificar que todas las rutas, assets, formularios y navegación de un sitio publicado funcionan con un `Host` personalizado.
- Mantener `/s/[slug]` como URL de respaldo y no alterar el modelo de publicación existente.

### 2. Hacer operativo el proxy

- Configurar el CNAME real hacia el host de Forma.
- Probar la autorización de emisión en `/api/domains/allow` y TLS on-demand de Caddy con dominios permitidos y no permitidos.
- Verificar certificados, renovación, reinicio del stack y persistencia de datos/configuración.
- Documentar el procedimiento de alta, diagnóstico y rollback.

### 3. Verificación y salida

- Ejecutar pruebas unitarias, de integración y E2E del flujo completo.
- Probar desde una red externa con un dominio de staging real.
- Registrar evidencia de HTTP/HTTPS, DNS, logs, reinicio y restauración antes de habilitarlo comercialmente.

## Archivos involucrados

- `src/server/db/postgres-schema.sql`: esquema de `platform_domains`.
- `src/features/domains/actions.ts`: alta y autorización por plan.
- `src/features/domains/server/repository.ts`: persistencia, estados y resolución.
- `src/features/domains/components/DomainVerifyButton.tsx`: acción de verificación del panel.
- `src/app/(frontend)/dashboard/domains/page.tsx`: UX e instrucciones DNS.
- `src/app/(frontend)/api/domains/[id]/verify/route.ts`: consulta DNS y transición de verificación.
- `src/app/(frontend)/api/domains/allow/route.ts`: autorización consultada por Caddy.
- `src/features/sites/server/repository.ts` y `src/app/(frontend)/page.tsx`: resolución pública por `Host`.
- `Caddyfile`, `deploy/compose.production.yaml` y `deploy/README.md`: proxy, TLS y configuración operativa.
- `tests/` y `tests/e2e/`: cobertura nueva del contrato, sin modificar el comportamiento de dominios durante este plan.

## Pruebas de aceptación

- Un usuario sin `customDomain` no puede crear ni verificar dominios aunque invoque la acción/API directamente.
- Un hostname inválido, duplicado, ajeno o sin CNAME correcto no se activa.
- Un CNAME correcto cambia el estado esperado y permite servir únicamente el sitio publicado asociado.
- Un hostname verificado no puede ver otro sitio, la plataforma ni un borrador por manipular el `Host`.
- `/s/[slug]` sigue funcionando y permanece aislado de la resolución por dominio.
- HTTP redirige o se comporta según la política decidida; HTTPS obtiene certificado válido y se renueva.
- Un hostname no autorizado recibe rechazo de Caddy/TLS y no provoca emisión de certificado.
- Alta, verificación, publicación, despublicación, borrado y reinicio no dejan asociaciones inválidas.
- Las pruebas se ejecutan con `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` y una prueba manual en VPS con DNS real.

## Riesgos y controles

- **DNS/TLS depende de infraestructura externa:** staging con dominio real, logs y checklist de operación antes del lanzamiento.
- **Emisión TLS on-demand puede abusarse:** mantener la consulta de autorización estricta, limitar dominios permitidos y monitorear solicitudes.
- **Aislamiento por `Host` puede fallar en rutas auxiliares:** prueba específica de assets, APIs, cookies y formularios desde dominio personalizado.
- **PostgreSQL y cambios concurrentes pueden dejar estados inconsistentes:** transiciones idempotentes y backup/restauración probados.
- **La documentación previa declara dominios como pendientes:** actualizar referencias solo cuando las pruebas de VPS pasen; hasta entonces, comunicarlo como soporte parcial.
