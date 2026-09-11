/* Pinta articulo.html, la versión de la página del artículo para la
   DEMOSTRACIÓN (Firebase, sin PHP). En el sitio real este trabajo lo hace
   articulo.php en el servidor.
   El armado del cuerpo es el mismo de siempre: assets/blog-bloques.js. */
(async function () {
  const main = document.getElementById("articulo-main");
  if (!main) return;
  if (window.RCB_DATA_READY) await window.RCB_DATA_READY;

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const id = new URLSearchParams(location.search).get("post") || "";
  const todos = (window.RCB_DEFAULT_POSTS || []).filter(p => p.status !== "privado");
  const post = todos.find(p => p.id === id);

  if (!post) {
    main.innerHTML = `
      <div class="container">
        <div class="art-vacio">
          <h1>Artículo no encontrado</h1>
          <p>El artículo que buscas no existe o fue movido.</p>
          <a href="blog.html" class="btn btn-primary">Volver al blog</a>
        </div>
      </div>`;
    return;
  }

  document.title = post.title + " | Blog RCB";

  const categorias = window.RCB_BLOG_CATEGORIES || [];
  const nombreCat = (categorias.find(c => c.id === post.category) || {}).name || "";

  const embedPortada = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(post.videoUrl) : null;
  const portada = embedPortada
    ? `<div class="art-video art-portada"><iframe src="${embedPortada}" title="${esc(post.title)}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    : (post.image ? `<div class="art-portada"><img src="${esc(post.image)}" alt="${esc(post.title)}"></div>` : "");

  let cuerpo = window.RCB_BLOQUES_HTML ? window.RCB_BLOQUES_HTML(window.RCB_BLOQUES(post)) : "";
  if (!cuerpo) cuerpo = `<p class="art-sin-cuerpo">Este artículo todavía no tiene contenido.</p>`;

  /* "Más artículos": primero los de la misma categoría, luego el resto. */
  const mismos = [], otros = [];
  todos.forEach(p => {
    if (p.id === post.id) return;
    if (p.category && p.category === post.category) mismos.push(p); else otros.push(p);
  });
  const relacionados = mismos.concat(otros).slice(0, 3);

  const urlActual = location.href;

  const relHtml = !relacionados.length ? "" : `
    <section class="art-mas">
      <div class="container">
        <h2>Más artículos</h2>
        <div class="art-mas-grid">
          ${relacionados.map(r => {
            const rCat = (categorias.find(c => c.id === r.category) || {}).name || "";
            const rImg = r.image || ((window.RCB_BLOQUES(r).find(b => b.type === "image") || {}).url || "");
            return `
            <a class="art-mas-card" href="articulo.html?post=${encodeURIComponent(r.id)}">
              <div class="art-mas-thumb">${
                rImg ? `<img src="${esc(rImg)}" alt="${esc(r.title)}" loading="lazy" decoding="async">`
                     : `<span class="art-mas-icono">${esc(r.icon || "📰")}</span>`
              }</div>
              <div class="art-mas-body">
                ${rCat ? `<span class="cat">${esc(rCat)}</span>` : ""}
                <h3>${esc(r.title)}</h3>
                ${r.excerpt ? `<p>${esc(r.excerpt)}</p>` : ""}
                <span class="art-mas-leer">Leer artículo →</span>
              </div>
            </a>`;
          }).join("")}
        </div>
        <div class="art-mas-todos">
          <a href="blog.html" class="btn btn-tertiary">Ver todos los artículos</a>
        </div>
      </div>
    </section>`;

  main.innerHTML = `
    <article class="art-wrap">
      <div class="container art-container">
        <div class="breadcrumb art-breadcrumb">
          <a href="index.html">Inicio</a> &nbsp;›&nbsp; <a href="blog.html">Blog</a>
          ${nombreCat ? `&nbsp;›&nbsp; ${esc(nombreCat)}` : ""}
        </div>

        <header class="art-cabecera">
          ${nombreCat ? `<span class="art-categoria">${esc(nombreCat)}</span>` : ""}
          <h1>${esc(post.title)}</h1>
          <div class="art-meta">
            ${post.date ? `<span>📅 ${esc(post.date)}</span>` : ""}
            ${post.readTime ? `<span>⏱ ${esc(post.readTime)}</span>` : ""}
          </div>
          ${post.excerpt ? `<p class="art-entradilla">${esc(post.excerpt)}</p>` : ""}
        </header>

        ${portada}

        <div class="art-cuerpo">${cuerpo}</div>

        <div class="art-compartir">
          <span>Compartir:</span>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + urlActual)}"
             target="_blank" rel="noopener" class="art-compartir-btn art-wa">
            <img src="assets/whatsapp.svg" alt="" width="16" height="16"> WhatsApp
          </a>
          <button type="button" class="art-compartir-btn art-copiar" id="copiar-enlace"
                  data-url="${esc(urlActual)}">🔗 Copiar enlace</button>
          <span class="art-copiado" id="copiado-aviso" hidden>✓ Enlace copiado</span>
        </div>
      </div>
    </article>
    ${relHtml}`;
})();
