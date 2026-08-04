/* Inyecta íconos SVG reales (Facebook, Instagram, YouTube, TikTok)
   en cualquier enlace .social-row a[aria-label], reemplazando los emoji. */
(function () {
  const ICONS = {
    Facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.23 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.23 22 17.08 22 12.06Z"/></svg>',
    Instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    YouTube: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23 12s0-3.5-.45-5.15a2.9 2.9 0 0 0-2-2.05C18.9 4.3 12 4.3 12 4.3s-6.9 0-8.55.5a2.9 2.9 0 0 0-2 2.05C1 8.5 1 12 1 12s0 3.5.45 5.15a2.9 2.9 0 0 0 2 2.05c1.65.5 8.55.5 8.55.5s6.9 0 8.55-.5a2.9 2.9 0 0 0 2-2.05C23 15.5 23 12 23 12ZM9.75 15.5v-7l6 3.5-6 3.5Z"/></svg>',
    TikTok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.5 2h-3.1v13.2c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.28 0 .55.04.8.12v-3.2a5.9 5.9 0 0 0-.8-.06 5.9 5.9 0 0 0-5.9 5.9 5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9V8.4a7.6 7.6 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.5-4.5Z"/></svg>'
  };

  function apply() {
    document.querySelectorAll(".social-row a[aria-label]").forEach(a => {
      const icon = ICONS[a.getAttribute("aria-label")];
      if (icon) a.innerHTML = icon;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
