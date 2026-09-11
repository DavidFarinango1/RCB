/* Botón "Copiar enlace" del artículo. Copia la dirección al portapapeles y
   confirma al visitante que se copió.
   Se escucha en todo el documento en vez de en el botón concreto, porque en la
   versión de demostración el artículo se dibuja después de cargar esta página.

   El método moderno (navigator.clipboard) solo funciona en conexiones seguras;
   si no está disponible se recurre al método antiguo. Si ambos fallan se avisa
   por pantalla: nunca se abre una ventana emergente, que resulta molesta. */
(function () {
  let temporizador = null;

  function mostrar(texto, esError) {
    const aviso = document.getElementById("copiado-aviso");
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.classList.toggle("es-error", !!esError);
    aviso.hidden = false;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { aviso.hidden = true; }, 3000);
  }

  function copiarAntiguo(texto) {
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.left = "-9999px";
    document.body.appendChild(campo);
    campo.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(campo);
    return ok;
  }

  function alFallar() {
    mostrar("No se pudo copiar. Copia la dirección desde la barra del navegador.", true);
  }

  document.addEventListener("click", function (e) {
    const boton = e.target.closest && e.target.closest("#copiar-enlace");
    if (!boton) return;

    const url = boton.dataset.url || location.href;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(
        function () { mostrar("✓ Enlace copiado", false); },
        function () { if (copiarAntiguo(url)) mostrar("✓ Enlace copiado", false); else alFallar(); }
      );
      return;
    }
    if (copiarAntiguo(url)) mostrar("✓ Enlace copiado", false);
    else alFallar();
  });
})();
