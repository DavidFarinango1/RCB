<?php
/* Sube una imagen del admin y la guarda como archivo real en backend/uploads/,
   redimensionada y comprimida (máx. 1200px, JPEG ~82% o PNG). Devuelve la URL
   relativa para guardarla en la base de datos en vez del base64 gigante. */

session_start();

header('Content-Type: application/json; charset=utf-8');

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}

if (empty($_SESSION['rcb_admin'])) {
  respond(['error' => 'No autorizado. Inicia sesión de nuevo.'], 401);
}
/* Libera el candado de la sesión para no bloquear otras peticiones del admin. */
session_write_close();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['image'])) {
  respond(['error' => 'Falta el archivo "image".'], 400);
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
  respond(['error' => 'Error al subir el archivo (código ' . $file['error'] . ').'], 400);
}
$MAX_BYTES = 8 * 1024 * 1024;
if ($file['size'] > $MAX_BYTES) {
  respond(['error' => 'La imagen supera 8 MB. Elige una más liviana.'], 400);
}

$info = @getimagesize($file['tmp_name']);
if ($info === false) {
  respond(['error' => 'El archivo no es una imagen válida.'], 400);
}
$mime = $info['mime'];
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mime, $allowed, true)) {
  respond(['error' => 'Formato no permitido. Usa JPG, PNG, WebP o GIF.'], 400);
}

$dir = __DIR__ . '/uploads';
if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
  respond(['error' => 'No se pudo crear la carpeta de subidas.'], 500);
}

/* PNG conserva transparencia; todo lo demás se guarda como JPEG comprimido. */
$keepPng = ($mime === 'image/png' || $mime === 'image/gif');
$ext = $keepPng ? 'png' : 'jpg';
$name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = $dir . '/' . $name;

$MAX_DIM = 1200;
$saved = false;

if (function_exists('imagecreatefromstring')) {
  $src = @imagecreatefromstring(file_get_contents($file['tmp_name']));
  if ($src !== false) {
    $w = imagesx($src);
    $h = imagesy($src);
    $scale = min(1, $MAX_DIM / max($w, $h));
    $nw = max(1, (int) round($w * $scale));
    $nh = max(1, (int) round($h * $scale));

    $out = imagecreatetruecolor($nw, $nh);
    if ($keepPng) {
      imagealphablending($out, false);
      imagesavealpha($out, true);
      $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
      imagefill($out, 0, 0, $transparent);
    } else {
      $white = imagecolorallocate($out, 255, 255, 255);
      imagefill($out, 0, 0, $white);
    }
    imagecopyresampled($out, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

    $saved = $keepPng ? imagepng($out, $dest, 8) : imagejpeg($out, $dest, 82);
    imagedestroy($out);
    imagedestroy($src);
  }
}

/* Si el servidor no tiene GD, guarda el archivo tal cual llegó. */
if (!$saved) {
  if (!move_uploaded_file($file['tmp_name'], $dest)) {
    respond(['error' => 'No se pudo guardar la imagen en el servidor.'], 500);
  }
}

respond(['ok' => true, 'url' => 'backend/uploads/' . $name]);
