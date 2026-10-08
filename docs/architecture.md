# Arquitectura del proyecto

La unidad de organización es la funcionalidad. La plataforma de Forma y el CMS de Payload comparten PostgreSQL, pero mantienen modelos e identidades separados.

## Estructura

```text
src/app/                 Rutas, layouts y APIs de Next.js
src/features/auth/       Registro, login, sesiones y usuarios de la plataforma
src/features/sites/      Sitios, borradores, publicación, leads y media
src/features/editor/     Editor, campos, historial y estilos
src/features/website/    Renderizado público y contratos de bloques
src/features/templates/  Catálogo y contenido de plantillas
src/features/billing/    Planes, suscripciones y Mercado Pago
src/features/domains/    Dominios personalizados y verificación DNS
src/features/cms/        Configuración aislada de Payload
src/server/db/postgres.ts Pool PostgreSQL compartido
src/server/db/postgres-schema.sql Esquema de tablas platform_*
src/server/rate-limit.ts Rate limiting PostgreSQL con fallback local
```

## Persistencia

La plataforma usa tablas con prefijo `platform_`:

- `platform_users`, `platform_sessions` y `platform_sites`.
- `platform_media`, `platform_leads` y `platform_lead_notifications`.
- `platform_plans`, `platform_subscriptions` y `platform_billing_events`.
- `platform_domains`, `platform_distributed_rate_limits` y `platform_lead_rate_limits`.

Payload usa sus propias tablas en la misma base mediante `@payloadcms/db-postgres`. Un usuario de `platform_users` no es automáticamente un usuario de Payload.

El esquema de Forma se aplica con:

```bash
npm run migrate:platform
```

Las migraciones de Payload se aplican con:

```bash
npm run migrate
```

No existe actualmente un proceso de migración de registros desde SQLite. La instalación PostgreSQL se inicia limpia.

## Flujo de publicación

`Editor -> saveSite -> validación -> platform_sites.draft`

`Publicar -> platform_sites.published -> /s/[slug]`

Guardar modifica únicamente el borrador. Publicar copia el documento a `published`. Los documentos nuevos incluyen `schemaVersion`, `familyId` y `templateId`; los documentos anteriores se normalizan al leerlos.

## Media

Las imágenes se procesan con Sharp, se convierten a WebP y se guardan en:

```text
PLATFORM_DATA_DIR/media/
```

La metadata y el propietario se guardan en `platform_media`. Los archivos son inmutables; eliminar una referencia del editor no elimina automáticamente el archivo.

## Bloques

`features/website/blocks.ts` es el catálogo compartido de los 22 bloques. Editor, validación, Payload y renderizador público consumen los mismos contratos.

Para agregar un bloque:

1. Definir el contrato en `features/website/types.ts`.
2. Crear el renderizador en `features/website/components/sections`.
3. Agregar defaults y registrarlo en el catálogo.
4. Agregar campos del inspector y validación server-side.
5. Actualizar Payload y ejecutar `npm run check:cms-catalog`.

## Dominios

Los dominios personalizados se guardan en `platform_domains`. El flujo actual admite hostname, verificación CNAME manual y autorización de Caddy mediante `/api/domains/allow`. El soporte de dominio raíz, DNS gestionado y la operación con dominios reales todavía requiere validación en VPS.

## Rate limiting

El rate limiting distribuido usa PostgreSQL. Si la base no está disponible, se usa un mapa local limitado a la instancia. En producción, `TRUST_PROXY_HEADERS=true` solo debe habilitarse detrás de Caddy o un proxy que reescriba los headers.
