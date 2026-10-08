# Auditoría del editor

Fecha de revisión documental: 2 de octubre de 2026. Los estados “Funciona” describen el código y los E2E existentes; no equivalen a una verificación del VPS.

Este documento complementa `docs/next-chat.md` y concentra los controles del editor.

| Control | Estado actual | Evidencia o próxima verificación |
| --- | --- | --- |
| Editar campos de texto | Funciona | Límites y errores por campo |
| Preview en vivo | Funciona | Sesión vencida y errores |
| Agregar bloques | Corregido con fallback de ID | Probar en VPS |
| Duplicar sección | Funciona | Límite y selección |
| Eliminar sección | Funciona con modal | Caso solo portada |
| Eliminar última sección | Bloqueado | Confirmar mensaje |
| Reordenar con mouse | Funciona | Mantener selección |
| Reordenar táctil | Parcial | Resolver alternativa táctil |
| Undo/redo | Corregido parcialmente | E2E de contexto seleccionado |
| Guardar borrador | Funciona | Carrera con autoguardado |
| Publicar | Funciona en flujo normal | Validar en VPS |
| Autoguardado | Funciona | Requests simultáneos |
| Recuperación local | Funciona | Snapshot corrupto y conflicto |
| Estilos | Funciona | Responsive y accesibilidad |
| Imágenes generales | Funciona | Cuotas y limpieza |
| Imágenes de logos/equipo | Agregado | Probar upload y publicación |
| Links internos | Funciona | Sección eliminada |
| Links externos | Funciona | Protocolos y feedback |
| Formularios | Funciona | Campo nuevo sin editar |
| Newsletter | Funciona | Rate limit |

## Pruebas obligatorias

- Agregar cada uno de los 21 bloques.
- Editar campos simples y listas.
- Subir imágenes en todos los tipos soportados.
- Eliminar todas las secciones salvo portada.
- Guardar y publicar una portada sola.
- Deshacer y rehacer cambios de texto, orden y eliminación.
- Editar durante un guardado pendiente.
- Recargar después de autoguardado.
- Probar editor a 390 px.

## Verificación pendiente de entorno

- En este checkout pasaron `npm run typecheck`, `npm test`, `npm run build` y `npm run test:e2e`.
- Repetir el recorrido de publicación, medios y leads en el VPS.
- Verificar reinicio del contenedor y persistencia de `/app/data`.
