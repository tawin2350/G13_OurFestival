<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/users.json';

if (!file_exists(dirname($dataFile))) {
    mkdir(dirname($dataFile), 0775, true);
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
    chmod($dataFile, 0664);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit();
    }
    
    $required = ['firstname', 'lastname', 'nickname', 'gender', 'birth', 'email', 'phone'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo json_encode(['success' => false, 'message' => "กรุณากรอก $field"]);
            exit();
        }
    }
    
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'อีเมลไม่ถูกต้อง']);
        exit();
    }
    
    if (!preg_match('/^\d{9,10}$/', $input['phone'])) {
        echo json_encode(['success' => false, 'message' => 'เบอร์โทรศัพท์ไม่ถูกต้อง']);
        exit();
    }
    
    $users = json_decode(file_get_contents($dataFile), true);
    
    foreach ($users as $user) {
        if ($user['email'] === $input['email']) {
            echo json_encode(['success' => false, 'message' => 'อีเมลนี้ถูกใช้แล้ว']);
            exit();
        }
    }
    
    $newUser = [
        'id' => uniqid(),
        'firstname' => htmlspecialchars(trim($input['firstname'])),
        'lastname' => htmlspecialchars(trim($input['lastname'])),
        'nickname' => htmlspecialchars(trim($input['nickname'])),
        'gender' => htmlspecialchars(trim($input['gender'])),
        'birth' => htmlspecialchars(trim($input['birth'])),
        'email' => strtolower(trim($input['email'])),
        'phone' => htmlspecialchars(trim($input['phone'])),
        'created' => date('Y-m-d H:i:s')
    ];
    
    $users[] = $newUser;
    
    $result = file_put_contents($dataFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'สมัครสมาชิกเรียบร้อยแล้ว', 'data' => $newUser]);
    } else {
        $error = error_get_last();
        echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกข้อมูลได้', 'error' => $error['message'] ?? 'Unknown error', 'path' => $dataFile]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $users = json_decode(file_get_contents($dataFile), true);
    echo json_encode(['success' => true, 'data' => $users, 'count' => count($users)]);
    
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
