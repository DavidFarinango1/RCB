<?php
/* Recibe el formulario de "Solicitar cotización" y lo envía por correo a
   repuestoscasablanca.rcb@gmail.com. Se llama desde contacto.html e index.html
   al enviar el formulario (además de abrir WhatsApp). */

header('Content-Type: application/json; charset=utf-8');

$TO = 'repuestoscasablanca.rcb@gmail.com';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Datos inválidos.']); exit; }

function clean($v) {
  return trim(strip_tags((string)($v ?? '')));
}

$name = clean($data['name'] ?? '');
$phone = clean($data['phone'] ?? '');
$email = clean($data['email'] ?? '');
$company = clean($data['company'] ?? '');
$category = clean($data['category'] ?? '');
$message = clean($data['message'] ?? '');

if ($name === '' || $phone === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios.']);
  exit;
}

$subject = 'Nueva solicitud de cotización - ' . $name;

$body = "Nueva solicitud de cotización desde repuestoscasablanca.com\n\n";
$body .= "Nombre: $name\n";
$body .= "Teléfono: $phone\n";
if ($email !== '') $body .= "Correo: $email\n";
if ($company !== '') $body .= "Empresa: $company\n";
if ($category !== '') $body .= "Categoría de interés: $category\n";
$body .= "\nDetalle:\n$message\n";

$headers = "From: RCB Web <no-reply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
if ($email !== '') $headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

echo json_encode(['ok' => (bool)$sent]);
