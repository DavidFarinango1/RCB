<?php
/* API de RCB: guarda y lee todo el contenido del sitio (productos, categorías,
   blog, videos, "Nosotros", "Atención al cliente") en una base de datos MySQL
   real, en vez de localStorage. Mismo dominio que el sitio -> no hace falta CORS. */

session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$ARRAY_RESOURCES = ['products', 'categories', 'blog_categories', 'posts', 'video_categories', 'videos'];
$OBJECT_RESOURCES = ['about', 'settings', 'sections'];
$ALL_RESOURCES = array_merge($ARRAY_RESOURCES, $OBJECT_RESOURCES);

function json_input() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return $data;
}
function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}
function is_logged_in() {
  return !empty($_SESSION['rcb_admin']);
}

$resource = isset($_GET['resource']) ? $_GET['resource'] : '';
$method = $_SERVER['REQUEST_METHOD'];

try {
  $pdo = rcb_db();
} catch (Exception $e) {
  respond(['error' => 'No se pudo conectar a la base de datos. Revisa backend/config.php'], 500);
}

/* ---------- Login / sesión ---------- */
if ($resource === 'login' && $method === 'POST') {
  $body = json_input();
  $username = isset($body['username']) ? trim($body['username']) : '';
  $password = isset($body['password']) ? $body['password'] : '';

  $stmt = $pdo->prepare('SELECT password_hash FROM rcb_admins WHERE username = ?');
  $stmt->execute([$username]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($row && password_verify($password, $row['password_hash'])) {
    $_SESSION['rcb_admin'] = true;
    respond(['ok' => true]);
  }
  respond(['ok' => false, 'error' => 'Usuario o contraseña incorrectos.'], 401);
}

if ($resource === 'logout' && $method === 'POST') {
  $_SESSION = [];
  session_destroy();
  respond(['ok' => true]);
}

if ($resource === 'session' && $method === 'GET') {
  respond(['loggedIn' => is_logged_in()]);
}

/* ---------- Datos (productos, categorías, blog, videos, about, settings) ---------- */
if (!in_array($resource, $ALL_RESOURCES, true)) {
  respond(['error' => 'Recurso desconocido: ' . $resource], 404);
}

if ($method === 'GET') {
  /* Las lecturas no necesitan la sesión: se libera de inmediato para no
     bloquear otras peticiones (el candado de sesión atiende de una en una). */
  session_write_close();
  $stmt = $pdo->prepare('SELECT data FROM rcb_kv WHERE resource_key = ?');
  $stmt->execute([$resource]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    respond(in_array($resource, $ARRAY_RESOURCES, true) ? [] : new stdClass());
  }
  http_response_code(200);
  echo $row['data'];
  exit;
}

if ($method === 'POST') {
  if (!is_logged_in()) {
    respond(['error' => 'No autorizado. Inicia sesión de nuevo.'], 401);
  }
  session_write_close();
  $body = json_input();
  if ($body === null) {
    respond(['error' => 'JSON inválido.'], 400);
  }
  $json = json_encode($body);
  /* Candado: las imágenes deben subirse como archivos (backend/upload.php),
     nunca incrustadas en base64 — eso engordaba la base de datos y hacía
     lentísima la carga del sitio. Si un navegador con el panel viejo en caché
     lo intenta, se rechaza con un mensaje claro en vez de aceptarlo. */
  if (strpos($json, 'data:image/') !== false) {
    respond(['error' => 'Este guardado contiene una imagen incrustada (base64). Recarga el panel con Ctrl+Shift+R para usar la versión actual y vuelve a intentarlo.'], 422);
  }
  $stmt = $pdo->prepare(
    'INSERT INTO rcb_kv (resource_key, data) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data)'
  );
  $stmt->execute([$resource, $json]);
  respond(['ok' => true]);
}

respond(['error' => 'Método no permitido.'], 405);
