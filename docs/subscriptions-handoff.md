# Handoff: Suscripciones, planes y límites

## Objetivo

Diseñar e implementar el sistema comercial de la plataforma Forma sin acoplarlo a un proveedor de cobros. Stripe queda fuera de la implementación inmediata, pero la arquitectura debe permitir agregar Mercado Pago, Stripe u otros proveedores en el futuro sin modificar el editor, la PWA ni el frontend principal.

## Decisión de producto actual

El período inicial será una prueba gratuita de 30 días sin límite de publicaciones. El objetivo es permitir que el usuario conozca el producto, cree su sitio y publique sin fricción.

La diferenciación entre planes se hará principalmente mediante la cantidad de componentes/bloques disponibles, no mediante un límite artificial de publicaciones durante el trial.

Propuesta inicial a validar:

| Plan | Precio | Sitios | Publicaciones | Componentes | Dominio personalizado |
| --- | --- | ---: | --- | ---: | --- |
| Prueba / Gratis | 30 días sin costo | 1 | Ilimitadas durante el trial | 3 | No |
| Inicial | USD 6/mes | 1 | Ilimitadas | 12 | No |
| Pro | Precio a definir | 3 | Ilimitadas | Todos | Sí |

No publicar precios definitivos hasta decidir el valor del plan Pro. El nombre final del plan de prueba también debe definirse: puede ser `Gratis`, `Prueba` o `Gratis por 30 días`.

## Componentes actuales

El catálogo actual tiene 21 bloques:

- `hero`: portada.
- `services`: servicios/beneficios.
- `projects`: proyectos/casos.
- `about`: nosotros/resultados.
- `faq`: preguntas frecuentes.
- `contact`: contacto.
- `gallery`: galería.
- `testimonials`: testimonios.
- `pricing`: planes y precios.
- `cta`: CTA destacado.
- `textImage`: texto + imagen.
- `video`: video o embed.
- `logos`: logos de clientes.
- `team`: equipo.
- `stats`: estadísticas.
- `process`: proceso.
- `comparison`: comparativa de planes.
- `form`: formulario de contacto.
- `newsletter`: newsletter.
- `menu`: carta gastronómica.
- `hours`: horarios y ubicación.

La matriz de componentes no debe elegirse solo por cantidad. Cada plan debe permitir construir una web útil y coherente.

### Propuesta de análisis para la matriz

El plan Gratis debe cubrir una web básica de presentación:

- `hero`
- `services`
- `about` o `projects`
- `contact`

Como el límite solicitado es de 3 componentes, se debe decidir si `hero` y `contact` son componentes obligatorios fuera de la cuota o si cuentan dentro de los tres. La recomendación es que `hero` sea obligatorio y que el plan tenga dos bloques adicionales elegibles, con un contacto básico incorporado en la estructura mínima.

El plan Inicial debe permitir webs comerciales completas para la mayoría de los clientes, con 12 bloques recomendados que incluyan:

- portada;
- servicios/beneficios;
- proyectos o galería;
- nosotros/resultados;
- testimonios;
- CTA;
- texto + imagen;
- formulario;
- horarios o ubicación;
- preguntas frecuentes;
- proceso;
- newsletter o menú según el rubro.

El plan Pro debe habilitar los 21 bloques, dominio personalizado, hasta 3 sitios y futuras capacidades avanzadas.

La selección final debe evaluarse sobre las nueve plantillas actuales. Ninguna plantilla debe contener bloques que el plan del usuario no pueda usar, salvo que esos bloques se reemplacen, se oculten o se conviertan en una composición permitida para ese plan.

## Plantillas por plan

Actualmente hay nueve plantillas:

- Editorial: `studio`, `restaurant`, `consultant`.
- Inmersivo: `retreat`, `coast`, `atelier`.
- Modular: `product`, `launch`, `scale`.

Antes de implementar límites, hay que relevar cada plantilla y clasificar sus bloques. Luego decidir:

1. Qué plantillas aparecen en el plan Gratis.
2. Qué plantillas aparecen en el plan Inicial.
3. Qué plantillas quedan exclusivas de Pro.
4. Cómo se comportan las plantillas existentes si un usuario baja de plan.
5. Si las plantillas deben venir ya adaptadas al límite del plan o si se debe impedir seleccionar componentes no disponibles.

Recomendación inicial:

- Gratis: acceso a una selección reducida de plantillas simples y composiciones de 3 bloques.
- Inicial: acceso a las nueve plantillas, pero con biblioteca limitada a 12 bloques.
- Pro: acceso a las nueve plantillas y los 21 bloques.

No se debe mostrar una plantilla con contenido imposible de conservar bajo el plan elegido. La creación debe clonar una versión compatible con el plan.

## Estado actual del código

El checkout actual no tiene todavía un módulo de billing completo:

- No existe actualmente una implementación consolidada de `features/billing`.
- SQLite contiene usuarios, sesiones, sitios, medios y leads, pero no un modelo completo de planes y suscripciones operativo.
- No existe trial aplicado.
- No existe contador de componentes por sitio.
- No existe enforcement server-side de planes.
- No existe checkout ni webhook.
- No existe dominio personalizado.

La documentación anterior sobre planes manuales debe considerarse diseño/historial hasta verificar nuevamente el código.

## Arquitectura requerida

La aplicación debe tener un modelo interno independiente del proveedor.

### Entidades internas mínimas

`plans`:

- identificador interno;
- nombre;
- precio de referencia;
- moneda;
- límite de sitios;
- límite de componentes/bloques permitidos;
- límite de publicaciones, actualmente ilimitado durante trial;
- permiso de dominio personalizado;
- estado activo.

`subscriptions`:

