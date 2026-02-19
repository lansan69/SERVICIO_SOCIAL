<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';
// require 'rango.php'; // Not strictly needed for Executive history

header('Content-Type: application/json');

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

$schema = array(
    array('data' => 'id', 'title' => 'ID LOG', 'type' => 'numeric', 'readOnly' => true),
    array('data' => 'fecha', 'title' => 'FECHA CAMBIO', 'type' => 'text', 'readOnly' => true),
    array('data' => 'responsable', 'title' => 'RESPONSABLE', 'type' => 'text', 'readOnly' => true),
    array('data' => 'movimiento', 'title' => 'ACCIÓN', 'type' => 'text', 'readOnly' => true),
    array('data' => 'descripcion', 'title' => 'DETALLE / VALOR PREVIO', 'type' => 'text', 'readOnly' => true, 'width' => 300),
    array('data' => 'id_eje', 'title' => 'ID EJECUTIVO', 'type' => 'numeric', 'readOnly' => true)
);

switch ($action) {
    case 'obtener':
        $id_eje_filter = isset($_GET['id_eje']) ? $_GET['id_eje'] : null;

        // Change table to historial_ejecutivo
        $sql = "SELECT * FROM `historial_ejecutivo` ";

        if ($id_eje_filter) {
            // Filter by the Executive FK (id_eje11)
            $sql .= " WHERE id_eje11 = " . mysqli_real_escape_string($connection, $id_eje_filter);
        }
        $sql .= " ORDER BY id_his_eje DESC";

        $his_ejecutivos = query($sql, $connection);
        $tableData = array();

        if (is_array($his_ejecutivos)) {
            foreach ($his_ejecutivos as $row) {
                $tableData[] = array(
                    // Map DB columns (_his_eje) to Frontend Schema keys
                    'id' => isset($row['id_his_eje']) ? $row['id_his_eje'] : "",
                    'id_eje' => isset($row['id_eje11']) ? $row['id_eje11'] : "",
                    'fecha' => isset($row['fec_his_eje']) ? $row['fec_his_eje'] : "",
                    'responsable' => isset($row['res_his_eje']) ? $row['res_his_eje'] : "",
                    'movimiento' => isset($row['mov_his_eje']) ? $row['mov_his_eje'] : "",
                    'descripcion' => isset($row['des_his_eje']) ? $row['des_his_eje'] : "",
                );
            }
            echo json_encode(array(
                'success' => true,
                'schema' => $schema,
                'data' => $tableData
            ));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Error al consultar datos'));
        }
        break;

    case 'insertar':
        // 1. Sanitize Inputs
        $resp = isset($_REQUEST['res']) ? mysqli_real_escape_string($connection, $_REQUEST['res']) : 'Sistema';
        $mov = isset($_REQUEST['mov']) ? mysqli_real_escape_string($connection, $_REQUEST['mov']) : '';
        $des = isset($_REQUEST['des']) ? mysqli_real_escape_string($connection, $_REQUEST['des']) : '';

        // Note: Accepting 'id_cit' OR 'id_eje' from the JS to maintain compatibility, 
        // but treating it as the Executive ID.
        $raw_id = isset($_REQUEST['id_eje']) ? $_REQUEST['id_eje'] : (isset($_REQUEST['id_cit']) ? $_REQUEST['id_cit'] : 0);
        $id_eje = (int) $raw_id;

        // 2. Basic Validation
        if ($id_eje === 0) {
            echo json_encode(array(
                'success' => false,
                'message' => 'Error: No se proporcionó un ID de ejecutivo válido.'
            ));
            break;
        }

        // 3. Construct the SQL Query (Targeting historial_ejecutivo)
        $sql = "INSERT INTO `historial_ejecutivo` 
                (`res_his_eje`, `mov_his_eje`, `des_his_eje`, `id_eje11`) 
                VALUES 
                ('$resp', '$mov', '$des', $id_eje)";

        // 4. Execute Query
        if (mysqli_query($connection, $sql)) {
            echo json_encode(array(
                'success' => true,
                'message' => 'Histórico guardado correctamente',
                'received' => array('responsable' => $resp, 'movimiento' => $mov)
            ));
        } else {
            echo json_encode(array(
                'success' => false,
                'message' => 'Error SQL al insertar: ' . mysqli_error($connection)
            ));
        }
        break;

    default:
        echo json_encode(array(
            'success' => false,
            'message' => 'Acción no válida o no proporcionada'
        ));
        break;
}

mysqli_close($connection);
exit;
?>