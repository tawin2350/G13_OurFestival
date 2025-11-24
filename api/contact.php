<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/contacts.json';

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
    
    $required = ['name', 'email', 'subject', 'message'];
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
    
    if (!empty($input['phone']) && !preg_match('/^\d{9,10}$/', $input['phone'])) {
        echo json_encode(['success' => false, 'message' => 'เบอร์โทรศัพท์ไม่ถูกต้อง']);
        exit();
    }
    
    $contacts = json_decode(file_get_contents($dataFile), true);
    
    $newContact = [
        'id' => uniqid(),
        'name' => htmlspecialchars(trim($input['name'])),
        'email' => strtolower(trim($input['email'])),
        'phone' => !empty($input['phone']) ? htmlspecialchars(trim($input['phone'])) : '-',
        'subject' => htmlspecialchars(trim($input['subject'])),
        'message' => htmlspecialchars(trim($input['message'])),
        'created' => time() * 1000,
        'status' => 'pending'
    ];
    
    $contacts[] = $newContact;
    
    usort($contacts, function($a, $b) {
        return $b['created'] - $a['created'];
    });
    
    if (file_put_contents($dataFile, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'ส่งข้อความเรียบร้อยแล้ว', 'data' => $newContact]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกข้อมูลได้']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $contacts = json_decode(file_get_contents($dataFile), true);
    echo json_encode(['success' => true, 'data' => $contacts, 'count' => count($contacts)]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ ID']);
        exit();
    }
    
    $contacts = json_decode(file_get_contents($dataFile), true);
    $found = false;
    
    $contacts = array_filter($contacts, function($c) use ($input, &$found) {
        if ($c['id'] === $input['id']) {
            $found = true;
            return false;
        }
        return true;
    });
    
    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูล']);
        exit();
    }
    
    $contacts = array_values($contacts);
    
    if (file_put_contents($dataFile, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'ลบข้อมูลเรียบร้อยแล้ว']);
    } else {
        echo json_encode(['success' => false, 'message' => 'ไม่สามารถลบข้อมูลได้']);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
