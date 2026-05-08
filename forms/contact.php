<?php
header('Content-Type: application/json; charset=UTF-8');

function send_json(int $status, bool $success, string $message): void {
    http_response_code($status);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ]);
    exit;
}

function smtp_read($socket): string {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return $data;
}

function smtp_expect(string $response, array $codes): bool {
    foreach ($codes as $code) {
        if (strpos($response, $code) === 0) {
            return true;
        }
    }
    return false;
}

function smtp_cmd($socket, string $command, array $expectedCodes): bool {
    fwrite($socket, $command . "\r\n");
    $response = smtp_read($socket);
    return smtp_expect($response, $expectedCodes);
}

function send_via_smtp(string $to, string $subject, string $body, string $fromEmail, string $fromName, string $replyTo): bool {
    $host = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
    $port = (int) (getenv('SMTP_PORT') ?: 587);
    $username = getenv('SMTP_USERNAME') ?: '';
    $password = getenv('SMTP_PASSWORD') ?: '';

    if ($username === '' || $password === '') {
        return false;
    }

    $socket = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 15);
    if (!$socket) {
        return false;
    }

    stream_set_timeout($socket, 15);

    $greeting = smtp_read($socket);
    if (!smtp_expect($greeting, ['220'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'EHLO localhost', ['250'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'STARTTLS', ['220'])) {
        fclose($socket);
        return false;
    }

    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'EHLO localhost', ['250'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'AUTH LOGIN', ['334'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, base64_encode($username), ['334'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, base64_encode($password), ['235'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'MAIL FROM:<' . $fromEmail . '>', ['250'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'RCPT TO:<' . $to . '>', ['250', '251'])) {
        fclose($socket);
        return false;
    }

    if (!smtp_cmd($socket, 'DATA', ['354'])) {
        fclose($socket);
        return false;
    }

    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $replyTo;
    $headers[] = 'Subject: ' . $subject;
    $headers[] = 'To: ' . $to;

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.";
    fwrite($socket, $payload . "\r\n");

    $dataResponse = smtp_read($socket);
    $ok = smtp_expect($dataResponse, ['250']);

    smtp_cmd($socket, 'QUIT', ['221']);
    fclose($socket);

    return $ok;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, false, 'Method not allowed.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || strlen($name) < 2) {
    send_json(400, false, 'Please enter your name.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(400, false, 'Please enter a valid email address.');
}

if ($subject === '' || strlen($subject) < 4) {
    send_json(400, false, 'Please enter a subject.');
}

if ($message === '' || strlen($message) < 20) {
    send_json(400, false, 'Message must be at least 20 characters.');
}

$recipient = 'adityaindana@gmail.com';
$mailSubject = '[Portfolio] ' . preg_replace('/[\r\n]+/', ' ', $subject);
$body = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'adityaindana@gmail.com';
$fromName = getenv('SMTP_FROM_NAME') ?: 'Aditya Indana Portfolio';
$replyTo = $name . ' <' . $email . '>';

$sent = send_via_smtp($recipient, $mailSubject, $body, $fromEmail, $fromName, $replyTo);

$smtpUser = getenv('SMTP_USERNAME') ?: '';
$smtpPass = getenv('SMTP_PASSWORD') ?: '';

if (!$sent && $smtpUser === '' && $smtpPass === '') {
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $replyTo;
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    $sent = @mail($recipient, $mailSubject, $body, implode("\r\n", $headers));
}

if (!$sent) {
    send_json(
        500,
        false,
        'Email service is not configured. Set SMTP_USERNAME and SMTP_PASSWORD (Gmail app password) on your server.'
    );
}

send_json(200, true, 'Thanks for reaching out. Your message has been sent.');
