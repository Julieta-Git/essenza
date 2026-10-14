/* Essenza · lógica del catálogo
   Lee CONFIG, FAMILIAS y CATALOGO de products.js. Sin dependencias. */
(function () {
  "use strict";

  const GENEROS = [
    { slug: "hombre", nombre: "Hombre" },
    { slug: "mujer", nombre: "Mujer" },
    { slug: "unisex", nombre: "Unisex" },
  ];
  const TEMPORADAS = [
    { slug: "verano", nombre: "Verano" },
    { slug: "invierno", nombre: "Invierno" },
    { slug: "todo-el-anio", nombre: "Todo el año" },
  ];
  const DURACIONES = { baja: "Baja", media: "Media", alta: "Alta" };

  const filtros = { familia: "", genero: "", temporada: "" };
  const $ = (sel) => document.querySelector(sel);

  /* ---------- utilidades ---------- */

  function urlWhatsapp(mensaje) {
    return `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
  }

  function nombreDe(lista, slug) {
    const item = lista.find((x) => x.slug === slug);
    return item ? item.nombre : slug;
  }

  function precioTexto(precio) {
    if (precio === null || precio === undefined || precio === "") return "Consultar precio";
    return "$ " + Number(precio).toLocaleString("es-AR");
  }

  function el(tag, props = {}, hijos = []) {
    const nodo = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") nodo.className = v;
      else if (k === "text") nodo.textContent = v;
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v);
    });
    (Array.isArray(hijos) ? hijos : [hijos]).forEach((h) => h && nodo.append(h));
    return nodo;
  }

  function fotoVacia() {
    return el("div", { class: "foto-vacia" }, el("div", {}, [el("span", { text: "E" }), document.createTextNode("Foto próximamente")]));
  }

  // Si la imagen no existe o falla, muestra el placeholder.
  function nodoImagen(perfume, clase) {
    const cont = el("div", { class: clase });
    if (!perfume.imagen) {
      cont.append(fotoVacia());
      return cont;
    }
    const img = el("img", { src: perfume.imagen, alt: perfume.marca ? `${perfume.nombre} de ${perfume.marca}` : perfume.nombre, loading: "lazy", decoding: "async" });
    img.addEventListener("error", () => img.replaceWith(fotoVacia()), { once: true });
    cont.append(img);
    return cont;
  }

  // "Marca · 100 ml", omitiendo lo que no esté cargado.
  function marcaYMl(perfume) {
    return [perfume.marca, perfume.ml ? `${perfume.ml} ml` : ""].filter(Boolean).join(" · ");
  }

  function mensajeConsulta(perfume) {
    const detalle = marcaYMl(perfume).replace(" · ", ", ");
    return `Hola, quiero consultar por el perfume ${perfume.nombre}${detalle ? ` (${detalle})` : ""}.`;
  }

  /* ---------- datos fijos de la página ---------- */

  function completarDatos() {
    document.querySelectorAll(".js-wa").forEach((a) => {
      a.href = urlWhatsapp(a.dataset.msg || "Hola, quiero hacer una consulta.");
    });
    document.querySelectorAll(".js-ig").forEach((a) => { a.href = CONFIG.instagram; });
    document.querySelectorAll(".js-direccion").forEach((n) => { n.textContent = CONFIG.direccion; });
    document.querySelectorAll(".js-horario").forEach((n) => { n.textContent = CONFIG.horario; });
    if (CONFIG.preciosActualizados) {
      const p = $("#precios-fecha");
      p.textContent = `Precios actualizados al ${CONFIG.preciosActualizados}. Precio en efectivo o transferencia; consultá por cuotas.`;
      p.hidden = false;
    }
  }

  /* ---------- familias ---------- */

  function familiasConStock() {
    return FAMILIAS.filter((f) => CATALOGO.some((p) => p.familia === f.slug));
  }

  function renderFamilias() {
    const cont = $("#familias-lista");
    // Sin familias cargadas, la sección no se muestra.
    const sinFamilias = familiasConStock().length === 0;
    $("#familias").hidden = sinFamilias;
    document.querySelectorAll('a[href="#familias"]').forEach((a) => { a.hidden = sinFamilias; });
    cont.replaceChildren(
      ...familiasConStock().map((f) => {
        const perfumes = CATALOGO.filter((p) => p.familia === f.slug);
        const cant = perfumes.length;
        return el("button", {
          class: "familia", type: "button",
          onclick: () => { setFiltro("familia", f.slug); $("#catalogo").scrollIntoView(); },
        }, [
          el("span", { class: "familia__nombre", text: f.nombre }),
          el("span", { class: "familia__desc", text: f.descripcion }),
          el("span", { class: "familia__perfumes", text: perfumes.map((p) => p.nombre).join(" · ") }),
          el("span", { class: "familia__cant", text: cant === 1 ? "1 perfume" : `${cant} perfumes` }),
        ]);
      })
    );
  }

  /* ---------- filtros ---------- */

  function renderChips(id, clave, opciones) {
    const cont = $(id);
    // Un filtro con menos de dos opciones no sirve: se oculta el grupo.
    cont.closest(".filtros__grupo").hidden = opciones.length < 2;
    const todas = [{ slug: "", nombre: "Todas" }, ...opciones];
    cont.replaceChildren(
      ...todas.map((o) => el("button", {
        class: "chip", type: "button",
        "aria-pressed": String(filtros[clave] === o.slug),
        onclick: () => setFiltro(clave, o.slug),
      }, document.createTextNode(o.slug === "" && clave === "genero" ? "Todos" : o.nombre)))
    );
  }

  function renderFiltros() {
    renderChips("#filtro-familia", "familia", familiasConStock());
    renderChips("#filtro-genero", "genero", GENEROS.filter((g) => CATALOGO.some((p) => p.genero === g.slug)));
    renderChips("#filtro-temporada", "temporada", TEMPORADAS.filter((t) => CATALOGO.some((p) => p.temporada === t.slug)));
  }

  function setFiltro(clave, valor) {
    filtros[clave] = valor;
    renderFiltros();
    renderCatalogo();
  }

  /* ---------- animación de las fotos ---------- */

  // Las tarjetas aparecen al entrar en pantalla y la foto se asienta con un brillo dorado.
  // Sin animación si la persona pidió movimiento reducido en su dispositivo.
  const animar = window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window;
  const observador = animar ? new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const card = e.target;
      card.classList.add("card--visible");
      observador.unobserve(card);
      // Al terminar se saca el retraso para que el toque y el hover respondan al instante.
      setTimeout(() => card.classList.remove("card--revela"), 1600);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }) : null;

  function animarCards(cont) {
    if (!observador) return;
    const columnas = getComputedStyle(cont).gridTemplateColumns.split(" ").length || 1;
    [...cont.children].forEach((card, i) => {
      card.classList.add("card--revela");
      card.style.setProperty("--retraso", `${(i % columnas) * 90}ms`);
      observador.observe(card);
    });
  }

  /* ---------- tarjetas ---------- */

  function crearCard(perfume) {
    const card = el("article", { class: "card" + (perfume.disponible === false ? " card--agotado" : "") });
    if (perfume.ejemplo) card.append(el("span", { class: "badge badge--ejemplo", text: "Ejemplo" }));
    if (perfume.disponible === false) card.append(el("span", { class: "badge badge--stock", text: "Sin stock" }));

    card.append(nodoImagen(perfume, "card__img"));
    const tags = [
      perfume.familia && nombreDe(FAMILIAS, perfume.familia),
      perfume.genero && nombreDe(GENEROS, perfume.genero),
      perfume.temporada && nombreDe(TEMPORADAS, perfume.temporada),
    ].filter(Boolean);

    card.append(el("div", { class: "card__body" }, [
      marcaYMl(perfume) ? el("span", { class: "card__marca", text: marcaYMl(perfume) }) : null,
      el("h3", { class: "card__nombre" }, el("button", { type: "button", onclick: () => abrirFicha(perfume) }, document.createTextNode(perfume.nombre))),
      tags.length ? el("div", { class: "card__meta" }, tags.map((t) => el("span", { class: "tag", text: t }))) : null,
      el("span", { class: "card__precio", text: precioTexto(perfume.precio) }),
    ]));
    return card;
  }

  function renderDestacados() {
    const lista = CATALOGO.filter((p) => p.destacado && p.disponible !== false);
    $("#destacados").hidden = lista.length === 0;
    $("#destacados-lista").replaceChildren(...lista.map(crearCard));
    animarCards($("#destacados-lista"));
  }

  function renderCatalogo() {
    const lista = CATALOGO
      .filter((p) => !filtros.familia || p.familia === filtros.familia)
      .filter((p) => !filtros.genero || p.genero === filtros.genero)
      .filter((p) => !filtros.temporada || p.temporada === filtros.temporada)
      // Los que no tienen stock van al final.
      .sort((a, b) => (a.disponible === false) - (b.disponible === false));

    $("#catalogo-lista").replaceChildren(...lista.map(crearCard));
    animarCards($("#catalogo-lista"));
    $("#catalogo-vacio").hidden = lista.length > 0;
    $("#resultado").textContent = lista.length === 1 ? "1 perfume" : `${lista.length} perfumes`;
  }

  /* ---------- ficha ---------- */

  const modal = $("#modal");

  function cerrarBoton() {
    const b = el("button", { class: "modal__cerrar", type: "button", "aria-label": "Cerrar ficha", onclick: () => modal.close() });
    b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    return b;
  }

  function filaFicha(etiqueta, valor) {
    return el("li", {}, [el("span", { text: etiqueta }), el("span", { text: valor })]);
  }

  function abrirFicha(perfume) {
    const filas = [];
    if (perfume.familia) filas.push(filaFicha("Familia", nombreDe(FAMILIAS, perfume.familia)));
    if (perfume.genero) filas.push(filaFicha("Para", nombreDe(GENEROS, perfume.genero)));
    if (perfume.genero === "unisex" && perfume.tiraA) filas.push(filaFicha("Tira más a", nombreDe(GENEROS, perfume.tiraA)));
    if (perfume.temporada) filas.push(filaFicha("Temporada", nombreDe(TEMPORADAS, perfume.temporada)));
    if (perfume.duracion) filas.push(filaFicha("Duración", DURACIONES[perfume.duracion] || perfume.duracion));
    // Si están las notas por etapa se muestran separadas; si no, la lista general.
    if (perfume.notasSalida && perfume.notasSalida.length) {
      filas.push(filaFicha("Salida", perfume.notasSalida.join(", ")));
      filas.push(filaFicha("Corazón", perfume.notasCorazon.join(", ")));
      filas.push(filaFicha("Fondo", perfume.notasFondo.join(", ")));
    } else if (perfume.notas && perfume.notas.length) {
      filas.push(filaFicha("Notas", perfume.notas.join(", ")));
    }
    if (perfume.ml) filas.push(filaFicha("Tamaño", `${perfume.ml} ml`));

    const agotado = perfume.disponible === false;
    const boton = agotado
      ? el("a", { class: "btn btn--ghost", href: urlWhatsapp(`Hola, ¿cuándo vuelve a entrar el perfume ${perfume.nombre}?`), target: "_blank", rel: "noopener" }, document.createTextNode("Avisame cuando vuelva"))
      : el("a", { class: "btn", href: urlWhatsapp(mensajeConsulta(perfume)), target: "_blank", rel: "noopener" }, document.createTextNode("Consultar por WhatsApp"));

    $("#modal-contenido").replaceChildren(
      cerrarBoton(),
      nodoImagen(perfume, "modal__img"),
      el("div", { class: "modal__body" }, [
        perfume.marca ? el("span", { class: "card__marca", text: perfume.marca }) : null,
        el("h3", { id: "modal-titulo", text: perfume.nombre }),
        perfume.descripcion ? el("p", { text: perfume.descripcion }) : null,
        filas.length ? el("ul", { class: "ficha" }, filas) : null,
        el("span", { class: "modal__precio", text: agotado ? "Sin stock" : precioTexto(perfume.precio) }),
        perfume.precio && !agotado ? el("span", { class: "modal__nota", text: "Precio en efectivo o transferencia. Consultá por cuotas con Mercado Pago." }) : null,
        boton,
      ]),
    );
    modal.showModal();
  }

  // Cerrar al tocar fuera de la ficha.
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  /* ---------- inicio ---------- */

  $("#limpiar-filtros").addEventListener("click", () => {
    filtros.familia = filtros.genero = filtros.temporada = "";
    renderFiltros();
    renderCatalogo();
  });

  completarDatos();
  renderFamilias();
  renderFiltros();
  renderDestacados();
  renderCatalogo();
})();
