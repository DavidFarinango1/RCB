/* Renderiza blog.html a partir de los datos de assets/posts.js,
   o de los que haya guardado el panel administrador en localStorage. */
(async function () {
  const PAGE_SIZE = 6;

  function getPosts() {
    return window.RCB_DEFAULT_POSTS || [];
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
  function extractYoutubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function legacyContentToBlocks(content) {
    const text = (content || "").trim();
    if (!text) return [];
    const parts = text.split(/\n(?=\*\*.+?\*\*)/);
    return parts.map(part => {
      const m = part.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);
      return m ? { title: m[1].trim(), text: m[2].trim() } : { title: "", text: part.trim() };
    });
  }
  function contentBlocksHtml(p) {
    let blocks = p.contentBlocks && p.contentBlocks.length ? p.contentBlocks : legacyContentToBlocks(p.content);
    if (!blocks.length) blocks = [{ title: "", text: p.excerpt || "" }];
    return blocks.map(b => `
      <div class="post-block">
        ${b.title ? `<h3 class="post-block-title">${escapeHtml(b.title)}</h3>` : ""}
        ${b.text ? `<p class="post-block-text">${escapeHtml(b.text)}</p>` : ""}
      </div>
    `).join("");
  }

  const grid = document.getElementById("blog-post-grid");
  if (!grid) return; // no estamos en blog.html
  await window.RCB_DATA_READY;

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
            <button type="button" class="btn btn-primary btn-sm" data-post-open="${featured.id}">Leer artículo →</button>
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
        <article class="post-card" data-category="${p.category}" data-post-open="${p.id}" style="cursor:pointer;">
          <div class="thumb">${thumbHtml(p)}</div>
          <div class="body">
            <span class="cat">${categoryName(p.category)}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="post-meta">${p.date} · ${p.readTime}</div>
          </div>
        </article>
      `).join("");
    }
    renderPagination(totalPages);
    bindPostOpeners();
  }

  /* ---------- Modal de artículo (se abre dentro de la página) ---------- */
  const postModal = document.getElementById("post-modal");
  const postModalBody = document.getElementById("post-modal-body");
  function openPostModal(id) {
    const p = allPosts.find(x => x.id === id);
    if (!p || !postModal || !postModalBody) return;
    const youtubeId = extractYoutubeId(p.videoUrl);
    const mediaHtml = youtubeId
      ? `<div class="post-modal-video"><iframe src="https://www.youtube.com/embed/${youtubeId}" title="${p.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : (p.image ? `<div class="post-modal-thumb">${thumbHtml(p, "object-fit:contain;height:auto;max-height:220px;")}</div>` : "");
    postModalBody.innerHTML = `
      ${mediaHtml}
      <span class="cat">${categoryName(p.category)}</span>
      <h2>${p.title}</h2>
      <div class="post-meta" style="margin:8px 0 16px;">📅 ${p.date} &nbsp;·&nbsp; ${p.readTime || ""}</div>
      ${contentBlocksHtml(p)}
    `;
    postModal.classList.add("open");
  }
  function bindPostOpeners() {
    document.querySelectorAll("[data-post-open]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openPostModal(el.dataset.postOpen);
      });
    });
  }
  const postModalClose = document.getElementById("post-modal-close");
  if (postModalClose) postModalClose.addEventListener("click", () => postModal.classList.remove("open"));
  if (postModal) postModal.addEventListener("click", e => { if (e.target === postModal) postModal.classList.remove("open"); });

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
      <div class="popular-item" data-post-open="${p.id}">
        <div class="thumb">${thumbHtml(p)}</div>
        <div><h5>${p.title}</h5><span>${p.date}</span></div>
      </div>
    `).join("");
    bindPostOpeners();
  }

  renderTabs();
  renderGrid();
})();
