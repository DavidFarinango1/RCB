<?php
/* Migración por lotes: convierte las imágenes base64 de la base de datos en
   archivos reales dentro de backend/uploads/. Procesa unas pocas imágenes por
   carga y guarda el avance, para no agotar el tiempo del servidor.
   Cómo usarlo: inicia sesión en el admin y abre esta página en el navegador.
   Recárgala (F5) las veces que pida, hasta que diga "LISTO".
   Al terminar, borra este archivo del servidor. */

session_start();
require_once __DIR__ . '/config.php';

@set_time_limit(120);
@ini_set('memory_limit', '512M');

header('Content-Type: text/plain; charset=utf-8');

if (empty($_SESSION['rcb_admin'])) {
  http_response_code(401);
  echo "No autorizado. Inicia sesión en el admin y vuelve a abrir esta página.\n";
  exit;
}
/* Libera el candado de la sesión para no bloquear el admin mientras migra. */
session_write_close();

$dir = __DIR__ . '/uploads';
if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
  http_response_code(500);
  echo "No se pudo crear backend/uploads/.\n";
  exit;
}

$LOTE = 3;          // imágenes por carga de página
$migradas = 0;
$fallidas = 0;
$pendientes = 0;    // base64 que quedaron para la próxima carga

function rcb_save_data_url($dataUrl, $dir, &$fallidas) {
  if (!preg_match('#^data:image/(jpeg|jpg|png|webp|gif);base64,#i', $dataUrl, $m)) {
    $fallidas++;
    return $dataUrl;
  }
  $bytes = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1));
  if ($bytes === false) { $fallidas++; return $dataUrl; }

  $mime = strtolower($m[1]);
  $keepPng = ($mime === 'png' || $mime === 'gif');
  $ext = $keepPng ? 'png' : 'jpg';
  $name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
  $dest = $dir . '/' . $name;

  $saved = false;
  if (function_exists('imagecreatefromstring')) {
    $src = @imagecreatefromstring($bytes);
    if ($src !== false) {
      $w = imagesx($src);
      $h = imagesy($src);
      $scale = min(1, 1200 / max($w, $h));
      $nw = max(1, (int) round($w * $scale));
      $nh = max(1, (int) round($h * $scale));
      $out = imagecreatetruecolor($nw, $nh);
      if ($keepPng) {
        imagealphablending($out, false);
        imagesavealpha($out, true);
        imagefill($out, 0, 0, imagecolorallocatealpha($out, 0, 0, 0, 127));
      } else {
        imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));
      }
      imagecopyresampled($out, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
      $saved = $keepPng ? imagepng($out, $dest, 8) : imagejpeg($out, $dest, 82);
      imagedestroy($out);
      imagedestroy($src);
    }
  }
  if (!$saved && file_put_contents($dest, $bytes) === false) {
    $fallidas++;
    return $dataUrl;
  }
  return 'backend/uploads/' . $name;
}

/* Reemplaza base64 hasta llenar el lote; cuenta el resto como pendiente. */
function rcb_walk(&$value, $dir, &$migradas, &$fallidas, &$pendientes, $LOTE) {
  if (is_array($value)) {
    foreach ($value as &$v) rcb_walk($v, $dir, $migradas, $fallidas, $pendientes, $LOTE);
    unset($v);
  } elseif (is_string($value) && strpos($value, 'data:image/') === 0) {
    if ($migradas >= $LOTE) { $pendientes++; return; }
    $nueva = rcb_save_data_url($value, $dir, $fallidas);
    if ($nueva !== $value) { $value = $nueva; $migradas++; }
  }
}

$pdo = rcb_db();
$rows = $pdo->query('SELECT resource_key, data FROM rcb_kv')->fetchAll(PDO::FETCH_ASSOC);
$upd = $pdo->prepare('UPDATE rcb_kv SET data = ? WHERE resource_key = ?');

foreach ($rows as $row) {
  $antes = $migradas;
  $data = json_decode($row['data'], true);
  if ($data === null) { echo "- {$row['resource_key']}: JSON inválido, se omite\n"; continue; }
  rcb_walk($data, $dir, $migradas, $fallidas, $pendientes, $LOTE);
  if ($migradas > $antes) {
    $upd->execute([json_encode($data), $row['resource_key']]);
    echo "- {$row['resource_key']}: " . ($migradas - $antes) . " imagen(es) migradas en esta carga\n";
  }
}

echo "\nEn esta carga -> Migradas: $migradas | Fallidas: $fallidas | Pendientes: $pendientes\n\n";
if ($pendientes > 0) {
  echo ">>> AÚN FALTAN $pendientes IMÁGENES. Recarga esta página (F5) para continuar. <<<\n";
} elseif ($fallidas > 0) {
  echo "Terminó, pero $fallidas imagen(es) no se pudieron convertir. Avísale a tu asistente.\n";
} else {
  echo "LISTO: no quedan imágenes base64. Revisa el sitio y borra este archivo del servidor.\n";
}
