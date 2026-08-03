/* Panel administrador — lógica 100% client-side (localStorage).
   ADVERTENCIA PARA EL DESARROLLADOR: esto es una demo funcional para gestionar
   el catálogo desde el navegador. NO es un backend real: las credenciales
   están en este archivo (visibles en el código fuente) y los datos se guardan
   solo en el navegador de quien los edita. Para producción se necesita un
   backend con autenticación real y una base de datos compartida. */
(function () {
  const STORAGE_KEY = "rcb_products";
  const SESSION_KEY = "rcb_admin_session";
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "rcb2026";

  const loginBox = document.getElementById("admin-login");
  const shell = document.getElementById("admin-shell");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function showApp() {
    loginBox.style.display = "none";
    shell.classList.add("open");
    renderAll();
  }

  function showLogin() {
    shell.classList.remove("open");
    loginBox.style.display = "flex";
  }

  if (isLoggedIn()) showApp();

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
    });
  }

  /* ---------- Gestión de productos ---------- */
  function getProducts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return (window.RCB_DEFAULT_PRODUCTS || []).slice();
  }

  function saveProducts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

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

  let editingId = null;

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

  function renderTable() {
    const list = getProducts();
    renderStats(list);
    if (!tableBody) return;
    tableBody.innerHTML = list.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.icon || "📦"} ${p.name}</td>
        <td>${p.categoryLabel}</td>
        <td>$${Number(p.price).toFixed(2)}</td>
        <td>${p.stock ? "En stock" : "Agotado"}</td>
        <td>
          <div class="row-actions">
            <button data-edit="${p.id}">Editar</button>
            <button data-del="${p.id}" class="del-btn">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");

    tableBody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => openForm(btn.dataset.edit));
    });
    tableBody.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => deleteProduct(btn.dataset.del));
    });
  }

  const CATEGORY_OPTIONS = [
    { value: "voltaje", label: "Protectores de voltaje" },
    { value: "cintas", label: "Cintas aislantes" },
    { value: "refrigeracion", label: "Repuestos para refrigeración" },
    { value: "electricos", label: "Materiales eléctricos" },
    { value: "herramientas", label: "Herramientas y accesorios" }
  ];

  function populateCategorySelect() {
    const sel = document.getElementById("field-category");
    if (!sel) return;
    sel.innerHTML = CATEGORY_OPTIONS.map(c => `<option value="${c.value}">${c.label}</option>`).join("");
  }

  function openForm(id) {
    editingId = id || null;
    const list = getProducts();
    const p = id ? list.find(x => x.id === id) : null;

    formTitle.textContent = p ? "Editar producto" : "Agregar producto";
    document.getElementById("field-id").value = p ? p.id : "";
    document.getElementById("field-id").disabled = !!p;
    document.getElementById("field-name").value = p ? p.name : "";
    document.getElementById("field-category").value = p ? p.category : "voltaje";
    document.getElementById("field-price").value = p ? p.price : "";
    document.getElementById("field-icon").value = p ? (p.icon || "") : "📦";
    document.getElementById("field-stock").checked = p ? !!p.stock : true;
    document.getElementById("field-description").value = p ? p.description : "";
    document.getElementById("field-specs").value = p ? (p.specs || []).join("\n") : "";

    formOverlay.classList.add("open");
  }

  function closeForm() {
    formOverlay.classList.remove("open");
    form.reset();
  }

  function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    const list = getProducts().filter(p => p.id !== id);
    saveProducts(list);
    renderTable();
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const list = getProducts();
      const catValue = document.getElementById("field-category").value;
      const catLabel = CATEGORY_OPTIONS.find(c => c.value === catValue).label;

      const newProduct = {
        id: editingId || document.getElementById("field-id").value.trim().toUpperCase().replace(/\s+/g, "-"),
        name: document.getElementById("field-name").value.trim(),
        category: catValue,
        categoryLabel: catLabel,
        price: parseFloat(document.getElementById("field-price").value) || 0,
        icon: document.getElementById("field-icon").value.trim() || "📦",
        stock: document.getElementById("field-stock").checked,
        description: document.getElementById("field-description").value.trim(),
        specs: document.getElementById("field-specs").value
          .split("\n").map(s => s.trim()).filter(Boolean)
      };

      if (!newProduct.id || !newProduct.name) return;

      if (editingId) {
        const idx = list.findIndex(p => p.id === editingId);
        if (idx > -1) list[idx] = newProduct;
      } else {
        if (list.some(p => p.id === newProduct.id)) {
          alert("Ya existe un producto con ese SKU. Usa otro código.");
          return;
        }
        list.push(newProduct);
      }

      saveProducts(list);
      closeForm();
      renderTable();
    });
  }

  if (addBtn) addBtn.addEventListener("click", () => openForm(null));
  if (cancelBtn) cancelBtn.addEventListener("click", closeForm);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Esto restaurará el catálogo original y se perderán los cambios guardados en este navegador. ¿Continuar?")) return;
      localStorage.removeItem(STORAGE_KEY);
      renderTable();
    });
  }

  function renderAll() {
    populateCategorySelect();
    renderTable();
  }

  if (isLoggedIn()) renderAll();
})();
