/* Catálogo base de productos RCB.
   El panel administrador (admin.html) guarda cambios en localStorage bajo la
   clave "rcb_products" — ese valor tiene prioridad sobre esta lista por defecto. */
window.RCB_DEFAULT_PRODUCTS = [
  {
    "id": "DF-001",
    "name": "Deflector de flama",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260902-150739-3cfbb92b.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Un deflector de flama es un accesorio o estructura metálica diseñada para redirigir, concentrar o proteger el calor y la dirección de una llama.",
    "specs": []
  },
  {
    "id": "EXP-001",
    "name": "Expansor de tuberías de cobre para taladro",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260902-144612-42feb833.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Un expansor para tubería de cobre de tipo broca para taladro es un accesorio de vástago hexagonal que ensancha el extremo de un tubo mediante calor por fricción.",
    "specs": []
  },
  {
    "id": "LTU-001",
    "name": "Llave de torque Universal",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260830-215649-fccd3776.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Llave de Torque Digital Universal RCB 🔧\n\nHerramienta profesional y versátil, ideal para trabajos de mantenimiento y reparación. Cuenta con ajuste de torque de 3 a 100 N·m, pantalla digital y diseño ergonómico para facilitar su uso. Es universal, compatible con diferentes aplicaciones y viene con un estuche plástico para almacenamiento y transporte, manteniéndola protegida y organizada.",
    "specs": []
  },
  {
    "id": "BP-001",
    "name": "Bota de purga de Nitrógeno",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260827-221631-e62cabbb.png",
    "imageFit": {
      "scale": 1.2,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Bota de purga de nitrógeno RCB, diseñada para un sellado hermético y manos libres en tuberías de climatización y refrigeración. Su cuerpo escalonado de alta resistencia se adapta a múltiples diámetros de tubo, optimizando el uso de gas y previniendo la oxidación interna durante la soldadura. Eficiencia, rapidez y calidad profesional en cada instalación de HVAC.",
    "specs": []
  },
  {
    "id": "VC-001",
    "name": "Vacuómetro digital Wipcool",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260827-221311-5b7ae86f.png",
    "imageFit": {
      "scale": 1.2,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Vacuómetro digital para medir micrones. Marca Wipcool",
    "specs": []
  },
  {
    "id": "DE-001",
    "name": "Desbarbador para tuberías de cobre",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260826-131650-2af3d5c0.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Escariador y desbarbador para tubería de cobre, ideal para eliminar rebabas y preparar los extremos antes de instalar o usar mangueras y realizar el doblado de la tubería. Herramienta práctica para trabajos de aire acondicionado y refrigeración.",
    "specs": []
  },
  {
    "id": "CM-001",
    "name": "Cinta momia PEGABLE",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260811-155120-fe6f399e.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "La cinta momia pegable de la marca RCB es un material vinílico flexible (generalmente de PVC) diseñado específicamente para el área de climatización y refrigeración.A diferencia de la cinta momia tradicional que se sostiene únicamente por tensión mecánica al enrollarse, esta versión cuenta con una capa adhesiva (pegable) que facilita un sellado más firme, hermético y permanente durante la instalación.",
    "specs": []
  },
  {
    "id": "MD-001",
    "name": "Manguera dobla tubería de cobre 1/4+3/8+1/2+5/8",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260811-155516-55d012a8.png",
    "imageFit": {
      "scale": 1.4,
      "x": -0.5089058524173028,
      "y": -2.0356234096692107
    },
    "stock": true,
    "description": "",
    "specs": []
  },
  {
    "id": "PV-110",
    "name": "Protector de Voltaje 110V 15A",
    "category": "repuestos-de-refrigeradores-y-congeladores",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260811-155528-fc295799.png",
    "imageFit": {
      "scale": 1,
      "x": -2.220446049250313e-15,
      "y": -0.6785411365564037
    },
    "stock": true,
    "description": "Protege refrigeradoras y electrodomésticos de 110V contra bajo voltaje, sobrevoltaje, picos y cortes de energía.",
    "specs": [
      "Corte por bajo voltaje: 90V (ajustable)",
      "Corte por sobrevoltaje: 138-140V",
      "Retardo de reconexión: 2-4 minutos",
      "Corriente máxima: 15A / 2200W",
      "Frecuencia: 50/60Hz"
    ]
  },
  {
    "id": "BSW-001",
    "name": "Banda de secadora Whirlpool",
    "category": "repuestos-de-secadora",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260827-180019-78fbe613.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "La banda para secadora Whirlpool 341241 es una pieza de transmisión diseñada para hacer girar el tambor durante el ciclo de secado. Cuenta con 92 1/4\" de largo, 1/4\" de ancho, 4 nervaduras y 3 ranuras, y es compatible con determinados modelos Whirlpool y otras marcas de la misma plataforma. Se recomienda verificar el modelo de la secadora antes de comprar.",
    "specs": [
      "Whirlpool"
    ]
  },
  {
    "id": "PL-9V",
    "name": "Pila de 9V Zinc-Carbono",
    "category": "repuestos-de-electronica",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260827-175354-34c4568e.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Batería 9V",
    "specs": [
      "Zinc Carbono"
    ]
  },
  {
    "id": "BV-005",
    "name": "Bomba de vacío 5 CFM",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260827-170131-048ded54.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Bomba de vacío 5 CFM\nUna etapa",
    "specs": []
  },
  {
    "id": "CN-010",
    "name": "Kit de canaletas para tuberías de aires acondicionados",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260827-164952-3e8867a2.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Las canaletas para aire acondicionado RCB permiten proteger y organizar tuberías y cables, brindando una instalación más limpia, segura y con un acabado profesional. Ideales para técnicos e instalaciones residenciales o comerciales.",
    "specs": [
      "Kit de 13 pcs"
    ]
  },
  {
    "id": "PV-002",
    "name": "PROTECTOR DE VOLTAJE 220V",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "oferta",
    "image": "backend/uploads/20260811-155132-30d56eb1.png",
    "imageFit": {
      "scale": 1.2,
      "x": -1.2722646310432568,
      "y": 1.696352841391009
    },
    "stock": true,
    "description": "es un dispositivo que cuida tus aparatos eléctricos de cambios bruscos de luz. Corta la corriente cuando el voltaje sube o baja mucho y la reconecta sola cuando la energía vuelve a estar segura.",
    "specs": [
      "Voltaje: 220V",
      "Amperaje: 20AMP"
    ]
  },
  {
    "id": "CR-001",
    "name": "Cinta Rubatex RCB",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260817-185636-39696e0d.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": -4.4105173876166255
    },
    "stock": true,
    "description": "La cinta Rubatex es una tira de espuma elastomérica autoadhesiva diseñada para el aislamiento térmico y el sellado.\nCaracterísticas principales\n\nMaterial: Espuma de celda cerrada flexible.\nControl térmico: Evita la ganancia o pérdida de calor.\nPrevención: Impide la condensación en tuberías frías.\nInstalación: Cuenta con una cara autoadhesiva fuerte.\nAplicación: Ideal para juntas de sistemas HVAC y refrigeración.",
    "specs": []
  },
  {
    "id": "BEU-001",
    "name": "Base para Evaporadora universal",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260811-155127-19c13b11.png",
    "imageFit": {
      "scale": 1.4,
      "x": -9.414758269720101,
      "y": -4.071246819338422
    },
    "stock": true,
    "description": "Este es un soporte de montaje universal para unidades interiores de aire acondicionado tipo split.\nEl soporte está fabricado en metal y cuenta con un diseño ajustable para adaptarse a diferentes tamaños de equipos.\nEste modelo incluye una pequeña burbuja de nivel incorporada para facilitar la instalación en la pared.",
    "specs": [
      "Con nivel incluído."
    ]
  },
  {
    "id": "CM-002",
    "name": "Cinta momia NO PEGABLE",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260811-155115-08d96b82.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "La cinta momia no pegable (o sin adhesivo) de RCB es el estándar más utilizado por los técnicos en refrigeración y aire acondicionado para agrupar y proteger las líneas de instalación.\nA diferencia de la versión adhesiva, esta cinta se aplica mediante tensión mecánica, estirándola firmemente mientras se enrolla sobre sí misma para que quede sujeta por fricción y presión.",
    "specs": []
  },
  {
    "id": "CAU-001",
    "name": "Control de aire acondicionado Universal K-1038E",
    "category": "repuestos-de-aire-acondicionado",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260820-194519-e4bc475d.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "1000 Códigos",
    "specs": []
  },
  {
    "id": "VCF-001",
    "name": "Válvula de control de flujo R22 (AZUL)",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260811-155139-03792c86.png",
    "imageFit": {
      "scale": 1.7999999999999998,
      "x": 0.7633587786259532,
      "y": -3.7319762510602246
    },
    "stock": true,
    "description": "Válvula de control de flujo R22 azul",
    "specs": [
      "Entrada: R22 (1/4)",
      "Salida: R22 (1/4)"
    ]
  },
  {
    "id": "VCF-002",
    "name": "Válvula de control de flujo R410A (ROJA)",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "oferta",
    "image": "backend/uploads/20260811-155512-03a8d9ee.png",
    "imageFit": {
      "scale": 1.7999999999999998,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Válvula de control de flujo ROJA",
    "specs": [
      "Entrada: R22 (1/4)",
      "Salida: R410A (5/16)"
    ]
  },
  {
    "id": "LC-001",
    "name": "Linterna de cabeza RCB",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260811-155519-7c533b0c.png",
    "imageFit": {
      "scale": 1,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "",
    "specs": [
      "Recargable"
    ]
  },
  {
    "id": "CB-001",
    "name": "CB-001",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260812-203617-c392b3ad.jpg",
    "imageFit": {
      "scale": 1.4,
      "x": 0,
      "y": 0
    },
    "stock": true,
    "description": "Cauchos o empaques para las bases de la condensadora, aires acondicionados.",
    "specs": [
      "Viene incluído todo lo de la imagen."
    ]
  },
  {
    "id": "FH-001",
    "name": "Filtro de hidrolavadora Karcher",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "nuevo",
    "image": "backend/uploads/20260811-155135-0b593563.png",
    "imageFit": {
      "scale": 1,
      "x": -0.25445292620865123,
      "y": -4.071246819338422
    },
    "stock": true,
    "description": "Filtro atrapapelusas, cabellos o impurezas del agua.",
    "specs": [
      "Enroscable"
    ]
  },
  {
    "id": "AH-001",
    "name": "Acople de hidrolavadora karcher tipo universal",
    "category": "herramientas",
    "price": 0,
    "oldPrice": null,
    "label": "",
    "image": "backend/uploads/20260811-155524-86621b8d.png",
    "imageFit": {
      "scale": 1.4,
      "x": 0.2544529262086514,
      "y": 7.124681933842239
    },
    "stock": true,
    "description": "Esta es una boquilla giratoria de 360 grados compatible con hidrolavadoras Kärcher de las series K2 a K7.\nEl accesorio utiliza un modo de pulverización giratorio para eliminar suciedad difícil con mayor eficiencia.",
    "specs": [
      "Tiene dos entradas"
    ]
  }
];
