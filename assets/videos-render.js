/* Renderiza videos.html a partir de assets/videos-data.js,
   o de lo que haya guardado el panel administrador en localStorage. */
(async function () {
  const getCategories = () => window.RCB_DEFAULT_VIDEO_CATEGORIES || [];
  const getVideos = () => window.RCB_DEFAULT_VIDEOS || [];
  function categoryName(id) {
    const c = getCategories().find(c => c.id === id);
    return c ? c.name : "General";
  }
  function fitStyle(fit) {
    fit = fit || { scale: 1, x: 0, y: 0 };
    return `transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});`;
  }
  function youtubeUrl(v) {
    return v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : "https://www.youtube.com/@RCB";
  }
  function thumbHtml(v) {
    if (v.image) {
      return `<img src="${v.image}" alt="${v.title}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;${fitStyle(v.imageFit)}">`;
    }
    if (v.youtubeId) {
      return `<img src="https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg" alt="${v.title}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;">`;
    }
    return v.icon || "🎬";
  }

  const grid = document.getElementById("video-grid");
  if (!grid) return; // no estamos en videos.html
  await window.RCB_DATA_READY;

  const allVideos = getVideos();
  let filter = "todos";

  const tabRow = document.getElementById("video-tab-row");
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

  const emptyState = document.getElementById("video-empty-state");
  function renderGrid() {
    const list = filter === "todos" ? allVideos : allVideos.filter(v => v.category === filter);
    if (!list.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = list.map(v => `
      <a class="video-card" href="${youtubeUrl(v)}" target="_blank" rel="noopener" style="display:block;">
        <div class="thumb">
          ${thumbHtml(v)}<span class="duration">${v.duration || ""}</span>
          <span class="play">▶</span>
        </div>
        <div class="body">
          <h3>${v.title}</h3>
          <p>${v.description || ""}</p>
          <div class="video-meta">${v.date || ""}${v.views ? " · " + v.views : ""}</div>
        </div>
      </a>
    `).join("");
  }

  renderTabs();
  renderGrid();
})();
