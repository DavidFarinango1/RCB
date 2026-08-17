/* Renderiza el contenido editable de "Nosotros" a partir de
   assets/about-data.js, o de lo que haya guardado el panel administrador.
   Se usa tanto en nosotros.html (página completa) como en index.html
   (resumen "Sobre RCB"). */
(async function () {
  await window.RCB_DATA_READY;
  function getAbout() {
    return window.RCB_DEFAULT_ABOUT || {};
  }
  function fitStyle(fit) {
    fit = fit || { scale: 1, x: 0, y: 0 };
    return `translate(${fit.x}%, ${fit.y}%) scale(${fit.scale})`;
  }

  const about = getAbout();

  /* ---------- Resumen en el Inicio ---------- */
  const homeImgEl = document.getElementById("home-about-image");
  if (homeImgEl && about.introImage) {
    homeImgEl.src = about.introImage;
    homeImgEl.style.transform = fitStyle(about.introImageFit);
  }
  const homeTextEl = document.getElementById("home-about-text");
  if (homeTextEl) homeTextEl.textContent = about.introText;

  /* ---------- Página completa Nosotros ---------- */
  const introTitleEl = document.getElementById("about-intro-title");
  if (!introTitleEl) return; // no estamos en nosotros.html

  introTitleEl.textContent = about.introTitle;
  document.getElementById("about-intro-text").textContent = about.introText;
  const introImgEl = document.getElementById("about-intro-image");
  if (introImgEl && about.introImage) {
    introImgEl.src = about.introImage;
    introImgEl.style.transform = fitStyle(about.introImageFit);
  }

  const statsRow = document.getElementById("about-stats-row");
  if (statsRow && Array.isArray(about.stats)) {
    statsRow.innerHTML = about.stats.map(s => `<div class="stat-box"><strong>${s.value}</strong><span>${s.label}</span></div>`).join("");
  }

  document.getElementById("about-historia-title").textContent = about.historiaTitle;
  const historiaTextEl = document.getElementById("about-historia-text");
  if (historiaTextEl) {
    historiaTextEl.innerHTML = (about.historiaText || "").split(/\n\s*\n/).map(p => `<p>${p.trim()}</p>`).join("");
  }
  const historiaImgEl = document.getElementById("about-historia-image");
  if (historiaImgEl && about.historiaImage) {
    historiaImgEl.src = about.historiaImage;
    historiaImgEl.style.transform = fitStyle(about.historiaImageFit);
  }

  const misionEl = document.getElementById("about-mision-text");
  if (misionEl) misionEl.textContent = about.mision;
  const visionEl = document.getElementById("about-vision-text");
  if (visionEl) visionEl.textContent = about.vision;

  const valoresGrid = document.getElementById("about-valores-grid");
  if (valoresGrid && Array.isArray(about.valores)) {
    valoresGrid.innerHTML = about.valores.map(v => `
      <div class="cat-card">
        <div class="cat-icon">${v.icon}</div>
        <h3>${v.text}</h3>
      </div>
    `).join("");
  }

  const propositoEl = document.getElementById("about-proposito-text");
  if (propositoEl) propositoEl.textContent = about.proposito;
})();
