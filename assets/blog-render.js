/* Renderiza blog.html a partir de los datos de assets/posts.js,
   o de los que haya guardado el panel administrador en localStorage. */
(async function () {
  const PAGE_SIZE = 6;

  function getPosts() {
    /* Los blogs en privado se guardan pero no se muestran en la web. */
    return (window.RCB_DEFAULT_POSTS || []).filter(p => p.status !== "privado");
  }
  function getCategories() {
    return window.RCB_BLOG_CATEGORIES || [];
  }
  function categoryName(id) {
    const c = getCategories().find(c => c.id === id);
    return c ? c.name : "General";
  }
  function fitStyle(fit) {
    fit = fit || { scale: 1, x: 0, y: 0 };
    return `transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});`;
  }
  function thumbHtml(p, extraStyle) {
    return p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;${fitStyle(p.imageFit)}${extraStyle || ""}">`
      : (p.icon || "📰");
  }
  /* Dirección de la página propia de cada artículo. Antes el artículo se abría
     en una ventana emergente; ahora es una página real, con su propia URL, que
     se puede compartir y que Google puede indexar. */
  function postUrl(id) {
    return "articulo.php?post=" + encodeURIComponent(id);
  }


  const grid = document.getElementById("blog-post-grid");
  if (!grid) return; // no estamos en blog.html
  await window.RCB_DATA_READY;

  const allPosts = getPosts();
  const featured = allPosts.find(p => p.featured) || allPosts[0];
  const gridPosts = allPosts.filter(p => p !== featured);

  const state = { category: "todos", search: "", page: 1 };

  /* ---------- Destacado ---------- */
  /* El artículo destacado se muestra ya abierto: el visitante lo lee sin tener
     que hacer clic. El enlace de abajo lleva a su página propia, que es la que
     se comparte y la que indexa Google. */
  const featuredContainer = document.getElementById("featured-post-container");
  if (featuredContainer && featured) {
    const embedPortada = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(featured.videoUrl) : null;
    const portada = embedPortada
      ? `<div class="art-video art-portada"><iframe src="${embedPortada}" title="${featured.title}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : (featured.image ? `<div class="art-portada"><img src="${featured.image}" alt="${featured.title}"></div>` : "");

    let cuerpo = window.RCB_BLOQUES_HTML
      ? window.RCB_BLOQUES_HTML(window.RCB_BLOQUES(featured))
      : "";
    if (!cuerpo) cuerpo = `<p class="art-sin-cuerpo">Este artículo todavía no tiene contenido.</p>`;

    featuredContainer.innerHTML = `
      <article class="destacado-abierto">
        <span class="badge">DESTACADO</span>
        <h2>${featured.title}</h2>
        <div class="post-meta destacado-meta">
          📅 ${featured.date}
          ${featured.readTime ? `&nbsp;·&nbsp; ⏱ ${featured.readTime}` : ""}
          &nbsp;·&nbsp; ${categoryName(featured.category)}
        </div>
        ${featured.excerpt ? `<p class="art-entradilla">${featured.excerpt}</p>` : ""}
        ${portada}
        <div class="art-cuerpo">${cuerpo}</div>
        <div class="destacado-pie">
          <a class="btn btn-primary btn-sm" href="${postUrl(featured.id)}">Abrir en su propia página →</a>
        </div>
      </article>`;
  }

  /* ---------- Pestañas de categoría ---------- */
  const tabRow = document.getElementById("blog-tab-row");
  function renderTabs() {
    if (!tabRow) return;
    let html = `<span class="tab ${state.category === 'todos' ? 'active' : ''}" data-filter="todos">Todos</span>`;
    getCategories().forEach(c => {
      html += `<span class="tab ${state.category === c.id ? 'active' : ''}" data-filter="${c.id}">${c.name}</span>`;
    });
    tabRow.innerHTML = html;
    tabRow.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        state.category = tab.dataset.filter;
        state.page = 1;
        renderTabs();
        renderGrid();
      });
    });
  }

  /* ---------- Grid + paginación ---------- */
  const emptyState = document.getElementById("blog-empty-state");
  const pagination = document.getElementById("blog-pagination");

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function getFiltered() {
    const searching = !!state.search.trim();
    let list = (searching ? allPosts : gridPosts).slice();
    if (state.category !== "todos") list = list.filter(p => p.category === state.category);
    if (searching) {
      const q = normalize(state.search.trim());
      list = list.filter(p =>
        normalize(p.title).includes(q) ||
        normalize(p.excerpt).includes(q) ||
        normalize(p.content).includes(q) ||
        normalize(categoryName(p.category)).includes(q)
      );
    }
    return list;
  }

  function renderGrid() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (!filtered.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";
      grid.innerHTML = pageItems.map(p => `
        <a class="post-card" data-category="${p.category}" href="${postUrl(p.id)}">
          <div class="thumb">${thumbHtml(p)}</div>
          <div class="body">
            <span class="cat">${categoryName(p.category)}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="post-meta">${p.date} · ${p.readTime}</div>
          </div>
        </a>
      `).join("");
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

  function findMatchingCategory(term) {
    const q = normalize(term);
    if (!q) return null;
    return getCategories().find(c => normalize(c.name).includes(q) || q.includes(normalize(c.name)));
  }

  const searchInput = document.getElementById("blog-search");
  function applySearch() {
    const term = searchInput.value.trim();
    const matchedCat = findMatchingCategory(term);
    if (matchedCat) {
      state.category = matchedCat.id;
      state.search = "";
    } else {
      state.category = "todos";
      state.search = term;
    }
    state.page = 1;
    renderTabs();
    renderGrid();
    window.scrollTo({ top: tabRow.offsetTop - 100, behavior: "smooth" });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value;
      state.page = 1;
      renderGrid();
    });
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); applySearch(); }
    });
    const searchBtn = searchInput.parentElement.querySelector("button");
    if (searchBtn) searchBtn.addEventListener("click", e => { e.preventDefault(); applySearch(); });
  }

  /* ---------- Sidebar: categorías con conteo ---------- */
  const catList = document.getElementById("blog-cat-list");
  if (catList) {
    catList.innerHTML = getCategories().map(c => {
      const count = allPosts.filter(p => p.category === c.id).length;
      return `<li><span>✔ ${c.name}</span><span class="count">(${count})</span></li>`;
    }).join("");
  }

  /* ---------- Sidebar: populares (los 5 más recientes) ---------- */
  const popularList = document.getElementById("blog-popular-list");
  if (popularList) {
    popularList.innerHTML = allPosts.slice(0, 5).map(p => `
      <a class="popular-item" href="${postUrl(p.id)}">
        <div class="thumb">${thumbHtml(p)}</div>
        <div><h5>${p.title}</h5><span>${p.date}</span></div>
      </a>
    `).join("");
  }

  renderTabs();
  renderGrid();
})();
