/* Cliente para la API de RCB (backend/api.php). Reemplaza el uso de
   localStorage por una base de datos real en el servidor (mismo dominio). */
window.RCB_API = (function () {
  const BASE = "backend/api.php";

  async function get(resource) {
    const res = await fetch(BASE + "?resource=" + encodeURIComponent(resource), { credentials: "same-origin" });
    if (!res.ok) throw new Error("No se pudo leer '" + resource + "' (HTTP " + res.status + ")");
    return res.json();
  }

  async function save(resource, data) {
    const res = await fetch(BASE + "?resource=" + encodeURIComponent(resource), {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || ("Error al guardar '" + resource + "' (HTTP " + res.status + ")"));
    }
    return res.json();
  }

  async function login(username, password) {
    const res = await fetch(BASE + "?resource=login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || "Usuario o contraseña incorrectos.");
    return body;
  }

  async function logout() {
    return fetch(BASE + "?resource=logout", { method: "POST", credentials: "same-origin" });
  }

  /* Sube una imagen al servidor (backend/upload.php la comprime y guarda como
     archivo real) y devuelve su URL, que es lo que se guarda en la base de datos. */
  async function uploadImage(file) {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("backend/upload.php", {
      method: "POST",
      credentials: "same-origin",
      body: form
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || "No se pudo subir la imagen.");
    return body.url;
  }

  return { get, save, login, logout, uploadImage };
})();
