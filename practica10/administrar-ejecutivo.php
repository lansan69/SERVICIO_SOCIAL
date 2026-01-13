<?php
// importar archivos necesarios
require 'con.php';
require 'template.php'; 
require 'querys.php';

header('Content-Type: application/json');

$action = $_REQUEST['action'];

switch ($action) {
    case 'modificar':
        // $campo = escape($_POST['campo'], $connection);
        // $valor = escape($_POST['valor'], $connection);
        // $id_cit = escape($_POST['id_cit'], $connection);


        // $sql = "UPDATE cita SET $campo = '$valor' WHERE id_cita = '$id_cit'";

        // // 4. Ejecutar la consulta
        // $response = ejecutarConsulta($sql, $connection);

        // // 5. Devolver la respuesta JSON
        // echo $response;
        break;
    case 'obtener_arbol':
        $sql = "SELECT id_eje, nom_eje, id_padre
                FROM ejecutivo
                WHERE eli_eje = 1"; // Only active nodes

        // Assuming query() returns an array of associative arrays
        $raw_data = query($sql, $connection);

        $treeData = array();

        if (is_array($raw_data)) {
            // 1. Iterate through the results
            foreach ($raw_data as $row) {

                // 2. Convert Database NULL/0 to jsTree '#'
                $parent = ($row['id_padre'] == null || $row['id_padre'] == 0) ? '#' : $row['id_padre'];

                $treeData[] = array(
                    'id' => $row['id_eje'],
                    'parent' => $parent,
                    'text' => $row['nom_eje']
                );
            }
        }

        // 3. Return the array directly (jsTree expects [ {}, {} ])
        echo json_encode($treeData);
        break;

    case "eliminar_nodo": // Matches the action name in your arbol.js
        $id = isset($_REQUEST['id']) ? (int) $_REQUEST['id'] : 0;

        if ($id > 0) {
            // Logic: Hide this node AND any node that has this node as a parent
            // To be truly recursive for 5 levels, a single update might leave grandchildren visible
            // but this query handles the immediate children. 
            $sql = "UPDATE ejecutivo 
                    SET eli_eje = 0 
                    WHERE id_eje = $id OR id_padre = $id";

            if (mysqli_query($connection, $sql)) {
                echo json_encode(['success' => true, 'message' => 'Desterrado exitosamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error SQL: ' . mysqli_error($connection)]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
        }
        break;
    case "mover_nodo":
        $idRaw = isset($_REQUEST['id']) ? (int) $_REQUEST['id'] : 0;
        $parentRaw = isset($_REQUEST['parent_id']) ? $_REQUEST['parent_id'] : '#';

        if ($idRaw > 0) {
            if ($parentRaw === '#') {
                // Case 1: Moving to root
                $sql = "UPDATE ejecutivo SET id_padre = NULL WHERE id_eje = $idRaw";
            } elseif (is_numeric($parentRaw)) {
                // Case 2: Parent is an ID (Integer) -> Update Hierarchy
                $parentIdValue = (int) $parentRaw;
                $sql = "UPDATE ejecutivo SET id_padre = $parentIdValue WHERE id_eje = $idRaw";
            } else {
                // Case 3: Parent is a string -> Update Plantel
                // We use mysqli_real_escape_string to prevent SQL injection
                $plantelValue = mysqli_real_escape_string($connection, $parentRaw);
                $sql = "UPDATE ejecutivo SET plantel = '$plantelValue' WHERE id_eje = $idRaw";
            }

            // Execute the determined query
            if (mysqli_query($connection, $sql)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Actualización completada correctamente'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error SQL: ' . mysqli_error($connection)
                ]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID de ejecutivo no válido']);
        }
        break;
    case "guardar_nodo":
        // 1. Sanitize inputs
        // Note: $_REQUEST covers both GET and POST.
        $idRaw = isset($_REQUEST['id']) ? $_REQUEST['id'] : null;
        $text = isset($_REQUEST['text']) ? mysqli_real_escape_string($connection, $_REQUEST['text']) : 'Nuevo Ejecutivo';
        $parentRaw = isset($_REQUEST['parent_id']) ? $_REQUEST['parent_id'] : '#';

        // 2. Logic to determine Insert vs Update
        // jsTree uses non-numeric IDs (like "j1_2") for new nodes client-side.
        if (is_numeric($idRaw)) {
            // --- UPDATE CASE (Renaming) ---
            $sql = "UPDATE ejecutivo SET nom_eje = '$text' WHERE id_eje = $idRaw";

            if (mysqli_query($connection, $sql)) {
                echo json_encode(['success' => true, 'message' => 'Renombrado exitoso']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar SQL']);
            }

        } else {
            // --- INSERT CASE (New Node) ---

            // Convert jsTree root symbol '#' to Database NULL
            if ($parentRaw === '#') {
                $parentIdValue = "NULL";
            } else {
                $parentIdValue = (int) $parentRaw; // Ensure it's an integer
            }

            // Insert new record (Default eli_eje = 1 for visible)
            $sql = "INSERT INTO ejecutivo (nom_eje, id_padre, eli_eje) 
                    VALUES ('$text', $parentIdValue, 1)";

            if (mysqli_query($connection, $sql)) {
                // IMPORTANT: Get the ID generated by the Database
                $new_id = mysqli_insert_id($connection);

                echo json_encode([
                    'success' => true,
                    'message' => 'Creado exitosamente',
                    'new_id' => $new_id // Required by JS to update the tree ID
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al insertar SQL: ' . mysqli_error($connection)
                ]);
            }
        }
        break;
}
mysqli_close($connection);
exit;
?>