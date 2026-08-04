/* Renderiza blog.html a partir de los datos de assets/posts.js,
   o de los que haya guardado el panel administrador en localStorage. */
(function () {
  const PAGE_SIZE = 6;

  function getPosts() {
    const saved = localStorage.getItem("rcb_posts");
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* usa las de por defecto */ } }
    return window.RCB_DEFAULT_POSTS || [];
  }
  function getCategories() {
    const saved = localStorage.getItem("rcb_blog_categories");
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* usa las de por defecto */ } }
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
      ? `<img src="${p.image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;${fitStyle(p.imageFit)}${extraStyle || ""}">`
      : (p.icon || "📰");
  }

  const grid = document.getElementById("blog-post-grid");
  if (!grid) return; // no estamos en blog.html

  const allPosts = getPosts();
  const featured = allPosts.find(p => p.featured) || allPosts[0];
  const gridPosts = allPosts.filter(p => p !== featured);

  const state = { category: "todos", search: "", page: 1 };

  /* ---------- Destacado ---------- */
  const featuredContainer = document.getElementById("featured-post-container");
  if (featuredContainer && featured) {
    featuredContainer.innerHTML = `
      <article class="featured-post">
        <div class="thumb">${thumbHtml(featured)}</div>
        <div class="body">
          <span class="badge">DESTACADO</span>
          <h2>${featured.title}</h2>
          <p>${featured.excerpt}</p>
          <div class="post-meta" style="margin-bottom:14px;">📅 ${featured.date} &nbsp;·&nbsp; ${categoryName(featured.category)}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a href="#" class="btn btn-primary btn-sm">Leer artículo →</a>
            ${featured.pdf ? `<a href="${featured.pdf}" download="${featured.pdfName || 'articulo.pdf'}" class="btn btn-tertiary btn-sm">📄 Descargar PDF</a>` : ""}
          </div>
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
    let list = gridPosts.slice();
    if (state.category !== "todos") list = list.filter(p => p.category === state.category);
    if (state.search.trim()) {
      const q = normalize(state.search.trim());
      list = list.filter(p =>
        normalize(p.title).includes(q) ||
        normalize(p.excerpt).includes(q) ||
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
        <article class="post-card" data-category="${p.category}">
          <div class="thumb">${thumbHtml(p)}</div>
          <div class="body">
            <span class="cat">${categoryName(p.category)}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="post-meta">${p.date} · ${p.readTime}</div>
            ${p.pdf ? `<a href="${p.pdf}" download="${p.pdfName || 'articulo.pdf'}" style="display:inline-block;margin-top:8px;font-size:0.78rem;font-weight:600;color:var(--azul-brillante);">📄 Descargar PDF</a>` : ""}
          </div>
        </article>
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

  const searchInput = document.getElementById("blog-search");
  function applySearch() {
    state.search = searchInput.value;
    state.page = 1;
    renderGrid();
    window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
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
      <div class="popular-item">
        <div class="thumb">${thumbHtml(p)}</div>
        <div><h5>${p.title}</h5><span>${p.date}</span></div>
      </div>
    `).join("");
  }

  renderTabs();
  renderGrid();
})();
