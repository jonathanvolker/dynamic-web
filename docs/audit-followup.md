# Auditoría de integridad y tareas de endurecimiento

Última auditoría: 2026-10-08.

## Resultado verificable

No se declara corrección matemática del 100%. El proyecto fue revisado por áreas y se corrigieron los defectos reproducibles encontrados. La cobertura automatizada actual es:

- `npm run typecheck`: aprobado.
- `npm test`: 27 tests aprobados.
- `npm run test:e2e`: 13 tests aprobados.
- `npm run build`: aprobado.
- `git diff --check`: aprobado.

## Trabajo completado

### Editor y documento

- Inserción de nuevas secciones antes del footer.
- Protección de la última sección de contenido.
- Reordenamiento impedido contra bloques conservados por plan.
- Enlaces internos sin opción inválida hacia `#footer`.
- Campo `type` de formularios sin input duplicado.
- Alta y baja de enlaces del footer desde el inspector.
- Validación de campos opcionales del footer.
- Autosave protegido contra snapshots obsoletos.
- Preview del footer visible solo cuando el bloque activo es el footer.

### Seguridad y abuso

- Rate limit de login con backoff exponencial y limpieza en login correcto.
- Payload de leads limitado a 128 KB y 20 claves.
- Valores de leads limitados a strings de 5000 caracteres.
- Rate limit de leads con upsert atómico.
- Cuotas de media por plan.
- Límite de imagen de 8 MB y 40 megapíxeles.
- Concurrencia de procesamiento de imágenes limitada.
- Cookies `secure` forzadas en producción.
- CMS restringido a administradores para escritura.
- Suscripción local requerida para servir sitios públicos.
- Webhook de Mercado Pago con ventana temporal y vínculo contra suscripción local.
- Cancelación de Mercado Pago sin reactivar ni sobrescribir la suscripción.

### Dominios y persistencia

- Validación y normalización estricta de hostnames.
- Entitlement Profesional requerido para crear/verificar dominios.
- Transición de dominio `pending` a `verified` controlada e idempotente.
- Migraciones PostgreSQL versionadas e idempotentes para las tablas `platform_*`.
- Tolerancia a JSON corrupto de sitios y leads.

### CMS y cobertura

- Catálogo CMS alineado con los 22 bloques modernos.
- Matriz E2E de alta, edición, preview y persistencia de bloques.
- Pruebas de límites de planes y dominios.
- Modal de proyectos accesible.
- Galería navegable por teclado y con semántica de carrusel.
- Labels, IDs y `autocomplete` en formularios.
- E2E de foco, diálogo y navegación de galería.
- CI ejecuta E2E después del build.

## Pendientes explícitos

### Alta prioridad operativa

- Configurar rate limiting distribuido por IP confiable o proxy, porque el login actual limita por email normalizado y no impide ataques distribuidos.
- Definir cuotas de media a nivel de infraestructura, incluyendo almacenamiento total del volumen, backup y limpieza de archivos huérfanos.
- Limitar el endpoint de leads en el proxy/WAF además del límite de aplicación.
- Auditar la configuración real de Caddy y `x-forwarded-for`; ningún endpoint debe confiar en headers que el proxy no reescriba.
- Aplicar y verificar la migración de Payload en producción después de ampliar su catálogo.

### Cobertura pendiente

- Tests de API de media para sesión ausente, MIME real inválido, archivo mayor a 8 MB, Sharp fallido y acceso cross-account.
- Tests de leads concurrentes y rate limit en una base aislada.
- Tests de estados de billing con fechas vencidas, gracia, cancelación y renovación.
- Tests de webhook con replay, suscripción no vinculada y referencia manipulada.
- Tests de dominios con DNS correcto/incorrecto, duplicados, ownership y hostname personalizado completo.
- Tests de administración de suscripciones y actualización del período.
- Tests de aislamiento entre cuentas para sitios, leads, media y dominios usando IDs manipulados.
- Tests de rollback y compatibilidad sobre una base PostgreSQL existente de cada versión.

### Accesibilidad pendiente

- Ejecutar axe/Lighthouse en CI.
- Revisión manual con lector de pantalla.
- Verificación de contraste de paletas y estados disabled/focus.
- Pruebas de Firefox/WebKit y navegación sin JavaScript.
- Verificación específica de prefers-reduced-motion.

## Criterio para cerrar la auditoría

La auditoría puede considerarse cerrada cuando los pendientes de alta prioridad tengan pruebas automatizadas o controles operativos verificables. Mientras exista una dependencia de configuración externa, DNS, WAF, Mercado Pago, Payload o revisión manual de accesibilidad, el resultado debe expresarse como “verificado dentro del alcance automatizado”, no como garantía absoluta.
