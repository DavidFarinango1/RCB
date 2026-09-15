/* Lógica del catálogo (productos.html).
   Lee productos y categorías desde localStorage si el admin los editó,
   si no, usa los datos por defecto de products.js / categories.js */
(async function () {
  await window.RCB_DATA_READY;
  const PAGE_SIZE = 9;

  const getProducts = () => window.RCB_DEFAULT_PRODUCTS || [];
  const getCategories = () => window.RCB_DEFAULT_CATEGORIES || [];
  const getSubcategories = () => window.RCB_DEFAULT_SUBCATEGORIES || [];

  function categoryName(id) {
    const c = getCategories().find(c => c.id === id);
    return c ? c.name : "Sin categoría";
  }
  function subcategoryName(id) {
    if (!id) return "";
    const s = getSubcategories().find(s => s.id === id);
    return s ? s.name : "";
  }

  const state = {
    all: getProducts(),
    category: new URLSearchParams(location.search).get("cat") || "todos",
    search: new URLSearchParams(location.search).get("q") || "",
    sort: "relevancia",
    page: 1
  };

  const grid = document.getElementById("product-grid");
  const catList = document.getElementById("category-list");
  const resultsCount = document.getElementById("results-count");
  const searchInput = document.getElementById("catalog-search");
  if (searchInput && state.search) searchInput.value = state.search;
  const sortSelect = document.getElementById("sort-select");
  const pagination = document.getElementById("pagination");
  const emptyState = document.getElementById("empty-state");

  function money(n) { return "$" + n.toFixed(2); }

  function categoryCounts() {
    const counts = {};
    state.all.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }

  function renderCategoryList() {
    if (!catList) return;
    const counts = categoryCounts();
    const cats = getCategories();

    let html = `<li class="cat-filter-item ${state.category === 'todos' ? 'active' : ''}" data-cat="todos">
        <span>Todos los productos</span><span class="count">(${state.all.length})</span>
      </li>`;
    cats.forEach(c => {
      html += `<li class="cat-filter-item ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}">
          <span>${c.name}</span><span class="count">(${counts[c.id] || 0})</span>
        </li>`;
    });
    catList.innerHTML = html;

    catList.querySelectorAll(".cat-filter-item").forEach(li => {
      li.addEventListener("click", () => {
        state.category = li.dataset.cat;
        state.page = 1;
        render();
      });
    });
  }

  function getFiltered() {
    let list = state.all.slice();
    if (state.category !== "todos") list = list.filter(p => p.category === state.category);
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }
    if (state.sort === "precio-asc") list.sort((a, b) => a.price - b.price);
    if (state.sort === "precio-desc") list.sort((a, b) => b.price - a.price);
    if (state.sort === "nombre") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function renderGrid() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (resultsCount) {
      resultsCount.textContent = filtered.length + (filtered.length === 1 ? " producto encontrado" : " productos encontrados");
    }

    if (!filtered.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";
      grid.innerHTML = pageItems.map(p => {
        /* Foto completa por defecto, con el ajuste de mover/acercar del panel. */
        const encuadre = window.RCB_ESTILO_ENCUADRE ? window.RCB_ESTILO_ENCUADRE(p.imageFit) : "";
        const thumb = p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" class="prod-img-completa" style="${encuadre}">` : (p.icon || "📦");
        const tag = p.label === "oferta" ? '<span class="prod-tag tag-oferta">OFERTA</span>'
          : p.label === "nuevo" ? '<span class="prod-tag tag-nuevo">NUEVO</span>' : "";
        return `
        <article class="prod-card">
          <div class="prod-thumb">${thumb}${tag}</div>
          <div class="prod-body">
            <span class="cat">${categoryName(p.category)}</span>
            <h3>${p.name}</h3>
            <p class="prod-sku">SKU: ${p.id}</p>
            ${p.price ? `<p class="prod-price">
              ${p.oldPrice ? `<span class="prod-old-price">${money(Number(p.oldPrice))}</span>` : ""}
              ${money(p.price)}
            </p>` : ""}
            <div class="prod-actions">
              <a href="https://wa.me/593993421505?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary btn-sm">Cotizar</a>
              <button class="btn btn-tertiary btn-sm" data-detail="${p.id}">Ver detalles</button>
            </div>
          </div>
        </article>`;
      }).join("");

      grid.querySelectorAll("[data-detail]").forEach(btn => {
        btn.addEventListener("click", () => showDetail(btn.dataset.detail));
      });
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!pagination) return;
    if (totalPages <= 1) { pagination.innerHTML = ""; return; }
    let html = `<button ${state.page === 1 ? "disabled" : ""} data-page="${state.page - 1}">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<span class="${i === state.page ? 'active' : ''}" data-page="${i}" style="cursor:pointer;">${i}</span>`;
    }
    html += `<button ${state.page === totalPages ? "disabled" : ""} data-page="${state.page + 1}">›</button>`;
    pagination.innerHTML = html;
    pagination.querySelectorAll("[data-page]").forEach(el => {
      el.addEventListener("click", () => {
        state.page = parseInt(el.dataset.page, 10);
        renderGrid();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
      });
    });
  }

  function showDetail(id) {
    const p = state.all.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById("product-modal");
    /* Galería de hasta 3 imágenes, mostradas COMPLETAS por defecto y con el
       ajuste de mover/acercar que se haga en el panel. Con una sola imagen no
       salen miniaturas. */
    const encuadre = window.RCB_ESTILO_ENCUADRE || (() => "");
    const imagenes = window.RCB_IMAGENES_PRODUCTO ? window.RCB_IMAGENES_PRODUCTO(p) : [];

    let galeria;
    if (!imagenes.length) {
      galeria = `<div class="modal-thumb">${p.icon || "📦"}</div>`;
    } else {
      galeria = `
        <div class="prod-galeria">
          <div class="modal-thumb prod-galeria-principal">
            <img id="prod-galeria-img" src="${imagenes[0].url}" alt="${p.name}" style="${encuadre(imagenes[0].fit)}">
          </div>
          ${imagenes.length > 1 ? `
          <div class="prod-galeria-miniaturas">
            ${imagenes.map((im, i) => `
              <button type="button" class="prod-galeria-mini${i === 0 ? " activa" : ""}"
                      data-galeria="${i}" aria-label="Ver imagen ${i + 1} de ${imagenes.length}">
                <img src="${im.url}" alt="" loading="lazy" style="${encuadre(im.fit)}">
              </button>`).join("")}
          </div>` : ""}
        </div>`;
    }

    /* Video corto (TikTok o YouTube Shorts), solo en productos de Herramientas.
       Se reproduce aquí mismo, sin sacar al cliente de la web. */
    const video = p.category === "herramientas" && window.RCB_VIDEO_CORTO
      ? window.RCB_VIDEO_CORTO(p.video)
      : null;
    const videosHtml = !video ? "" : `
      <div class="prod-videos">
        <h3 class="prod-videos-titulo">Video del producto</h3>
        <div class="prod-video prod-video-vertical">
          <iframe src="${video.url}" title="Video de ${p.name}" loading="lazy" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>`;

    const sub = subcategoryName(p.subcategory);
    document.getElementById("modal-body").innerHTML = `
      ${galeria}
      <span class="cat">${categoryName(p.category)}${sub ? " · " + sub : ""}</span>
      <h2>${p.name}</h2>
      <p class="prod-sku">SKU: ${p.id}</p>
      ${p.price ? `<p class="prod-price" style="font-size:1.4rem;">
        ${p.oldPrice ? `<span class="prod-old-price">${money(Number(p.oldPrice))}</span>` : ""}
        ${money(p.price)}
      </p>` : ""}
      <p style="margin:14px 0;color:#4B5563;">${p.description || ""}</p>
      <ul class="spec-list">${(p.specs || []).map(s => `<li>✔ ${s}</li>`).join("")}</ul>
      ${videosHtml}
      <a href="https://wa.me/593993421505?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary" style="margin-top:16px;">💬 Cotizar por WhatsApp</a>
    `;

    /* Cambiar de imagen al pulsar una miniatura. */
    const principal = document.getElementById("prod-galeria-img");
    document.querySelectorAll("[data-galeria]").forEach(btn => {
      btn.addEventListener("click", () => {
        const im = imagenes[Number(btn.dataset.galeria)];
        if (!im || !principal) return;
        principal.src = im.url;
        principal.style.cssText = encuadre(im.fit);
        document.querySelectorAll("[data-galeria]").forEach(b => b.classList.remove("activa"));
        btn.classList.add("activa");
      });
    });

    modal.classList.add("open");
  }

  function render() {
    renderCategoryList();
    renderGrid();
  }

  if (searchInput) {
    searchInput.addEventListener("input", e => { state.search = e.target.value; state.page = 1; renderGrid(); });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });
  }

  /* Al cerrar la ficha se vacía su contenido: si no, un video que se estaba
     reproduciendo seguiría sonando con la ventana ya oculta. */
  function cerrarFicha() {
    const modal = document.getElementById("product-modal");
    if (!modal) return;
    modal.classList.remove("open");
    const cuerpo = document.getElementById("modal-body");
    if (cuerpo) cuerpo.innerHTML = "";
  }
  const modalClose = document.getElementById("modal-close");
  if (modalClose) modalClose.addEventListener("click", cerrarFicha);
  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) cerrarFicha(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("open")) cerrarFicha();
  });

  if (grid) render();
})();