- usuario;
- plan interno;
- estado (`trialing`, `active`, `past_due`, `canceled`, `expired`);
- fecha de inicio;
- fecha de vencimiento del trial o período actual;
- proveedor (`manual`, `mercadopago`, `stripe`, futuro proveedor);
- moneda y precio contratado;
- ID externo de cliente;
- ID externo de suscripción;
- cancelación al final del período;
- fechas de creación y actualización.

`publication_usage` o equivalente:

- usuario o sitio;
- período;
- cantidad de publicaciones;
- última publicación.

`site` o documento del sitio:

- plan aplicado o plan heredado desde la cuenta;
- componentes usados;
- dominio personalizado y estado de verificación cuando corresponda.

La regla de acceso debe vivir en backend. Ocultar botones en React no es suficiente.

### Contrato de proveedores

Definir una interfaz interna similar a:

```text
createCheckout(user, plan, returnUrl)
handleWebhook(request)
cancelSubscription(subscription)
changePlan(subscription, plan)
createCustomerPortal(user)
```

El resto de la aplicación solo debe conocer el estado interno de la suscripción. No debe importar SDKs de proveedores desde el editor o la PWA.

## Flujo del trial

1. El usuario se registra.
2. Se crea una suscripción `trialing` por 30 días.
3. Se asigna un sitio como máximo.
4. Se permiten publicaciones ilimitadas durante el trial.
5. Se habilitan únicamente los componentes del plan Gratis.
6. El usuario puede editar y guardar borradores.
7. Antes de vencer el trial se muestra la oferta de actualización.
8. Al vencer el trial, se debe decidir entre:
   - pasar a modo bloqueado para publicación;
   - conservar el sitio publicado y bloquear nuevas publicaciones;
   - permitir únicamente lectura y exportación.

La recomendación es conservar visible la última publicación y bloquear nuevas publicaciones/creación de sitios hasta actualizar.

## Flujo de selección y activación

1. La home muestra los tres planes.
2. El usuario puede elegir un plan durante el registro o desde `/planes`.
3. El trial se activa automáticamente sin proveedor.
4. El usuario que quiere continuar elige Inicial o Pro.
5. Se selecciona un proveedor cuando exista más de uno.
6. El proveedor procesa el checkout.
7. El backend recibe y verifica el webhook.
8. La suscripción local pasa a `active`.
9. Se aplican los límites y capacidades del plan.
10. El usuario recibe acceso a la gestión de su suscripción.

Nunca se debe activar un plan pago solamente por el retorno del navegador desde el checkout.

## Dominios personalizados

El dominio personalizado debe ser una capacidad de Pro.

El cliente compra y conserva su dominio. La plataforma solo gestiona la vinculación.

Flujo mínimo:

1. El usuario agrega `www.cliente.com` en el panel.
2. La plataforma genera un token de verificación.
3. El usuario crea un CNAME apuntando al host de Forma.
4. La plataforma verifica DNS.
5. Se asocia el dominio al sitio.
6. El reverse proxy enruta por `Host`.
7. Se emite HTTPS.
8. Se muestra estado `pending`, `verified`, `active` o `error`.

El soporte de dominios raíz (`cliente.com`) requiere resolver registros A/ALIAS o utilizar un proveedor especializado. Debe implementarse después del flujo con `www`.

La PWA no debe acceder directamente a DNS ni a certificados. Todo debe ser backend/API.

## Orden de implementación

1. Confirmar nombres, límites y precio del plan Pro.
2. Definir si hero/contacto cuentan dentro del límite de componentes Gratis.
3. Crear la matriz formal de bloques por plan.
4. Clasificar las nueve plantillas por plan y crear composiciones compatibles.
5. Diseñar el modelo interno de planes, suscripciones, trial y uso.
6. Implementar enforcement server-side para sitios, bloques y publicaciones.
7. Agregar el bloque de precios a la home y crear `/planes`.
8. Agregar estado del plan y límites al dashboard/editor.
9. Preparar el contrato de proveedores sin integrar Stripe todavía.
10. Implementar dominios personalizados como módulo independiente de billing.
11. Agregar pruebas unitarias y E2E de límites, trial y downgrade.
12. Integrar el primer proveedor cuando se defina si será Mercado Pago u otro.
13. Agregar webhooks idempotentes y reconciliación de estados.

## Pruebas necesarias

- Registro crea trial de 30 días.
- Trial permite publicaciones ilimitadas.
- Trial permite solo los componentes autorizados.
- Gratis no puede superar un sitio.
- Inicial no puede usar componentes Pro.
- Pro puede usar los 21 bloques.
- Un bloque no permitido no puede guardarse mediante una request manipulada.
- Una plantilla incompatible no puede crearse.
- El vencimiento bloquea publicación según la política definida.
- Upgrade habilita capacidades sin perder contenido.
- Downgrade no borra automáticamente contenido; debe informar qué queda fuera del plan.
- Webhook duplicado no duplica suscripciones ni modifica incorrectamente el estado.
- El frontend/PWA funciona igual independientemente del proveedor.

## Administración

El administrador solicitado es:

```text
facundosvalit@gmail.com
```

Debe agregarse en GitHub Actions/VPS mediante `PLATFORM_ADMIN_EMAILS`. No guardar ese valor como secreto de código ni modificarlo desde el frontend.

## Restricciones

- No integrar Stripe todavía.
- No acoplar la PWA a un proveedor.
- No poner claves secretas en el repositorio.
- No modificar Compose o despliegue sin revisar qué arquitectura usa cada archivo.
- No aplicar límites solo en la UI.
- No borrar contenido de usuarios durante un downgrade sin una política explícita.
- No publicar precios definitivos hasta cerrar el plan Pro.
