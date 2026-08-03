/* Catálogo base de productos RCB.
   El panel administrador (admin.html) guarda cambios en localStorage bajo la
   clave "rcb_products" — ese valor tiene prioridad sobre esta lista por defecto. */
window.RCB_DEFAULT_PRODUCTS = [
  {
    id: "PV-110",
    name: "Protector de Voltaje 110V 15A",
    category: "voltaje",
    categoryLabel: "Protectores de voltaje",
    price: 18.99,
    stock: true,
    icon: "⚡",
    description: "Protege refrigeradoras y electrodomésticos de 110V contra bajo voltaje, sobrevoltaje, picos y cortes de energía.",
    specs: [
      "Corte por bajo voltaje: 90V (ajustable)",
      "Corte por sobrevoltaje: 138-140V",
      "Retardo de reconexión: 2-4 minutos",
      "Corriente máxima: 15A / 2200W",
      "Frecuencia: 50/60Hz"
    ]
  },
  {
    id: "PV-110D",
    name: "Protector de Voltaje Digital 110V",
    category: "voltaje",
    categoryLabel: "Protectores de voltaje",
    price: 24.5,
    stock: true,
    icon: "🔢",
    description: "Versión con pantalla digital que muestra el voltaje en tiempo real y permite ajustar manualmente los rangos mínimo y máximo de protección.",
    specs: [
      "Display digital de voltaje",
      "Rango ajustable de corte alto y bajo",
      "Corriente máxima: 15A",
      "Indicador LED de estado",
      "Frecuencia: 50/60Hz"
    ]
  },
  {
    id: "PV-220",
    name: "Protector de Voltaje 220V 20A",
    category: "voltaje",
    categoryLabel: "Protectores de voltaje",
    price: 29.9,
    stock: true,
    icon: "🔌",
    description: "Diseñado para equipos de 220V como aires acondicionados y refrigeración industrial. Protección contra picos, apagones y variaciones de voltaje.",
    specs: [
      "Voltaje nominal: 220V, 50/60Hz",
      "Corriente máxima: 20A / 3300W",
      "Retardo de reconexión: 3 minutos",
      "Protección alto/bajo voltaje ajustable",
      "Uso residencial e industrial"
    ]
  },
  {
    id: "PV-REF-PRO",
    name: "Protector de Voltaje Trabajo Pesado 20A",
    category: "voltaje",
    categoryLabel: "Protectores de voltaje",
    price: 34.0,
    stock: true,
    icon: "🛡️",
    description: "Protector de alta resistencia para refrigeración comercial y equipos de uso continuo, con protección contra supresión de picos hasta 270V/474J.",
    specs: [
      "Supresión de picos: 270V / 474J",
      "Corriente máxima: 20A",
      "Ciclo de espera: 3-50 min ± 20%",
      "Temperatura de operación: -5°C a 55°C",
      "Humedad máxima: 85% H.R."
    ]
  },
  {
    id: "CIN-PVC-18",
    name: "Cinta PVC Aislante 18mm x 20m",
    category: "cintas",
    categoryLabel: "Cintas aislantes",
    price: 1.75,
    stock: true,
    icon: "🌀",
    description: "Cinta aislante de PVC de uso profesional para instalaciones eléctricas, autoextinguible y resistente a la humedad.",
    specs: [
      "Ancho: 18mm · Largo: 20m",
      "Rigidez dieléctrica según norma UL 510",
      "Soporta hasta 600V",
      "Aplicación entre 0°C y 38°C",
      "Autoextinguible / retardante de fuego"
    ]
  },
  {
    id: "CIN-MOM-PEG",
    name: "Cinta Momia Pegable 48mm x 10m",
    category: "cintas",
    categoryLabel: "Cintas aislantes",
    price: 4.2,
    stock: true,
    icon: "🧵",
    description: "Cinta de caucho vulcanizante autoadhesiva, ideal para empalmes eléctricos e impermeabilización de conexiones.",
    specs: [
      "Ancho: 48mm · Largo: 10m",
      "Elongación de ruptura: hasta 300-1000%",
      "Resistente al calor hasta 80°C",
      "Forma masa homogénea sin calor ni presión",
      "Uso profesional en refrigeración y electricidad"
    ]
  },
  {
    id: "CIN-MOM-NOPEG",
    name: "Cinta Momia No Pegable 48mm x 10m",
    category: "cintas",
    categoryLabel: "Cintas aislantes",
    price: 4.5,
    stock: true,
    icon: "🧵",
    description: "Cinta de caucho autofundente que no deja residuo pegajoso, recomendada para sellado de tuberías de aire acondicionado.",
    specs: [
      "Ancho: 48mm · Largo: 10m",
      "Autofundente, no pegable al tacto",
      "Resistente a la intemperie y humedad",
      "Ideal para tuberías de climatización",
      "Uso profesional"
    ]
  },
  {
    id: "MOT-EVAP-110",
    name: "Motoventilador para Evaporador 110V",
    category: "refrigeracion",
    categoryLabel: "Repuestos para refrigeración",
    price: 12.8,
    stock: true,
    icon: "🌬️",
    description: "Motor tipo esqueleto para evaporador de refrigeradoras domésticas, alta durabilidad y bajo consumo.",
    specs: [
      "Voltaje: 110-127V, 60Hz",
      "Velocidad: 3000 RPM",
      "Flecha larga 40mm",
      "Uso: refrigeradoras y congeladores domésticos",
      "Rotación de eje según modelo"
    ]
  },
  {
    id: "MOT-COND-220",
    name: "Motor de Condensador 220V",
    category: "refrigeracion",
    categoryLabel: "Repuestos para refrigeración",
    price: 22.5,
    stock: true,
    icon: "❄️",
    description: "Motor para ventilador de condensador en refrigeración comercial, compatible con múltiples marcas de equipos.",
    specs: [
      "Rango de voltaje: 70-264V, 50/60Hz",
      "Velocidad: 300-1800 RPM (según modelo)",
      "Potencia: hasta 20.5W",
      "Uso: refrigeración comercial",
      "Bajo nivel de ruido"
    ]
  },
  {
    id: "CAP-ARR",
    name: "Capacitor de Arranque para Compresor",
    category: "refrigeracion",
    categoryLabel: "Repuestos para refrigeración",
    price: 6.9,
    stock: true,
    icon: "🔋",
    description: "Capacitor de arranque para compresores de refrigeración, disponible en distintas capacidades (µF).",
    specs: [
      "Uso: arranque de compresores monofásicos",
      "Voltaje de trabajo: 220-250V",
      "Disponible en varias capacidades µF",
      "Carcasa resistente a altas temperaturas",
      "Instalación estándar"
    ]
  },
  {
    id: "TUB-COB-38",
    name: "Tubo de Cobre Tipo L 3/8\"",
    category: "electricos",
    categoryLabel: "Materiales eléctricos",
    price: 8.4,
    stock: true,
    icon: "🧊",
    description: "Tubería de cobre tipo L para líneas de refrigerante en sistemas de aire acondicionado y refrigeración.",
    specs: [
      "Diámetro: 3/8 pulgada",
      "Tipo L (pared gruesa)",
      "Uso: líneas de refrigerante",
      "Compatible con soldadura de plata/cobre",
      "Presentación por rollo o tramo"
    ]
  },
  {
    id: "CAB-THHN-12",
    name: "Cable THHN 12 AWG",
    category: "electricos",
    categoryLabel: "Materiales eléctricos",
    price: 0.65,
    stock: true,
    icon: "🔩",
    description: "Cable eléctrico THHN calibre 12 AWG para instalaciones residenciales y comerciales.",
    specs: [
      "Calibre: 12 AWG",
      "Aislamiento termoplástico resistente al calor",
      "Uso: instalaciones eléctricas de baja tensión",
      "Precio referencial por metro",
      "Cumple estándares de conducción eléctrica"
    ]
  },
  {
    id: "BREAKER-1P",
    name: "Breaker Termomagnético 1 Polo",
    category: "electricos",
    categoryLabel: "Materiales eléctricos",
    price: 5.3,
    stock: true,
    icon: "🔧",
    description: "Interruptor termomagnético de un polo para protección de circuitos eléctricos residenciales.",
    specs: [
      "Amperajes disponibles: 15A, 20A, 30A",
      "Protección contra sobrecarga y cortocircuito",
      "Montaje en riel DIN",
      "Uso residencial y comercial",
      "Cumple normas de seguridad eléctrica"
    ]
  },
  {
    id: "MULTI-DIG",
    name: "Multímetro Digital",
    category: "herramientas",
    categoryLabel: "Herramientas y accesorios",
    price: 15.9,
    stock: true,
    icon: "📟",
    description: "Multímetro digital para medición de voltaje, corriente, resistencia y continuidad en instalaciones eléctricas.",
    specs: [
      "Mide voltaje AC/DC, corriente y resistencia",
      "Pantalla LCD retroiluminada",
      "Función de continuidad con alarma sonora",
      "Incluye puntas de prueba",
      "Uso profesional y doméstico"
    ]
  },
  {
    id: "PINZA-AMP",
    name: "Pinza Amperimétrica",
    category: "herramientas",
    categoryLabel: "Herramientas y accesorios",
    price: 21.0,
    stock: true,
    icon: "🧲",
    description: "Pinza amperimétrica para medición de corriente sin necesidad de interrumpir el circuito.",
    specs: [
      "Mide corriente AC hasta 400A",
      "Mide voltaje AC/DC y resistencia",
      "Mordaza de apertura amplia",
      "Pantalla digital de fácil lectura",
      "Ideal para técnicos electricistas"
    ]
  },
  {
    id: "KIT-DEST",
    name: "Kit de Destornilladores Aislados",
    category: "herramientas",
    categoryLabel: "Herramientas y accesorios",
    price: 11.5,
    stock: true,
    icon: "🛠️",
    description: "Set de destornilladores con mango aislado, recomendados para trabajos eléctricos seguros.",
    specs: [
      "Mangos aislados hasta 1000V",
      "Puntas plana y phillips en varias medidas",
      "Acero cromo-vanadio",
      "Estuche incluido",
      "Uso profesional en electricidad"
    ]
  }
];
