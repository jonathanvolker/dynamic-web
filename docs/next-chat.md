# Handoff completo del proyecto Forma

Fecha de referencia: 2 de octubre de 2026.

Este documento resume el estado general del proyecto para continuar en otro chat sin perder contexto.

## 1. Producto

Forma es una plataforma multisitio para que una persona se registre, cree un sitio desde una plantilla, edite contenido, guarde un borrador, publique una versión independiente y reciba contactos.

El proyecto ya supera la etapa de maqueta visual. Es un MVP funcional local y desplegable, pero todavía está en estabilización antes de comercializar suscripciones automáticas y dominios propios.

## 2. Estado funcional actual

### Implementado

- Next.js 15, React 19, TypeScript y Node 22.23+.
- Registro, login, logout y sesiones con tokens hash.
- Contraseñas con `scrypt`.
- Dashboard privado y sitios aislados por propietario.
- Creación desde plantilla o base simple.
- Tres familias visuales y nueve plantillas públicas.
- Editor visual por bloques y 21 tipos de bloque.
- Preview en iframe, vista escritorio y móvil.
- Agregar, duplicar, eliminar y reordenar secciones.
- Papelera roja por sección con modal de confirmación.
- Undo y redo.
- Autoguardado y recuperación local.
- Separación entre borrador y publicación.
- Publicación mediante `/s/[slug]` y despublicación.
- Imágenes WebP fuera del JSON con control de propietario.
- Formularios de contacto y newsletter.
- Persistencia de leads en SQLite.
- Bandeja de leads en `/dashboard/leads`.
- Notificaciones internas y rate limiting persistente.
- Auditoría de CTA y enlaces en `docs/cta-audit.md`.
- Planes iniciales y suscripciones manuales.
- Panel administrativo en `/admin/platform`.
- CI/CD hacia GHCR y VPS.

### Verificado localmente

- En esta revisión pasaron `npm run typecheck`, `npm test` (11 pruebas), `npm run build` y `npm run test:e2e` (10 recorridos). Docker no está instalado en este entorno, por lo que Compose queda pendiente de validación con el binario correspondiente.
- Los E2E fueron ampliados, pero la última versión debe ejecutarse contra un build de producción.

## 3. Familias y plantillas

### Editorial creativo

- Forma: `studio`.
- Brasa: `restaurant`.
- Nexo: `consultant`.

### Inmersivo fotográfico

- Alba: `retreat`.
- Marea: `coast`.
- Línea: `atelier`.

### Modular producto

- Vector: `product`.
- Nimbus: `launch`.
- Escala: `scale`.

Las plantillas se visitan sin autenticación en `/templates` y `/templates/[template]`.

## 4. Bloques disponibles

- Portada.
- Servicios.
- Proyectos.
- Nosotros.
- Preguntas.
- Contacto.
- Galería.
- Testimonios.
- Planes y precios.
- CTA destacado.
- Texto + imagen.
- Video o embed.
- Logos de clientes.
- Equipo.
- Estadísticas.
- Proceso.
- Comparativa de planes.
- Formulario de contacto.
- Newsletter.
- Carta gastronómica.
- Horarios y ubicación.

La composición libre con elementos anidados todavía no existe.

## 5. Editor

El panel lateral tiene tres pestañas: `Secciones`, `+ Agregar` y `Estilos`. `Estilos` reemplazó al nombre anterior `Identidad y ajustes`.

Correcciones recientes:

- Fallback para generar IDs cuando `crypto.randomUUID()` no está disponible.
- Agregar bloque selecciona automáticamente la nueva sección.
- El error al agregar queda visible en el panel lateral.
- Undo/redo conserva la sección activa cuando es posible.
- Reordenar conserva la selección salvo que se mueva la sección seleccionada.
- Eliminar desde tarjeta usa modal.
- No se puede eliminar la última sección.
- Campos nuevos de formulario nacen con tipo `text`.
- Logos y equipo admiten carga de imágenes.
- Enlaces opcionales vacíos no muestran falsos errores.
- Botones internos declaran `type="button"`.
- Tabs móviles tienen estado activo y `aria-selected`.
- Preview tiene un ancho máximo menor y controles más visibles.
- El editor avisa antes de salir con cambios no guardados.
- Hay prueba E2E para una web con solo portada.

Riesgos pendientes:

- No hay control de concurrencia entre dos pestañas.
- Autoguardado y guardado manual necesitan una prueba E2E de carrera.
- El iframe no tiene sandbox completo.
- El reordenamiento táctil no está resuelto.
- Los errores aparecen principalmente al guardar y no junto a cada campo.
- El historial no agrupa escritura carácter por carácter.
- El toolbar móvil requiere revisión visual adicional.

## 6. Guardado y publicación

El flujo es:

```text
Editor -> saveSite -> sesión/ownership -> validateSite -> SQLite
```

Guardar modifica únicamente `draft`. Publicar copia el documento validado a `published`. La web pública renderiza únicamente `published` desde `/s/[slug]`.

