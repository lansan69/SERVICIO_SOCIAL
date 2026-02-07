<?php

//##############################################
// librerias
require 'con.php';
require 'template.php';
require 'querys.php';
//##############################################

header('Content-Type: application/json');

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch ($action) {
    case "validar":
        $id_cita = escape($_REQUEST['id_cita'], $connection);
        $id_row = escape($_REQUEST['id_row'], $connection);

        $sql = "SELECT * FROM comentario WHERE id_cita = '$id_cita' AND id_row = '$id_row'";
        $check = query($sql, $connection);

        if (empty($check)) {
            echo returnData(false, "No existe", []);
        } else {
            echo returnData(true, "Existe", []);
        }
        break;

    case "obtener":
        // You might want to remove "WHERE active = '1'" if you stop using that column entirely,
        // but leaving it is fine if you still have old soft-deleted rows.
        $sql = "SELECT * FROM comentario";
        $raw_data = query($sql, $connection);

        $formatted_data = [];

        foreach ($raw_data as $row) {
            $formatted_data[] = [
                'row' => $row['id_cita'],
                'col' => $row['id_row'],
                'comment' => $row['comentario']
            ];
        }
        echo returnData(true, "", $formatted_data);
        break;

    case "agregar":
        $id_cita = escape($_REQUEST['id_cita'], $connection);
        $id_row = escape($_REQUEST['id_row'], $connection);
        $comentario = escape($_REQUEST['comentario'], $connection);

        $sql = "SELECT * FROM comentario WHERE id_cita = '$id_cita' AND id_row = '$id_row'";
        $check = query($sql, $connection);

        if (empty($check)) {
            $sql = "INSERT INTO comentario (id_cita, id_row, comentario, active) VALUES ('$id_cita', '$id_row', '$comentario', '1')";
            query($sql, $connection);
            echo returnData(true, "Agregado", []);
        } else {
            echo returnData(false, "Ya existe", []);
        }
        break;

    case "eliminar":
        $id_cita = escape($_REQUEST['id_cita'], $connection);
        $id_row = escape($_REQUEST['id_row'], $connection);

        $sql = "DELETE FROM comentario WHERE id_cita = '$id_cita' AND id_row = '$id_row'";
        query($sql, $connection);
        echo returnData(true, "Eliminado permanentemente", []);
        break;

    case "modificar":
        $id_cita = escape($_REQUEST['id_cita'], $connection);
        $id_row = escape($_REQUEST['id_row'], $connection);
        $comentario = escape($_REQUEST['comentario'], $connection);

        $sql = "UPDATE comentario SET comentario = '$comentario' WHERE id_cita = '$id_cita' AND id_row = '$id_row'";
        query($sql, $connection);
        echo returnData(true, "Modificado", []);
        break;
}

function returnData($success, $message, $data)
{
    return json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
}
?>