/* Convierte los bloques de un artículo en HTML, con las mismas clases que usa
   articulo.php. Lo usan el blog (para mostrar el artículo destacado ya abierto)
   y la vista previa del panel administrador, para que los tres sitios pinten
   el contenido exactamente igual.
   El espejo en el servidor vive en backend/blog-lib.php. */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Artículos antiguos guardaban el cuerpo como texto con subtítulos **así**. */
  function bloquesLegacy(content) {
    const texto = String(content || "").trim();
    if (!texto) return [];
    return texto.split(/\n(?=\*\*.+?\*\*)/).map(parte => {
      const m = parte.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);
      return m
        ? { type: "text", title: m[1].trim(), text: m[2].trim() }
        : { type: "text", title: "", text: parte.trim() };
    });
  }

  function bloqueHtml(b) {
    const tipo = (b && b.type) || "text";

    if (tipo === "image") {
      if (!b.url) return "";
      return '<figure class="art-figura"><img src="' + esc(b.url) + '" alt="' + esc(b.caption) +
        '" loading="lazy" decoding="async">' +
        (b.caption ? "<figcaption>" + esc(b.caption) + "</figcaption>" : "") + "</figure>";
    }
    if (tipo === "video") {
      const embed = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(b.url) : null;
      if (!embed) return "";
      return '<div class="art-video"><iframe src="' + esc(embed) +
        '" title="Video del artículo" loading="lazy" frameborder="0" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        "allowfullscreen></iframe></div>";
    }
    if (tipo === "list") {
      const items = (b.items || []).map(i => String(i).trim()).filter(Boolean);
      if (!items.length) return "";
      const tag = b.style === "number" ? "ol" : "ul";
      return "<" + tag + ' class="art-lista">' +
        items.map(i => "<li>" + esc(i) + "</li>").join("") + "</" + tag + ">";
    }

    const titulo = String((b && b.title) || "").trim();
    const texto = String((b && b.text) || "").trim();
    if (!titulo && !texto) return "";
    const parrafos = texto.split(/\n\s*\n/)
      .map(p => p.trim()).filter(Boolean)
      .map(p => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>").join("");
    return '<div class="art-bloque">' +
      (titulo ? "<h2>" + esc(titulo) + "</h2>" : "") + parrafos + "</div>";
  }

  /* Devuelve los bloques de un artículo, ya normalizados. */
  window.RCB_BLOQUES = function (post) {
    const b = post && Array.isArray(post.contentBlocks) ? post.contentBlocks : [];
    return b.length ? b : bloquesLegacy(post && post.content);
  };

  /* Arma el cuerpo completo del artículo. */
  window.RCB_BLOQUES_HTML = function (bloques) {
    return (bloques || []).map(bloqueHtml).join("");
  };

  window.RCB_BLOQUE_HTML = bloqueHtml;
})();
