/* Categorías y entradas del blog RCB.
   El panel administrador guarda los cambios en localStorage bajo la clave
   "rcb_posts" — ese valor tiene prioridad sobre esta lista por defecto. */
window.RCB_BLOG_CATEGORIES = [
  { id: "voltaje", name: "Protectores de voltaje" },
  { id: "cintas", name: "Cintas aislantes" },
  { id: "refrigeracion", name: "Refrigeración" },
  { id: "instalaciones", name: "Instalaciones eléctricas" },
  { id: "consejos", name: "Consejos y mantenimiento" },
  { id: "lab", name: "RCB Lab – Pruebas reales" }
];

window.RCB_DEFAULT_POSTS = [
  {
    "id": "post-cinta-momia-pegable-vs-no-pegable",
    "title": "Cinta momia pegable vs no pegable: ¿cuál conviene más?",
    "excerpt": "Comparamos a fondo las dos versiones más usadas en refrigeración y electricidad. Ventajas, desventajas, aplicaciones y recomendaciones según cada caso.",
    "category": "cintas",
    "date": "20 mayo, 2024",
    "readTime": "6 min de lectura",
    "image": null,
    "icon": "🌀",
    "featured": true
  },
  {
    "id": "post-elegir-protector-refrigeradora",
    "title": "¿Cómo elegir el protector de voltaje ideal para tu refrigeradora?",
    "category": "voltaje",
    "excerpt": "Aprende a elegir el protector adecuado según la potencia, tipo de equipo y las condiciones eléctricas de tu hogar.",
    "date": "18 mayo, 2024",
    "readTime": "5 min de lectura",
    "featured": false,
    "image": null,
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "videoUrl": "<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@pelisdetodo06/video/7661693880324148500\" data-video-id=\"7661693880324148500\" style=\"max-width: 605px;min-width: 325px;\" > <section> <a target=\"_blank\" title=\"@pelisdetodo06\" href=\"https://www.tiktok.com/@pelisdetodo06?refer=embed\">@pelisdetodo06</a> <p>𝐑𝐈𝐎🐦| película completa en español latino🎬🍿</p> <a target=\"_blank\" title=\"♬ sonido original - 𝐏𝐄𝐋𝐈𝐂𝐔𝐋𝐀𝐒 🍿\" href=\"https://www.tiktok.com/music/sonido-original-7661694805161102098?refer=embed\">♬ sonido original - 𝐏𝐄𝐋𝐈𝐂𝐔𝐋𝐀𝐒 🍿</a> </section> </blockquote> <script async src=\"https://www.tiktok.com/embed.js\"></script>",
    "contentBlocks": [],
    "icon": "📰"
  },
  {
    "id": "post-por-que-se-danan-electrodomesticos",
    "title": "¿Por qué se dañan los electrodomésticos cuando regresa la energía?",
    "excerpt": "Te explicamos las causas de los picos de voltaje y cómo un buen protector puede evitar daños costosos.",
    "category": "voltaje",
    "date": "15 mayo, 2024",
    "readTime": "6 min de lectura",
    "image": null,
    "icon": "❄️",
    "featured": false
  },
  {
    "id": "post-errores-comunes-cinta-aislante",
    "title": "5 errores comunes al usar cinta aislante y cómo evitarlos",
    "excerpt": "Pequeños errores que pueden comprometer tus instalaciones. Evítalos y asegúrate de usar la cinta de forma correcta.",
    "category": "cintas",
    "date": "12 mayo, 2024",
    "readTime": "4 min de lectura",
    "image": null,
    "icon": "🌀",
    "featured": false
  },
  {
    "id": "post-cinta-aislante-calor-humedad",
    "title": "¿Qué cinta aislante soporta más calor y humedad?",
    "excerpt": "Prueba de resistencia: analizamos diferentes cintas en condiciones extremas para mostrarte cuál dura más.",
    "category": "cintas",
    "date": "10 mayo, 2024",
    "readTime": "5 min de lectura",
    "image": null,
    "icon": "🌀",
    "featured": false
  },
  {
    "id": "post-aislar-tuberias-aire-acondicionado",
    "title": "Cómo aislar correctamente las tuberías de tu aire acondicionado",
    "excerpt": "Guía paso a paso para una instalación eficiente que mejora el rendimiento y evita filtraciones de agua.",
    "category": "refrigeracion",
    "date": "8 mayo, 2024",
    "readTime": "6 min de lectura",
    "image": null,
    "icon": "🧊",
    "featured": false
  },
  {
    "id": "post-senales-instalacion-necesita-proteccion",
    "title": "Señales de que tu instalación eléctrica necesita protección",
    "excerpt": "Identifica los riesgos más comunes en tu instalación y protege tu hogar o negocio antes de que sea tarde.",
    "category": "instalaciones",
    "date": "5 mayo, 2024",
    "readTime": "5 min de lectura",
    "image": null,
    "icon": "🔧",
    "featured": false
  }
];
