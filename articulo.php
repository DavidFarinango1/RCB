<?php
/* Página de un artículo del blog, armada por el servidor.
   Que el HTML salga ya listo desde aquí es lo que permite dos cosas que con
   JavaScript no se consiguen: que Google indexe el artículo y que al pegar el
   enlace en WhatsApp o Facebook se vea la miniatura con el título.

   Funciona igual en la raíz del sitio o dentro de una carpeta de pruebas:
   busca la configuración en las dos ubicaciones posibles. */

$cfg = __DIR__ . '/backend/config.php';
if (!file_exists($cfg)) $cfg = dirname(__DIR__) . '/backend/config.php';

$lib = __DIR__ . '/backend/blog-lib.php';
if (!file_exists($lib)) $lib = dirname(__DIR__) . '/backend/blog-lib.php';

require_once $cfg;
require_once $lib;

$id = isset($_GET['post']) ? trim($_GET['post']) : '';

$posts = [];
$categorias = [];
$ajustes = [];
$errorBase = false;
try {
  $pdo = rcb_db();
  $posts = rcb_recurso($pdo, 'posts', []);
  $categorias = rcb_recurso($pdo, 'blog_categories', []);
  $ajustes = rcb_recurso($pdo, 'settings', []);
} catch (Exception $e) {
  $errorBase = true;
}

/* Los blogs marcados como privados no se muestran ni se pueden abrir por
   enlace directo: para el público es como si no existieran. */
$posts = array_values(array_filter($posts, function ($p) {
  return ($p['status'] ?? 'publicado') !== 'privado';
}));

$post = null;
foreach ($posts as $p) {
  if (($p['id'] ?? '') === $id) { $post = $p; break; }
}

/* Artículo inexistente: se responde 404 de verdad, para no dejar enlaces
   rotos indexados en Google. */
if (!$post) {
  http_response_code(404);
  $tituloPagina = 'Artículo no encontrado | RCB';
  $descripcion = 'El artículo que buscas no existe o fue movido.';
  $imagenOg = '';
} else {
  $tituloPagina = ($post['title'] ?? 'Artículo') . ' | Blog RCB';
  $descripcion = rcb_descripcion($post);
  $imagenOg = rcb_imagen_principal($post);
}

/* Dirección absoluta: las vistas previas al compartir la necesitan completa. */
$esHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
  || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
