<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';

header('Content-Type: application/json');


$ejecutivoMap = [];
$listaEjecutivos = [];

// 1. Fetch all "ejecutivos" data
$sql_executives = "SELECT * FROM ejecutivo";
$raw_executives = query($sql_executives, $connection);

// 2. Process the raw results into the required structures
if (is_array($raw_executives)) {
    foreach ($raw_executives as $executive) {

        $nombre = isset($executive['nom_eje']) ? $executive['nom_eje'] : "";
        $id = isset($executive['id_eje']) ? $executive['id_eje'] : "";
        $telefono = isset($executive['tel_eje']) ? $executive['tel_eje'] : "";
        $plantel = isset($executive['id_pla']) ? $executive['id_pla'] : "";

        // a) For the Dropdown Source (Lista)
        $listaEjecutivos[] = $nombre;

        // b) For the Frontend Cascade Logic (Map)
        // Mapeo: Nombre (ej: 'Juan Pérez') -> [ID, Telefono]
        if ($id != "") {
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono,
                'plantel' => $plantel,
            ];
        }
    }
} else {
    error_log("Error al obtener la lista de ejecutivos.");
}

$action = $_REQUEST['action'];

switch ($action) {
    case 'obtener_arbol':
        $sql = "SELECT id_eje, nom_eje, id_padre, ejecutivo.id_pla as id_plantel
                FROM ejecutivo
                LEFT JOIN plantel ON ejecutivo.id_eje = plantel.id_pla
                WHERE eli_eje = 1"; // Only active nodes

        // Assuming query() returns an array of associative arrays
        $raw_data = query($sql, $connection);

        $sql2 = "SELECT id_pla, nom_pla FROM plantel";
        $planteles = query($sql2, $connection);

        $treeData = array();

        if (is_array($raw_data)) {
            // 1. Iterate through the results
            foreach ($raw_data as $row) {

                // 2. Convert Database NULL/0 to jsTree '#'
                $parent = ($row['id_padre'] == null || $row['id_padre'] == 0) ? $row['id_plantel'] : $row['id_padre'];

                $treeData[] = array(
                    'id' => $row['id_eje'],
                    'parent' => $parent,
                    'text' => $row['nom_eje'],
                );
            }

            foreach ($planteles as $plantel) {
                $treeData[] = array(
                    'id' => $plantel['id_pla'],
                    'parent' => "#",
                    'text' => $plantel['nom_pla']
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
        $id_eje = isset($_REQUEST['id']) ? (int) $_REQUEST['id'] : 0;
        $parentRaw = isset($_REQUEST['parent_id']) ? $_REQUEST['parent_id'] : '#';

        if ($id_eje <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de ejecutivo inválido']);
            break;
        }

        // CHECK 1: Is the new parent a String? (Means it is a Plantel UUID like 'cuau-333...')
        if (!is_numeric($parentRaw) && $parentRaw !== '#') {
            $id_pla_dest = escape($parentRaw, $connection);

            // Logic: Parent becomes NULL (Root of that Plantel), and update Plantel ID
            $sql = "UPDATE ejecutivo 
                    SET id_padre = NULL, 
                        id_pla = '$id_pla_dest' 
                    WHERE id_eje = $id_eje";

            if (mysqli_query($connection, $sql)) {
                echo json_encode(['success' => true, 'message' => 'Movido a Plantel correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error SQL: ' . mysqli_error($connection)]);
            }
        }
        // CHECK 2: Is the new parent a Number? (Means it is another Executive)
        else {
            $parentIdValue = (int) $parentRaw;

            // Logic: We must update the Parent, BUT we should also update the Plantel 
            // to match the new Boss's plantel (in case you dragged from one school to another).

            // 1. Get the Plantel ID of the new Boss
            $sqlGetBoss = "SELECT id_pla FROM ejecutivo WHERE id_eje = $parentIdValue";
            $resBoss = query($sqlGetBoss, $connection);

            if (!empty($resBoss)) {
                $new_pla_id = $resBoss[0]['id_pla'];

                // Update Parent AND Plantel
                $sql = "UPDATE ejecutivo 
                        SET id_padre = $parentIdValue,
                            id_pla = '$new_pla_id'
                        WHERE id_eje = $id_eje";

                if (mysqli_query($connection, $sql)) {
                    echo json_encode(['success' => true, 'message' => 'Jerarquía actualizada correctamente']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . mysqli_error($connection)]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'El jefe destino no existe']);
            }
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