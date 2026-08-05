/* Panel administrador — lógica 100% client-side (localStorage).
   ADVERTENCIA: esto es una demo funcional para gestionar el catálogo desde
   el navegador. NO es un backend real: las credenciales están en este
   archivo (visibles en el código fuente) y los datos se guardan solo en el
   navegador de quien los edita. Para que los cambios se vean para todos los
   visitantes del sitio hace falta un backend real (ej. Firebase) y una base
   de datos compartida. */
(function () {
  const KEY_PRODUCTS = "rcb_products";
  const KEY_CATEGORIES = "rcb_categories";
  const SESSION_KEY = "rcb_admin_session";
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "rcb2026";
  const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

  const loginBox = document.getElementById("admin-login");
  const shell = document.getElementById("admin-shell");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");

  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "true"; }
  function showApp() { loginBox.style.display = "none"; shell.classList.add("open"); renderAll(); }
  function showLogin() { shell.classList.remove("open"); loginBox.style.display = "flex"; }

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("login-user").value.trim();
      const pass = document.getElementById("login-pass").value;
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, "true");
        loginError.style.display = "none";
        showApp();
      } else {
        loginError.style.display = "block";
      }
    });
  }
  if (logoutBtn) logoutBtn.addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); showLogin(); });

  /* ---------- Pestañas del sidebar ---------- */
  const tabLinks = document.querySelectorAll("[data-tab]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");
  tabLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      tabLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const target = link.dataset.tab;
      tabPanels.forEach(panel => {
        panel.style.display = panel.dataset.tabPanel === target ? "" : "none";
      });
    });
  });

  /* ---------- Almacenamiento ---------- */
  function load(key, fallback) {
    const saved = localStorage.getItem(key);
    if (saved) { try { return JSON.parse(saved); } catch (e) { /* ignore */ } }
    return fallback;
  }
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      alert("No se pudo guardar: el almacenamiento de este navegador está lleno (localStorage). Esto pasa cuando ya hay muchas imágenes/PDFs guardados. Elimina algún producto/imagen/PDF pesado, o usa \"Restaurar catálogo original\" para liberar espacio, e inténtalo de nuevo.");
      return false;
    }
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
  function readImageFile(input, callback) {
    const file = input.files && input.files[0];
    if (!file) { callback(null); return; }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("La imagen supera 1.5 MB. Elige una más liviana.");
      input.value = "";
      callback(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  }

  const MAX_PDF_BYTES = 3 * 1024 * 1024;
  function readPdfFile(input, callback) {
    const file = input.files && input.files[0];
    if (!file) { callback(null); return; }
    if (file.type !== "application/pdf") {
      alert("El archivo debe ser un PDF.");
      input.value = "";
      callback(undefined);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      alert("El PDF supera 3 MB. Elige uno más liviano.");
      input.value = "";
      callback(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback({ data: reader.result, name: file.name });
    reader.readAsDataURL(file);
  }

  /* ---------- Ajustador de imagen (mover / zoom / restablecer) ---------- */
  function defaultFit() { return { scale: 1, x: 0, y: 0 }; }
  function clampFit(fit) {
    fit.scale = Math.min(3, Math.max(1, fit.scale));
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
  const resetBtn = document.getElementById("reset-catalog-btn");
  const categorySelect = document.getElementById("field-category");
  const productImageInput = document.getElementById("field-image");
  const productImagePreview = document.getElementById("product-image-preview");
  const productImageToolbar = document.getElementById("product-image-toolbar");

  let editingId = null;
  let currentProductImage = null;
  let currentProductImageFit = defaultFit();

  const productAdjuster = setupImageAdjuster({
    box: productImagePreview,
    toolbar: productImageToolbar,
    zoomInBtn: document.getElementById("product-zoom-in"),
    zoomOutBtn: document.getElementById("product-zoom-out"),
    resetBtn: document.getElementById("product-reset-fit"),
    getFit: () => currentProductImageFit,
    setFit: fit => { currentProductImageFit = fit; }
  });

  function populateCategorySelect(selectEl) {
    selectEl.innerHTML = getCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }
  if (productImageInput) {
    productImageInput.addEventListener("change", () => {
      readImageFile(productImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentProductImage = dataUrl;
        currentProductImageFit = defaultFit();
        productImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Vista previa de la imagen";
        productAdjuster.refresh();
      });
    });
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
      const fit = p.imageFit || defaultFit();
      const thumb = p.image ? `<img src="${p.image}" alt="" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (p.icon || "📦");
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
    currentProductImage = p ? (p.image || null) : null;
    currentProductImageFit = p && p.imageFit ? { ...p.imageFit } : defaultFit();
    productImagePreview.innerHTML = currentProductImage ? `<img src="${currentProductImage}" alt="">` : "Vista previa de la imagen";
    productImageInput.value = "";
    productAdjuster.refresh();

    formOverlay.classList.add("open");
  }
  function closeForm() { formOverlay.classList.remove("open"); form.reset(); }
  function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    saveProducts(getProducts().filter(p => p.id !== id));
    renderTable();
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const list = getProducts();

      const product = {
        id: editingId || document.getElementById("field-id").value.trim().toUpperCase().replace(/\s+/g, "-"),
        name: document.getElementById("field-name").value.trim(),
        category: categorySelect.value,
        price: parseFloat(document.getElementById("field-price").value) || 0,
        oldPrice: document.getElementById("field-oldprice").value ? parseFloat(document.getElementById("field-oldprice").value) : null,
        label: document.getElementById("field-label").value || "",
        image: currentProductImage,
        imageFit: currentProductImageFit,
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
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Esto restaurará el catálogo de productos original y se perderán los cambios guardados en este navegador. ¿Continuar?")) return;
      localStorage.removeItem(KEY_PRODUCTS);
      renderTable();
      renderCategoryChips();
    });
  }

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
  const postImageInput = document.getElementById("post-field-image");
  const postImagePreview = document.getElementById("post-image-preview");
  const postImageToolbar = document.getElementById("post-image-toolbar");
  const postPdfInput = document.getElementById("post-field-pdf");
  const postPdfStatus = document.getElementById("post-pdf-status");
  const postRemovePdfBtn = document.getElementById("post-remove-pdf-btn");

  let editingPostId = null;
  let currentPostImage = null;
  let currentPostImageFit = defaultFit();
  let currentPostPdf = null;
  let currentPostPdfName = "";

  function refreshPdfStatus() {
    postPdfStatus.textContent = currentPostPdf ? `📄 ${currentPostPdfName}` : "Ningún PDF adjunto.";
    postRemovePdfBtn.style.display = currentPostPdf ? "inline-flex" : "none";
  }
  if (postPdfInput) {
    postPdfInput.addEventListener("change", () => {
      readPdfFile(postPdfInput, result => {
        if (result === undefined) return;
        if (result) {
          currentPostPdf = result.data;
          currentPostPdfName = result.name;
        } else {
          currentPostPdf = null;
          currentPostPdfName = "";
        }
        refreshPdfStatus();
      });
    });
  }
  if (postRemovePdfBtn) {
    postRemovePdfBtn.addEventListener("click", () => {
      currentPostPdf = null;
      currentPostPdfName = "";
      postPdfInput.value = "";
      refreshPdfStatus();
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

  function openPostForm(id) {
    editingPostId = id || null;
    const p = id ? getPosts().find(x => x.id === id) : null;

    postFormTitle.textContent = p ? "Editar entrada" : "Agregar entrada";
    populatePostCategorySelect();
    document.getElementById("post-field-title").value = p ? p.title : "";
    postCategorySelect.value = p ? p.category : (getBlogCategories()[0] || {}).id || "";
    document.getElementById("post-field-excerpt").value = p ? p.excerpt : "";
    document.getElementById("post-field-date").value = p ? p.date : "";
    document.getElementById("post-field-readtime").value = p ? (p.readTime || "") : "";
    document.getElementById("post-field-featured").checked = p ? !!p.featured : false;
    currentPostImage = p ? (p.image || null) : null;
    currentPostImageFit = p && p.imageFit ? { ...p.imageFit } : defaultFit();
    postImagePreview.innerHTML = currentPostImage ? `<img src="${currentPostImage}" alt="">` : "Vista previa de la imagen";
    postImageInput.value = "";
    postAdjuster.refresh();
    currentPostPdf = p ? (p.pdf || null) : null;
    currentPostPdfName = p ? (p.pdfName || "") : "";
    postPdfInput.value = "";
    refreshPdfStatus();

    postOverlay.classList.add("open");
  }
  function closePostForm() {
    postOverlay.classList.remove("open");
    postForm.reset();
    currentPostPdf = null;
    currentPostPdfName = "";
    refreshPdfStatus();
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
        date: document.getElementById("post-field-date").value.trim(),
        readTime: document.getElementById("post-field-readtime").value.trim() || "5 min de lectura",
        featured: document.getElementById("post-field-featured").checked,
        image: currentPostImage,
        imageFit: currentPostImageFit,
        pdf: currentPostPdf,
        pdfName: currentPostPdfName,
        icon: "📰"
      };

      if (editingPostId) {
        const idx = list.findIndex(p => p.id === editingPostId);
        if (idx > -1) list[idx] = post;
      } else {
        list.push(post);
      }

      if (!savePosts(list)) return;
      closePostForm();
      renderPostsTable();
    });
  }

  if (addPostBtn) addPostBtn.addEventListener("click", () => openPostForm(null));
  if (cancelPostBtn) cancelPostBtn.addEventListener("click", closePostForm);

  function renderPostsTable() {
    if (!postTableBody) return;
    const list = getPosts();
    postTableBody.innerHTML = list.map(p => {
      const fit = p.imageFit || defaultFit();
      const thumb = p.image ? `<img src="${p.image}" alt="" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (p.icon || "📰");
      return `
      <tr>
        <td><div class="admin-thumb">${thumb}</div></td>
        <td>${p.title}</td>
        <td>${blogCategoryName(p.category)}</td>
        <td>${p.date}</td>
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

  /* ================= GALERÍA ================= */
  const KEY_GALLERY_ITEMS = "rcb_gallery_items";
  const KEY_GALLERY_CATEGORIES = "rcb_gallery_categories";
  const getGalleryItems = () => load(KEY_GALLERY_ITEMS, (window.RCB_DEFAULT_GALLERY_ITEMS || []).slice());
  const saveGalleryItems = list => save(KEY_GALLERY_ITEMS, list);
  const getGalleryCategories = () => load(KEY_GALLERY_CATEGORIES, (window.RCB_DEFAULT_GALLERY_CATEGORIES || []).slice());
  const saveGalleryCategories = list => save(KEY_GALLERY_CATEGORIES, list);
  function galleryCategoryName(id) {
    const c = getGalleryCategories().find(c => c.id === id);
    return c ? c.name : "General";
  }

  const galleryCatNameInput = document.getElementById("gallery-cat-name");
  const addGalleryCategoryBtn = document.getElementById("add-gallery-category-btn");
  const galleryCatChipGrid = document.getElementById("gallery-category-chip-grid");

  function renderGalleryCategoryChips() {
    if (!galleryCatChipGrid) return;
    const cats = getGalleryCategories();
    const items = getGalleryItems();
    galleryCatChipGrid.innerHTML = cats.map(c => {
      const count = items.filter(i => i.category === c.id).length;
      return `
        <div class="admin-chip">
          <div class="admin-chip-thumb">🖼️</div>
          <div class="admin-chip-body"><strong>${c.name}</strong><span>${count} foto(s)</span></div>
          <div class="admin-chip-actions">
            <button data-gcat-del="${c.id}" style="border:none;background:#fff;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.72rem;color:#DC2626;">🗑</button>
          </div>
        </div>`;
    }).join("") || `<p style="color:#94A3B8;font-size:0.85rem;">Aún no hay categorías de galería.</p>`;
    galleryCatChipGrid.querySelectorAll("[data-gcat-del]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.gcatDel;
      const used = getGalleryItems().some(i => i.category === id);
      if (!confirm((used ? "Hay fotos usando esta categoría; quedarán sin categoría válida. " : "") + "¿Eliminar esta categoría de galería?")) return;
      saveGalleryCategories(getGalleryCategories().filter(c => c.id !== id));
      renderGalleryCategoryChips();
      populateGalleryCategorySelect();
      renderGalleryTable();
    }));
  }

  if (addGalleryCategoryBtn) {
    addGalleryCategoryBtn.addEventListener("click", () => {
      const name = galleryCatNameInput.value.trim();
      if (!name) return;
      const list = getGalleryCategories();
      const id = uniqueId(slugify(name) || ("gcat-" + Date.now()), list.map(c => c.id));
      list.push({ id, name });
      saveGalleryCategories(list);
      galleryCatNameInput.value = "";
      renderGalleryCategoryChips();
      populateGalleryCategorySelect();
    });
  }

  const galleryTableBody = document.getElementById("admin-gallery-table-body");
  const galleryOverlay = document.getElementById("gallery-form-overlay");
  const galleryForm = document.getElementById("gallery-form");
  const galleryFormTitle = document.getElementById("gallery-form-title");
  const galleryCategorySelect = document.getElementById("gallery-field-category");
  const addGalleryItemBtn = document.getElementById("add-gallery-item-btn");
  const cancelGalleryBtn = document.getElementById("cancel-gallery-form-btn");
  const galleryImageInput = document.getElementById("gallery-field-image");
  const galleryImagePreview = document.getElementById("gallery-image-preview");
  const galleryImageToolbar = document.getElementById("gallery-image-toolbar");

  let editingGalleryId = null;
  let currentGalleryImage = null;
  let currentGalleryImageFit = defaultFit();

  const galleryAdjuster = setupImageAdjuster({
    box: galleryImagePreview,
    toolbar: galleryImageToolbar,
    zoomInBtn: document.getElementById("gallery-zoom-in"),
    zoomOutBtn: document.getElementById("gallery-zoom-out"),
    resetBtn: document.getElementById("gallery-reset-fit"),
    getFit: () => currentGalleryImageFit,
    setFit: fit => { currentGalleryImageFit = fit; }
  });

  if (galleryImageInput) {
    galleryImageInput.addEventListener("change", () => {
      readImageFile(galleryImageInput, dataUrl => {
        if (dataUrl === undefined) return;
        currentGalleryImage = dataUrl;
        currentGalleryImageFit = defaultFit();
        galleryImagePreview.innerHTML = dataUrl ? `<img src="${dataUrl}" alt="">` : "Vista previa de la imagen";
        galleryAdjuster.refresh();
      });
    });
  }

  function populateGalleryCategorySelect() {
    galleryCategorySelect.innerHTML = getGalleryCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  function openGalleryForm(id) {
    editingGalleryId = id || null;
    const item = id ? getGalleryItems().find(x => x.id === id) : null;

    galleryFormTitle.textContent = item ? "Editar foto" : "Agregar foto";
    populateGalleryCategorySelect();
    document.getElementById("gallery-field-caption").value = item ? item.caption : "";
    galleryCategorySelect.value = item ? item.category : (getGalleryCategories()[0] || {}).id || "";
    document.getElementById("gallery-field-wide").checked = item ? !!item.wide : false;
    currentGalleryImage = item ? (item.image || null) : null;
    currentGalleryImageFit = item && item.imageFit ? { ...item.imageFit } : defaultFit();
    galleryImagePreview.innerHTML = currentGalleryImage ? `<img src="${currentGalleryImage}" alt="">` : "Vista previa de la imagen";
    galleryImageInput.value = "";
    galleryAdjuster.refresh();

    galleryOverlay.classList.add("open");
  }
  function closeGalleryForm() { galleryOverlay.classList.remove("open"); galleryForm.reset(); }

  function deleteGalleryItem(id) {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    saveGalleryItems(getGalleryItems().filter(i => i.id !== id));
    renderGalleryTable();
    renderGalleryCategoryChips();
  }

  if (galleryForm) {
    galleryForm.addEventListener("submit", e => {
      e.preventDefault();
      const caption = document.getElementById("gallery-field-caption").value.trim();
      if (!caption) return;
      const list = getGalleryItems();

      const item = {
        id: editingGalleryId || uniqueId("gal-" + (slugify(caption) || Date.now()), list.map(i => i.id)),
        caption,
        category: galleryCategorySelect.value,
        wide: document.getElementById("gallery-field-wide").checked,
        image: currentGalleryImage,
        imageFit: currentGalleryImageFit,
        icon: "🖼️"
      };

      if (editingGalleryId) {
        const idx = list.findIndex(i => i.id === editingGalleryId);
        if (idx > -1) list[idx] = item;
      } else {
        list.push(item);
      }

      if (!saveGalleryItems(list)) return;
      closeGalleryForm();
      renderGalleryTable();
      renderGalleryCategoryChips();
    });
  }

  if (addGalleryItemBtn) addGalleryItemBtn.addEventListener("click", () => openGalleryForm(null));
  if (cancelGalleryBtn) cancelGalleryBtn.addEventListener("click", closeGalleryForm);

  function renderGalleryTable() {
    if (!galleryTableBody) return;
    const list = getGalleryItems();
    galleryTableBody.innerHTML = list.map(item => {
      const fit = item.imageFit || defaultFit();
      const thumb = item.image ? `<img src="${item.image}" alt="" style="transform:translate(${fit.x}%, ${fit.y}%) scale(${fit.scale});">` : (item.icon || "🖼️");
      return `
      <tr>
        <td><div class="admin-thumb">${thumb}</div></td>
        <td>${item.caption}</td>
        <td>${galleryCategoryName(item.category)}</td>
        <td>
          <div class="row-actions">
            <button data-gallery-edit="${item.id}">Editar</button>
            <button data-gallery-del="${item.id}" class="del-btn">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join("");
    galleryTableBody.querySelectorAll("[data-gallery-edit]").forEach(b => b.addEventListener("click", () => openGalleryForm(b.dataset.galleryEdit)));
    galleryTableBody.querySelectorAll("[data-gallery-del]").forEach(b => b.addEventListener("click", () => deleteGalleryItem(b.dataset.galleryDel)));
  }

  /* ================= NOSOTROS ================= */
  const KEY_ABOUT = "rcb_about";
  function getAbout() {
    const defaults = window.RCB_DEFAULT_ABOUT || {};
    const saved = localStorage.getItem(KEY_ABOUT);
    if (saved) { try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) { /* ignore */ } }
    return { ...defaults };
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
    const data = collectAboutForm();
    if (!saveAbout(data)) return;
    alert("Cambios guardados. Revisa la página Nosotros para verlos.");
  }

  const saveAboutBtn = document.getElementById("save-about-btn");
  const saveAboutBtnBottom = document.getElementById("save-about-btn-bottom");
  if (saveAboutBtn) saveAboutBtn.addEventListener("click", saveAboutForm);
  if (saveAboutBtnBottom) saveAboutBtnBottom.addEventListener("click", saveAboutForm);

  /* ================= INIT ================= */
  function renderAll() {
    populateCategorySelect(categorySelect);
    renderTable();
    renderCategoryChips();
    renderBlogCategoryChips();
    renderPostsTable();
    renderVideoCategoryChips();
    renderVideosTable();
    renderGalleryCategoryChips();
    renderGalleryTable();
    fillAboutForm();
  }

  if (isLoggedIn()) showApp();
})();
