<?php
/* Funciones compartidas para armar la página de un artículo del blog.
   Vive aparte de articulo.php para poder reutilizarse y revisarse sin ruido. */

/* Convierte un enlace de video en la dirección incrustable, para que el video
   se reproduzca dentro de la página. Espejo de assets/media-embed.js.
   Acepta YouTube, Vimeo y TikTok. Solo ENLACES: un código de inserción pegado
   (<blockquote ...>) se rechaza, para que no se publique un video por error. */
function rcb_embed_url($url) {
  $u = trim((string)$url);
  if ($u === '') return null;
  if (!preg_match('~^(https?://)?([a-z0-9-]+\.)*(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com)/~i', $u)) return null;

  if (preg_match('~(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/|live/)|youtu\.be/)([\w-]{11})~', $u, $m)) {
    return 'https://www.youtube.com/embed/' . $m[1];
  }
  if (preg_match('~vimeo\.com/(?:[^/?#]+/)*(\d{6,})~', $u, $m)) {
    return 'https://player.vimeo.com/video/' . $m[1];
  }
  if (preg_match('~tiktok\.com/(?:@[^/?#]+/video|embed(?:/v2)?|player/v1|v)/(\d{10,})~', $u, $m)) {
    return 'https://www.tiktok.com/player/v1/' . $m[1];
  }
  return null;
}

function rcb_e($s) {
  return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

/* Los saltos de línea que escribe el administrador se respetan como párrafos. */
function rcb_parrafos($texto) {
  $partes = preg_split('/\n\s*\n/', trim((string)$texto));
  $out = '';
  foreach ($partes as $p) {
    $p = trim($p);
    if ($p === '') continue;
    $out .= '<p>' . nl2br(rcb_e($p)) . '</p>';
  }
  return $out;
}

/* Compatibilidad: artículos viejos guardaban el cuerpo como un texto con
   subtítulos marcados **así**. Se convierten a bloques para no perderlos. */
function rcb_bloques_legacy($content) {
  $texto = trim((string)$content);
  if ($texto === '') return [];
  $partes = preg_split('/\n(?=\*\*.+?\*\*)/', $texto);
  $out = [];
  foreach ($partes as $parte) {
    if (preg_match('/^\*\*(.+?)\*\*\n?([\s\S]*)$/', $parte, $m)) {
      $out[] = ['type' => 'text', 'title' => trim($m[1]), 'text' => trim($m[2])];
    } else {
      $out[] = ['type' => 'text', 'title' => '', 'text' => trim($parte)];
    }
  }
  return $out;
}

/* Devuelve los bloques del artículo, ya normalizados. */
function rcb_bloques($post) {
  $bloques = isset($post['contentBlocks']) && is_array($post['contentBlocks']) ? $post['contentBlocks'] : [];
  if (!$bloques) $bloques = rcb_bloques_legacy($post['content'] ?? '');
  return $bloques;
}

/* Dibuja un bloque del cuerpo del artículo. */
function rcb_bloque_html($b) {
  /* Sin "type" es un bloque antiguo de subtítulo + texto. */
  $tipo = $b['type'] ?? 'text';

  if ($tipo === 'image') {
    $url = trim((string)($b['url'] ?? ''));
    if ($url === '') return '';
    $pie = trim((string)($b['caption'] ?? ''));
    return '<figure class="art-figura">'
      . '<img src="' . rcb_e($url) . '" alt="' . rcb_e($pie) . '" loading="lazy" decoding="async">'
      . ($pie !== '' ? '<figcaption>' . rcb_e($pie) . '</figcaption>' : '')
      . '</figure>';
  }

  if ($tipo === 'video') {
    $embed = rcb_embed_url($b['url'] ?? '');
    if (!$embed) return '';
    return '<div class="art-video">'
      . '<iframe src="' . rcb_e($embed) . '" title="Video del artículo" loading="lazy"'
      . ' frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
      . ' allowfullscreen></iframe>'
      . '</div>';
  }

  if ($tipo === 'list') {
    $items = isset($b['items']) && is_array($b['items']) ? $b['items'] : [];
    $items = array_values(array_filter(array_map('trim', $items), function ($i) { return $i !== ''; }));
    if (!$items) return '';
    $etiqueta = (($b['style'] ?? 'bullet') === 'number') ? 'ol' : 'ul';
    $html = '<' . $etiqueta . ' class="art-lista">';
    foreach ($items as $i) $html .= '<li>' . rcb_e($i) . '</li>';
    return $html . '</' . $etiqueta . '>';
  }

  /* texto */
  $titulo = trim((string)($b['title'] ?? ''));
  $texto = trim((string)($b['text'] ?? ''));
  if ($titulo === '' && $texto === '') return '';
  return '<div class="art-bloque">'
    . ($titulo !== '' ? '<h2>' . rcb_e($titulo) . '</h2>' : '')
    . rcb_parrafos($texto)
    . '</div>';
}

/* Resumen corto y limpio para la vista previa al compartir el enlace. */
function rcb_descripcion($post) {
  $txt = trim((string)($post['excerpt'] ?? ''));
  if ($txt === '') {
    foreach (rcb_bloques($post) as $b) {
      if (($b['type'] ?? 'text') === 'text' && trim((string)($b['text'] ?? '')) !== '') {
        $txt = trim($b['text']);
        break;
      }
    }
  }
  $txt = trim(preg_replace('/\s+/', ' ', $txt));
  if (function_exists('mb_substr')) {
    return mb_strlen($txt, 'UTF-8') > 200 ? mb_substr($txt, 0, 197, 'UTF-8') . '...' : $txt;
  }
  return strlen($txt) > 200 ? substr($txt, 0, 197) . '...' : $txt;
}

/* Primera imagen utilizable del artículo (portada o la primera del cuerpo). */
function rcb_imagen_principal($post) {
  $img = trim((string)($post['image'] ?? ''));
  if ($img !== '') return $img;
  foreach (rcb_bloques($post) as $b) {
    if (($b['type'] ?? '') === 'image' && trim((string)($b['url'] ?? '')) !== '') return trim($b['url']);
  }
  return '';
}

/* "Más artículos": primero los de la misma categoría, luego el resto. */
function rcb_relacionados($posts, $actual, $cuantos = 3) {
  $mismos = [];
  $otros = [];
  foreach ($posts as $p) {
    if (($p['id'] ?? '') === ($actual['id'] ?? '')) continue;
    if (($p['category'] ?? '') === ($actual['category'] ?? '') && ($actual['category'] ?? '') !== '') {
      $mismos[] = $p;
    } else {
      $otros[] = $p;
    }
  }
  return array_slice(array_merge($mismos, $otros), 0, $cuantos);
}

function rcb_nombre_categoria($categorias, $id) {
  foreach ($categorias as $c) {
    if (($c['id'] ?? '') === $id) return $c['name'] ?? $id;
  }
  return '';
}

/* Lee un recurso guardado por el panel (products, posts, settings...). */
function rcb_recurso($pdo, $clave, $porDefecto) {
  try {
    $stmt = $pdo->prepare('SELECT data FROM rcb_kv WHERE resource_key = ?');
    $stmt->execute([$clave]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return $porDefecto;
    $d = json_decode($row['data'], true);
    return $d === null ? $porDefecto : $d;
  } catch (Exception $e) {
    return $porDefecto;
  }
}
