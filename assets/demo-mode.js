/* MODO DEMOSTRACIÓN
   Firebase no ejecuta PHP, así que ahí no existe backend/api.php: ni el panel
   podría iniciar sesión ni se podrían guardar cambios.
   Este archivo detecta que el sitio se está viendo en el dominio de Firebase y,
   solo en ese caso, reemplaza la conexión al servidor por el almacenamiento del
   propio navegador. Así el cliente puede recorrer y probar todo el panel.

   IMPORTANTE: en el dominio real (repuestoscasablanca.com) esto no se activa
   nunca, porque la condición es el nombre del dominio. El sitio en producción
   sigue hablando con la base de datos de siempre. */
(function () {
  const host = location.hostname;
  const esDemo = /\.web\.app$/.test(host) || /\.firebaseapp\.com$/.test(host);
  window.RCB_DEMO = esDemo;
  if (!esDemo) return;

  const CLAVE = "rcb_demo_";
  const USUARIO = "admin";
  const CLAVE_ACCESO = "rcb2026";

  function leer(recurso) {
    try {
      const v = localStorage.getItem(CLAVE + recurso);
      return v === null ? undefined : JSON.parse(v);
    } catch (e) {
      return undefined;
    }
  }
  function escribir(recurso, datos) {
    try {
      localStorage.setItem(CLAVE + recurso, JSON.stringify(datos));
      return true;
    } catch (e) {
      alert("No se pudo guardar en la demostración: el navegador se quedó sin espacio.");
      return false;
    }
  }

  const LISTAS = ["products", "categories", "blog_categories", "posts", "video_categories", "videos"];

  /* Con un servidor real la respuesta tarda, y para cuando llega ya se han
     cargado los archivos de contenido por defecto (posts.js, products.js...).
     Aquí la respuesta sería inmediata y esos archivos se cargarían DESPUÉS,
     pisando lo que el cliente acabara de guardar. Por eso se espera a que la
     página termine de cargar sus scripts. */
  const paginaLista = new Promise(function (res) {
    if (document.readyState !== "loading") res();
    else document.addEventListener("DOMContentLoaded", res, { once: true });
  });

  /* Los artículos reales todavía no tienen cuerpo escrito, así que en la
     demostración se rellena uno con contenido de ejemplo: es la única forma de
     que se vea la estructura completa (subtítulos, imagen, lista y video).
     Esto vive solo aquí; el sitio real no lo ve nunca. */
  function conEjemplo(posts) {
    const copia = JSON.parse(JSON.stringify(posts || []));
    const p = copia.find(function (x) { return x.featured; }) || copia[0];
    if (!p) return copia;
    if (p.contentBlocks && p.contentBlocks.length) return copia;

    p.videoUrl = p.videoUrl || "https://www.youtube.com/watch?v=7TJUtW3xsJI";
    p.image = p.image || "imagen/imagen2.png";
    p.contentBlocks = [
      {
        type: "text",
        title: "Un ejemplo de subtítulo",
        text: "Este es un párrafo de ejemplo para mostrar cómo se lee el artículo. El subtítulo de arriba sale en negrita y más grande, separando cada parte del texto.\n\nDejando una línea en blanco se crea un párrafo nuevo, como este."
      },
      { type: "image", url: "imagen/imagen7.png", caption: "Las imágenes se pueden intercalar entre los párrafos, con su pie de foto." },
      {
        type: "list",
        style: "number",
        items: [
          "Las listas sirven para explicar pasos ordenados.",
          "Se pueden poner numeradas, como esta.",
          "O con viñetas, si el orden no importa."
        ]
      },
      {
        type: "text",
        title: "Los videos se ven aquí mismo",
        text: "Basta pegar el enlace de YouTube o de Vimeo desde el panel y el video queda incrustado en el punto exacto del artículo, sin sacar al visitante de la página."
      },
      { type: "video", url: "https://vimeo.com/76979871" }
    ];
    return copia;
  }

  window.RCB_API = {
    get: function (recurso) {
      return paginaLista.then(function () {
        const guardado = leer(recurso);
        if (guardado !== undefined) return guardado;
        if (recurso === "posts") {
          const conCuerpo = conEjemplo(window.RCB_DEFAULT_POSTS);
          if (conCuerpo.length) return conCuerpo;
        }
        /* Sin nada guardado se devuelve vacío, y cada página usa su contenido
           de respaldo, que es el mismo que hay hoy en el sitio real. */
        return LISTAS.indexOf(recurso) !== -1 ? [] : {};
      });
    },
    save: function (recurso, datos) {
      if (!escribir(recurso, datos)) return Promise.reject(new Error("Sin espacio"));
      return Promise.resolve({ ok: true });
    },
    login: function (usuario, clave) {
      if (usuario === USUARIO && clave === CLAVE_ACCESO) return Promise.resolve({ ok: true });
      return Promise.reject(new Error("Usuario o contraseña incorrectos."));
    },
    logout: function () { return Promise.resolve(); },
    /* Sin servidor no hay dónde subir la imagen: se queda incrustada en el
       navegador. Suficiente para ver cómo funciona. */
    uploadImage: function (archivo) {
      return new Promise(function (res, rej) {
        if (archivo.size > 2 * 1024 * 1024) {
          rej(new Error("En la demostración las imágenes deben pesar menos de 2 MB."));
          return;
        }
        const lector = new FileReader();
        lector.onload = function () { res(lector.result); };
        lector.onerror = function () { rej(new Error("No se pudo leer la imagen.")); };
        lector.readAsDataURL(archivo);
      });
    }
  };

  /* Aviso visible, para que nadie confunda la demostración con el sitio real. */
  document.addEventListener("DOMContentLoaded", function () {
    const aviso = document.createElement("div");
    aviso.className = "demo-aviso";
    aviso.innerHTML =
      '<strong>Versión de demostración</strong> — sirve para revisar la estructura y probar el panel. ' +
      'Los cambios se guardan solo en este navegador y no afectan al sitio real. ' +
      '<button type="button" class="demo-aviso-reset">Reiniciar demostración</button>';
    document.body.appendChild(aviso);
    document.body.classList.add("con-demo-aviso");

    aviso.querySelector(".demo-aviso-reset").addEventListener("click", function () {
      if (!confirm("¿Borrar todo lo que se ha probado y volver al contenido original?")) return;
      Object.keys(localStorage)
        .filter(function (k) { return k.indexOf(CLAVE) === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
      location.reload();
    });
  });
})();
