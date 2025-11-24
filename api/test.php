<?php
header('Content-Type: application/json');

$info = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'current_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'data_path' => __DIR__ . '/../data',
    'users_file' => __DIR__ . '/../data/users.json',
    'data_dir_exists' => is_dir(__DIR__ . '/../data'),
    'data_dir_writable' => is_writable(__DIR__ . '/../data'),
    'users_file_exists' => file_exists(__DIR__ . '/../data/users.json'),
    'users_file_writable' => is_writable(__DIR__ . '/../data/users.json'),
    'users_file_readable' => is_readable(__DIR__ . '/../data/users.json'),
];

if (file_exists(__DIR__ . '/../data/users.json')) {
    $info['users_file_permissions'] = substr(sprintf('%o', fileperms(__DIR__ . '/../data/users.json')), -4);
    if (function_exists('posix_getpwuid')) {
        $info['users_file_owner'] = posix_getpwuid(fileowner(__DIR__ . '/../data/users.json'))['name'] ?? 'Unknown';
    }
}

if (is_dir(__DIR__ . '/../data')) {
    $info['data_dir_permissions'] = substr(sprintf('%o', fileperms(__DIR__ . '/../data')), -4);
    if (function_exists('posix_getpwuid')) {
        $info['data_dir_owner'] = posix_getpwuid(fileowner(__DIR__ . '/../data'))['name'] ?? 'Unknown';
    }
}

echo json_encode($info, JSON_PRETTY_PRINT);
?>
