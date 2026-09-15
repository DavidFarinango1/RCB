/* Panel administrador. Los datos se guardan en una base de datos MySQL real
   a través de backend/api.php — los cambios se ven para todos los visitantes,
   en cualquier dispositivo. El inicio de sesión también lo valida el servidor. */
(function () {
  const KEY_PRODUCTS = "rcb_products";
  const KEY_CATEGORIES = "rcb_categories";
  const SESSION_KEY = "rcb_admin_session";
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

  const loginBox = document.getElementById("admin-login");
  const shell = document.getElementById("admin-shell");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");
  const loginPassToggle = document.getElementById("login-pass-toggle");
  if (loginPassToggle) {
    loginPassToggle.addEventListener("click", () => {
      const passInput = document.getElementById("login-pass");
      const showing = passInput.type === "text";
      passInput.type = showing ? "password" : "text";
      loginPassToggle.textContent = showing ? "👁️" : "🙈";
      loginPassToggle.setAttribute("aria-label", showing ? "Mostrar contraseña" : "Ocultar contraseña");
    });
  }

  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "true"; }
  function showApp() { loginBox.style.display = "none"; shell.classList.add("open"); renderAll(); }
  function showLogin() { shell.classList.remove("open"); loginBox.style.display = "flex"; }

  /* ---------- Datos: caché en memoria respaldado por backend/api.php (MySQL) ---------- */
  const CACHE = {};
  const RESOURCE_KEYS = ["products", "categories", "posts", "blog_categories", "videos", "video_categories", "about", "settings", "sections"];
  async function bootstrapCache() {
    await Promise.all(RESOURCE_KEYS.map(async resource => {
      try {
        CACHE["rcb_" + resource] = await RCB_API.get(resource);
      } catch (e) {
        console.error("No se pudo cargar '" + resource + "' del servidor:", e);
      }
    }));
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const user = document.getElementById("login-user").value.trim();
      const pass = document.getElementById("login-pass").value;
      try {
        await RCB_API.login(user, pass);
        sessionStorage.setItem(SESSION_KEY, "true");
        loginError.style.display = "none";
        await bootstrapCache();
        showApp();
      } catch (err) {
        loginError.style.display = "block";
      }
    });
  }
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    RCB_API.logout().catch(() => {});
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  /* ---------- Pestañas del sidebar ---------- */
  const tabLinks = document.querySelectorAll("[data-tab]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");
  const adminSidebar = document.getElementById("admin-sidebar");
  const adminDrawerBackdrop = document.getElementById("admin-drawer-backdrop");
  const adminMobileTitle = document.getElementById("admin-mobile-title");

  function closeDrawer() {
    if (adminSidebar) adminSidebar.classList.remove("open");
    if (adminDrawerBackdrop) adminDrawerBackdrop.classList.remove("open");
  }
  function openDrawer() {
    if (adminSidebar) adminSidebar.classList.add("open");
    if (adminDrawerBackdrop) adminDrawerBackdrop.classList.add("open");
  }
  const adminMenuToggle = document.getElementById("admin-menu-toggle");
  if (adminMenuToggle) adminMenuToggle.addEventListener("click", openDrawer);
  if (adminDrawerBackdrop) adminDrawerBackdrop.addEventListener("click", closeDrawer);

  tabLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      tabLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const target = link.dataset.tab;
      tabPanels.forEach(panel => {
        panel.style.display = panel.dataset.tabPanel === target ? "" : "none";
      });
      if (adminMobileTitle) adminMobileTitle.textContent = link.textContent.trim().replace(/^\S+\s/, "").replace(/\s*\d+\s*$/, "");
      closeDrawer();
    });
  });

  function updateNavBadges() {
    const setBadge = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
    setBadge("nav-badge-productos", getProducts().length);
    setBadge("nav-badge-categorias", getCategories().length);
    setBadge("nav-badge-blog", getPosts().length);
    setBadge("nav-badge-videos", getVideos().length);
  }

  /* ---------- Almacenamiento (caché en memoria + backend/api.php) ---------- */
  function load(key, fallback) {
    const cached = CACHE[key];
    if (cached === undefined || cached === null) return fallback;
    /* Una lista vacía en el servidor = "sin datos": se muestran los de ejemplo,
       igual que hacen las páginas públicas. Al guardar, pasan a ser reales. */
    if (Array.isArray(cached) && cached.length === 0) return fallback;
    return cached;
  }
  function save(key, value) {
    CACHE[key] = value;
    const resource = key.replace(/^rcb_/, "");
    RCB_API.save(resource, value).catch(e => {
      alert("No se pudo guardar en el servidor: " + e.message);
    });
    return true;
  }

  const getProducts = () => load(KEY_PRODUCTS, (window.RCB_DEFAULT_PRODUCTS || []).slice());
  const saveProducts = list => save(KEY_PRODUCTS, list);
  const getCategories = () => load(KEY_CATEGORIES, (window.RCB_DEFAULT_CATEGORIES || []).slice());
  const saveCategories = list => save(KEY_CATEGORIES, list);

  function categoryName(id) {
    const c = getCategories().find(c => c.id === id);
    return c ? c.name : "Sin categoría";
  }
  function slugify(str) {
    return str.toLowerCase().trim()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  function uniqueId(base, existingIds) {
    let id = base, n = 2;
    while (existingIds.includes(id)) { id = base + "-" + n; n++; }
    return id;
  }
  /* Sube la imagen al servidor y entrega su URL (ya no base64: las imágenes
     se guardan como archivos reales y las páginas cargan mucho más rápido). */
  function readImageFile(input, callback) {
    const file = input.files && input.files[0];
    if (!file) { callback(null); return; }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("La imagen supera 8 MB. Elige una más liviana.");
      input.value = "";
      callback(undefined);
      return;
    }
    RCB_API.uploadImage(file)
      .then(url => callback(url))
      .catch(err => {
        alert(err.message || "No se pudo subir la imagen.");
        input.value = "";
        callback(undefined);
      });
  }

  /* ---------- Ajustador de imagen (mover / zoom / restablecer) ---------- */
  function defaultFit() { return { scale: 1, x: 0, y: 0 }; }
  function clampFit(fit) {
    fit.scale = Math.min(3, Math.max(0.5, fit.scale));
    const bound = 40;
    fit.x = Math.min(bound, Math.max(-bound, fit.x));
    fit.y = Math.min(bound, Math.max(-bound, fit.y));
    return fit;
  }
  function applyFit(boxEl, fit) {
    const img = boxEl.querySelector("img");
    if (img) img.style.transform = `translate(${fit.x}%, ${fit.y}%) scale(${fit.scale})`;
  }

  function setupImageAdjuster(opts) {
    const { box, toolbar, zoomInBtn, zoomOutBtn, resetBtn, getFit, setFit } = opts;
    let dragging = false, startX = 0, startY = 0, startFit = null;

    function refresh() {
      const hasImage = !!box.querySelector("img");
      box.classList.toggle("has-image", hasImage);
      toolbar.style.display = hasImage ? "flex" : "none";
      if (hasImage) applyFit(box, getFit());
    }

    box.addEventListener("mousedown", e => {
      if (!box.querySelector("img")) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startFit = { ...getFit() };
      e.preventDefault();
    });
    window.addEventListener("mousemove", e => {
      if (!dragging) return;
      const rect = box.getBoundingClientRect();
      const fit = clampFit({
        scale: startFit.scale,
        x: startFit.x + ((e.clientX - startX) / rect.width) * 100,
        y: startFit.y + ((e.clientY - startY) / rect.height) * 100
      });
      setFit(fit);
      applyFit(box, fit);
    });
    window.addEventListener("mouseup", () => { dragging = false; });

    zoomInBtn.addEventListener("click", () => {
      const fit = clampFit({ ...getFit(), scale: getFit().scale + 0.2 });
      setFit(fit);
      applyFit(box, fit);
    });
    zoomOutBtn.addEventListener("click", () => {
      const fit = clampFit({ ...getFit(), scale: getFit().scale - 0.2 });
      setFit(fit);
      applyFit(box, fit);
    });
    resetBtn.addEventListener("click", () => {
      const fit = defaultFit();
      setFit(fit);
      applyFit(box, fit);
    });

    return { refresh };
  }

  /* ================= PRODUCTOS ================= */
  const tableBody = document.getElementById("admin-table-body");
  const statTotal = document.getElementById("stat-total");
  const statCats = document.getElementById("stat-cats");
  const statValue = document.getElementById("stat-value");
  const statOut = document.getElementById("stat-out");

  const formOverlay = document.getElementById("admin-form-overlay");
  const form = document.getElementById("product-form");
  const formTitle = document.getElementById("form-title");
  const addBtn = document.getElementById("add-product-btn");
  const cancelBtn = document.getElementById("cancel-form-btn");
  const categorySelect = document.getElementById("field-category");
  const productImagenesBox = document.getElementById("product-imagenes");

  let editingId = null;
  /* Hasta 3 imágenes por producto. La primera es la que se ve en el catálogo
     y en el inicio; las otras dos son miniaturas dentro de la ficha. */
  const MAX_IMAGENES = window.RCB_MAX_IMAGENES_PRODUCTO || 3;
  let imagenesProducto = [];

  function renderImagenesProducto() {
    if (!productImagenesBox) return;

    /* La foto se muestra COMPLETA por defecto. Con mover y acercar se puede
       ajustar a gusto; lo que se ve aquí es exactamente lo que verá el cliente. */
    productImagenesBox.innerHTML = Array.from({ length: MAX_IMAGENES }, (_, i) => {
      const im = imagenesProducto[i];
      return `
      <div class="prod-imagen-slot" data-slot="${i}">
        <div class="prod-imagen-cabecera">
          <span class="prod-imagen-etiqueta">${i === 0 ? "Imagen principal" : "Imagen " + (i + 1)}</span>
          ${im ? `<button type="button" class="btn btn-tertiary btn-sm prod-imagen-quitar" title="Quitar">✕</button>` : ""}
        </div>
        <div class="admin-image-upload prod-imagen-previa" data-previa="${i}">${
          im ? `<img src="${im.url}" alt="">` : (i === 0 ? "Sube la imagen principal" : "Opcional")
        }</div>
        <div class="img-adjust-toolbar" data-toolbar="${i}" style="display:${im ? "" : "none"};">
          <button type="button" data-zoom-out="${i}" title="Alejar">−</button>
          <span class="img-adjust-hint">Arrastra para mover</span>
          <button type="button" data-zoom-in="${i}" title="Acercar">+</button>
          <button type="button" data-reset-fit="${i}" class="reset-btn">Restablecer</button>
        </div>
        <input type="file" data-archivo="${i}" accept="image/*">
      </div>`;
    }).join("");

    for (let i = 0; i < MAX_IMAGENES; i++) {
      const ajustador = setupImageAdjuster({
        box: productImagenesBox.querySelector(`[data-previa="${i}"]`),
        toolbar: productImagenesBox.querySelector(`[data-toolbar="${i}"]`),
        zoomInBtn: productImagenesBox.querySelector(`[data-zoom-in="${i}"]`),
        zoomOutBtn: productImagenesBox.querySelector(`[data-zoom-out="${i}"]`),
        resetBtn: productImagenesBox.querySelector(`[data-reset-fit="${i}"]`),
        getFit: () => (imagenesProducto[i] ? imagenesProducto[i].fit : defaultFit()),
        setFit: fit => { if (imagenesProducto[i]) imagenesProducto[i].fit = fit; }
      });
      if (ajustador) ajustador.refresh();

      const input = productImagenesBox.querySelector(`[data-archivo="${i}"]`);
      if (input) {
        input.addEventListener("change", () => {
          readImageFile(input, url => {
            if (url === undefined) return;
            if (!url) return;
            imagenesProducto[i] = { url: url, fit: defaultFit() };
            renderImagenesProducto();
          });
        });
      }

      const quitar = productImagenesBox.querySelector(`[data-slot="${i}"] .prod-imagen-quitar`);
      if (quitar) {
        quitar.addEventListener("click", () => {
          /* Se quita el hueco para que no queden espacios vacíos en medio. */
          imagenesProducto.splice(i, 1);
          renderImagenesProducto();
        });
      }
    }
  }

  /* ---------- Video corto del producto (solo categoría Herramientas) ---------- */
  const CATEGORIA_CON_VIDEO = "herramientas";
  const videoFila = document.getElementById("product-video-fila");
  const videoInput = document.getElementById("field-video");
  const videoAviso = document.getElementById("field-video-aviso");
  const videoPrevia = document.getElementById("field-video-previa");

  /* El campo solo aparece cuando el producto es de Herramientas. */
  function actualizarCampoVideo() {
    if (!videoFila) return;
    const esHerramienta = categorySelect && categorySelect.value === CATEGORIA_CON_VIDEO;
    videoFila.hidden = !esHerramienta;
    /* Oculto no debe seguir reproduciendo nada. */
    if (!esHerramienta && videoPrevia) videoPrevia.innerHTML = "";
    if (esHerramienta) revisarVideoProducto();
  }

  /* Avisa en el momento si el enlace sirve y muestra el video. */
  function revisarVideoProducto() {
    if (!videoInput || !videoAviso || !videoPrevia) return;
    const url = videoInput.value.trim();
    const info = window.RCB_VIDEO_CORTO ? window.RCB_VIDEO_CORTO(url) : null;

    if (!url) {
      videoAviso.textContent = "";
      videoAviso.className = "bloque-aviso";
      videoPrevia.innerHTML = "";
      return;
    }
    if (info) {
      videoAviso.textContent = "✓ Video corto de " + info.servicio + " verificado. Se reproducirá dentro de la ficha del producto.";
      videoAviso.className = "bloque-aviso es-ok";
      if (!videoPrevia.querySelector('iframe[src="' + info.url + '"]')) {
        videoPrevia.innerHTML = `<iframe src="${info.url}" frameborder="0" allowfullscreen></iframe>`;
      }
    } else {
      videoAviso.textContent = "✕ " + (window.RCB_VIDEO_CORTO_MOTIVO ? window.RCB_VIDEO_CORTO_MOTIVO(url) : "Enlace no reconocido.");
      videoAviso.className = "bloque-aviso es-error";
      videoPrevia.innerHTML = "";
    }
  }
  if (videoInput) videoInput.addEventListener("input", revisarVideoProducto);
  if (categorySelect) categorySelect.addEventListener("change", actualizarCampoVideo);

  function populateCategorySelect(selectEl) {
    selectEl.innerHTML = getCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  function renderStats(list) {
    if (!statTotal) return;
    const cats = new Set(list.map(p => p.category));
    const totalValue = list.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const outCount = list.filter(p => !p.stock).length;
    statTotal.textContent = list.length;
    statCats.textContent = cats.size;
    statValue.textContent = "$" + totalValue.toFixed(2);
    statOut.textContent = outCount;
  }

  /* ---------- Filtros de la tabla de productos ---------- */
  const productFilter = { category: "todos", search: "", status: "todos" };
  const productFilterSearch = document.getElementById("product-filter-search");
  const productFilterStatus = document.getElementById("product-filter-status");
  const productFilterCategories = document.getElementById("product-filter-categories");
  const productFilterCount = document.getElementById("product-filter-count");

  function renderProductFilterPills() {
    if (!productFilterCategories) return;
    const all = getProducts();
    const cats = getCategories();
    let html = `<span class="tab ${productFilter.category === 'todos' ? 'active' : ''}" data-cat="todos">Todos (${all.length})</span>`;
    cats.forEach(c => {
      const count = all.filter(p => p.category === c.id).length;
      html += `<span class="tab ${productFilter.category === c.id ? 'active' : ''}" data-cat="${c.id}">${c.name} (${count})</span>`;
    });
    productFilterCategories.innerHTML = html;
    productFilterCategories.querySelectorAll("[data-cat]").forEach(el => {
      el.addEventListener("click", () => {
        productFilter.category = el.dataset.cat;
        renderTable();
      });
    });
  }

  function getFilteredProducts() {
    let list = getProducts();
    if (productFilter.category !== "todos") list = list.filter(p => p.category === productFilter.category);
    if (productFilter.status === "stock") list = list.filter(p => p.stock);
    if (productFilter.status === "agotado") list = list.filter(p => !p.stock);
    if (productFilter.search.trim()) {
      const q = productFilter.search.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }

  if (productFilterSearch) {
    productFilterSearch.addEventListener("input", () => {
      productFilter.search = productFilterSearch.value;
      renderTable();
    });
  }
  if (productFilterStatus) {
    productFilterStatus.addEventListener("change", () => {
      productFilter.status = productFilterStatus.value;
      renderTable();
    });
  }

  function renderTable() {
    updateNavBadges();
    const fullList = getProducts();
    renderStats(fullList);
    renderProductFilterPills();
    const list = getFilteredProducts();
    if (productFilterCount) {
      productFilterCount.textContent = list.length + (list.length === 1 ? " producto encontrado" : " productos encontrados");
    }
    if (!tableBody) return;
    if (!list.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#94A3B8;padding:20px;">No hay productos que coincidan con el filtro.</td></tr>`;
      return;
    }
    tableBody.innerHTML = list.map(p => {
      /* Igual que en la web: foto completa, con el ajuste de mover/acercar. */
      const fit = p.imageFit || defaultFit();
      const thumb = p.image ? `<img src="${p.image}" alt="" class="prod-img-completa" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (p.icon || "📦");
      return `
      <tr>
        <td><div class="admin-thumb">${thumb}</div></td>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${categoryName(p.category)}</td>
        <td>$${Number(p.price).toFixed(2)}${p.oldPrice ? ` <span style="text-decoration:line-through;color:#94A3B8;">$${Number(p.oldPrice).toFixed(2)}</span>` : ""}</td>
        <td>${p.stock ? "En stock" : "Agotado"}</td>
        <td>
          <div class="row-actions">
            <button data-edit="${p.id}">Editar</button>
            <button data-del="${p.id}" class="del-btn">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
    }).join("");

    tableBody.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openForm(btn.dataset.edit)));
    tableBody.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteProduct(btn.dataset.del)));
  }

  function openForm(id) {
    editingId = id || null;
    const list = getProducts();
    const p = id ? list.find(x => x.id === id) : null;

    formTitle.textContent = p ? "Editar producto" : "Agregar producto";
    document.getElementById("field-id").value = p ? p.id : "";
    document.getElementById("field-id").disabled = !!p;
    document.getElementById("field-name").value = p ? p.name : "";
    populateCategorySelect(categorySelect);
    categorySelect.value = p ? p.category : (getCategories()[0] || {}).id || "";
    document.getElementById("field-price").value = p ? p.price : "";
    document.getElementById("field-oldprice").value = p && p.oldPrice ? p.oldPrice : "";
    document.getElementById("field-label").value = p ? (p.label || "") : "";
    document.getElementById("field-stock").checked = p ? !!p.stock : true;
    document.getElementById("field-description").value = p ? p.description : "";
    document.getElementById("field-specs").value = p ? (p.specs || []).join("\n") : "";
    /* Entiende los dos formatos: los productos antiguos traen una sola imagen
       en "image", los nuevos traen hasta tres en "images". */
    imagenesProducto = window.RCB_IMAGENES_PRODUCTO
      ? window.RCB_IMAGENES_PRODUCTO(p).map(im => ({ url: im.url, fit: { ...im.fit } }))
      : [];
    renderImagenesProducto();
    if (videoInput) videoInput.value = p ? (p.video || "") : "";
    actualizarCampoVideo();

    formOverlay.classList.add("open");
  }
  function closeForm() {
    formOverlay.classList.remove("open");
    form.reset();
    /* Vacía las vistas previas de video para que no sigan sonando. */
    if (videoPrevia) videoPrevia.innerHTML = "";
  }
  function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    saveProducts(getProducts().filter(p => p.id !== id));
    renderTable();
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const list = getProducts();

      /* El video corto solo existe para Herramientas. Si el enlace no sirve,
         no se guarda en silencio: se avisa para que lo corrijan o lo borren. */
      const esHerramienta = categorySelect.value === CATEGORIA_CON_VIDEO;
      const enlaceVideo = esHerramienta && videoInput ? videoInput.value.trim() : "";
      if (enlaceVideo && !(window.RCB_VIDEO_CORTO && window.RCB_VIDEO_CORTO(enlaceVideo))) {
        alert("El enlace del video corto no sirve:\n\n" + enlaceVideo + "\n\n" +
          (window.RCB_VIDEO_CORTO_MOTIVO ? window.RCB_VIDEO_CORTO_MOTIVO(enlaceVideo) : "") +
          "\n\nCorrígelo o bórralo antes de guardar.");
        return;
      }

      const product = {
        id: editingId || document.getElementById("field-id").value.trim().toUpperCase().replace(/\s+/g, "-"),
        name: document.getElementById("field-name").value.trim(),
        category: categorySelect.value,
        price: parseFloat(document.getElementById("field-price").value) || 0,
        oldPrice: document.getElementById("field-oldprice").value ? parseFloat(document.getElementById("field-oldprice").value) : null,
        label: document.getElementById("field-label").value || "",
        /* Se guardan las hasta 3 imágenes, y además la primera se deja en
           "image" como siempre: es la que leen la tarjeta del catálogo, la del
           inicio y la tabla del panel, que así no necesitan cambiar. */
        images: imagenesProducto.map(im => ({ url: im.url, fit: im.fit })),
        image: imagenesProducto.length ? imagenesProducto[0].url : null,
        imageFit: imagenesProducto.length ? imagenesProducto[0].fit : defaultFit(),
        video: enlaceVideo,
        stock: document.getElementById("field-stock").checked,
        description: document.getElementById("field-description").value.trim(),
        specs: document.getElementById("field-specs").value.split("\n").map(s => s.trim()).filter(Boolean)
      };

      if (!product.id || !product.name) return;

      if (editingId) {
        const idx = list.findIndex(p => p.id === editingId);
        if (idx > -1) list.splice(idx, 1);
        list.unshift(product);
      } else {
        if (list.some(p => p.id === product.id)) { alert("Ya existe un producto con ese SKU. Usa otro código."); return; }
        list.unshift(product);
      }

      if (!saveProducts(list)) return;
      document.getElementById("field-id").disabled = false;
      closeForm();
      renderTable();
      renderCategoryChips();
    });
  }

  if (addBtn) addBtn.addEventListener("click", () => openForm(null));
  if (cancelBtn) cancelBtn.addEventListener("click", closeForm);

  /* ================= CATEGORÍAS ================= */
  const catOverlay = document.getElementById("category-form-overlay");
  const catForm = document.getElementById("category-form");
  const catFormTitle = document.getElementById("category-form-title");
  const catNameInput = document.getElementById("cat-field-name");
  const catShortInput = document.getElementById("cat-field-short");
  const catImageInput = document.getElementById("cat-field-image");
  const catImagePreview = document.getElementById("category-image-preview");
  const catImageToolbar = document.getElementById("category-image-toolbar");
  const addCategoryBtn = document.getElementById("add-category-btn");
  const cancelCategoryBtn = document.getElementById("cancel-category-form-btn");
  const catChipGrid = document.getElementById("category-chip-grid");

  let editingCategoryId = null;
  let currentCategoryImage = null;
  let currentCategoryImageFit = defaultFit();

  const categoryAdjuster = setupImageAdjuster({
    box: catImagePreview,
    toolbar: catImageToolbar,
    zoomInBtn: document.getElementById("category-zoom-in"),
    zoomOutBtn: document.getElementById("category-zoom-out"),
    resetBtn: document.getElementById("category-reset-fit"),
    getFit: () => currentCategoryImageFit,
    setFit: fit => { currentCategoryImageFit = fit; }
  });

  if (catImageInput) {
    catImageInput.addEventListener("change", () => {
      readImageFile(catImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentCategoryImage = dataUrl;
        currentCategoryImageFit = defaultFit();
        catImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Sin imagen";
        categoryAdjuster.refresh();
      });
    });
  }

  function openCategoryForm(id) {
    editingCategoryId = id || null;
    const c = id ? getCategories().find(x => x.id === id) : null;
    catFormTitle.textContent = c ? "Editar categoría" : "Agregar categoría";
    catNameInput.value = c ? c.name : "";
    catShortInput.value = c ? (c.shortName || "") : "";
    currentCategoryImage = c ? (c.image || null) : null;
    currentCategoryImageFit = c && c.imageFit ? { ...c.imageFit } : defaultFit();
    catImagePreview.innerHTML = currentCategoryImage ? `<img src="${currentCategoryImage}" alt="">` : "Sin imagen";
    catImageInput.value = "";
    categoryAdjuster.refresh();
    catOverlay.classList.add("open");
  }
  function closeCategoryForm() { catOverlay.classList.remove("open"); catForm.reset(); }

  function deleteCategory(id) {
    const usedByProducts = getProducts().some(p => p.category === id);
    const warn = usedByProducts ? "Hay productos usando esta categoría; quedarán sin categoría válida. " : "";
    if (!confirm(warn + "¿Eliminar esta categoría?")) return;
    saveCategories(getCategories().filter(c => c.id !== id));
    renderCategoryChips();
    renderTable();
  }

  if (catForm) {
    catForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = catNameInput.value.trim();
      if (!name) return;
      const list = getCategories();
      if (editingCategoryId) {
        const idx = list.findIndex(c => c.id === editingCategoryId);
        if (idx > -1) list[idx] = { ...list[idx], name, shortName: catShortInput.value.trim(), image: currentCategoryImage, imageFit: currentCategoryImageFit };
      } else {
        const id = uniqueId(slugify(name) || ("cat-" + Date.now()), list.map(c => c.id));
        list.push({ id, name, shortName: catShortInput.value.trim(), image: currentCategoryImage, imageFit: currentCategoryImageFit });
      }
      if (!saveCategories(list)) return;
      closeCategoryForm();
      renderCategoryChips();
      populateCategorySelect(categorySelect);
      populateCategorySelect(document.getElementById("sub-field-category"));
    });
  }
  if (addCategoryBtn) addCategoryBtn.addEventListener("click", () => openCategoryForm(null));
  if (cancelCategoryBtn) cancelCategoryBtn.addEventListener("click", closeCategoryForm);

  function renderCategoryChips() {
    updateNavBadges();
    if (!catChipGrid) return;
    const cats = getCategories();
    const products = getProducts();
    catChipGrid.innerHTML = cats.map(c => {
      const count = products.filter(p => p.category === c.id).length;
      const cFit = c.imageFit || defaultFit();
      const thumb = c.image ? `<img src="${c.image}" alt="" style="transform:translate(${cFit.x}%, ${cFit.y}%) scale(${cFit.scale});">` : "🗂️";
      return `
        <div class="admin-chip">
          <div class="admin-chip-thumb">${thumb}</div>
          <div class="admin-chip-body"><strong>${c.name}</strong><span>${count} producto(s)</span></div>
          <div class="admin-chip-actions">
            <button data-cat-edit="${c.id}" style="border:none;background:var(--borde);padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.72rem;">✎</button>
            <button data-cat-del="${c.id}" style="border:none;background:var(--borde);padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.72rem;color:#DC2626;">🗑</button>
          </div>
        </div>`;
    }).join("") || `<p style="color:#94A3B8;font-size:0.85rem;">Aún no hay categorías.</p>`;
    catChipGrid.querySelectorAll("[data-cat-edit]").forEach(b => b.addEventListener("click", () => openCategoryForm(b.dataset.catEdit)));
    catChipGrid.querySelectorAll("[data-cat-del]").forEach(b => b.addEventListener("click", () => deleteCategory(b.dataset.catDel)));
  }

  /* ================= BLOG ================= */
  const KEY_POSTS = "rcb_posts";
  const KEY_BLOG_CATEGORIES = "rcb_blog_categories";
  const getPosts = () => load(KEY_POSTS, (window.RCB_DEFAULT_POSTS || []).slice());
  const savePosts = list => save(KEY_POSTS, list);
  const getBlogCategories = () => load(KEY_BLOG_CATEGORIES, (window.RCB_BLOG_CATEGORIES || []).slice());
  const saveBlogCategories = list => save(KEY_BLOG_CATEGORIES, list);
  function blogCategoryName(id) {
    const c = getBlogCategories().find(c => c.id === id);
    return c ? c.name : "General";
  }

  const blogCatNameInput = document.getElementById("blog-cat-name");
  const addBlogCategoryBtn = document.getElementById("add-blog-category-btn");
  const blogCatChipGrid = document.getElementById("blog-category-chip-grid");

  function renderBlogCategoryChips() {
    if (!blogCatChipGrid) return;
    const cats = getBlogCategories();
    const posts = getPosts();
    blogCatChipGrid.innerHTML = cats.map(c => {
      const count = posts.filter(p => p.category === c.id).length;
      return `
        <div class="admin-chip">
          <div class="admin-chip-thumb">📝</div>
          <div class="admin-chip-body"><strong>${c.name}</strong><span>${count} entrada(s)</span></div>
          <div class="admin-chip-actions">
            <button data-blogcat-del="${c.id}" style="border:none;background:#fff;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.72rem;color:#DC2626;">🗑</button>
          </div>
        </div>`;
    }).join("") || `<p style="color:#94A3B8;font-size:0.85rem;">Aún no hay categorías de blog.</p>`;
    blogCatChipGrid.querySelectorAll("[data-blogcat-del]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.blogcatDel;
      const used = getPosts().some(p => p.category === id);
      if (!confirm((used ? "Hay entradas usando esta categoría; quedarán sin categoría válida. " : "") + "¿Eliminar esta categoría de blog?")) return;
      saveBlogCategories(getBlogCategories().filter(c => c.id !== id));
      renderBlogCategoryChips();
      populatePostCategorySelect();
      renderPostsTable();
    }));
  }

  if (addBlogCategoryBtn) {
    addBlogCategoryBtn.addEventListener("click", () => {
      const name = blogCatNameInput.value.trim();
      if (!name) return;
      const list = getBlogCategories();
      const id = uniqueId(slugify(name) || ("blogcat-" + Date.now()), list.map(c => c.id));
      list.push({ id, name });
      saveBlogCategories(list);
      blogCatNameInput.value = "";
      renderBlogCategoryChips();
      populatePostCategorySelect();
    });
  }

  const postTableBody = document.getElementById("admin-post-table-body");
  const postOverlay = document.getElementById("post-form-overlay");
  const postForm = document.getElementById("post-form");
  const postFormTitle = document.getElementById("post-form-title");
  const postCategorySelect = document.getElementById("post-field-category");
  const addPostBtn = document.getElementById("add-post-btn");
  const cancelPostBtn = document.getElementById("cancel-post-form-btn");
  const volverPostBtn = document.getElementById("volver-post-form-btn");
  const postImageInput = document.getElementById("post-field-image");
  const postImagePreview = document.getElementById("post-image-preview");
  const postImageToolbar = document.getElementById("post-image-toolbar");
  const postVideoInput = document.getElementById("post-field-video");
  const postContentBlocksBox = document.getElementById("post-content-blocks");
  const postAddContentBlockBtn = document.getElementById("post-add-content-block");

  let editingPostId = null;
  let currentPostImage = null;
  let currentPostImageFit = defaultFit();

  /* Artículos viejos guardaban el cuerpo como un texto con subtítulos
     marcados **así**. Se convierten a bloques para no perder nada. */
  function contentToBlocks(content) {
    const text = (content || "").trim();
    if (!text) return [{ type: "text", title: "", text: "" }];
    const parts = text.split(/\n(?=\*\*.+?\*\*)/);
    return parts.map(part => {
      const m = part.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);
      return m
        ? { type: "text", title: m[1].trim(), text: m[2].trim() }
        : { type: "text", title: "", text: part.trim() };
    });
  }
  /* ---------- Fechas ----------
     El calendario trabaja con 2024-05-20, pero en el artículo se muestra
     "20 mayo, 2024", que es como están guardadas las entradas existentes.
     Se guardan las dos: la legible para mostrar y la ISO para el calendario. */
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function isoALegible(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
    if (!m) return "";
    return Number(m[3]) + " " + MESES[Number(m[2]) - 1] + ", " + m[1];
  }
  function legibleAIso(texto) {
    const t = String(texto || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const m = /^(\d{1,2})\s+([a-záéíóúñ]+),?\s+(\d{4})$/i.exec(t);
    if (!m) return "";
    const mes = MESES.indexOf(m[2].toLowerCase());
    if (mes === -1) return "";
    return m[3] + "-" + String(mes + 1).padStart(2, "0") + "-" + String(m[1]).padStart(2, "0");
  }

  /* ---------- Bloques del artículo ----------
     El cuerpo del artículo es una lista de bloques que se pueden ordenar.
     Tipos: texto (subtítulo + párrafos), imagen, video y lista.
     Los bloques antiguos no tienen "type": se tratan como texto. */
  const BLOQUE_ETIQUETA = {
    text: "Subtítulo y texto",
    image: "Imagen",
    video: "Video",
    list: "Lista"
  };
  function tipoBloque(b) {
    return BLOQUE_ETIQUETA[b && b.type] ? b.type : "text";
  }
  function bloqueVacio(tipo) {
    if (tipo === "image") return { type: "image", url: "", caption: "" };
    if (tipo === "video") return { type: "video", url: "" };
    if (tipo === "list") return { type: "list", style: "bullet", items: [""] };
    return { type: "text", title: "", text: "" };
  }

  function cuerpoBloqueHtml(b, i) {
    const tipo = tipoBloque(b);
    const attr = v => String(v == null ? "" : v).replace(/"/g, "&quot;");
    const txt = v => String(v == null ? "" : v);

    if (tipo === "image") {
      return `
        <div class="form-row">
          <label>Imagen</label>
          <div class="bloque-previa" data-bloque-previa>${
            b.url ? `<img src="${attr(b.url)}" alt="">` : "Aún no has elegido una imagen"
          }</div>
          <input type="file" class="bloque-imagen-archivo" accept="image/*">
        </div>
        <div class="form-row">
          <label>Pie de foto (opcional)</label>
          <input type="text" class="bloque-pie" placeholder="Ej: Las dos versiones, una junto a la otra" value="${attr(b.caption)}">
          <p class="bloque-ayuda">Se muestra debajo de la imagen, en letra pequeña y cursiva.</p>
        </div>`;
    }
    if (tipo === "video") {
      return `
        <div class="form-row">
          <label>Enlace del video</label>
          <input type="text" class="bloque-video-url" placeholder="https://www.youtube.com/watch?v=...  o  https://vimeo.com/..." value="${attr(b.url)}">
          <p class="bloque-aviso" data-bloque-aviso></p>
          <p class="bloque-ayuda">El video se reproduce aquí mismo, en este punto del artículo. El visitante no sale de la página.</p>
        </div>
        <div class="form-row bloque-previa-video" data-bloque-previa></div>`;
    }
    if (tipo === "list") {
      const items = (b.items && b.items.length ? b.items : [""]).join("\n");
      return `
        <div class="form-row">
          <label>Tipo de lista</label>
          <select class="bloque-lista-estilo" style="max-width:240px;">
            <option value="bullet"${(b.style || "bullet") === "bullet" ? " selected" : ""}>Con viñetas (•)</option>
            <option value="number"${b.style === "number" ? " selected" : ""}>Numerada (1, 2, 3)</option>
          </select>
        </div>
        <div class="form-row">
          <label>Elementos</label>
          <textarea class="bloque-lista-items" rows="4" placeholder="Limpia la tubería&#10;Solapa cada vuelta&#10;Cierra el extremo">${txt(items)}</textarea>
          <p class="bloque-ayuda">Un elemento por línea. Cada línea será un punto de la lista.</p>
        </div>`;
    }
    return `
      <div class="form-row">
        <label>Subtítulo (opcional)</label>
        <input type="text" class="bloque-titulo" placeholder="Ej: ¿Cuál conviene en cada caso?" value="${attr(b.title)}">
        <p class="bloque-ayuda">Sale <strong>en negrita y más grande</strong>, separando esta parte del artículo. Déjalo vacío si solo quieres texto.</p>
      </div>
      <div class="form-row">
        <label>Texto</label>
        <textarea class="bloque-texto" rows="6" placeholder="Escribe aquí el contenido de esta parte...">${txt(b.text)}</textarea>
        <p class="bloque-ayuda">Deja una línea en blanco entre párrafos para que se separen.</p>
      </div>`;
  }

  function renderContentBlocks(blocks) {
    postContentBlocksBox.innerHTML = blocks.map((b, i) => {
      const tipo = tipoBloque(b);
      return `
      <div class="content-block" data-block-index="${i}" data-block-type="${tipo}">
        <div class="bloque-cabecera">
          <span class="bloque-tipo">${BLOQUE_ETIQUETA[tipo]}</span>
          <span class="bloque-acciones">
            <button type="button" class="btn btn-tertiary btn-sm bloque-subir" title="Subir">↑</button>
            <button type="button" class="btn btn-tertiary btn-sm bloque-bajar" title="Bajar">↓</button>
            <button type="button" class="btn btn-tertiary btn-sm block-remove" title="Eliminar bloque">✕</button>
          </span>
        </div>
        ${cuerpoBloqueHtml(b, i)}
      </div>`;
    }).join("");

    const indiceDe = btn => parseInt(btn.closest("[data-block-index]").dataset.blockIndex, 10);

    postContentBlocksBox.querySelectorAll(".block-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const lista = collectContentBlocks();
        lista.splice(indiceDe(btn), 1);
        renderContentBlocks(lista.length ? lista : [bloqueVacio("text")]);
      });
    });
    postContentBlocksBox.querySelectorAll(".bloque-subir").forEach(btn => {
      btn.addEventListener("click", () => {
        const lista = collectContentBlocks();
        const i = indiceDe(btn);
        if (i === 0) return;
        [lista[i - 1], lista[i]] = [lista[i], lista[i - 1]];
        renderContentBlocks(lista);
      });
    });
    postContentBlocksBox.querySelectorAll(".bloque-bajar").forEach(btn => {
      btn.addEventListener("click", () => {
        const lista = collectContentBlocks();
        const i = indiceDe(btn);
        if (i >= lista.length - 1) return;
        [lista[i], lista[i + 1]] = [lista[i + 1], lista[i]];
        renderContentBlocks(lista);
      });
    });

    /* Imagen de un bloque: se sube al servidor y se guarda su dirección. */
    postContentBlocksBox.querySelectorAll(".bloque-imagen-archivo").forEach(input => {
      input.addEventListener("change", () => {
        const caja = input.closest("[data-block-index]");
        readImageFile(input, url => {
          if (url === undefined) return;
          caja.dataset.blockImage = url || "";
          const previa = caja.querySelector("[data-bloque-previa]");
          if (previa) previa.innerHTML = url ? `<img src="${url}" alt="">` : "Sin imagen todavía";
        });
      });
    });

    /* Video: se avisa en el momento si el enlace sirve, y se muestra. */
    postContentBlocksBox.querySelectorAll(".bloque-video-url").forEach(input => {
      const refrescar = () => {
        const caja = input.closest("[data-block-index]");
        const aviso = caja.querySelector("[data-bloque-aviso]");
        const previa = caja.querySelector("[data-bloque-previa]");
        const url = input.value.trim();
        const embed = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(url) : null;
        if (!url) {
          aviso.textContent = "";
          aviso.className = "bloque-aviso";
          previa.innerHTML = "";
          return;
        }
        if (embed) {
          const servicio = window.RCB_EMBED_SERVICIO(url);
          aviso.textContent = "✓ Video de " + servicio + " detectado. Se reproducirá dentro del artículo.";
          aviso.className = "bloque-aviso es-ok";
          previa.innerHTML = `<iframe src="${embed}" frameborder="0" allowfullscreen></iframe>`;
        } else {
          aviso.textContent = "✕ No reconocemos este enlace. Debe ser de YouTube o Vimeo.";
          aviso.className = "bloque-aviso es-error";
          previa.innerHTML = "";
        }
      };
      input.addEventListener("input", refrescar);
      refrescar();
    });

    /* Recuerda las imágenes ya subidas al reordenar o redibujar. */
    postContentBlocksBox.querySelectorAll("[data-block-index]").forEach((caja, i) => {
      if (blocks[i] && blocks[i].type === "image") caja.dataset.blockImage = blocks[i].url || "";
    });
  }

  function collectContentBlocks() {
    return Array.from(postContentBlocksBox.querySelectorAll(".content-block")).map(el => {
      const tipo = el.dataset.blockType || "text";
      const val = sel => { const n = el.querySelector(sel); return n ? n.value : ""; };

      if (tipo === "image") {
        return { type: "image", url: el.dataset.blockImage || "", caption: val(".bloque-pie") };
      }
      if (tipo === "video") {
        return { type: "video", url: val(".bloque-video-url").trim() };
      }
      if (tipo === "list") {
        return {
          type: "list",
          style: val(".bloque-lista-estilo") || "bullet",
          items: val(".bloque-lista-items").split("\n").map(s => s.trim()).filter(Boolean)
        };
      }
      return { type: "text", title: val(".bloque-titulo"), text: val(".bloque-texto") };
    });
  }

  if (postAddContentBlockBtn) {
    postAddContentBlockBtn.addEventListener("click", () => {
      const tipoSel = document.getElementById("post-block-type");
      const tipo = tipoSel ? tipoSel.value : "text";
      const blocks = collectContentBlocks();
      blocks.push(bloqueVacio(tipo));
      renderContentBlocks(blocks);
    });
  }

  const postAdjuster = setupImageAdjuster({
    box: postImagePreview,
    toolbar: postImageToolbar,
    zoomInBtn: document.getElementById("post-zoom-in"),
    zoomOutBtn: document.getElementById("post-zoom-out"),
    resetBtn: document.getElementById("post-reset-fit"),
    getFit: () => currentPostImageFit,
    setFit: fit => { currentPostImageFit = fit; }
  });

  if (postImageInput) {
    postImageInput.addEventListener("change", () => {
      readImageFile(postImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentPostImage = dataUrl;
        currentPostImageFit = defaultFit();
        postImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Vista previa de la imagen";
        postAdjuster.refresh();
      });
    });
  }

  function populatePostCategorySelect() {
    postCategorySelect.innerHTML = getBlogCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  /* Confirma en el momento si el enlace del video de portada sirve, y lo
     muestra, para no descubrirlo recién al publicar el artículo. */
  function revisarVideoPortada() {
    const aviso = document.getElementById("post-video-aviso");
    const previa = document.getElementById("post-video-previa");
    if (!aviso || !previa || !postVideoInput) return;
    const url = postVideoInput.value.trim();
    const embed = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(url) : null;

    if (!url) {
      aviso.textContent = "";
      aviso.className = "bloque-aviso";
      previa.innerHTML = "";
      return;
    }
    if (embed) {
      aviso.textContent = "✓ Video de " + window.RCB_EMBED_SERVICIO(url) + " verificado. Se reproducirá dentro del artículo.";
      aviso.className = "bloque-aviso es-ok";
      previa.innerHTML = `<iframe src="${embed}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      aviso.textContent = "✕ No reconocemos este enlace. Debe ser de YouTube o Vimeo.";
      aviso.className = "bloque-aviso es-error";
      previa.innerHTML = "";
    }
  }
  if (postVideoInput) postVideoInput.addEventListener("input", revisarVideoPortada);

  /* ---------- Vista previa del artículo ----------
     Dibuja lo que hay ahora en el formulario, sin guardar nada, con las mismas
     clases de estilo que usa articulo.php. Sirve para ver cómo quedará antes
     de publicarlo. */
  function abrirPreviaPost() {
    const esc = s => String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const caja = document.getElementById("previa-post");
    const cuerpo = document.getElementById("previa-post-cuerpo");
    if (!caja || !cuerpo) return;

    const titulo = document.getElementById("post-field-title").value.trim();
    const resumen = document.getElementById("post-field-excerpt").value.trim();
    const fecha = isoALegible(document.getElementById("post-field-date").value);
    const lectura = document.getElementById("post-field-readtime").value.trim();
    const estado = document.getElementById("post-field-status").value;
    const catNombre = (getBlogCategories().find(c => c.id === postCategorySelect.value) || {}).name || "";

    const embedPortada = window.RCB_EMBED_URL ? window.RCB_EMBED_URL(postVideoInput.value) : null;
    const portada = embedPortada
      ? `<div class="art-video art-portada"><iframe src="${embedPortada}" frameborder="0" allowfullscreen></iframe></div>`
      : (currentPostImage ? `<div class="art-portada"><img src="${esc(currentPostImage)}" alt=""></div>` : "");

    let interior = window.RCB_BLOQUES_HTML
      ? window.RCB_BLOQUES_HTML(collectContentBlocks())
      : "";
    if (!interior) interior = '<p class="art-sin-cuerpo">Este artículo todavía no tiene contenido.</p>';

    cuerpo.innerHTML = `
      ${estado === "privado" ? '<p class="previa-privado">🔒 Este blog está en <strong>privado</strong>: así se vería, pero todavía no es visible para el público.</p>' : ""}
      <div class="art-container">
        <header class="art-cabecera">
          ${catNombre ? `<span class="art-categoria">${esc(catNombre)}</span>` : ""}
          <h1>${esc(titulo) || "(sin título)"}</h1>
          <div class="art-meta">
            ${fecha ? `<span>📅 ${esc(fecha)}</span>` : ""}
            ${lectura ? `<span>⏱ ${esc(lectura)}</span>` : ""}
          </div>
          ${resumen ? `<p class="art-entradilla">${esc(resumen)}</p>` : ""}
        </header>
        ${portada}
        <div class="art-cuerpo">${interior}</div>
      </div>`;

    caja.classList.add("open");
  }

  ["previsualizar-post-btn", "previsualizar-post-btn-2"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", abrirPreviaPost);
  });
  const previaCerrar = document.getElementById("previa-post-cerrar");
  if (previaCerrar) previaCerrar.addEventListener("click", () => {
    document.getElementById("previa-post").classList.remove("open");
  });

  function openPostForm(id) {
    editingPostId = id || null;
    const p = id ? getPosts().find(x => x.id === id) : null;

    postFormTitle.textContent = p ? "Editar blog" : "Nuevo blog";
    populatePostCategorySelect();
    document.getElementById("post-field-title").value = p ? p.title : "";
    postCategorySelect.value = p ? p.category : (getBlogCategories()[0] || {}).id || "";
    document.getElementById("post-field-excerpt").value = p ? p.excerpt : "";
    document.getElementById("post-field-date").value = p
      ? (p.dateISO || legibleAIso(p.date) || "")
      : new Date().toISOString().slice(0, 10);
    document.getElementById("post-field-status").value =
      p && p.status === "privado" ? "privado" : "publicado";
    document.getElementById("post-field-readtime").value = p ? (p.readTime || "") : "";
    document.getElementById("post-field-featured").checked = p ? !!p.featured : false;
    currentPostImage = p ? (p.image || null) : null;
    currentPostImageFit = p && p.imageFit ? { ...p.imageFit } : defaultFit();
    postImagePreview.innerHTML = currentPostImage ? `<img src="${currentPostImage}" alt="">` : "Vista previa de la imagen";
    postImageInput.value = "";
    postAdjuster.refresh();
    postVideoInput.value = p ? (p.videoUrl || "") : "";
    revisarVideoPortada();
    renderContentBlocks(p && p.contentBlocks && p.contentBlocks.length ? p.contentBlocks : contentToBlocks(p ? p.content : ""));

    /* El editor es una vista de la propia página, no una ventana flotante:
       se oculta el listado para trabajar con todo el ancho disponible. */
    const listado = document.getElementById("blog-listado");
    if (listado) listado.style.display = "none";
    postOverlay.classList.add("open");
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function closePostForm() {
    postOverlay.classList.remove("open");
    const listado = document.getElementById("blog-listado");
    if (listado) listado.style.display = "";
    postForm.reset();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function deletePost(id) {
    if (!confirm("¿Eliminar esta entrada del blog?")) return;
    savePosts(getPosts().filter(p => p.id !== id));
    renderPostsTable();
  }

  if (postForm) {
    postForm.addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("post-field-title").value.trim();
      if (!title) return;
      const list = getPosts();

      const post = {
        id: editingPostId || uniqueId("post-" + (slugify(title) || Date.now()), list.map(p => p.id)),
        title,
        category: postCategorySelect.value,
        excerpt: document.getElementById("post-field-excerpt").value.trim(),
        /* Se guarda la fecha legible (la que se muestra) y la ISO (la del
           calendario), para no perder ninguna de las dos. */
        date: isoALegible(document.getElementById("post-field-date").value) ||
              document.getElementById("post-field-date").value.trim(),
        dateISO: document.getElementById("post-field-date").value.trim(),
        status: document.getElementById("post-field-status").value === "privado" ? "privado" : "publicado",
        readTime: document.getElementById("post-field-readtime").value.trim() || "5 min de lectura",
        featured: document.getElementById("post-field-featured").checked,
        image: currentPostImage,
        imageFit: currentPostImageFit,
        videoUrl: postVideoInput.value.trim(),
        /* Cada tipo de bloque guarda campos distintos: aplastarlos todos a
           título + texto borraría las imágenes, los videos y las listas. */
        contentBlocks: collectContentBlocks().filter(b => {
          if (b.type === "image") return !!b.url;
          if (b.type === "video") return !!b.url;
          if (b.type === "list") return b.items && b.items.length > 0;
          return (b.title || "").trim() || (b.text || "").trim();
        }),
        icon: "📰"
      };

      if (editingPostId) {
        const idx = list.findIndex(p => p.id === editingPostId);
        if (idx > -1) list[idx] = post;
      } else {
        list.push(post);
      }

      if (post.featured) {
        list.forEach(p => { if (p.id !== post.id) p.featured = false; });
      }

      if (!savePosts(list)) return;
      closePostForm();
      renderPostsTable();
    });
  }

  if (addPostBtn) addPostBtn.addEventListener("click", () => openPostForm(null));
  if (cancelPostBtn) cancelPostBtn.addEventListener("click", closePostForm);
  if (volverPostBtn) volverPostBtn.addEventListener("click", closePostForm);

  function renderPostsTable() {
    updateNavBadges();
    if (!postTableBody) return;
    const list = getPosts();
    const featuredIds = list.filter(p => p.featured).map(p => p.id);
    if (featuredIds.length > 1) {
      list.forEach((p, i) => { if (p.featured && p.id !== featuredIds[featuredIds.length - 1]) p.featured = false; });
      savePosts(list);
    }
    postTableBody.innerHTML = list.map(p => {
      const fit = p.imageFit || defaultFit();
      const thumb = p.image ? `<img src="${p.image}" alt="" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (p.icon || "📰");
      return `
      <tr>
        <td><div class="admin-thumb">${thumb}</div></td>
        <td>${p.title}</td>
        <td>${blogCategoryName(p.category)}</td>
        <td>${p.date}</td>
        <td>${p.status === "privado"
          ? '<span class="estado-privado">🔒 Privado</span>'
          : '<span class="estado-publicado">● Publicado</span>'}</td>
        <td>${p.featured ? "⭐ Sí" : "—"}</td>
        <td>
          <div class="row-actions">
            <button data-post-edit="${p.id}">Editar</button>
            <button data-post-del="${p.id}" class="del-btn">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join("");
    postTableBody.querySelectorAll("[data-post-edit]").forEach(b => b.addEventListener("click", () => openPostForm(b.dataset.postEdit)));
    postTableBody.querySelectorAll("[data-post-del]").forEach(b => b.addEventListener("click", () => deletePost(b.dataset.postDel)));
  }

  /* ================= VIDEOS ================= */
  const KEY_VIDEOS = "rcb_videos";
  const KEY_VIDEO_CATEGORIES = "rcb_video_categories";
  const getVideos = () => load(KEY_VIDEOS, (window.RCB_DEFAULT_VIDEOS || []).slice());
  const saveVideos = list => save(KEY_VIDEOS, list);
  const getVideoCategories = () => load(KEY_VIDEO_CATEGORIES, (window.RCB_DEFAULT_VIDEO_CATEGORIES || []).slice());
  const saveVideoCategories = list => save(KEY_VIDEO_CATEGORIES, list);
  function videoCategoryName(id) {
    const c = getVideoCategories().find(c => c.id === id);
    return c ? c.name : "General";
  }
  function extractYoutubeId(url) {
    if (!url) return "";
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : "";
  }

  const videoCatNameInput = document.getElementById("video-cat-name");
  const addVideoCategoryBtn = document.getElementById("add-video-category-btn");
  const videoCatChipGrid = document.getElementById("video-category-chip-grid");

  function renderVideoCategoryChips() {
    if (!videoCatChipGrid) return;
    const cats = getVideoCategories();
    const videos = getVideos();
    videoCatChipGrid.innerHTML = cats.map(c => {
      const count = videos.filter(v => v.category === c.id).length;
      return `
        <div class="admin-chip">
          <div class="admin-chip-thumb">🎬</div>
          <div class="admin-chip-body"><strong>${c.name}</strong><span>${count} video(s)</span></div>
          <div class="admin-chip-actions">
            <button data-vidcat-del="${c.id}" style="border:none;background:#fff;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.72rem;color:#DC2626;">🗑</button>
          </div>
        </div>`;
    }).join("") || `<p style="color:#94A3B8;font-size:0.85rem;">Aún no hay categorías de video.</p>`;
    videoCatChipGrid.querySelectorAll("[data-vidcat-del]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.vidcatDel;
      const used = getVideos().some(v => v.category === id);
      if (!confirm((used ? "Hay videos usando esta categoría; quedarán sin categoría válida. " : "") + "¿Eliminar esta categoría de video?")) return;
      saveVideoCategories(getVideoCategories().filter(c => c.id !== id));
      renderVideoCategoryChips();
      populateVideoCategorySelect();
      renderVideosTable();
    }));
  }

  if (addVideoCategoryBtn) {
    addVideoCategoryBtn.addEventListener("click", () => {
      const name = videoCatNameInput.value.trim();
      if (!name) return;
      const list = getVideoCategories();
      const id = uniqueId(slugify(name) || ("vidcat-" + Date.now()), list.map(c => c.id));
      list.push({ id, name });
      saveVideoCategories(list);
      videoCatNameInput.value = "";
      renderVideoCategoryChips();
      populateVideoCategorySelect();
    });
  }

  const videoTableBody = document.getElementById("admin-video-table-body");
  const videoOverlay = document.getElementById("video-form-overlay");
  const videoForm = document.getElementById("video-form");
  const videoFormTitle = document.getElementById("video-form-title");
  const videoCategorySelect = document.getElementById("video-field-category");
  const addVideoBtn = document.getElementById("add-video-btn");
  const cancelVideoBtn = document.getElementById("cancel-video-form-btn");
  const videoYoutubeInput = document.getElementById("video-field-youtube");
  const videoImagePreview = document.getElementById("video-image-preview");

  let editingVideoId = null;

  function populateVideoCategorySelect() {
    videoCategorySelect.innerHTML = getVideoCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  function updateVideoThumbnailPreview() {
    const id = extractYoutubeId(videoYoutubeInput.value.trim());
    videoImagePreview.innerHTML = id
      ? `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="">`
      : "Pega el enlace de YouTube para ver la miniatura";
  }
  if (videoYoutubeInput) videoYoutubeInput.addEventListener("input", updateVideoThumbnailPreview);

  function openVideoForm(id) {
    editingVideoId = id || null;
    const v = id ? getVideos().find(x => x.id === id) : null;

    videoFormTitle.textContent = v ? "Editar video" : "Agregar video";
    populateVideoCategorySelect();
    videoYoutubeInput.value = v && v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : "";
    updateVideoThumbnailPreview();
    document.getElementById("video-field-title").value = v ? v.title : "";
    videoCategorySelect.value = v ? v.category : (getVideoCategories()[0] || {}).id || "";
    document.getElementById("video-field-description").value = v ? (v.description || "") : "";
    document.getElementById("video-field-duration").value = v ? (v.duration || "") : "";
    document.getElementById("video-field-date").value = v ? (v.date || "") : "";
    document.getElementById("video-field-views").value = v ? (v.views || "") : "";

    videoOverlay.classList.add("open");
  }
  function closeVideoForm() {
    videoOverlay.classList.remove("open");
    videoForm.reset();
    videoImagePreview.innerHTML = "Pega el enlace de YouTube para ver la miniatura";
  }

  function deleteVideo(id) {
    if (!confirm("¿Eliminar este video?")) return;
    saveVideos(getVideos().filter(v => v.id !== id));
    renderVideosTable();
    renderVideoCategoryChips();
  }

  if (videoForm) {
    videoForm.addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("video-field-title").value.trim();
      if (!title) return;
      const list = getVideos();

      const video = {
        id: editingVideoId || uniqueId("video-" + (slugify(title) || Date.now()), list.map(v => v.id)),
        title,
        category: videoCategorySelect.value,
        description: document.getElementById("video-field-description").value.trim(),
        youtubeId: extractYoutubeId(document.getElementById("video-field-youtube").value.trim()),
        duration: document.getElementById("video-field-duration").value.trim(),
        date: document.getElementById("video-field-date").value.trim(),
        views: document.getElementById("video-field-views").value.trim(),
        icon: "🎬"
      };

      if (editingVideoId) {
        const idx = list.findIndex(v => v.id === editingVideoId);
        if (idx > -1) list[idx] = video;
      } else {
        list.push(video);
      }

      if (!saveVideos(list)) return;
      closeVideoForm();
      renderVideosTable();
      renderVideoCategoryChips();
    });
  }

  if (addVideoBtn) addVideoBtn.addEventListener("click", () => openVideoForm(null));
  if (cancelVideoBtn) cancelVideoBtn.addEventListener("click", closeVideoForm);

  function renderVideosTable() {
    updateNavBadges();
    if (!videoTableBody) return;
    const list = getVideos();
    videoTableBody.innerHTML = list.map(v => {
      const fit = v.imageFit || defaultFit();
      let thumb;
      if (v.image) thumb = `<img src="${v.image}" alt="" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">`;
      else if (v.youtubeId) thumb = `<img src="https://img.youtube.com/vi/${v.youtubeId}/default.jpg" alt="">`;
      else thumb = v.icon || "🎬";
      return `
      <tr>
        <td><div class="admin-thumb">${thumb}</div></td>
        <td>${v.title}</td>
        <td>${videoCategoryName(v.category)}</td>
        <td>${v.duration || "—"}</td>
        <td>${v.date || "—"}</td>
        <td>
          <button data-video-home="${v.id}" class="btn ${v.home ? 'btn-primary' : 'btn-tertiary'} btn-sm">${v.home ? "⭐ En Inicio" : "Colocar en Inicio"}</button>
        </td>
        <td>
          <div class="row-actions">
            <button data-video-edit="${v.id}">Editar</button>
            <button data-video-del="${v.id}" class="del-btn">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join("");
    videoTableBody.querySelectorAll("[data-video-edit]").forEach(b => b.addEventListener("click", () => openVideoForm(b.dataset.videoEdit)));
    videoTableBody.querySelectorAll("[data-video-del]").forEach(b => b.addEventListener("click", () => deleteVideo(b.dataset.videoDel)));
    videoTableBody.querySelectorAll("[data-video-home]").forEach(b => b.addEventListener("click", () => setHomeVideo(b.dataset.videoHome)));
  }

  function setHomeVideo(id) {
    const list = getVideos();
    const target = list.find(v => v.id === id);
    const alreadyHome = target && target.home;
    list.forEach(v => { v.home = false; });
    if (!alreadyHome && target) target.home = true;
    if (!saveVideos(list)) return;
    renderVideosTable();
  }


  /* ================= NOSOTROS ================= */
  const KEY_ABOUT = "rcb_about";
  function getAbout() {
    const defaults = window.RCB_DEFAULT_ABOUT || {};
    return { ...defaults, ...load(KEY_ABOUT, {}) };
  }
  function saveAbout(data) { return save(KEY_ABOUT, data); }

  const aboutIntroImageInput = document.getElementById("about-field-intro-image");
  const aboutIntroImagePreview = document.getElementById("about-intro-image-preview");
  const aboutIntroImageToolbar = document.getElementById("about-intro-image-toolbar");
  const aboutHistoriaImageInput = document.getElementById("about-field-historia-image");
  const aboutHistoriaImagePreview = document.getElementById("about-historia-image-preview");
  const aboutHistoriaImageToolbar = document.getElementById("about-historia-image-toolbar");

  let currentAboutIntroImage = null;
  let currentAboutIntroImageFit = defaultFit();
  let currentAboutHistoriaImage = null;
  let currentAboutHistoriaImageFit = defaultFit();

  const aboutIntroAdjuster = aboutIntroImagePreview ? setupImageAdjuster({
    box: aboutIntroImagePreview,
    toolbar: aboutIntroImageToolbar,
    zoomInBtn: document.getElementById("about-intro-zoom-in"),
    zoomOutBtn: document.getElementById("about-intro-zoom-out"),
    resetBtn: document.getElementById("about-intro-reset-fit"),
    getFit: () => currentAboutIntroImageFit,
    setFit: fit => { currentAboutIntroImageFit = fit; }
  }) : null;
  const aboutHistoriaAdjuster = aboutHistoriaImagePreview ? setupImageAdjuster({
    box: aboutHistoriaImagePreview,
    toolbar: aboutHistoriaImageToolbar,
    zoomInBtn: document.getElementById("about-historia-zoom-in"),
    zoomOutBtn: document.getElementById("about-historia-zoom-out"),
    resetBtn: document.getElementById("about-historia-reset-fit"),
    getFit: () => currentAboutHistoriaImageFit,
    setFit: fit => { currentAboutHistoriaImageFit = fit; }
  }) : null;

  if (aboutIntroImageInput) {
    aboutIntroImageInput.addEventListener("change", () => {
      readImageFile(aboutIntroImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentAboutIntroImage = dataUrl;
        currentAboutIntroImageFit = defaultFit();
        aboutIntroImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Vista previa de la imagen";
        aboutIntroAdjuster.refresh();
      });
    });
  }
  if (aboutHistoriaImageInput) {
    aboutHistoriaImageInput.addEventListener("change", () => {
      readImageFile(aboutHistoriaImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentAboutHistoriaImage = dataUrl;
        currentAboutHistoriaImageFit = defaultFit();
        aboutHistoriaImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Vista previa de la imagen";
        aboutHistoriaAdjuster.refresh();
      });
    });
  }

  function fillAboutForm() {
    const about = getAbout();
    document.getElementById("about-field-intro-title").value = about.introTitle || "";
    document.getElementById("about-field-intro-text").value = about.introText || "";
    currentAboutIntroImage = about.introImage || null;
    currentAboutIntroImageFit = about.introImageFit ? { ...about.introImageFit } : defaultFit();
    if (aboutIntroImagePreview) {
      aboutIntroImagePreview.innerHTML = currentAboutIntroImage ? `<img src="${currentAboutIntroImage}" alt="">` : "Vista previa de la imagen";
      if (aboutIntroAdjuster) aboutIntroAdjuster.refresh();
    }

    (about.stats || []).forEach((s, i) => {
      const valueEl = document.getElementById("about-stat-value-" + i);
      const labelEl = document.getElementById("about-stat-label-" + i);
      if (valueEl) valueEl.value = s.value || "";
      if (labelEl) labelEl.value = s.label || "";
    });

    document.getElementById("about-field-historia-title").value = about.historiaTitle || "";
    document.getElementById("about-field-historia-text").value = about.historiaText || "";
    currentAboutHistoriaImage = about.historiaImage || null;
    currentAboutHistoriaImageFit = about.historiaImageFit ? { ...about.historiaImageFit } : defaultFit();
    if (aboutHistoriaImagePreview) {
      aboutHistoriaImagePreview.innerHTML = currentAboutHistoriaImage ? `<img src="${currentAboutHistoriaImage}" alt="">` : "Vista previa de la imagen";
      if (aboutHistoriaAdjuster) aboutHistoriaAdjuster.refresh();
    }

    document.getElementById("about-field-mision").value = about.mision || "";
    document.getElementById("about-field-vision").value = about.vision || "";
    document.getElementById("about-field-proposito").value = about.proposito || "";
    document.getElementById("about-field-valores").value = (about.valores || []).map(v => `${v.icon} | ${v.text}`).join("\n");

    const settings = getSettings();
    document.getElementById("settings-field-whatsapp").value = settings.whatsapp || "";
    document.getElementById("settings-field-email").value = settings.email || "";
    document.getElementById("settings-field-hours-weekday").value = settings.hoursWeekday || "";
    document.getElementById("settings-field-hours-saturday").value = settings.hoursSaturday || "";
  }

  const KEY_SETTINGS = "rcb_settings";
  function getSettings() {
    const defaults = window.RCB_DEFAULT_SETTINGS || {};
    return { ...defaults, ...load(KEY_SETTINGS, {}) };
  }
  function saveSettings(data) { return save(KEY_SETTINGS, data); }
  function collectSettingsForm() {
    return {
      whatsapp: document.getElementById("settings-field-whatsapp").value.trim(),
      email: document.getElementById("settings-field-email").value.trim(),
      hoursWeekday: document.getElementById("settings-field-hours-weekday").value.trim(),
      hoursSaturday: document.getElementById("settings-field-hours-saturday").value.trim()
    };
  }

  function collectAboutForm() {
    const stats = [0, 1, 2, 3].map(i => ({
      value: (document.getElementById("about-stat-value-" + i) || {}).value || "",
      label: (document.getElementById("about-stat-label-" + i) || {}).value || ""
    })).filter(s => s.value || s.label);

    const valores = document.getElementById("about-field-valores").value
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|");
        return { icon: (parts[0] || "").trim(), text: (parts.slice(1).join("|") || "").trim() };
      });

    return {
      introTitle: document.getElementById("about-field-intro-title").value.trim(),
      introText: document.getElementById("about-field-intro-text").value.trim(),
      introImage: currentAboutIntroImage,
      introImageFit: currentAboutIntroImageFit,
      stats,
      historiaTitle: document.getElementById("about-field-historia-title").value.trim(),
      historiaText: document.getElementById("about-field-historia-text").value,
      historiaImage: currentAboutHistoriaImage,
      historiaImageFit: currentAboutHistoriaImageFit,
      mision: document.getElementById("about-field-mision").value.trim(),
      vision: document.getElementById("about-field-vision").value.trim(),
      proposito: document.getElementById("about-field-proposito").value.trim(),
      valores
    };
  }

  function saveAboutForm() {
    try {
      if (!saveAbout(collectAboutForm())) return;
      alert("Cambios guardados. Revisa la página Nosotros para verlos.");
    } catch (e) {
      alert("No se pudo guardar: " + e.message);
    }
  }
  function saveSettingsForm() {
    try {
      if (!saveSettings(collectSettingsForm())) return;
      alert("Cambios guardados. Revisa el pie de página del sitio para verlos.");
    } catch (e) {
      alert("No se pudo guardar: " + e.message);
    }
  }

  const saveAboutBtn = document.getElementById("save-about-btn");
  const saveAboutBtnBottom = document.getElementById("save-about-btn-bottom");
  if (saveAboutBtn) saveAboutBtn.addEventListener("click", saveAboutForm);
  if (saveAboutBtnBottom) saveAboutBtnBottom.addEventListener("click", saveAboutForm);

  const saveSettingsBtn = document.getElementById("save-settings-btn");
  if (saveSettingsBtn) saveSettingsBtn.addEventListener("click", saveSettingsForm);

  /* ================= SECCIONES (banners del sitio) ================= */
  /* Permite cambiar título, texto e imagen de fondo del encabezado de
     Inicio, Productos, Blog, Videos y Contacto. */
  const KEY_SECTIONS = "rcb_sections";
  const SECTION_LIST = [
    /* medida = tamaño recomendado de la imagen para que entre sin recortes
       (es la proporción real del banner de esa página). */
    { id: "inicio", label: "Inicio", page: "index.html", medida: "1600 × 620 px" },
    { id: "productos", label: "Productos", page: "productos.html", medida: "1600 × 320 px" },
    { id: "blog", label: "Blog", page: "blog.html", medida: "1600 × 320 px" },
    { id: "videos", label: "Videos", page: "videos.html", medida: "1600 × 320 px" },
    { id: "contacto", label: "Contacto", page: "contacto.html", medida: "1600 × 320 px" }
  ];

  function getSections() {
    const defaults = window.RCB_DEFAULT_SECTIONS || {};
    const saved = load(KEY_SECTIONS, {}) || {};
    const out = {};
    SECTION_LIST.forEach(s => {
      out[s.id] = { ...(defaults[s.id] || {}), ...(saved[s.id] || {}) };
    });
    return out;
  }
  function saveSections(data) { return save(KEY_SECTIONS, data); }

  /* Estado en memoria mientras se edita (la imagen ya viene subida como URL). */
  let sectionsDraft = null;
  const sectionEditorsBox = document.getElementById("section-editors");
  const sectionPicker = document.getElementById("section-picker");

  function sectionEditorHtml(s, data) {
    const esInicio = s.id === "inicio";
    const val = v => String(v == null ? "" : v).replace(/"/g, "&quot;");
    const pos = data.imagePos || "center center";
    const opt = (v, txt) => `<option value="${v}"${pos === v ? " selected" : ""}>${txt}</option>`;

    const features = esInicio ? `
      <hr style="border:none;border-top:1px solid var(--borde);margin:20px 0;">
      <h2 style="font-size:1rem;margin-bottom:4px;">Destacados del banner</h2>
      <p style="font-size:0.78rem;color:#64748B;margin-bottom:10px;">Los tres textos cortos que aparecen sobre la imagen de Inicio.</p>
      ${[0, 1, 2].map(i => {
        const f = (data.features || [])[i] || {};
        return `<div class="form-row" style="display:grid;grid-template-columns:1fr 1.4fr;gap:12px;">
          <input type="text" data-sec-feature-title="${i}" placeholder="Ej: CALIDAD GARANTIZADA" value="${val(f.title)}">
          <input type="text" data-sec-feature-text="${i}" placeholder="Ej: Productos probados y certificados" value="${val(f.text)}">
        </div>`;
      }).join("")}` : "";

    return `
      <div class="section-editor" data-section-editor="${s.id}" style="display:none;">
        <p style="font-size:0.85rem;color:#64748B;margin-bottom:16px;">
          Banner de la página <a href="${s.page}" target="_blank">${s.label}</a>.
        </p>

        <div class="section-preview-wrap">
          <div class="section-preview-label">
            <span>Vista previa</span>
            <em>Se actualiza mientras escribes. Nada se publica hasta que pulses “Guardar cambios”.</em>
          </div>
          <div class="section-preview ${esInicio ? "is-hero" : "is-page"}" data-sec-banner>
            <div class="section-preview-inner">
              <h3 data-prev-title></h3>
              <p data-prev-subtitle></p>
              ${esInicio ? '<div class="section-preview-features" data-prev-features></div>' : ""}
            </div>
          </div>
          <div class="section-preview-state" data-sec-state></div>
        </div>
        <div class="form-row">
          <label>Título</label>
          <textarea data-sec-title rows="2" placeholder="Título del banner">${val(data.title).replace(/&quot;/g, '"')}</textarea>
          <p style="font-size:0.78rem;color:#64748B;margin-top:4px;">Puedes usar Enter para partir el título en dos líneas.</p>
        </div>
        ${esInicio ? `
        <div class="form-row">
          <label>Palabra destacada en azul (opcional)</label>
          <input type="text" data-sec-accent placeholder="Ej: tu hogar" value="${val(data.accent)}">
          <p style="font-size:0.78rem;color:#64748B;margin-top:4px;">Debe ser una parte exacta del título de arriba.</p>
        </div>` : ""}
        <div class="form-row">
          <label>Texto debajo del título</label>
          <textarea data-sec-subtitle rows="3">${val(data.subtitle).replace(/&quot;/g, '"')}</textarea>
        </div>
        <div class="form-row">
          <label>Imagen de fondo (máx. 8 MB)</label>
          <input type="file" data-sec-image accept="image/*">
          <p class="section-size-hint">
            📐 Medida recomendada: <strong>${s.medida}</strong> (horizontal).
            Una imagen cuadrada se recorta arriba y abajo, porque el banner es mucho más ancho que alto.
          </p>
        </div>
        <div class="form-row">
          <label>Posición de la imagen</label>
          <select data-sec-pos>
            ${opt("center left", "Izquierda")}
            ${opt("center center", "Centro")}
            ${opt("center right", "Derecha")}
          </select>
          <p style="font-size:0.78rem;color:#64748B;margin-top:4px;">Sirve para que no se corte lo importante de la foto.</p>
        </div>
        <div class="form-row">
          <label>Oscurecer la imagen: <span data-sec-overlay-val>${Number(data.overlay) || 0}%</span></label>
          <input type="range" data-sec-overlay min="0" max="100" step="5" value="${Number(data.overlay) || 0}" style="width:100%;max-width:520px;">
          <p style="font-size:0.78rem;color:#64748B;margin-top:4px;">Súbelo si la imagen es muy cargada y el texto no se lee bien. En 0% la imagen se ve tal cual.</p>
        </div>
        <div class="form-row">
          <label>Degradado azul lateral: <span data-sec-tint-val>${data.tint == null ? 100 : Number(data.tint)}%</span></label>
          <input type="range" data-sec-tint min="0" max="100" step="5" value="${data.tint == null ? 100 : Number(data.tint)}" style="width:100%;max-width:520px;">
          <p style="font-size:0.78rem;color:#64748B;margin-top:4px;">Es el azul que cubre el lado izquierdo. Bájalo para que la imagen se vea también ahí; súbelo si el título no se lee. 100% es el diseño original.</p>
        </div>
        ${features}
        <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-sm" id="save-sections-btn-${s.id}">Guardar cambios</button>
          <button type="button" class="btn btn-tertiary btn-sm" data-sec-discard>Descartar cambios</button>
        </div>
      </div>`;
  }

  /* Lee lo que hay ahora mismo en el formulario de una sección (sin guardarlo). */
  function readSectionForm(id) {
    const box = sectionEditorsBox.querySelector(`[data-section-editor="${id}"]`);
    if (!box) return null;
    const pick = sel => box.querySelector(sel);
    const data = {
      title: (pick("[data-sec-title]") || {}).value || "",
      subtitle: (pick("[data-sec-subtitle]") || {}).value || "",
      imagePos: (pick("[data-sec-pos]") || {}).value || "center center",
      overlay: Number((pick("[data-sec-overlay]") || {}).value || 0),
      tint: pick("[data-sec-tint]") ? Number(pick("[data-sec-tint]").value) : 100,
      image: (sectionsDraft[id] || {}).image || ""
    };
    const accent = pick("[data-sec-accent]");
    if (accent) data.accent = accent.value.trim();
    if (id === "inicio") {
      data.features = [0, 1, 2].map(i => ({
        title: (box.querySelector(`[data-sec-feature-title="${i}"]`) || {}).value || "",
        text: (box.querySelector(`[data-sec-feature-text="${i}"]`) || {}).value || ""
      })).filter(f => f.title || f.text);
    }
    return data;
  }

  /* Pinta la vista previa con lo que el usuario está escribiendo, usando el
     mismo armado de título que la web real (window.RCB_SECTION_TITLE_HTML). */
  function updateSectionPreview(id) {
    const box = sectionEditorsBox.querySelector(`[data-section-editor="${id}"]`);
    if (!box) return;
    const data = readSectionForm(id);
    if (!data) return;

    const banner = box.querySelector("[data-sec-banner]");
    if (banner) {
      banner.style.setProperty("--section-img", window.RCB_SECTION_IMAGE_CSS
        ? window.RCB_SECTION_IMAGE_CSS(data.image)
        : "none");
      banner.style.setProperty("--section-pos", data.imagePos);
      banner.style.setProperty("--section-veil", (Number(data.overlay) || 0) / 100 * 0.9);
      banner.style.setProperty("--section-tint", (data.tint == null ? 100 : Number(data.tint)) / 100);
    }
    const overlayVal = box.querySelector("[data-sec-overlay-val]");
    if (overlayVal) overlayVal.textContent = (Number(data.overlay) || 0) + "%";
    const tintVal = box.querySelector("[data-sec-tint-val]");
    if (tintVal) tintVal.textContent = (data.tint == null ? 100 : Number(data.tint)) + "%";
    const title = box.querySelector("[data-prev-title]");
    if (title) {
      title.innerHTML = window.RCB_SECTION_TITLE_HTML
        ? window.RCB_SECTION_TITLE_HTML(data.title, data.accent)
        : (data.title || "");
    }
    const subtitle = box.querySelector("[data-prev-subtitle]");
    if (subtitle) subtitle.textContent = data.subtitle || "";

    const feats = box.querySelector("[data-prev-features]");
    if (feats) {
      feats.innerHTML = (data.features || [])
        .map(f => `<span><strong>${escapeHtml(f.title)}</strong>${escapeHtml(f.text)}</span>`)
        .join("");
    }

    /* Avisa si hay cambios sin guardar comparando con lo que está en la base. */
    const state = box.querySelector("[data-sec-state]");
    if (state) {
      const saved = getSections()[id] || {};
      const sucio = JSON.stringify({ ...saved, ...data }) !== JSON.stringify(saved);
      state.textContent = sucio ? "● Tienes cambios sin guardar en esta sección." : "";
      state.classList.toggle("is-dirty", sucio);
    }
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function showSectionEditor(id) {
    if (!sectionEditorsBox) return;
    sectionEditorsBox.querySelectorAll("[data-section-editor]").forEach(el => {
      el.style.display = el.dataset.sectionEditor === id ? "" : "none";
    });
    if (sectionPicker) {
      sectionPicker.querySelectorAll("[data-section-tab]").forEach(b => {
        b.classList.toggle("active", b.dataset.sectionTab === id);
      });
    }
  }

  function renderSectionsEditor() {
    if (!sectionEditorsBox) return;
    sectionsDraft = getSections();
    sectionEditorsBox.innerHTML = SECTION_LIST
      .map(s => sectionEditorHtml(s, sectionsDraft[s.id] || {}))
      .join("");

    SECTION_LIST.forEach(s => {
      const box = sectionEditorsBox.querySelector(`[data-section-editor="${s.id}"]`);
      if (!box) return;
      const input = box.querySelector("[data-sec-image]");
      if (input) {
        input.addEventListener("change", () => {
          readImageFile(input, url => {
            if (url === undefined) return;
            sectionsDraft[s.id].image = url;
            updateSectionPreview(s.id);
          });
        });
      }

      /* Cualquier tecla o cambio en el formulario repinta la vista previa. */
      box.addEventListener("input", () => updateSectionPreview(s.id));
      box.addEventListener("change", () => updateSectionPreview(s.id));

      const discard = box.querySelector("[data-sec-discard]");
      if (discard) {
        discard.addEventListener("click", () => {
          if (!confirm("¿Descartar los cambios sin guardar de esta sección?")) return;
          renderSectionsEditor();
          showSectionEditor(s.id);
        });
      }

      const btn = document.getElementById("save-sections-btn-" + s.id);
      if (btn) btn.addEventListener("click", saveSectionsForm);

      updateSectionPreview(s.id);
    });

    showSectionEditor(SECTION_LIST[0].id);
  }

  function collectSectionsForm() {
    const out = {};
    SECTION_LIST.forEach(s => {
      const data = readSectionForm(s.id);
      if (data) out[s.id] = data;
    });
    return out;
  }

  function saveSectionsForm() {
    try {
      if (!saveSections(collectSectionsForm())) return;
      /* Ya guardado: se repinta el aviso de "cambios sin guardar". */
      SECTION_LIST.forEach(s => updateSectionPreview(s.id));
      alert("Cambios guardados. Abre la página de la sección para verlos.");
    } catch (e) {
      alert("No se pudo guardar: " + e.message);
    }
  }

  if (sectionPicker) {
    sectionPicker.addEventListener("click", e => {
      const btn = e.target.closest("[data-section-tab]");
      if (btn) showSectionEditor(btn.dataset.sectionTab);
    });
  }
  const saveSectionsBtn = document.getElementById("save-sections-btn");
  if (saveSectionsBtn) saveSectionsBtn.addEventListener("click", saveSectionsForm);

  /* ================= INIT ================= */
  function renderAll() {
    populateCategorySelect(categorySelect);
    renderTable();
    renderCategoryChips();
    renderBlogCategoryChips();
    renderPostsTable();
    renderVideoCategoryChips();
    renderVideosTable();
    fillAboutForm();
    renderSectionsEditor();
  }

  if (isLoggedIn()) { bootstrapCache().then(showApp); }
})();
