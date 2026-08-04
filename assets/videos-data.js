/* Categorías y videos del catálogo RCB.
   El panel administrador guarda los cambios en localStorage bajo las claves
   "rcb_video_categories" y "rcb_videos" — esos valores tienen prioridad
   sobre estas listas por defecto. */
window.RCB_DEFAULT_VIDEO_CATEGORIES = [
  { id: "voltaje", name: "Protectores de voltaje" },
  { id: "cintas", name: "Cintas aislantes" },
  { id: "instalaciones", name: "Instalaciones" },
  { id: "comparativas", name: "Comparativas" },
  { id: "consejos", name: "Consejos" },
  { id: "laboratorio", name: "Pruebas de laboratorio" }
];

window.RCB_DEFAULT_VIDEOS = [
  {
    id: "video-cinta-momia-pegable-vs-no-pegable",
    title: "Cinta momia pegable vs no pegable: ¿cuál conviene más?",
    description: "Comparamos las dos versiones más usadas en refrigeración y electricidad. Ventajas, desventajas y pruebas reales.",
    category: "comparativas",
    youtubeId: "",
    duration: "6:45",
    date: "20 mayo, 2024",
    views: "1.2K vistas",
    image: null,
    icon: "🌀"
  },
  {
    id: "video-protector-voltaje-electrodomesticos",
    title: "¿Cómo protege un protector de voltaje tus electrodomésticos?",
    description: "Demostramos cómo trabaja el protector RCB ante variaciones de voltaje y apagones.",
    category: "voltaje",
    youtubeId: "",
    duration: "5:32",
    date: "15 mayo, 2024",
    views: "980 vistas",
    image: null,
    icon: "⚡"
  },
  {
    id: "video-cinta-momia-resistencia",
    title: "Cinta momia RCB: prueba de resistencia al calor y al agua",
    description: "Ponemos a prueba nuestras cintas en condiciones extremas. Resultados que garantizan calidad.",
    category: "laboratorio",
    youtubeId: "",
    duration: "4:58",
    date: "10 mayo, 2024",
    views: "1.1K vistas",
    image: null,
    icon: "🌀"
  },
  {
    id: "video-encintar-tuberia-aire-acondicionado",
    title: "Cómo encintar correctamente una tubería de aire acondicionado",
    description: "Guía práctica paso a paso para una instalación segura y duradera.",
    category: "instalaciones",
    youtubeId: "",
    duration: "7:20",
    date: "5 mayo, 2024",
    views: "850 vistas",
    image: null,
    icon: "❄️"
  },
  {
    id: "video-que-pasa-vuelve-luz-apagon",
    title: "¿Qué pasa cuando vuelve la luz después de un apagón?",
    description: "Explicamos los riesgos y cómo proteger tus equipos.",
    category: "voltaje",
    youtubeId: "",
    duration: "4:03",
    date: "28 abril, 2024",
    views: "720 vistas",
    image: null,
    icon: "⚡"
  },
  {
    id: "video-errores-instalar-equipos-electricos",
    title: "5 errores comunes al instalar equipos eléctricos",
    description: "Evita fallas y protege tu inversión.",
    category: "consejos",
    youtubeId: "",
    duration: "5:12",
    date: "22 abril, 2024",
    views: "640 vistas",
    image: null,
    icon: "🔧"
  },
  {
    id: "video-cinta-aislante-o-momia",
    title: "¿Cinta aislante o cinta momia? Cuándo usar cada una",
    description: "Te ayudamos a elegir la mejor opción para cada necesidad.",
    category: "cintas",
    youtubeId: "",
    duration: "6:07",
    date: "18 abril, 2024",
    views: "910 vistas",
    image: null,
    icon: "🌀"
  }
];
