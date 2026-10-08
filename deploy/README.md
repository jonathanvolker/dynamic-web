# Despliegue en VPS

El workflow `.github/workflows/deploy.yml` verifica typecheck, tests unitarios y build. En pushes a `main` publica dos imágenes en GHCR:

- `dynamic-web:main`: aplicación compilada.
- `dynamic-web:migration-main`: scripts, código fuente y dependencias para migraciones.

Después copia Compose y Caddy al VPS, ejecuta las migraciones y recién entonces levanta la aplicación.

## Preparar el VPS una vez

Instalar Docker Engine, Compose Plugin y crear el directorio de deploy:

```bash
apt update
apt install -y ca-certificates curl docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
mkdir -p /opt/forma
```

No es necesario crear manualmente el `.env`: GitHub Actions lo escribe con permisos `0600` en cada deploy.

## GitHub Secrets

Crear un environment `production` con:

```text
VPS_HOST
VPS_USER
DEPLOY_PATH
VPS_SSH_KEY
VPS_KNOWN_HOSTS
GHCR_USERNAME
GHCR_TOKEN
POSTGRES_PASSWORD
DOMAIN
PUBLIC_URL
PAYLOAD_SECRET
COOKIE_SECURE
TRUST_PROXY_HEADERS
PLATFORM_ADMIN_EMAILS
PLAN_INITIAL_PRICE_ARS
PLAN_PROFESSIONAL_PRICE_ARS
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_WEBHOOK_SECRET
MERCADOPAGO_SANDBOX
FORMA_CNAME_TARGET
```

`POSTGRES_PASSWORD` es obligatorio para crear el contenedor PostgreSQL. `PAYLOAD_SECRET` debe ser aleatorio y tener al menos 32 caracteres. No subir secretos, `.env`, claves privadas ni tokens al repositorio.

## Primer deploy

El push a `main` ejecuta este flujo:

1. Construye y publica las imágenes `main` y `migration-main`.
2. Copia `compose.production.yaml` y `Caddyfile` al VPS.
3. Escribe el `.env` productivo.
4. Hace login en GHCR y descarga las imágenes.
5. Crea PostgreSQL y espera el healthcheck.
6. Ejecuta `migrate:platform` y `payload migrate`.
7. Levanta `app`, Caddy y PostgreSQL.

No hay migración de datos desde SQLite. La instalación PostgreSQL se crea limpia.

## Deploys posteriores

El mismo flujo se ejecuta en cada push. Las migraciones son idempotentes y Payload solo aplica migraciones pendientes. No hay que ejecutar comandos manualmente ni eliminar el paso de migración del workflow.

## Persistencia

- PostgreSQL: volumen `forma_postgres_data`.
- Media de la plataforma: volumen `forma_data`, montado en `/app/data`.
- Caddy: volúmenes `caddy_data` y `caddy_config`.

Los backups productivos deben incluir PostgreSQL, `/app/data`, la configuración de Caddy y los secretos necesarios para restaurar. Los media administrados por Payload requieren una política de volumen separada si se usan.

## Diagnóstico

```bash
cd /opt/forma
docker compose -f compose.production.yaml ps
docker compose -f compose.production.yaml logs --tail=200 db
docker compose -f compose.production.yaml logs --tail=200 app
```

Si falla una migración, no borrar volúmenes. Revisar `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, disponibilidad de PostgreSQL y que exista la imagen `:migration-main` del mismo deploy.
