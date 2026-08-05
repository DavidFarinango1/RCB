/* Aplica los datos de "Atención al cliente" (footer) guardados desde el
   panel administrador, o los valores por defecto de settings-data.js. */
(function () {
  function getSettings() {
    const saved = localStorage.getItem("rcb_settings");
    if (saved) { try { return { ...window.RCB_DEFAULT_SETTINGS, ...JSON.parse(saved) }; } catch (e) { /* usa los de por defecto */ } }
    return window.RCB_DEFAULT_SETTINGS || {};
  }

  const s = getSettings();
  const map = {
    "footer-whatsapp": "💬 WhatsApp: " + s.whatsapp,
    "footer-email": "✉️ " + s.email,
    "footer-hours-weekday": "🕐 " + s.hoursWeekday,
    "footer-hours-saturday": "🕐 " + s.hoursSaturday
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = map[id];
  });
})();
