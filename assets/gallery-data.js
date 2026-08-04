/* Categorías e imágenes de la galería RCB.
   El panel administrador guarda los cambios en localStorage bajo las claves
   "rcb_gallery_categories" y "rcb_gallery_items" — esos valores tienen
   prioridad sobre estas listas por defecto. */
window.RCB_DEFAULT_GALLERY_CATEGORIES = [
  { id: "voltaje", name: "Protectores de voltaje" },
  { id: "cintas", name: "Cintas aislantes" },
  { id: "refrigeracion", name: "Refrigeración" },
  { id: "instalaciones", name: "Instalaciones" }
];

window.RCB_DEFAULT_GALLERY_ITEMS = [
  { id: "gal-protector-voltaje-rcb", caption: "Protector de voltaje RCB", category: "voltaje", image: null, icon: "⚡", wide: true },
  { id: "gal-cinta-pvc-aislante", caption: "Cinta PVC aislante", category: "cintas", image: null, icon: "🌀", wide: false },
  { id: "gal-cinta-momia-pegable", caption: "Cinta momia pegable", category: "cintas", image: null, icon: "🌀", wide: false },
  { id: "gal-motoventilador-refrigeracion", caption: "Motoventilador de refrigeración", category: "refrigeracion", image: null, icon: "❄️", wide: false },
  { id: "gal-instalacion-electrica-residencial", caption: "Instalación eléctrica residencial", category: "instalaciones", image: null, icon: "🔧", wide: false },
  { id: "gal-instalacion-aire-acondicionado", caption: "Instalación de aire acondicionado", category: "instalaciones", image: null, icon: "🧰", wide: false },
  { id: "gal-protector-voltaje-refrigeradora", caption: "Protector de voltaje en refrigeradora", category: "voltaje", image: null, icon: "🔌", wide: true },
  { id: "gal-cinta-momia-no-pegable", caption: "Cinta momia no pegable", category: "cintas", image: null, icon: "🌀", wide: false },
  { id: "gal-repuestos-climatizacion", caption: "Repuestos para climatización", category: "refrigeracion", image: null, icon: "🧊", wide: false },
  { id: "gal-mantenimiento-electrico", caption: "Proyecto de mantenimiento eléctrico", category: "instalaciones", image: null, icon: "🛠️", wide: false },
  { id: "gal-panel-proteccion-electrica", caption: "Panel de protección eléctrica", category: "voltaje", image: null, icon: "⚡", wide: false },
  { id: "gal-rcb-lab-pruebas", caption: "RCB Lab: pruebas de resistencia", category: "cintas", image: null, icon: "🎬", wide: true }
];
