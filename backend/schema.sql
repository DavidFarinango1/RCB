-- Esquema de base de datos para RCB (Repuestos Casa Blanca)
-- Ejecutar esto una sola vez en phpMyAdmin (Hostinger -> Databases -> MySQL Databases -> phpMyAdmin)

CREATE TABLE IF NOT EXISTS rcb_kv (
  resource_key VARCHAR(50) PRIMARY KEY,
  data LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rcb_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- El usuario admin (admin / rcb2026) y los datos iniciales del catálogo
-- se crean visitando backend/setup.php una sola vez (no aquí, porque el
-- password_hash real lo genera PHP, no se puede escribir a mano de forma segura).
