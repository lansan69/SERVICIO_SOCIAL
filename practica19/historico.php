<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';
require 'rango.php';

header('Content-Type: application/json');

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';


$schema = array(
    array('data' => 'id', 'title' => 'ID LOG', 'type' => 'numeric', 'readOnly' => true),
    array('data' => 'fecha', 'title' => 'FECHA CAMBIO', 'type' => 'text', 'readOnly' => true),
    array('data' => 'responsable', 'title' => 'RESPONSABLE', 'type' => 'text', 'readOnly' => true),
    array('data' => 'movimiento', 'title' => 'ACCIÓN', 'type' => 'text', 'readOnly' => true),
    array('data' => 'descripcion', 'title' => 'DETALLE / VALOR PREVIO', 'type' => 'text', 'readOnly' => true, 'width' => 300),
    array('data' => 'id_cita', 'title' => 'ID CITA', 'type' => 'numeric', 'readOnly' => true)
);

switch ($action) {
    case 'obtener':
        $id_cita_filter = isset($_GET['id_cita']) ? $_GET['id_cita'] : null;

        $sql = "SELECT * FROM `historial_cita` ";
        if ($id_cita_filter) {
            // Ensure this function exists in your querys.php or use mysqli_real_escape_string
            $sql .= " WHERE id_cit11 = " . mysqli_real_escape_string($connection, $id_cita_filter);
        }
        $sql .= " ORDER BY id_his_cit DESC";

        $his_citas = query($sql, $connection);
        $tableData = array();

        if (is_array($his_citas)) {
            foreach ($his_citas as $his_cita) {
                $tableData[] = array(
                    'id' => isset($his_cita['id_his_cit']) ? $his_cita['id_his_cit'] : "",
                    'id_cita' => isset($his_cita['id_cit11']) ? $his_cita['id_cit11'] : "",
                    'fecha' => isset($his_cita['fec_his_cit']) ? $his_cita['fec_his_cit'] : "",
                    'responsable' => isset($his_cita['res_his_cit']) ? $his_cita['res_his_cit'] : "",
                    'movimiento' => isset($his_cita['mov_his_cit']) ? $his_cita['mov_his_cit'] : "",
                    'descripcion' => isset($his_cita['des_his_cit']) ? $his_cita['des_his_cit'] : "",
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
        // 1. Sanitize Inputs (Using $_REQUEST to accept both GET and POST)
        $resp = isset($_REQUEST['res']) ? mysqli_real_escape_string($connection, $_REQUEST['res']) : 'Sistema';
        $mov = isset($_REQUEST['mov']) ? mysqli_real_escape_string($connection, $_REQUEST['mov']) : '';
        $des = isset($_REQUEST['des']) ? mysqli_real_escape_string($connection, $_REQUEST['des']) : '';
        $id_cit = isset($_REQUEST['id_cit']) ? (int) $_REQUEST['id_cit'] : 0;

        // 2. Basic Validation
        if ($id_cit === 0) {
            echo json_encode(array(
                'success' => false,
                'message' => 'Error: No se proporcionó un ID de cita válido.'
            ));
            break;
        }

        // 3. Construct the SQL Query
        // We use NOW() for 'fec_his_cit' to get the current server time automatically
        $sql = "INSERT INTO `historial_cita` 
                (`res_his_cit`, `mov_his_cit`, `des_his_cit`, `id_cit11`) 
                VALUES 
                ('$resp', '$mov', '$des', $id_cit)";

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