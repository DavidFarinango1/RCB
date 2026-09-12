/* Un producto puede tener hasta 3 imágenes, guardadas en el campo "images".
   Los productos creados antes solo tienen "image" (una sola): esta función
   entiende los dos formatos, así que nada de lo que ya existe se pierde.

   Para que el resto del sitio siga funcionando sin cambios, al guardar desde
   el panel también se mantiene "image" apuntando a la primera imagen: es la
   que usan la tarjeta del catálogo, la del inicio y la tabla del panel. */
window.RCB_MAX_IMAGENES_PRODUCTO = 3;

window.RCB_IMAGENES_PRODUCTO = function (p) {
  const fitPorDefecto = { scale: 1, x: 0, y: 0 };
  if (!p) return [];

  if (Array.isArray(p.images) && p.images.length) {
    return p.images
      .filter(function (i) { return i && i.url; })
      .slice(0, window.RCB_MAX_IMAGENES_PRODUCTO)
      .map(function (i) {
        return { url: i.url, fit: i.fit || fitPorDefecto };
      });
  }

  /* Formato antiguo: una sola imagen en "image". */
  if (p.image) return [{ url: p.image, fit: p.imageFit || fitPorDefecto }];

  return [];
};

/* Estilo de encuadre (mover y zoom) de una imagen. */
window.RCB_ESTILO_ENCUADRE = function (fit) {
  const f = fit || { scale: 1, x: 0, y: 0 };
  return "transform:translate(" + f.x + "%, " + f.y + "%) scale(" + f.scale + ");";
};
