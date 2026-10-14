# Essenza · Perfumes árabes en Formosa

Landing con catálogo de perfumes organizada por **familia olfativa** (propuesta B), con filtros secundarios por género y temporada. Las consultas van por WhatsApp.

- **Stack:** HTML, CSS y JS sin dependencias ni build. Se publica tal cual en Netlify.
- **Datos:** todo el catálogo vive en `products.js` (`CONFIG`, `FAMILIAS`, `CATALOGO`).
- **Fotos:** van en `assets/perfumes/`. Si una foto falta, se muestra "Foto próximamente".

## Cómo actualizar los perfumes del mes
1. Abrí `products.js`.
2. Editá, agregá o borrá objetos en `CATALOGO` (la forma de cada uno está explicada arriba del archivo).
3. Subí las fotos nuevas a `assets/perfumes/` (preferentemente .webp, vertical 4:5, unos 800 px de ancho).
4. Commit y push: GitHub Pages publica solo.

Las familias que no tengan perfumes cargados no se muestran, así que no hace falta borrarlas.

## Probar en local
Abrí `index.html` en el navegador, o usá `npx serve .` para verlo como en el servidor.

## Estado (2026-10-14)
**Implementado**
- Estructura completa: portada, familias, destacados (oculto hasta elegir cuáles), catálogo con filtros, ficha de perfume, cómo comprar, preguntas frecuentes, ubicación con mapa y WhatsApp flotante.
- Logo real, 11 fotos y notas (salida, corazón, fondo) de las fichas del cliente.
- Datos confirmados por el cliente: WhatsApp, Instagram, dirección, horario, medios de pago, envíos solo en Formosa, los 15 precios (13/10/2026).
- Pasada de calidad (impeccable): accesibilidad (botones de 44 px, cierre con ícono y etiqueta), tipografía Jost, filtros en filas en compu, familias con los nombres de sus perfumes, datos para Google (JSON-LD de comercio) y aviso si el navegador no tiene JavaScript.

- Encontrá tu perfume: 3 preguntas (para quién, cuándo lo usa, qué aroma) que recomiendan hasta 3 perfumes en stock y arman el mensaje de WhatsApp.
- Link propio por perfume (`#perfume/asad-bourbon`) que abre su ficha, y botón Compartir (en el celular abre el menú de compartir; en la compu copia el link).
- Foto de frasco en la portada (por ahora la de Asad Elixir, hasta tener una foto propia del local).
- Buscador "¿Usás un perfume de diseñador?": aparece solo cuando algún perfume tiene `inspiradoEn` cargado.
- Ficha con pirámide olfativa (salida, corazón, fondo) y barra de duración, que aparece cuando se carga `duracion`.

**Pendiente del cliente**
- Perfume de diseñador al que se parece cada uno (campo `inspiradoEn`), solo los que él confirme.
- Una foto propia para la portada (frasco o local, fondo oscuro, vertical).
- Notas y foto de Badee Al Oud Honor and Glory. Confirmar familia y temporada de Sublime y Kobra (notas tomadas de Fragrantica).
- ml y duración de cada perfume, y cuáles van como destacados.
- Confirmar género, familia y temporada de cada uno (los propuse a partir de las notas) y las marcas de Hawas (Rasasi) y Badee Al Oud (Lattafa).
- Confirmar el nombre comercial ("Essenza Perfume" o "Perfumes") y qué días abre (dijo "de 8 a 20").
- Confirmar si las cuotas con Mercado Pago tienen recargo.
- Revisar las descripciones de las familias y las respuestas de las preguntas frecuentes.

**Pendiente técnico**
- Con dominio: poner la URL completa en `og:image` para que WhatsApp muestre la vista previa. La vista previa es la misma para todo el sitio; una imagen distinta por perfume necesitaría una página por perfume.
- Crear el sitio en Netlify y conectar el dominio cuando lo registre.
- Probar en un celular Android real.
