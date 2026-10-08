# Rate limiting y proxy

La aplicación aplica límites en dos capas:

- **Proxy/WAF:** Caddy limita el cuerpo de `POST /api/public/leads` a 128 KB. En producción se debe agregar el límite de solicitudes por IP en el WAF o CDN disponible, sin confiar en `X-Forwarded-For` enviado por el cliente. Como referencia inicial: leads, 5 solicitudes cada 15 minutos por IP y sitio; newsletter, 3 cada 15 minutos; login, 20 intentos cada 15 minutos por IP.
- **Aplicación:** `src/server/rate-limit.ts` expone `RateLimitStore`. Usa SQLite con upsert atómico cuando `PLATFORM_DATA_DIR` es persistente y compartido entre los procesos. Si SQLite no está disponible, cambia a un mapa local acotado a 10.000 buckets y conserva un límite seguro para esa instancia.

El store compartido no requiere Redis ni otro servicio. Si se ejecutan varias réplicas, deben montar el mismo backend de datos soportado por la aplicación; una base SQLite en un volumen local por réplica no es distribuida. En ese caso, el WAF debe seguir siendo la barrera global. No se agrega un servicio externo obligatorio.

## Headers confiables

Caddy sobrescribe `X-Forma-Client-IP`, `X-Real-IP` y `X-Forwarded-For` con la dirección que observa directamente. La aplicación solo lee esos headers cuando `TRUST_PROXY_HEADERS=true`; fuera de ese modo usa el bucket conservador `unknown`. Si hay un CDN delante de Caddy, el CDN debe reemplazar la dirección de cliente y su red debe estar explícitamente validada antes de activar esta variable.

Nunca se debe activar `TRUST_PROXY_HEADERS=true` exponiendo Next directamente a Internet ni aceptar esos headers desde clientes sin un proxy que los reescriba.

## WAF/proxy externo

Los límites de solicitudes no se declaran en el Caddyfile base porque Caddy no incluye rate limiting por contador en su imagen oficial. Configurarlos en el WAF/CDN o en una variante de Caddy con un módulo de rate limit, manteniendo estas rutas y límites mínimos:

| Ruta | Clave | Límite inicial |
| --- | --- | --- |
| `/api/public/leads` | IP + sitio | 5/15 min; newsletter 3/15 min |
| `/login` y acciones de autenticación | IP | 20/15 min |
| `/api/platform/media` | IP + sesión | 30/15 min |
| `/api/billing/mercadopago` | IP | 60/min, además de validar firma |

El límite de cuerpo de leads ya está aplicado en `Caddyfile`; el de la aplicación permanece como segunda validación para tráfico que evite o no tenga proxy.
