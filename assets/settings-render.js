/* Aplica los datos de "Atención al cliente" (footer) guardados desde el
   panel administrador, o los valores por defecto de settings-data.js. */
(async function () {
  await window.RCB_DATA_READY;
  function getSettings() {
    return window.RCB_DEFAULT_SETTINGS || {};
  }

  const s = getSettings();
  const map = {
    "footer-whatsapp": "💬 WhatsApp: " + s.whatsapp,
    "footer-email": "✉️ " + s.email,
    "footer-hours-weekday": "🕐 " + s.hoursWeekday,
    "footer-hours-saturday": "🕐 " + s.hoursSaturday,
    "contact-whatsapp": s.whatsapp,
    "contact-email": s.email,
    "contact-hours-weekday": s.hoursWeekday,
    "contact-hours-saturday": s.hoursSaturday
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = map[id];
  });
})();
