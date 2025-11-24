<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = '../data/feedbacks.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit();
    }
    
    $required = ['rating', 'name', 'email', 'comment'];
    foreach ($required as $field) {
        if (empty($input[$field]) && $input[$field] !== 0) {
            echo json_encode(['success' => false, 'message' => "กรุณากรอก $field"]);
            exit();
        }
    }
    
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'อีเมลไม่ถูกต้อง']);
        exit();
    }
    
    if (!is_numeric($input['rating']) || $input['rating'] < 1 || $input['rating'] > 5) {
        echo json_encode(['success' => false, 'message' => 'คะแนนต้องอยู่ระหว่าง 1-5']);
        exit();
    }
    
    $feedbacks = json_decode(file_get_contents($dataFile), true);
    
    $newFeedback = [
        'id' => uniqid(),
        'rating' => (int)$input['rating'],
        'name' => htmlspecialchars(trim($input['name'])),
        'email' => strtolower(trim($input['email'])),
        'comment' => htmlspecialchars(trim($input['comment'])),
        'created' => time() * 1000
    ];
    
    $feedbacks[] = $newFeedback;
    
    usort($feedbacks, function($a, $b) {
        return $b['created'] - $a['created'];
    });
    
    if (file_put_contents($dataFile, json_encode($feedbacks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'ส่งความคิดเห็นเรียบร้อยแล้ว', 'data' => $newFeedback]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกข้อมูลได้']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $feedbacks = json_decode(file_get_contents($dataFile), true);
    $totalRating = 0;
    $count = count($feedbacks);
    
    if ($count > 0) {
        foreach ($feedbacks as $feedback) {
            $totalRating += $feedback['rating'];
        }
        $average = $totalRating / $count;
    } else {
        $average = 0;
    }
    
    echo json_encode([
        'success' => true, 
        'data' => $feedbacks, 
        'count' => $count,
        'average' => round($average, 2)
    ]);
    
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
