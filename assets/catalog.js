/* Lógica del catálogo (productos.html).
   Lee productos y categorías desde localStorage si el admin los editó,
   si no, usa los datos por defecto de products.js / categories.js */
(function () {
  const KEY_PRODUCTS = "rcb_products";
  const KEY_CATEGORIES = "rcb_categories";
  const KEY_SUBCATEGORIES = "rcb_subcategories";
  const PAGE_SIZE = 9;

  function load(key, fallback) {
    const saved = localStorage.getItem(key);
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* ignore */ } }
    return fallback;
  }

  const getProducts = () => load(KEY_PRODUCTS, window.RCB_DEFAULT_PRODUCTS || []);
  const getCategories = () => load(KEY_CATEGORIES, window.RCB_DEFAULT_CATEGORIES || []);
  const getSubcategories = () => load(KEY_SUBCATEGORIES, window.RCB_DEFAULT_SUBCATEGORIES || []);

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
        const fit = p.imageFit || { scale: 1, x: 0, y: 0 };
        const thumb = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (p.icon || "📦");
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
              <a href="https://wa.me/593991234567?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary btn-sm">Cotizar</a>
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
    const modalFit = p.imageFit || { scale: 1, x: 0, y: 0 };
    const thumb = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;transform:translate(${modalFit.x}%, ${modalFit.y}%) scale(${modalFit.scale});">` : (p.icon || "📦");
    const sub = subcategoryName(p.subcategory);
    document.getElementById("modal-body").innerHTML = `
      <div class="modal-thumb">${thumb}</div>
      <span class="cat">${categoryName(p.category)}${sub ? " · " + sub : ""}</span>
      <h2>${p.name}</h2>
      <p class="prod-sku">SKU: ${p.id}</p>
      ${p.price ? `<p class="prod-price" style="font-size:1.4rem;">
        ${p.oldPrice ? `<span class="prod-old-price">${money(Number(p.oldPrice))}</span>` : ""}
        ${money(p.price)}
      </p>` : ""}
      <p style="margin:14px 0;color:#4B5563;">${p.description || ""}</p>
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
    searchInput.addEventListener("input", e => { state.search = e.target.value; state.page = 1; renderGrid(); });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });
  }

  const modalClose = document.getElementById("modal-close");
  if (modalClose) modalClose.addEventListener("click", () => document.getElementById("product-modal").classList.remove("open"));
  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) modalOverlay.classList.remove("open"); });

  if (grid) render();
})();
