<?php
/* Plantilla de configuración. Copia este archivo como config.php y completa
   los valores reales (Hostinger: hPanel -> Databases -> MySQL Databases).
   config.php NO se sube a GitHub porque contiene la contraseña real. */

$rcb_es_local = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'], true);

if ($rcb_es_local) {
  define('DB_HOST', '127.0.0.1');
  define('DB_NAME', 'rcb_local');
  define('DB_USER', 'root');
  define('DB_PASS', '');
} else {
  define('DB_HOST', 'localhost');
  define('DB_NAME', 'TU_BASE_DE_DATOS');
  define('DB_USER', 'TU_USUARIO');
  define('DB_PASS', 'TU_CONTRASENA');
}

function rcb_db() {
  static $pdo = null;
  if ($pdo === null) {
    $pdo = new PDO(
      'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
      DB_USER,
      DB_PASS,
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
  }
  return $pdo;
}
