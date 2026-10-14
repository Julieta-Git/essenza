# Essenza · Perfumes árabes en Formosa

Landing con catálogo de perfumes organizada por **familia olfativa** (propuesta B), con filtros secundarios por género y temporada. Las consultas van por WhatsApp.

- **Stack:** HTML, CSS y JS sin dependencias ni build. Se publica tal cual en Netlify.
- **Datos:** todo el catálogo vive en `products.js` (`CONFIG`, `FAMILIAS`, `CATALOGO`).
- **Fotos:** van en `assets/perfumes/`. Si una foto falta, se muestra "Foto próximamente".

## Cómo actualizar los perfumes del mes
1. Abrí `products.js`.
2. Editá, agregá o borrá objetos en `CATALOGO` (la forma de cada uno está explicada arriba del archivo).
3. Si cambiaste precios, actualizá `CONFIG.preciosActualizados` (por ejemplo `"15/11/2026"`).
4. Subí las fotos nuevas a `assets/perfumes/` (preferentemente .webp, vertical 4:5, unos 800 px de ancho).
5. Commit y push: Netlify publica solo.

Las familias que no tengan perfumes cargados no se muestran, así que no hace falta borrarlas.

## Probar en local
Abrí `index.html` en el navegador, o usá `npx serve .` para verlo como en el servidor.

## Estado (2026-10-14)
**Implementado**
- Estructura completa: portada, familias, destacados (oculto hasta elegir cuáles), catálogo con filtros, ficha de perfume, cómo comprar, preguntas frecuentes, ubicación con mapa y WhatsApp flotante.
- Logo real, 11 fotos y notas (salida, corazón, fondo) de las fichas del cliente.
- Datos confirmados por el cliente: WhatsApp, Instagram, dirección, horario, medios de pago, envíos solo en Formosa, los 15 precios (13/10/2026).
- Pasada de calidad (impeccable): accesibilidad (botones de 44 px, cierre con ícono y etiqueta), tipografía Jost, filtros en filas en compu, familias con los nombres de sus perfumes, datos para Google (JSON-LD de comercio) y aviso si el navegador no tiene JavaScript.

**Pendiente del cliente**
- Notas y foto de Badee Al Oud Sublime, Hawas Kobra y Badee Al Oud Honor and Glory; foto de Club de Nuit Untold.
- ml y duración de cada perfume, y cuáles van como destacados.
- Confirmar género, familia y temporada de cada uno (los propuse a partir de las notas) y las marcas de Hawas (Rasasi) y Badee Al Oud (Lattafa).
- Confirmar el nombre comercial ("Essenza Perfume" o "Perfumes") y qué días abre (dijo "de 8 a 20").
- Confirmar si las cuotas con Mercado Pago tienen recargo.
- Revisar las descripciones de las familias y las respuestas de las preguntas frecuentes.

**Pendiente técnico**
- Crear el sitio en Netlify y conectar el dominio cuando lo registre.
- Probar en un celular Android real.
