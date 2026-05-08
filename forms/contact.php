<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || strlen($name) < 2) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter your name.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

if ($subject === '' || strlen($subject) < 4) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a subject.'
    ]);
    exit;
}

if ($message === '' || strlen($message) < 20) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Message must be at least 20 characters.'
    ]);
    exit;
}

$recipient = 'adityaindana@gmail.com';
$mailSubject = '[Portfolio] ' . preg_replace('/[\r\n]+/', ' ', $subject);
$body = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Aditya Indana <adityaindana@gmail.com>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail($recipient, $mailSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Email sending is not available on this server.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Thanks for reaching out. Your message has been sent.'
]);
