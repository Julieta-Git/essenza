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

## Estado (2026-10-13)
**Implementado**
- Estructura completa: portada, familias, destacados, catálogo con filtros, ficha de perfume, cómo comprar, preguntas frecuentes, ubicación con mapa y WhatsApp flotante.
- Datos confirmados por el cliente: WhatsApp, Instagram, dirección, horario, medios de pago, envíos solo en Formosa.

**Pendiente del cliente**
- Logo (por ahora el nombre está en texto) y colores finales.
- Fotos de los perfumes y, por cada uno: marca, ml, género, familia, notas, temporada y duración. Los 15 perfumes con sus precios ya están cargados (13/10/2026).
- Confirmar el nombre comercial ("Essenza") y qué días abre (dijo "de 8 a 20").
- Confirmar si las cuotas con Mercado Pago tienen recargo.
- Revisar las descripciones de las familias y las respuestas de las preguntas frecuentes.

**Pendiente técnico**
- Crear el sitio en Netlify y conectar el dominio cuando lo registre.
- Probar en un celular Android real.
