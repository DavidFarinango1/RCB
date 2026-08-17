<?php
/* Prepara la base de datos LOCAL (XAMPP) para desarrollo: crea la base
   rcb_local, sus tablas y el usuario admin (admin / rcb2026).
   Solo funciona en tu computadora — en el hosting se niega a correr.
   Se ejecuta una vez:  php backend/setup-local.php  (o visitando
   http://localhost:8000/backend/setup-local.php) */

$esCli = (php_sapi_name() === 'cli');
$esLocal = $esCli || in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'], true);
if (!$esLocal) {
  http_response_code(403);
  die("Este script es solo para el entorno local.\n");
}

header('Content-Type: text/plain; charset=utf-8');

try {
  $pdo = new PDO('mysql:host=127.0.0.1;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
  ]);
} catch (Exception $e) {
  die("No se pudo conectar a MySQL local. ¿Está iniciado en el panel de XAMPP?\nDetalle: " . $e->getMessage() . "\n");
}

$pdo->exec('CREATE DATABASE IF NOT EXISTS rcb_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
$pdo->exec('USE rcb_local');

$pdo->exec('CREATE TABLE IF NOT EXISTS rcb_kv (
  resource_key VARCHAR(50) PRIMARY KEY,
  data LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

$pdo->exec('CREATE TABLE IF NOT EXISTS rcb_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

$hash = password_hash('rcb2026', PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO rcb_admins (username, password_hash) VALUES (?, ?)
  ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)');
$stmt->execute(['admin', $hash]);

echo "Base de datos local lista.\n";
echo "- Base: rcb_local\n";
echo "- Usuario del panel: admin / rcb2026\n";
echo "Ya puedes entrar en http://localhost:8000/admin.html\n";
