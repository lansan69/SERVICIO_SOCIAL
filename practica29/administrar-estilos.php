<?php
require 'con.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch ($action) {
    case "guardar_estilo":
        $id_cita = $_POST['id_cita'];
        $id_col = $_POST['id_col'];
        $class = $_POST['class'];

        $sql = "INSERT INTO estilos_celda (id_cita, id_col, class) 
                VALUES ('$id_cita', '$id_col', '$class') 
                ON DUPLICATE KEY UPDATE class = '$class'";

        if ($class == 'clear') {
            $sql = "DELETE FROM estilos_celda WHERE id_cita = '$id_cita' AND id_col = '$id_col'";
        }

        $connection->query($sql);
        echo json_encode(['success' => true]);
        break;

    case "obtener_estilos":
        $sql = "SELECT * FROM estilos_celda";
        $result = $connection->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $data]);
        break;
}
?>