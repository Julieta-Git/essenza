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

  // "Club de Nuit Précieux" -> "club-de-nuit-precieux", para el link de cada perfume.
  function slugDe(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

  function renderSelect(id, clave, opciones) {
    const select = $(id);
    // Un filtro con menos de dos opciones no sirve: se oculta.
    select.closest(".filtros__grupo").hidden = opciones.length < 2;
    const todas = [{ slug: "", nombre: clave === "genero" ? "Todos" : "Todas" }, ...opciones];
    select.replaceChildren(...todas.map((o) => el("option", { value: o.slug, text: o.nombre })));
    select.value = filtros[clave];
    select.classList.toggle("filtro--activo", filtros[clave] !== "");
    select.onchange = () => setFiltro(clave, select.value);
  }

  function renderFiltros() {
    renderSelect("#filtro-familia", "familia", familiasConStock());
    renderSelect("#filtro-genero", "genero", GENEROS.filter((g) => CATALOGO.some((p) => p.genero === g.slug)));
    renderSelect("#filtro-temporada", "temporada", TEMPORADAS.filter((t) => CATALOGO.some((p) => p.temporada === t.slug)));
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
      observador.unobserve(card);
      // Se espera a que la foto esté cargada (hasta 1,5 s) para que la animación se vea siempre.
      const img = card.querySelector(".card__img img");
      const lista = img && !img.complete
        ? Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1500))])
        : Promise.resolve();
      lista.then(() => {
        requestAnimationFrame(() => card.classList.add("card--visible"));
        // Al terminar se saca el retraso para que el toque y el hover respondan al instante.
        setTimeout(() => card.classList.remove("card--revela"), 1800);
      });
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }) : null;

  function animarCards(cont) {
    if (!observador) return;
    const columnas = getComputedStyle(cont).gridTemplateColumns.split(" ").length || 1;
    [...cont.children].forEach((card, i) => {
      card.classList.add("card--revela");
      // Las fotos de tarjetas que van a animarse se piden enseguida.
      const img = card.querySelector(".card__img img");
      if (img) img.loading = "eager";
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

  // Pirámide olfativa: qué se siente al aplicar, a la media hora y horas después.
  const ETAPAS = [
    { clave: "notasSalida", nombre: "Salida", cuando: "Al aplicarlo" },
    { clave: "notasCorazon", nombre: "Corazón", cuando: "A la media hora" },
    { clave: "notasFondo", nombre: "Fondo", cuando: "Lo que queda en la piel" },
  ];

  function iconoPiramide(nivel) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 30 26");
    svg.setAttribute("aria-hidden", "true");
    // Tres franjas del triángulo, de arriba hacia abajo; se resalta la de esta etapa.
    ["15,1 10,9 20,9", "9.5,10 20.5,10 25.5,17 4.5,17", "4,18 26,18 29.5,25 .5,25"].forEach((puntos, i) => {
      const pol = document.createElementNS(ns, "polygon");
      pol.setAttribute("points", puntos);
      pol.setAttribute("class", i === nivel ? "activa" : "");
      svg.append(pol);
    });
    return svg;
  }

  function nodoPiramide(perfume) {
    const etapas = ETAPAS.filter((e) => perfume[e.clave] && perfume[e.clave].length);
    if (!etapas.length) return null;
    return el("div", { class: "piramide" }, [
      el("h4", { class: "piramide__titulo", text: "Cómo evoluciona" }),
      el("ol", { class: "piramide__lista" }, etapas.map((e) => el("li", { class: "piramide__nivel" }, [
        iconoPiramide(ETAPAS.indexOf(e)),
        el("div", {}, [
          el("span", { class: "piramide__nombre" }, [document.createTextNode(e.nombre + " "), el("small", { text: e.cuando })]),
          el("span", { class: "piramide__notas", text: perfume[e.clave].join(", ") }),
        ]),
      ]))),
    ]);
  }

  // Duración en tres niveles; no se muestra si no está cargada.
  function nodoDuracion(perfume) {
    const niveles = ["baja", "media", "alta"];
    const n = niveles.indexOf(perfume.duracion);
    if (n < 0) return null;
    return el("div", { class: "duracion" }, [
      el("span", { class: "duracion__label", text: "Duración" }),
      el("span", { class: "duracion__barra", role: "img", "aria-label": `Duración ${DURACIONES[perfume.duracion].toLowerCase()}` },
        niveles.map((_, i) => el("span", { class: i <= n ? "llena" : "" }))),
      el("span", { class: "duracion__texto", text: DURACIONES[perfume.duracion] }),
    ]);
  }

  function linkDe(perfume) {
    return `${location.origin}${location.pathname}#perfume/${slugDe(perfume.nombre)}`;
  }

  function botonCompartir(perfume) {
    const boton = el("button", { class: "compartir", type: "button" }, [iconoCompartir(), el("span", { text: "Compartir" })]);
    boton.addEventListener("click", async () => {
      const url = linkDe(perfume);
      const texto = boton.querySelector("span");
      if (navigator.share) {
        try { await navigator.share({ title: perfume.nombre, text: `Mirá este perfume en ${CONFIG.marca}: ${perfume.nombre}`, url }); } catch (_) { /* cancelado */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        texto.textContent = "Link copiado";
      } catch (_) {
        texto.textContent = url;
      }
      setTimeout(() => { texto.textContent = "Compartir"; }, 2500);
    });
    return boton;
  }

  function iconoCompartir() {
    const span = el("span", { class: "compartir__icono", "aria-hidden": "true" });
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>';
    return span;
  }

  function abrirFicha(perfume) {
    const filas = [];
    if (perfume.familia) filas.push(filaFicha("Familia", nombreDe(FAMILIAS, perfume.familia)));
    if (perfume.genero) filas.push(filaFicha("Para", nombreDe(GENEROS, perfume.genero)));
    if (perfume.genero === "unisex" && perfume.tiraA) filas.push(filaFicha("Tira más a", nombreDe(GENEROS, perfume.tiraA)));
    if (perfume.temporada) filas.push(filaFicha("Temporada", nombreDe(TEMPORADAS, perfume.temporada)));
    // Sin pirámide cargada se muestra la lista general de notas.
    const tienePiramide = perfume.notasSalida && perfume.notasSalida.length;
    if (!tienePiramide && perfume.notas && perfume.notas.length) filas.push(filaFicha("Notas", perfume.notas.join(", ")));
    if (perfume.inspiradoEn) filas.push(filaFicha("Se parece a", perfume.inspiradoEn));
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
        nodoPiramide(perfume),
        nodoDuracion(perfume),
        el("span", { class: "modal__precio", text: agotado ? "Sin stock" : precioTexto(perfume.precio) }),
        perfume.precio && !agotado ? el("span", { class: "modal__nota", text: "Precio en efectivo o transferencia. Consultá por cuotas con Mercado Pago." }) : null,
        boton,
        botonCompartir(perfume),
      ]),
    );
    // El link de la barra apunta a este perfume, para copiarlo o compartirlo.
    history.replaceState(null, "", `#perfume/${slugDe(perfume.nombre)}`);
    if (!modal.open) modal.showModal();
  }

  modal.addEventListener("close", () => {
    if (location.hash.startsWith("#perfume/")) history.replaceState(null, "", location.pathname + location.search);
  });

  // Si se entra con un link de perfume (#perfume/asad-bourbon), se abre su ficha.
  function abrirDesdeLink() {
    const m = location.hash.match(/^#perfume\/(.+)$/);
    if (!m) return;
    const perfume = CATALOGO.find((p) => slugDe(p.nombre) === decodeURIComponent(m[1]));
    if (perfume) abrirFicha(perfume);
  }
  window.addEventListener("hashchange", abrirDesdeLink);

  // Cerrar al tocar fuera de la ficha.
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  /* ---------- encontrá tu perfume ---------- */

  const respuestas = {};

  function preguntasQuiz() {
    return [
      { clave: "genero", titulo: "¿Para quién es?", opciones: [
        { valor: "hombre", texto: "Para hombre" }, { valor: "mujer", texto: "Para mujer" }, { valor: "", texto: "Me da igual" }] },
      { clave: "temporada", titulo: "¿Cuándo lo vas a usar más?", opciones: [
        { valor: "verano", texto: "Con calor" }, { valor: "invierno", texto: "Con frío o de noche" }, { valor: "todo-el-anio", texto: "Todo el año" }] },
      { clave: "familia", titulo: "¿Qué aroma te atrae?", opciones: [
        ...familiasConStock().map((f) => ({ valor: f.slug, texto: f.nombre, ayuda: f.descripcion })),
        { valor: "", texto: "No sé, sorprendeme" }] },
    ];
  }

  function puntaje(p) {
    let total = 0;
    if (respuestas.genero) {
      if (p.genero === respuestas.genero) total += 3;
      else if (p.genero === "unisex") total += p.tiraA === respuestas.genero ? 2.5 : 2;
      else total -= 10;
    }
    if (respuestas.temporada) {
      if (p.temporada === respuestas.temporada) total += 3;
      else if (p.temporada === "todo-el-anio" || respuestas.temporada === "todo-el-anio") total += 1.5;
    }
    if (respuestas.familia && p.familia === respuestas.familia) total += 4;
    if (p.imagen) total += 0.2; // a igual puntaje, primero los que tienen foto
    return total;
  }

  function renderQuiz(paso = 0) {
    const cont = $("#quiz");
    const preguntas = preguntasQuiz();
    if (paso >= preguntas.length) return renderRecomendados();
    const q = preguntas[paso];
    cont.replaceChildren(
      el("div", { class: "quiz__progreso", "aria-hidden": "true" }, preguntas.map((_, i) => el("span", { class: i <= paso ? "hecho" : "" }))),
      el("p", { class: "quiz__paso", text: `Pregunta ${paso + 1} de ${preguntas.length}` }),
      el("h3", { class: "quiz__titulo", text: q.titulo }),
      el("div", { class: "quiz__opciones" }, q.opciones.map((o) => el("button", {
        class: "quiz__opcion", type: "button",
        onclick: () => { respuestas[q.clave] = o.valor; renderQuiz(paso + 1); },
      }, [el("span", { text: o.texto }), o.ayuda ? el("small", { text: o.ayuda }) : null]))),
      paso > 0 ? el("button", { class: "quiz__volver", type: "button", onclick: () => renderQuiz(paso - 1) }, document.createTextNode("Volver")) : null,
    );
    if (paso > 0) cont.querySelector(".quiz__opcion").focus({ preventScroll: true });
  }

  function renderRecomendados() {
    const lista = CATALOGO
      .filter((p) => p.disponible !== false)
      .map((p) => ({ p, s: puntaje(p) }))
      .filter((x) => x.s > -5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.p);
    const motivo = [
      respuestas.genero && `para ${nombreDe(GENEROS, respuestas.genero).toLowerCase()}`,
      respuestas.temporada && { verano: "para el calor", invierno: "para el frío", "todo-el-anio": "para todo el año" }[respuestas.temporada],
      respuestas.familia && nombreDe(FAMILIAS, respuestas.familia).toLowerCase(),
    ].filter(Boolean).join(", ");
    const nombres = lista.map((p) => p.nombre).join(", ");
    const grilla = el("div", { class: "grid quiz__grid" }, lista.map(crearCard));
    $("#quiz").replaceChildren(
      el("h3", { class: "quiz__titulo", text: lista.length === 1 ? "Te recomendamos este" : "Te recomendamos estos" }),
      motivo ? el("p", { class: "quiz__motivo", text: `Elegidos por: ${motivo}.` }) : null,
      grilla,
      el("div", { class: "hero__actions quiz__acciones" }, [
        el("a", { class: "btn", href: urlWhatsapp(`Hola, el sitio me recomendó: ${nombres}. ¿Me asesorás?`), target: "_blank", rel: "noopener" }, document.createTextNode("Consultar por estos")),
        el("button", { class: "btn btn--ghost", type: "button", onclick: () => { Object.keys(respuestas).forEach((k) => delete respuestas[k]); renderQuiz(0); } }, document.createTextNode("Empezar de nuevo")),
      ]),
    );
    animarCards(grilla);
    $("#quiz").scrollIntoView({ block: "start" });
  }

  /* ---------- perfume de diseñador ---------- */

  function renderDisenador() {
    const conDato = CATALOGO.filter((p) => p.inspiradoEn);
    $("#disenador").hidden = conDato.length === 0;
    if (!conDato.length) return;
    const input = $("#disenador-buscar");
    const normalizar = (t) => slugDe(t).replace(/-/g, " ");
    const buscar = () => {
      const q = normalizar(input.value.trim());
      const lista = q ? conDato.filter((p) => normalizar(p.inspiradoEn).includes(q)) : conDato;
      $("#disenador-lista").replaceChildren(...lista.map(crearCard));
      $("#disenador-vacio").hidden = lista.length > 0;
      animarCards($("#disenador-lista"));
    };
    input.addEventListener("input", buscar);
    buscar();
  }

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
  renderQuiz();
  renderDisenador();
  abrirDesdeLink();
})();
