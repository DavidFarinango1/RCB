/* Renderiza galeria.html a partir de assets/gallery-data.js,
   o de lo que haya guardado el panel administrador en localStorage. */
(function () {
  function load(key, fallback) {
    const saved = localStorage.getItem(key);
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* usa las de por defecto */ } }
    return fallback;
  }
  const getCategories = () => load("rcb_gallery_categories", window.RCB_DEFAULT_GALLERY_CATEGORIES || []);
  const getItems = () => load("rcb_gallery_items", window.RCB_DEFAULT_GALLERY_ITEMS || []);

  function fitStyle(fit) {
    fit = fit || { scale: 1, x: 0, y: 0 };
    return `transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});`;
  }

  const grid = document.getElementById("gallery-grid");
  if (!grid) return; // no estamos en galeria.html

  const allItems = getItems();
  let filter = "todos";

  const tabRow = document.getElementById("gallery-tab-row");
  function renderTabs() {
    if (!tabRow) return;
    let html = `<span class="tab ${filter === 'todos' ? 'active' : ''}" data-filter="todos">Todos</span>`;
    getCategories().forEach(c => {
      html += `<span class="tab ${filter === c.id ? 'active' : ''}" data-filter="${c.id}">${c.name}</span>`;
    });
    tabRow.innerHTML = html;
    tabRow.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        filter = tab.dataset.filter;
        renderTabs();
        renderGrid();
      });
    });
  }

  const emptyState = document.getElementById("gallery-empty-state");
  function renderGrid() {
    const list = filter === "todos" ? allItems : allItems.filter(i => i.category === filter);
    if (!list.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = list.map(item => {
      const photo = item.image
        ? `<img src="${item.image}" alt="${item.caption}" loading="lazy" decoding="async" style="${fitStyle(item.imageFit)}">`
        : (item.icon || "🖼️");
      return `
        <div class="gallery-item">
          <div class="gallery-photo">${photo}</div>
          <span class="caption">${item.caption}</span>
        </div>`;
    }).join("");
  }

  renderTabs();
  renderGrid();
})();
