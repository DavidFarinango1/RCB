/* Trae todo el contenido del sitio (productos, categorías, blog, videos,
   "Nosotros", "Atención al cliente") desde la base de datos real (backend/api.php)
   y lo deja disponible en las mismas variables window.RCB_DEFAULT_* que ya
   usaban las páginas, para no tener que reescribir cada script de renderizado.
   window.RCB_DATA_READY es una promesa que los demás scripts esperan (await)
   antes de leer esas variables. */
window.RCB_DATA_READY = (async function () {
  try {
    const [
      products, categories, posts, blogCategories,
      videos, videoCategories, about, settings
    ] = await Promise.all([
      RCB_API.get("products"),
      RCB_API.get("categories"),
      RCB_API.get("posts"),
      RCB_API.get("blog_categories"),
      RCB_API.get("videos"),
      RCB_API.get("video_categories"),
      RCB_API.get("about"),
      RCB_API.get("settings")
    ]);
    if (products && products.length) window.RCB_DEFAULT_PRODUCTS = products;
    if (categories && categories.length) window.RCB_DEFAULT_CATEGORIES = categories;
    if (posts && posts.length) window.RCB_DEFAULT_POSTS = posts;
    if (blogCategories && blogCategories.length) window.RCB_BLOG_CATEGORIES = blogCategories;
    if (videos && videos.length) window.RCB_DEFAULT_VIDEOS = videos;
    if (videoCategories && videoCategories.length) window.RCB_DEFAULT_VIDEO_CATEGORIES = videoCategories;
    if (about && Object.keys(about).length) window.RCB_DEFAULT_ABOUT = about;
    if (settings && Object.keys(settings).length) window.RCB_DEFAULT_SETTINGS = settings;
  } catch (e) {
    console.error("No se pudo conectar con el servidor, se muestra el contenido de respaldo:", e);
  }
})();
