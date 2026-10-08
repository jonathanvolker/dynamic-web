# PostgreSQL único

## Estado actual

La migración de la plataforma a PostgreSQL está implementada para una instalación limpia. No se copian registros desde SQLite porque no hay datos productivos que conservar.

La plataforma y Payload usan la misma instancia PostgreSQL, con modelos separados:

- Payload administra sus propias tablas y migraciones.
- Forma administra las tablas `platform_*` mediante repositorios PostgreSQL.
- Las identidades de Payload y de la plataforma no están unificadas.

## Comandos

Aplicar el esquema de Forma:

```bash
DATABASE_URI=postgresql://forma:password@localhost:5432/forma npm run migrate:platform
```

Aplicar también las migraciones de Payload:

```bash
npm run migrate
```

En producción, el servicio Compose `migrate` ejecuta ambos comandos en ese orden:

```bash
docker compose -f compose.production.yaml --profile tools run --rm migrate
```

El workflow de GitHub Actions lo ejecuta automáticamente antes de levantar `app`.

## Despliegue limpio

1. Crear `POSTGRES_PASSWORD` como secret de GitHub.
2. Configurar `PAYLOAD_SECRET`, `DOMAIN`, `PUBLIC_URL` y el resto de secrets del deploy.
3. Hacer push a `main`.
4. GitHub Actions publica la imagen de aplicación y la imagen `migration-main`.
5. El VPS crea PostgreSQL, espera el healthcheck y ejecuta ambas migraciones.
6. Compose levanta la aplicación y Caddy.

No se deben ejecutar estas migraciones contra otra base sin confirmar primero `DATABASE_URI` y las credenciales del entorno.

## Migraciones futuras

`migrate-platform-postgres.ts` aplica el esquema base con `CREATE TABLE IF NOT EXISTS` y registra la versión inicial. Los cambios futuros de `platform_*` deben agregar versiones explícitas e idempotentes a ese mecanismo antes de desplegar cambios de repositorio.

## Pendientes

- Decidir si Payload y la plataforma compartirán identidad.
- Definir si Payload administrará sitios o seguirá siendo CMS complementario.
- Persistir y respaldar explícitamente los media de Payload.
- Probar backup y restauración de PostgreSQL y filesystem.
