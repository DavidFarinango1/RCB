/* Pinta el banner (encabezado) de la sección actual con lo que el
   administrador haya guardado: título, subtítulo e imagen de fondo.
   La página se marca con data-section="inicio|productos|blog|videos|contacto"
   en su <section class="hero"> o <section class="page-header">. */
(async function () {
  if (window.RCB_DATA_READY) await window.RCB_DATA_READY;

  const box = document.querySelector("[data-section]");
  if (!box) return;

  const all = window.RCB_DEFAULT_SECTIONS || {};
  const data = all[box.dataset.section];
  if (!data) return;

  /* El título admite saltos de línea y resalta en azul la "palabra destacada".
     El armado vive en sections-data.js para que la vista previa del panel
     administrador use exactamente la misma lógica. */
  const h1 = box.querySelector("h1");
  if (h1 && data.title && window.RCB_SECTION_TITLE_HTML) {
    h1.innerHTML = window.RCB_SECTION_TITLE_HTML(data.title, data.accent);
  }

  const p = box.querySelector("p.lead") || box.querySelector("p");
  if (p && data.subtitle) p.textContent = data.subtitle;

  /* La imagen se pasa como variable CSS para no perder el degradado azul
     que define styles.css (ahí está el único lugar donde vive el degradado). */
  if (data.image && window.RCB_SECTION_IMAGE_CSS) {
    box.style.setProperty("--section-img", window.RCB_SECTION_IMAGE_CSS(data.image));
  }
  if (data.imagePos) box.style.setProperty("--section-pos", data.imagePos);
  /* Oscurecido regulable (0-100 en el panel, 0-0.9 en CSS). */
  box.style.setProperty("--section-veil", (Number(data.overlay) || 0) / 100 * 0.9);
  /* Intensidad del degradado azul lateral (100 = el de siempre, 0 = sin él). */
  const tint = data.tint == null ? 100 : Number(data.tint);
  box.style.setProperty("--section-tint", (isNaN(tint) ? 100 : tint) / 100);

  /* Banner de Inicio sin textos: quedan solo los dos botones. El título se
     mantiene en la página (oculto a la vista) porque es el encabezado
     principal que lee Google; el texto y los destacados sí se ocultan. */
  if (data.mostrarTextos === false) box.classList.add("hero-solo-botones");
  /* Y sin los dos botones: el banner queda solo con la imagen. */
  if (data.mostrarBotones === false) box.classList.add("hero-sin-botones");

  /* Los tres destacados existen solo en el banner de Inicio. */
  if (Array.isArray(data.features)) {
    const items = box.querySelectorAll(".hero-feature");
    data.features.forEach((f, i) => {
      const item = items[i];
      if (!item) return;
      /* Se busca a partir del <strong>: el <span> del icono es hermano del
         bloque de texto y no debe tocarse (dentro lleva el SVG). */
      const strong = item.querySelector("strong");
      if (!strong) return;
      const span = strong.parentElement.querySelector("span");
      if (f.title) strong.textContent = f.title;
      if (span && f.text) span.textContent = f.text;
    });
  }
})();