La URL de MVP tiene este formato de ejemplo:

```text
https://tu-dominio.com/s/nombre-del-sitio-abc123
```

La URL corta `dominio.com/nombre-del-sitio` todavía no está implementada.

Prueba pendiente obligatoria en VPS:

1. Crear sitio.
2. Editar título.
3. Guardar.
4. Confirmar persistencia del borrador.
5. Publicar.
6. Abrir `Ver sitio`.
7. Confirmar la URL pública.
8. Modificar el borrador sin publicar.
9. Confirmar que la web pública no cambia.
10. Publicar nuevamente y confirmar actualización.
11. Despublicar y confirmar `404`.
12. Probar un sitio con solo portada.

## 7. Medios

Los medios nuevos se reciben por `POST /api/platform/media`, aceptan JPG/PNG/WebP de hasta 8 MB, se convierten a WebP con Sharp, conservan transparencia, se guardan en `data/media` y se validan por propietario.

Se soportan imágenes en logo, portada, nosotros, texto + imagen, proyectos, galería, logos y equipo.

Falta biblioteca de medios, eliminación de archivos sin uso, cuotas reales y limpieza segura.

## 8. Leads y formularios

Los formularios públicos incluyen validación server-side, honeypot, contacto, newsletter, bandeja por propietario, contador de no leídos, notificación interna y rate limiting persistente.

Límites actuales:

- Contacto: 5 envíos por sitio, tipo e IP cada 15 minutos.
- Newsletter: 3 envíos por sitio, tipo e IP cada 15 minutos.

Faltan notificaciones por email y exportación de leads.

## 9. Planes y suscripciones

La primera versión es manual, sin proveedor de pagos.

Planes sembrados:

- `free`: 1 sitio, 250 MB, sin dominio propio.
- `starter`: 3 sitios, 2 GB, sin dominio propio.
- `pro`: 10 sitios, 10 GB, dominio propio permitido.

Cada usuario nuevo recibe una suscripción `free` activa. El panel `/admin/platform` permite ver usuarios y cambiar manualmente plan y estado.

Estados disponibles: `active`, `trialing`, `past_due`, `canceled`, `unpaid`.

El acceso administrador se configura con:

```dotenv
PLATFORM_ADMIN_EMAILS=admin@dominio.com
```

Todavía faltan límites reales, página `/planes`, checkout, integración de Mercado Pago o Stripe, webhooks, renovaciones, cancelaciones e impagos automáticos.

## 10. Despliegue VPS

El flujo configurado es GitHub Actions -> GHCR -> SSH -> Docker Compose -> Caddy -> Next.js. La ejecución y la restauración de datos en un VPS deben verificarse operativamente.

El workflow ejecuta verificación en PR y construye/despliega con push o merge a `main`. La imagen debe usar `target: runner`, no `migration`.

Persistencia actual:

- SQLite en `/app/data`.
- Medios en `/app/data/media`.
- Volumen Docker `forma_data`.

Caddy actualmente resuelve un dominio principal y hace reverse proxy a Next.js. Dominios personalizados todavía no están implementados.

## 11. Base de datos

SQLite contiene `users`, `sessions`, `sites`, `media`, `leads`, `lead_notifications`, `lead_rate_limits`, `plans` y `subscriptions`.

La inicialización crea tablas, planes y suscripciones gratuitas faltantes automáticamente.

Para una etapa comercial seria se recomienda migrar usuarios, sitios, leads, medios y suscripciones a PostgreSQL.

## 12. Próximo orden de trabajo

### Prioridad 1: auditoría de producción

- Ejecutar E2E actualizado contra build de producción.
- Probar editor en VPS.
- Probar agregar los 21 bloques.
- Probar eliminar hasta dejar solo portada.
- Probar guardar, publicar y despublicar.
- Probar formularios y leads.
- Revisar consola del navegador y logs Docker.

### Prioridad 2: límites comerciales

- Aplicar límites del plan Gratis.
- Mostrar estado y límites en dashboard.
- Crear página de planes.
- Permitir solicitud manual de upgrade.
- Registrar historial administrativo.

### Prioridad 3: pagos

- Elegir Mercado Pago o Stripe.
- Crear checkout.
- Crear webhooks.
- Actualizar suscripciones desde eventos del proveedor.
- Implementar cancelación e impagos.

### Prioridad 4: dominios

- Mantener `/s/[slug]` como URL inicial.
- Agregar dominios registrados por sitio.
- Verificar DNS.
- Resolver por header `Host`.
- Configurar HTTPS automático en Caddy.

### Prioridad 5: plataforma operable

- PostgreSQL.
- Backups probados.
- Recuperación de contraseña.
- Verificación de email.
- Monitoreo y alertas.
- Control de concurrencia.
- Historial persistente.

## 13. Regla para el próximo chat

No agregar más plantillas ni variaciones visuales antes de completar auditoría de producción, estabilidad del editor, publicación comprobada, límites de planes y suscripciones operativas.
