/* Convierte un enlace de video pegado por el administrador en la dirección
   que se puede incrustar dentro de la página (para que el video se reproduzca
   aquí mismo y no mande al visitante a otro sitio).
   Acepta YouTube (normal, corto, shorts, embed) y Vimeo.
   Devuelve null si el enlace no es de un servicio reconocido. */
window.RCB_EMBED_URL = function (url) {
  const limpio = String(url == null ? "" : url).trim();
  if (!limpio) return null;

  const yt = limpio.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return "https://www.youtube.com/embed/" + yt[1];

  /* Vimeo: vimeo.com/123456789 y también vimeo.com/canal/123456789 */
  const vm = limpio.match(/vimeo\.com\/(?:[^\/]+\/)*(\d{6,})/);
  if (vm) return "https://player.vimeo.com/video/" + vm[1];

  return null;
};

/* Nombre del servicio, para avisar en el panel qué se detectó. */
window.RCB_EMBED_SERVICIO = function (url) {
  const e = window.RCB_EMBED_URL(url);
  if (!e) return null;
  return e.indexOf("youtube") !== -1 ? "YouTube" : "Vimeo";
};
