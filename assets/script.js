document.addEventListener('DOMContentLoaded', () => {
  const homeGrid = document.getElementById('home-category-grid');
  if (homeGrid) {
    let categories = window.RCB_DEFAULT_CATEGORIES || [];
    const saved = localStorage.getItem('rcb_categories');
    if (saved) {
      try { categories = JSON.parse(saved); } catch (e) { /* usa las de por defecto */ }
    }
    homeGrid.innerHTML = categories.map(c => {
      const fit = c.imageFit || { scale: 1, x: 0, y: 0 };
      const photo = c.image
        ? `<img src="${c.image}" alt="${c.name}" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">`
        : '<span style="font-size:2rem;">🗂️</span>';
      return `
      <div class="cat-card has-photo">
        <div class="cat-photo">${photo}</div>
        <div class="cat-card-body">
          <h3>${c.name.toUpperCase()}</h3>
          <a href="productos.html?cat=${c.id}">Ver productos →</a>
        </div>
      </div>
    `;
    }).join('');
  }

  function getHomeProducts() {
    let products = window.RCB_DEFAULT_PRODUCTS || [];
    const saved = localStorage.getItem('rcb_products');
    if (saved) {
      try { products = JSON.parse(saved); } catch (e) { /* usa los de por defecto */ }
    }
    return products;
  }
  function getHomeCategories() {
    let categories = window.RCB_DEFAULT_CATEGORIES || [];
    const saved = localStorage.getItem('rcb_categories');
    if (saved) {
      try { categories = JSON.parse(saved); } catch (e) { /* usa las de por defecto */ }
    }
    return categories;
  }
  function homeCategoryName(categories, id) {
    const c = categories.find(c => c.id === id);
    return c ? c.name : '';
  }
  function homeProductCardHtml(p, categories) {
    const fit = p.imageFit || { scale: 1, x: 0, y: 0 };
    const thumb = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">`
      : (p.icon || '📦');
    const tag = p.label === 'oferta' ? '<span class="prod-tag tag-oferta">OFERTA</span>'
      : p.label === 'nuevo' ? '<span class="prod-tag tag-nuevo">NUEVO</span>' : '';
    return `
      <article class="prod-card">
        <div class="prod-thumb">${thumb}${tag}</div>
        <div class="prod-body">
          <span class="cat">${homeCategoryName(categories, p.category)}</span>
          <h3>${p.name}</h3>
          ${p.price ? `<p class="prod-price">
            ${p.oldPrice ? `<span class="prod-old-price">$${Number(p.oldPrice).toFixed(2)}</span>` : ''}
            $${Number(p.price).toFixed(2)}
          </p>` : ''}
          <div class="prod-actions">
            <a href="https://wa.me/593991234567?text=${encodeURIComponent('Hola, quiero cotizar: ' + p.name + ' (SKU ' + p.id + ')')}" class="btn btn-primary btn-sm">Cotizar</a>
            <a href="productos.html?cat=${p.category}" class="btn btn-tertiary btn-sm">Ver más</a>
          </div>
        </div>
      </article>`;
  }

  const newGrid = document.getElementById('home-new-grid');
  const newSection = document.getElementById('home-new-section');
  if (newGrid && newSection) {
    const categories = getHomeCategories();
    const items = getHomeProducts().filter(p => p.label === 'nuevo').slice(0, 4);
    if (items.length) {
      newGrid.innerHTML = items.map(p => homeProductCardHtml(p, categories)).join('');
    } else {
      newSection.style.display = 'none';
    }
  }

  const offerGrid = document.getElementById('home-offer-grid');
  const offerSection = document.getElementById('home-offer-section');
  if (offerGrid && offerSection) {
    const categories = getHomeCategories();
    const items = getHomeProducts().filter(p => p.label === 'oferta').slice(0, 4);
    if (items.length) {
      offerGrid.innerHTML = items.map(p => homeProductCardHtml(p, categories)).join('');
    } else {
      offerSection.style.display = 'none';
    }
  }

  const headerSearchInput = document.querySelector('.topbar .search-box input');
  const headerSearchBtn = document.querySelector('.topbar .search-box button');
  if (headerSearchInput) {
    function runHeaderSearch() {
      const term = headerSearchInput.value.trim();
      if (!term) return;
      const catalogSearchInput = document.getElementById('catalog-search');
      if (catalogSearchInput) {
        catalogSearchInput.value = term;
        catalogSearchInput.dispatchEvent(new Event('input'));
        catalogSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.location.href = 'productos.html?q=' + encodeURIComponent(term);
      }
    }
    headerSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); runHeaderSearch(); }
    });
    if (headerSearchBtn) headerSearchBtn.addEventListener('click', e => { e.preventDefault(); runHeaderSearch(); });

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) headerSearchInput.value = initialQuery;
  }

  const toggle = document.querySelector('.mobile-toggle');
  const navbar = document.querySelector('.navbar');
  if (toggle && navbar) {
    toggle.addEventListener('click', () => navbar.classList.toggle('nav-open'));
  }

  const tabs = document.querySelectorAll('.tab-row .tab');
  const cards = document.querySelectorAll('[data-category]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        card.style.display = (filter === 'todos' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
});
