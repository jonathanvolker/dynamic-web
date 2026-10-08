# Migración a PostgreSQL único

## Estado

La primera etapa está implementada, pero la plataforma todavía no usa PostgreSQL en sus repositorios productivos. Como la instalación actual no tiene usuarios ni datos que conservar, no se hará una migración de registros: se creará una base PostgreSQL limpia y se cambiarán los repositorios directamente.

## Primera etapa implementada

- Pool PostgreSQL compartido en `src/server/db/postgres.ts`.
- Esquema inicial de plataforma en `src/server/db/postgres-schema.sql`.
- Tablas de plataforma con prefijo `platform_` para evitar colisiones con Payload.
- Migración idempotente: `npm run migrate:platform`.
- PostgreSQL agregado al compose de producción.
- Servicio `migrate` separado en el compose de producción con perfil `tools`.

## Modelo elegido

La misma base PostgreSQL contiene dos familias de tablas:

- Tablas internas de Payload, administradas por Payload.
- Tablas `platform_*`, administradas por los repositorios de Forma.

Esto unifica la infraestructura física sin forzar una incompatibilidad entre el modelo flexible de Payload y el modelo multi-tenant del editor. La unificación de identidad y contenido será una etapa posterior explícita.

## Orden de migración restante

1. Crear una instancia PostgreSQL de desarrollo o CI.
2. Ejecutar `npm run migrate:platform`.
3. Implementar repositorios PostgreSQL asíncronos detrás de interfaces comunes.
4. Migrar primero autenticación y sesiones.
5. Migrar sitios, publicaciones, media metadata, leads, dominios y billing.
6. Cambiar E2E e integración para usar PostgreSQL aislado.
7. Crear una cuenta y un sitio nuevos sobre PostgreSQL.
8. Retirar SQLite de los imports productivos.

## Comandos

Aplicar solo el esquema base de plataforma:

```bash
DATABASE_URI=postgresql://forma:password@localhost:5432/forma npm run migrate:platform
```

Aplicar el esquema de plataforma y luego las migraciones Payload:

```bash
docker compose -f deploy/compose.production.yaml --profile tools run --rm migrate
```

Estos comandos crean el esquema, pero no migran datos SQLite porque la instalación actual se iniciará limpia. No deben ejecutarse contra una base productiva sin la configuración correspondiente.

## Decisiones pendientes

- Unificar usuarios de Payload y usuarios de plataforma o mantenerlos como roles separados dentro de la misma base.
- Definir si Payload administrará sitios directamente o si seguirá siendo un CMS complementario.
- Migrar binarios de `data/media` a storage dedicado o conservar filesystem persistente.
- Convertir repositorios síncronos SQLite a repositorios asíncronos PostgreSQL.
- Elegir estrategia de tests PostgreSQL aislados por ejecución.
