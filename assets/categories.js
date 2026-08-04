/* Categorías y subcategorías base del catálogo RCB.
   El panel administrador guarda los cambios en localStorage bajo las claves
   "rcb_categories" y "rcb_subcategories" — esos valores tienen prioridad
   sobre estas listas por defecto. */
window.RCB_DEFAULT_CATEGORIES = [
  { id: "voltaje", name: "Protectores de voltaje", shortName: "Voltaje", image: "imagen/imagen2.png" },
  { id: "cintas", name: "Cintas aislantes", shortName: "Cintas", image: "imagen/imagen3.png" },
  { id: "refrigeracion", name: "Repuestos para refrigeración", shortName: "Refrigeración", image: "imagen/imagen4.png" },
  { id: "electricos", name: "Materiales eléctricos", shortName: "Eléctricos", image: "imagen/imagen5.png" },
  { id: "herramientas", name: "Herramientas y accesorios", shortName: "Herramientas", image: "imagen/imagen6.png" }
];

window.RCB_DEFAULT_SUBCATEGORIES = [];
