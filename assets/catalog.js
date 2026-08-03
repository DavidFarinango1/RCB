/* Lógica del catálogo (productos.html).
   Lee productos desde localStorage("rcb_products") si el admin los editó,
   si no, usa el catálogo por defecto de products.js */
(function () {
  const STORAGE_KEY = "rcb_products";
  const PAGE_SIZE = 9;

  function getProducts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fall through */ }
    }
    return window.RCB_DEFAULT_PRODUCTS || [];
  }

  const state = {
    all: getProducts(),
    category: new URLSearchParams(location.search).get("cat") || "todos",
    search: "",
    sort: "relevancia",
    page: 1
  };

  const grid = document.getElementById("product-grid");
  const catList = document.getElementById("category-list");
  const resultsCount = document.getElementById("results-count");
  const searchInput = document.getElementById("catalog-search");
  const sortSelect = document.getElementById("sort-select");
  const pagination = document.getElementById("pagination");
  const emptyState = document.getElementById("empty-state");

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function categoryCounts() {
    const counts = {};
    state.all.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }

  function renderCategoryList() {
    if (!catList) return;
    const counts = categoryCounts();
    const labels = {};
    state.all.forEach(p => { labels[p.category] = p.categoryLabel; });
    const cats = Object.keys(labels);

    let html = `<li class="cat-filter-item ${state.category === 'todos' ? 'active' : ''}" data-cat="todos">
        <span>Todos los productos</span><span class="count">(${state.all.length})</span>
      </li>`;
    cats.forEach(c => {
      html += `<li class="cat-filter-item ${state.category === c ? 'active' : ''}" data-cat="${c}">
          <span>${labels[c]}</span><span class="count">(${counts[c] || 0})</span>
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
    if (state.category !== "todos") {
      list = list.filter(p => p.category === state.category);
    }
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
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
      grid.innerHTML = pageItems.map(p => `
        <article class="prod-card">
          <div class="prod-thumb">${p.icon || "📦"}</div>
          <div class="prod-body">
            <span class="cat">${p.categoryLabel}</span>
            <h3>${p.name}</h3>
            <p class="prod-sku">SKU: ${p.id}</p>
            <p class="prod-price">${money(p.price)}</p>
            <div class="prod-actions">
              <a href="https://wa.me/593991234567?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary btn-sm">Cotizar</a>
              <button class="btn btn-tertiary btn-sm" data-detail="${p.id}">Ver detalles</button>
            </div>
          </div>
        </article>
      `).join("");

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
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-thumb">${p.icon || "📦"}</div>
      <span class="cat">${p.categoryLabel}</span>
      <h2>${p.name}</h2>
      <p class="prod-sku">SKU: ${p.id}</p>
      <p class="prod-price" style="font-size:1.4rem;">${money(p.price)}</p>
      <p style="margin:14px 0;color:#4B5563;">${p.description}</p>
      <ul class="spec-list">${(p.specs || []).map(s => `<li>✔ ${s}</li>`).join("")}</ul>
      <a href="https://wa.me/593991234567?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary" style="margin-top:16px;">💬 Cotizar por WhatsApp</a>
    `;
    modal.classList.add("open");
  }

  function render() {
    renderCategoryList();
    renderGrid();
  }

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      state.search = e.target.value;
      state.page = 1;
      renderGrid();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", e => {
      state.sort = e.target.value;
      renderGrid();
    });
  }

  const modalClose = document.getElementById("modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", () => document.getElementById("product-modal").classList.remove("open"));
  }
  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("open");
    });
  }

  if (grid) render();
})();
