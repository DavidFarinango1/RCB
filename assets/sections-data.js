/* Contenido de los banners (encabezados) de cada sección del sitio:
   Inicio, Productos, Blog, Videos y Contacto.
   El panel administrador guarda los cambios en la base de datos bajo el
   recurso "sections" — ese valor tiene prioridad sobre este contenido.
   Este archivo es el respaldo que se muestra si el servidor no responde. */
/* Convierte el título en HTML: respeta los saltos de línea y resalta en azul
   la "palabra destacada". Lo usan tanto la web (sections-render.js) como la
   vista previa del panel (admin.js), para que se vean exactamente igual. */
window.RCB_SECTION_TITLE_HTML = function (title, accent) {
  const escape = str => String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let html = escape(title).replace(/\r?\n/g, "<br>");
  const word = String(accent == null ? "" : accent).trim();
  if (word) {
    const safe = escape(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(safe, "i"), m => '<span class="accent">' + m + "</span>");
  }
  return html;
};

/* Devuelve el valor CSS para la imagen de fondo de un banner.
   Ojo: una url() dentro de una variable CSS se resuelve contra la HOJA DE
   ESTILOS (assets/), no contra la página; por eso "imagen/foto.png" acabaría
   buscándose en "assets/imagen/foto.png" y saldría rota. Se convierte a ruta
   absoluta para que apunte siempre al lugar correcto. */
window.RCB_SECTION_IMAGE_CSS = function (ruta) {
  if (!ruta) return "none";
  try {
    return 'url("' + new URL(ruta, document.baseURI).href + '")';
  } catch (e) {
    return 'url("' + ruta + '")';
  }
};

window.RCB_DEFAULT_SECTIONS = {
  inicio: {
    title: "Protección que\ntu hogar necesita",
    accent: "tu hogar",
    subtitle: "Protectores de voltaje, cintas aislantes y repuestos de calidad para instalaciones seguras y duraderas.",
    image: "imagen/imagen1.png",
    imagePos: "center right",
    overlay: 0,
    tint: 100,
    features: [
      { title: "CALIDAD GARANTIZADA", text: "Productos probados y certificados" },
      { title: "MÁXIMA SEGURIDAD", text: "Protege tus equipos y tu inversión" },
      { title: "ENVÍOS A TODO ECUADOR", text: "Rápido y seguro" }
    ]
  },
  productos: {
    title: "Catálogo de Productos",
    subtitle: "Protectores de voltaje, cintas aislantes, repuestos para refrigeración, materiales eléctricos y herramientas.",
    image: "imagen/imagen9.png",
    imagePos: "center center",
    overlay: 0,
    tint: 100
  },
  blog: {
    title: "Blog RCB",
    subtitle: "Consejos, guías y pruebas reales para elegir los mejores productos y proteger lo que más importa.",
    image: "imagen/imagen9.png",
    imagePos: "center center",
    overlay: 0,
    tint: 100
  },
  videos: {
    title: "Videos RCB",
    subtitle: "Pruebas reales, consejos útiles y demostraciones que te ayudan a elegir mejor.",
    image: "imagen/imagen9.png",
    imagePos: "center center",
    overlay: 0,
    tint: 100
  },
  contacto: {
    title: "Contáctanos",
    subtitle: "Escríbenos, cuéntanos qué necesitas y te ayudamos a encontrar la mejor solución para tu proyecto.",
    image: "imagen/imagen9.png",
    imagePos: "center center",
    overlay: 0,
    tint: 100
  }
};
