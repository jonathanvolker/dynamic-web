# Rate limiting y proxy

La aplicación aplica límites en dos capas:

- **Proxy/WAF:** Caddy limita el cuerpo de `POST /api/public/leads` a 128 KB. El límite de solicitudes por IP debe configurarse en el WAF o CDN.
- **Aplicación:** `src/server/rate-limit.ts` usa PostgreSQL mediante `platform_distributed_rate_limits` y `platform_lead_rate_limits`.

Si PostgreSQL no está disponible, el store usa un mapa local acotado a 10.000 buckets. Ese fallback protege únicamente la instancia actual y no reemplaza el límite distribuido.

## Headers confiables

Caddy sobrescribe `X-Forma-Client-IP`, `X-Real-IP` y `X-Forwarded-For`. La aplicación solo lee esos headers cuando:

```env
TRUST_PROXY_HEADERS=true
```

No se debe activar esa variable exponiendo Next directamente a Internet ni aceptar headers enviados por clientes sin un proxy que los reescriba.

## Límites iniciales

| Ruta | Clave | Límite |
| --- | --- | --- |
| `/api/public/leads` | IP + sitio | 5 cada 15 minutos |
| Newsletter | IP + sitio | 3 cada 15 minutos |
| Login y autenticación | IP | 20 cada 15 minutos |
| `/api/platform/media` | IP + sesión | 30 cada 15 minutos |
| `/api/billing/mercadopago` | IP | 60 por minuto, además de validar firma |

El límite del cuerpo de leads está aplicado en `Caddyfile`; el límite de aplicación permanece como segunda validación.