$base = ($esHttps ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost');
$carpeta = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$urlActual = $base . $carpeta . '/articulo.php?post=' . rawurlencode($id);
$imagenAbs = $imagenOg === '' ? '' : (preg_match('~^https?://~', $imagenOg) ? $imagenOg : $base . $carpeta . '/' . ltrim($imagenOg, '/'));

$relacionados = $post ? rcb_relacionados($posts, $post, 3) : [];
$nombreCat = $post ? rcb_nombre_categoria($categorias, $post['category'] ?? '') : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= rcb_e($tituloPagina) ?></title>
<meta name="description" content="<?= rcb_e($descripcion) ?>">
<link rel="canonical" href="<?= rcb_e($urlActual) ?>">

<!-- Vista previa al compartir el enlace (WhatsApp, Facebook, X) -->
<meta property="og:type" content="article">
<meta property="og:title" content="<?= rcb_e($post['title'] ?? 'Artículo no encontrado') ?>">
<meta property="og:description" content="<?= rcb_e($descripcion) ?>">
<meta property="og:url" content="<?= rcb_e($urlActual) ?>">
<meta property="og:site_name" content="RCB - Repuestos Casa Blanca">
<?php if ($imagenAbs !== ''): ?>
<meta property="og:image" content="<?= rcb_e($imagenAbs) ?>">
<meta name="twitter:card" content="summary_large_image">
<?php else: ?>
<meta name="twitter:card" content="summary">
<?php endif; ?>
<meta name="twitter:title" content="<?= rcb_e($post['title'] ?? 'Artículo no encontrado') ?>">
<meta name="twitter:description" content="<?= rcb_e($descripcion) ?>">

<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/styles.css?v=78">
</head>
<body>

<header>
  <div class="topbar">
    <div class="container">
      <a href="index.html" class="logo"><img src="imagen/logo.png" alt="RCB - Repuestos Casa Blanca"></a>
      <div class="search-box">
        <select class="search-cat-select" id="header-search-category" aria-label="Categoría"></select>
        <input type="text" placeholder="Buscar productos, categorías...">
        <button aria-label="Buscar"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar</button>
      </div>
      <button class="mobile-toggle" aria-label="Abrir menú">☰</button>
    </div>
  </div>

  <nav class="navbar">
    <div class="container">
      <ul class="nav-links">
        <li><a href="index.html">INICIO</a></li>
        <li><a href="nosotros.html">NOSOTROS</a></li>
        <li><a href="productos.html">PRODUCTOS</a></li>
        <li><a href="blog.html" class="active">BLOG</a></li>
        <li><a href="videos.html">VIDEOS</a></li>
        <li><a href="contacto.html">CONTACTO</a></li>
      </ul>
      <a href="contacto.html#cotizar" class="btn btn-primary">SOLICITAR COTIZACIÓN</a>
    </div>
  </nav>
</header>

<main>
<?php if (!$post): ?>

  <div class="container">
    <div class="art-vacio">
      <h1>Artículo no encontrado</h1>
      <p><?= $errorBase
        ? 'No pudimos conectar con el servidor en este momento. Inténtalo de nuevo en unos minutos.'
        : 'El artículo que buscas no existe o fue movido.' ?></p>
      <a href="blog.html" class="btn btn-primary">Volver al blog</a>
    </div>
  </div>

<?php else: ?>

  <article class="art-wrap">
    <div class="container art-container">

      <div class="breadcrumb art-breadcrumb">
        <a href="index.html">Inicio</a> &nbsp;›&nbsp; <a href="blog.html">Blog</a>
        <?php if ($nombreCat !== ''): ?>&nbsp;›&nbsp; <?= rcb_e($nombreCat) ?><?php endif; ?>
      </div>

      <header class="art-cabecera">
        <?php if ($nombreCat !== ''): ?>
          <span class="art-categoria"><?= rcb_e($nombreCat) ?></span>
        <?php endif; ?>
        <h1><?= rcb_e($post['title'] ?? '') ?></h1>
        <div class="art-meta">
          <?php if (!empty($post['date'])): ?><span>📅 <?= rcb_e($post['date']) ?></span><?php endif; ?>
          <?php if (!empty($post['readTime'])): ?><span>⏱ <?= rcb_e($post['readTime']) ?></span><?php endif; ?>
        </div>
        <?php if (!empty($post['excerpt'])): ?>
          <p class="art-entradilla"><?= rcb_e($post['excerpt']) ?></p>
        <?php endif; ?>
      </header>

      <?php
      /* Portada: el video del artículo manda sobre la imagen, porque es el
         contenido que el visitante espera ver primero. */
      $embedPortada = rcb_embed_url($post['videoUrl'] ?? '');
      if ($embedPortada): ?>
        <div class="art-video art-portada">
          <iframe src="<?= rcb_e($embedPortada) ?>" title="<?= rcb_e($post['title'] ?? '') ?>"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      <?php elseif (!empty($post['image'])): ?>
        <div class="art-portada">
          <img src="<?= rcb_e($post['image']) ?>" alt="<?= rcb_e($post['title'] ?? '') ?>">
        </div>
      <?php endif; ?>

      <div class="art-cuerpo">
        <?php
        $htmlCuerpo = '';
        foreach (rcb_bloques($post) as $b) $htmlCuerpo .= rcb_bloque_html($b);
        echo $htmlCuerpo !== '' ? $htmlCuerpo : '<p class="art-sin-cuerpo">Este artículo todavía no tiene contenido.</p>';
        ?>
      </div>

      <div class="art-compartir">
        <span>Compartir:</span>
        <a href="https://api.whatsapp.com/send?text=<?= rawurlencode(($post['title'] ?? '') . ' ' . $urlActual) ?>"
           target="_blank" rel="noopener" class="art-compartir-btn art-wa">
          <img src="assets/whatsapp.svg" alt="" width="16" height="16"> WhatsApp
        </a>
        <button type="button" class="art-compartir-btn art-copiar" id="copiar-enlace"
                data-url="<?= rcb_e($urlActual) ?>">🔗 Copiar enlace</button>
        <span class="art-copiado" id="copiado-aviso" hidden>✓ Enlace copiado</span>
      </div>

    </div>
  </article>

  <?php if ($relacionados): ?>
  <section class="art-mas">
    <div class="container">
      <h2>Más artículos</h2>
      <div class="art-mas-grid">
        <?php foreach ($relacionados as $r):
          $rImg = rcb_imagen_principal($r);
          $rCat = rcb_nombre_categoria($categorias, $r['category'] ?? '');
        ?>
          <a class="art-mas-card" href="articulo.php?post=<?= rawurlencode($r['id'] ?? '') ?>">
            <div class="art-mas-thumb">
              <?php if ($rImg !== ''): ?>
                <img src="<?= rcb_e($rImg) ?>" alt="<?= rcb_e($r['title'] ?? '') ?>" loading="lazy" decoding="async">
              <?php else: ?>
                <span class="art-mas-icono"><?= rcb_e($r['icon'] ?? '📰') ?></span>
              <?php endif; ?>
            </div>
            <div class="art-mas-body">
              <?php if ($rCat !== ''): ?><span class="cat"><?= rcb_e($rCat) ?></span><?php endif; ?>
              <h3><?= rcb_e($r['title'] ?? '') ?></h3>
              <?php if (!empty($r['excerpt'])): ?><p><?= rcb_e($r['excerpt']) ?></p><?php endif; ?>
              <span class="art-mas-leer">Leer artículo →</span>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
      <div class="art-mas-todos">
        <a href="blog.html" class="btn btn-tertiary">Ver todos los artículos</a>
      </div>
    </div>
  </section>
  <?php endif; ?>

<?php endif; ?>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="imagen/logo-nuevo.png" alt="RCB" class="footer-brand-logo">
        <p><strong>Repuestos Casa Blanca</strong></p>
        <p>Productos de calidad para instalaciones seguras, eficientes y duraderas.</p>
        <div class="social-row">
          <a href="https://www.facebook.com/profile.php?id=61592644390643" target="_blank" rel="noopener" aria-label="Facebook">📘</a>
          <a href="https://www.instagram.com/rcb_casablanca?igsh=MW91MGpnN2Y0YjdwMQ==" target="_blank" rel="noopener" aria-label="Instagram">📷</a>
          <a href="https://youtube.com/@rcb-repuestoscasablanca?si=JuM60FZVtYOU7pC4" target="_blank" rel="noopener" aria-label="YouTube">▶</a>
          <a href="https://www.tiktok.com/@rcb_casablanca" target="_blank" rel="noopener" aria-label="TikTok">🎵</a>
        </div>
      </div>
      <div>
        <h4>Enlaces rápidos</h4>
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="index.html#productos">Productos</a></li>
          <li><a href="blog.html">Blog</a></li>
          <li><a href="videos.html">Videos</a></li>
          <li><a href="contacto.html">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h4>Categorías</h4>
        <ul>
          <li><a href="#">Protectores de voltaje</a></li>
          <li><a href="#">Cintas aislantes</a></li>
          <li><a href="#">Repuestos para refrigeración</a></li>
          <li><a href="#">Materiales eléctricos</a></li>
          <li><a href="#">Herramientas y accesorios</a></li>
        </ul>
      </div>
      <div>
        <h4>Atención al cliente</h4>
        <ul>
          <li id="footer-whatsapp">💬 WhatsApp: <?= rcb_e($ajustes['whatsapp'] ?? '099 342 1505') ?></li>
          <li id="footer-email">✉️ <?= rcb_e($ajustes['email'] ?? 'ventas@rcb.com.ec') ?></li>
          <li id="footer-hours-weekday">🕐 <?= rcb_e($ajustes['hoursWeekday'] ?? 'Lunes a Viernes: 8:30 - 18:00') ?></li>
          <li id="footer-hours-saturday">🕐 <?= rcb_e($ajustes['hoursSaturday'] ?? 'Sábados: 9:00 - 13:00') ?></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 RCB (Repuestos Casa Blanca). Todos los derechos reservados.</span>
      <span><a href="#">Política de privacidad</a> · <a href="#">Términos y condiciones</a></span>
    </div>
  </div>
</footer>

<div class="social-float-stack">
  <a href="https://wa.me/593993421505" class="whatsapp-float" aria-label="Hablar por WhatsApp"><img src="assets/whatsapp.svg" alt="WhatsApp"></a>
</div>

<script src="assets/api-client.js?v=78"></script>
<script src="assets/public-data.js?v=78"></script>
<script src="assets/categories.js?v=78"></script>
<script src="assets/social-icons.js?v=78"></script>
<script src="assets/script.js?v=78"></script>
<script src="assets/copiar-enlace.js?v=78"></script>
</body>
</html>
