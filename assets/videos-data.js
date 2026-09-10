/* Categorías y videos del catálogo RCB.
   El panel administrador guarda los cambios en localStorage bajo las claves
   "rcb_video_categories" y "rcb_videos" — esos valores tienen prioridad
   sobre estas listas por defecto. */
window.RCB_DEFAULT_VIDEO_CATEGORIES = [
  {
    "id": "voltaje",
    "name": "Protectores de voltaje"
  },
  {
    "id": "cintas",
    "name": "Cintas aislantes"
  },
  {
    "id": "instalaciones",
    "name": "Instalaciones"
  },
  {
    "id": "comparativas",
    "name": "Comparativas"
  },
  {
    "id": "consejos",
    "name": "Consejos"
  },
  {
    "id": "laboratorio",
    "name": "Pruebas de laboratorio"
  }
];

window.RCB_DEFAULT_VIDEOS = [
  {
    "id": "video-cinta-momia-pegable-vs-no-pegable",
    "title": "Cinta momia pegable vs no pegable: ¿cuál conviene más?",
    "category": "comparativas",
    "description": "Comparamos las dos versiones más usadas en refrigeración y electricidad. Ventajas, desventajas y pruebas reales.",
    "youtubeId": "7TJUtW3xsJI",
    "duration": "6:45",
    "date": "20 mayo, 2024",
    "views": "1.2K vistas",
    "icon": "🎬",
    "home": false
  },
  {
    "id": "video-protector-voltaje-electrodomesticos",
    "title": "¿Cómo protege un protector de voltaje tus electrodomésticos?",
    "category": "voltaje",
    "description": "Demostramos cómo trabaja el protector RCB ante variaciones de voltaje y apagones.",
    "youtubeId": "JcGoqRzN_2w",
    "duration": "5:32",
    "date": "15 mayo, 2024",
    "views": "980 vistas",
    "icon": "🎬",
    "home": false
  },
  {
    "id": "video-cinta-momia-resistencia",
    "title": "Cinta momia RCB: prueba de resistencia al calor y al agua",
    "category": "laboratorio",
    "description": "Ponemos a prueba nuestras cintas en condiciones extremas. Resultados que garantizan calidad.",
    "youtubeId": "hX0IG4d2fiU",
    "duration": "4:58",
    "date": "10 mayo, 2024",
    "views": "1.1K vistas",
    "icon": "🎬",
    "home": false
  },
  {
    "id": "video-encintar-tuberia-aire-acondicionado",
    "title": "Cómo encintar correctamente una tubería de aire acondicionado",
    "category": "instalaciones",
    "description": "Guía práctica paso a paso para una instalación segura y duradera.",
    "youtubeId": "3epf6kaXqFc",
    "duration": "7:20",
    "date": "5 mayo, 2024",
    "views": "850 vistas",
    "icon": "🎬",
    "home": false
  },
  {
    "id": "video-errores-instalar-equipos-electricos",
    "title": "13 errores comunes al instalar equipos eléctricos",
    "category": "consejos",
    "description": "Evita fallas y protege tu inversión.",
    "youtubeId": "-hwCq2hH-7c",
    "duration": "5:12",
    "date": "22 abril, 2024",
    "views": "640 vistas",
    "icon": "🎬",
    "home": true
  }
];
