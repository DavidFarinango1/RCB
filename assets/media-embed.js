/* Convierte un enlace de video pegado por el administrador en la dirección
   que se puede incrustar dentro de la página (para que el video se reproduzca
   aquí mismo y no mande al visitante a otro sitio).
   Acepta YouTube (normal, corto, shorts, embed), Vimeo y TikTok.

   Solo se aceptan ENLACES. Un código de inserción pegado (<blockquote ...>)
   se rechaza a propósito: es fácil pegar el de otro video por error, y así
   ninguno aparece publicado sin querer.

   Espejo en el servidor: backend/blog-lib.php (rcb_embed_url). */
(function () {
  function limpiar(url) {
    const t = String(url == null ? "" : url).trim();
    /* Debe parecer un enlace de uno de los servicios, con o sin https:// */
    if (!/^(https?:\/\/)?([a-z0-9-]+\.)*(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com)\//i.test(t)) return "";
    return t;
  }

  window.RCB_EMBED_INFO = function (url) {
    const u = limpiar(url);
    if (!u) return null;

    const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { url: "https://www.youtube.com/embed/" + yt[1], servicio: "YouTube", vertical: /\/shorts\//.test(u) };

    /* Vimeo: vimeo.com/123456789 y también vimeo.com/canal/123456789 */
    const vm = u.match(/vimeo\.com\/(?:[^\/?#]+\/)*(\d{6,})/);
    if (vm) return { url: "https://player.vimeo.com/video/" + vm[1], servicio: "Vimeo", vertical: false };

    /* TikTok: tiktok.com/@cuenta/video/123..., /embed/v2/123..., /player/v1/123... */
    const tt = u.match(/tiktok\.com\/(?:@[^\/?#]+\/video|embed(?:\/v2)?|player\/v1|v)\/(\d{10,})/);
    if (tt) return { url: "https://www.tiktok.com/player/v1/" + tt[1], servicio: "TikTok", vertical: true };

    return null;
  };

  /* Para dar un aviso útil cuando el enlace no sirve. */
  window.RCB_EMBED_MOTIVO = function (url) {
    const t = String(url == null ? "" : url).trim();
    if (/^</.test(t)) return "Pega el enlace del video, no el código de inserción.";
    if (/(vm\.tiktok\.com|tiktok\.com\/t\/)/i.test(t)) {
      return "Es un enlace corto de TikTok. Abre el video en el navegador y copia el enlace completo (el que incluye /video/).";
    }
    return "No reconocemos este enlace. Debe ser de YouTube, Vimeo o TikTok.";
  };

  /* VIDEO CORTO de un producto: solo formatos cortos y verticales, que son
     los que tienen sentido en la ficha (TikTok y YouTube Shorts). */
  window.RCB_VIDEO_CORTO = function (url) {
    const i = window.RCB_EMBED_INFO(url);
    return i && i.vertical ? i : null;
  };
  window.RCB_VIDEO_CORTO_MOTIVO = function (url) {
    const i = window.RCB_EMBED_INFO(url);
    if (i && !i.vertical) {
      return "Es un video normal de " + i.servicio + ". Aquí va un video corto: usa un enlace de TikTok o de YouTube Shorts (youtube.com/shorts/...).";
    }
    return window.RCB_EMBED_MOTIVO(url).replace("YouTube, Vimeo o TikTok", "TikTok o YouTube Shorts");
  };

  /* Compatibilidad con el código que ya usa estas dos funciones. */
  window.RCB_EMBED_URL = function (url) {
    const i = window.RCB_EMBED_INFO(url);
    return i ? i.url : null;
  };
  window.RCB_EMBED_SERVICIO = function (url) {
    const i = window.RCB_EMBED_INFO(url);
    return i ? i.servicio : null;
  };
})();
