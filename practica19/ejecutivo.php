<?php
// 1. Set headers
header('Content-Type: application/json');

// 2. Strict check for GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require 'con.php';
require 'template.php';
require 'querys.php';

$ejecutivoMap = [];

// 3. Fetch data
$sql_executives = "SELECT * FROM ejecutivo";
$raw_executives = query($sql_executives, $connection);

if (is_array($raw_executives)) {
    foreach ($raw_executives as $executive) {
        $nombre = isset($executive['nom_eje']) ? $executive['nom_eje'] : "";
        $id = isset($executive['id_eje']) ? $executive['id_eje'] : "";
        $telefono = isset($executive['tel_eje']) ? $executive['tel_eje'] : "";

        if ($id != "") {
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono
            ];
        }
    }

    // 4. Return JSON with success = true
    echo json_encode([
        'success' => true,
        'data' => $ejecutivoMap
    ]);

} else {
    // Handle error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching data'
    ]);
}
?>