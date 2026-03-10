<?php
/**
 * ============================================================================
 * MÓDULO: Administrador del Árbol de Ejecutivos y Citas
 * ============================================================================
 * Descripción: 
 * Este archivo actúa como el backend principal (API) para gestionar la 
 * estructura jerárquica de los ejecutivos y planteles. Está diseñado para 
 * proveer y recibir datos del componente jsTree en el frontend.
 * * Funciones principales:
 * - Construye la jerarquía completa sumando citas directas y acumuladas.
 * - Procesa eventos de la interfaz (arrastrar y soltar) para mover ejecutivos.
 * - Gestiona la creación, renombrado y borrado lógico de nodos en la base de datos.
 * ============================================================================
 */

// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';

header('Content-Type: application/json');

//Guarda arreglos auxiliares para evitar consultas repetitivas al calcular las citas acumuladas en el árbol.
$ejecutivoMap = [];
$childrenMap = []; 
$listaEjecutivos = [];

// Obtenemos todos los ejecutivos activos para construir un mapa de información y relaciones.
$tipoEjecutivo = isset($_REQUEST["tipo"]) ?  mysqli_real_escape_string($connection, $_REQUEST['tipo']) : '';
$sql_executives = '';
if ($tipoEjecutivo == '') {
    $sql_executives = "SELECT * FROM ejecutivo WHERE eli_eje = 1";
} else {
    $sql_executives = "SELECT * FROM ejecutivo WHERE eli_eje = 1 AND rol_eje = '$tipoEjecutivo'";
}
$raw_executives = query($sql_executives, $connection);

// Construimos dos mapas:
// 1. $ejecutivoMap: Clave = id_eje, Valor = ['name' => nom_eje, 'tel' => tel_eje, 'plantel' => id_pla, 'citas' => count de citas directas, 'padre' => id_padre]
// 2. $childrenMap: Clave = id_eje (padre), Valor = [id_eje1, id_eje2, ...] (hijos)
if (is_array($raw_executives)) {

    foreach ($raw_executives as $executive) {

        $nombre = isset($executive['nom_eje']) ? $executive['nom_eje'] : "";
        $id = isset($executive['id_eje']) ? $executive['id_eje'] : "";
        $telefono = isset($executive['tel_eje']) ? $executive['tel_eje'] : "";
        $plantel = isset($executive['id_pla']) ? $executive['id_pla'] : "";
        $padre = isset($executive['id_padre']) ? $executive['id_padre'] : "";

        $listaEjecutivos[] = $nombre;
        $sql_citas = '';

        if($tipoEjecutivo != ''){
            $sql_citas = "SELECT COUNT(id_cita) as citas
            FROM citaEjecutivo
            WHERE id_eje2 = $id AND is_active = '1' AND rol_eje = '$tipoEjecutivo'";
            $res_citas = query($sql_citas, $connection);
            $citas_count = (isset($res_citas[0]['citas'])) ? (int) $res_citas[0]['citas'] : 0;
        }else{
            $sql_citas = "SELECT COUNT(id_cita) as citas
            FROM citaEjecutivo
            WHERE id_eje2 = $id AND is_active = '1'";
            $res_citas = query($sql_citas, $connection);
            $citas_count = (isset($res_citas[0]['citas'])) ? (int) $res_citas[0]['citas'] : 0;
        }

        if ($id != "") {
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono,
                'plantel' => $plantel,
                'citas' => $citas_count,
                'padre' => $padre,
                'tipo' => $tipoEjecutivo,
            ];

            if ($padre != "" && $padre != 0) {
                $childrenMap[$padre][] = $id;
            }
        }
    }
}

/**
 * Función: getRecursiveCitas
 * Descripción: Calcula el número total de citas acumuladas para un ejecutivo específico. 
 * Funciona sumando sus citas directas y recorriendo recursivamente todo el árbol de 
 * sus subordinados para sumar también las de ellos.
 * * @param int|string $currentId ID del ejecutivo que se está evaluando actualmente.
 * @param array &$ejecutivoMap Referencia al mapa que contiene la info y citas base de cada ejecutivo.
 * @param array &$childrenMap Referencia al mapa que define la relación entre padres e hijos.
 * @param string|null $tipoE Tipo de ejecutivo para filtrar (opcional).
 * @return int El número total de citas acumuladas en esa rama.
 */
function getRecursiveCitas($currentId, &$ejecutivoMap, &$childrenMap)
{
    // 1. Start with my own direct count
    $total = isset($ejecutivoMap[$currentId]['citas']) ? $ejecutivoMap[$currentId]['citas'] : 0;

    // 2. Check if I have children
    if (isset($childrenMap[$currentId])) {
        // 3. Loop through my children and ask for their totals
        foreach ($childrenMap[$currentId] as $childId) {
            $total += getRecursiveCitas($childId, $ejecutivoMap, $childrenMap);
        }
    }
    return $total;
}

$action = $_REQUEST['action'];

switch ($action) {

    /**
     * Caso: obtener_arbol
     * Descripción: Prepara la estructura JSON que jsTree necesita para renderizar el árbol. 
     * Une los catálogos de planteles y ejecutivos, inyecta las medallas (badges) HTML para 
     * el conteo de citas y asigna los íconos de colores correspondientes.
     * * Parámetros: 
     * - Ninguno requerido externamente, opera con toda la base de datos activa.
     */
    case 'obtener_arbol':
        // 1. Get nodes (Executives)
        $tipoEjecutivo = isset($_REQUEST["tipo"]) ?  mysqli_real_escape_string($connection, $_REQUEST['tipo']) : '';

        $sql = '';

        if($tipoEjecutivo == '') {
            $sql = "SELECT id_eje, nom_eje, id_padre, ejecutivo.id_pla as id_plantel, ult_eje
            FROM ejecutivo
            WHERE eli_eje = 1";
        }else{
            $sql = "SELECT id_eje, nom_eje, id_padre, ejecutivo.id_pla as id_plantel, ult_eje
            FROM ejecutivo
            WHERE eli_eje = 1
            AND rol_eje = '$tipoEjecutivo'";
        }

        $raw_data = query($sql, $connection);

        // 2. Get Planteles (Roots)
        $sql2 = "SELECT id_pla, nom_pla FROM plantel";
        $planteles = query($sql2, $connection);

        $treeData = array();

        if (is_array($raw_data)) {
            foreach ($raw_data as $row) {
                $parent = ($row['id_padre'] == null || $row['id_padre'] == 0) ? $row['id_plantel'] : $row['id_padre'];
                $id = $row['id_eje'];

                // --- TRAFFIC LIGHT LOGIC ---
                $ult_eje = $row['ult_eje'];

                // --- BADGE LOGIC ---
                $sql_extras = "SELECT COUNT(id_pla) as total
                FROM planteles_ejecutivo
                WHERE id_eje = $id";

                $res_extras = query($sql_extras, $connection);
                $extra_count = (isset($res_extras[0]['total'])) ? (int) $res_extras[0]['total'] : 0;
                $total_count = $extra_count;

                // --- FIXED: CALCULATE TOTALS ---

                // 1. Direct Citas (White Badge)
                $total_citas = isset($ejecutivoMap[$id]['citas']) ? $ejecutivoMap[$id]['citas'] : 0;

                // 2. Accumulated Citas (Red Badge) - USING RECURSION
                $acum = getRecursiveCitas($id, $ejecutivoMap, $childrenMap);

                $buildingsHtml = "";
                $citasHtml = "";

                // Only show badge if they have extra plantels
                if ($total_count > 0) {
                    $buildingsHtml .= " <span style='color:#ccc;'>|</span> ";
                    for ($i = 0; $i < $total_count; $i++) {
                        // CHANGE HERE: Added the 'material-icons' class
                        $buildingsHtml .= "<span class='ki-outline ki-escuela color-plantel'></span>";
                    }
                }

                // --- WHITE BADGE (Direct Citas / Padre) ---
                $citasHtml .= " <span style='color:#ccc;'>|</span> ";
                // Added: class='badge-click', data-id, data-scope='padre', cursor:pointer
                $citasHtml .= "<span 
                    class='badge-click' 
                    data-id='{$id}' 
                    data-scope='padre' 
                    style='
                        display: inline-block;
                        background-color: white;
                        border: 1px solid;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        line-height: 11px;
                        text-align: center;
                        padding: 0;
                        padding-top: 2.5px;
                        font-size: 12px;
                        font-weight: bold;
                        vertical-align: middle;
                        cursor: pointer; 
                    '>{$total_citas}</span>";

                // --- RED/PURPLE BADGE (Accumulated / Arbol) ---
                $citasHtml .= " <span style='color:#ccc;'>|</span> ";
                // Added: class='badge-click', data-id, data-scope='arbol', cursor:pointer
                $citasHtml .= "<span 
                    class='badge-click' 
                    data-id='{$id}' 
                    data-scope='arbol' 
                    style='
                        display: inline-block;
                        background-color: purple;
                        color: white;
                        border: 1px solid;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        line-height: 11px;
                        text-align: center;
                        padding: 0;
                        padding-top: 2.5px;
                        font-size: 12px;
                        font-weight: bold;
                        vertical-align: middle;
                        cursor: pointer;
                    '>{$acum}</span>";

                // --- COMBINE EVERYTHING ---
                $finalHtml = $row['nom_eje'] . $buildingsHtml . $citasHtml;

                $treeData[] = array(
                    'id' => $row['id_eje'],
                    'parent' => $parent,
                    'text' => $finalHtml,
                    'type' => 'ejecutivo'
                );
            }

            foreach ($planteles as $plantel) {
                $id_pla = $plantel['id_pla'];
                $acum_plantel = "SELECT COUNT(id_pla) as total FROM cita WHERE id_pla = '$id_pla' AND is_active = '1'";
                $res_acum_plantel = query($acum_plantel, $connection);
                $plantel_html = "";
                $plantel_html = "<span style='color:#ccc;'>|</span>";
                $plantel_html .= "
                 <span 
                    class='badge-click' 
                    data-id='{$plantel['id_pla']}' 
                    data-scope='plantel' 
                    style='
                        display: inline-block;
                        background-color: white;
                        border: 1px solid;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        line-height: 11px;
                        text-align: center;
                        padding: 0;
                        padding-top: 2.5px;
                        font-size: 12px;
                        font-weight: bold;
                        vertical-align: middle;
                        cursor: pointer; 
                    '>{$res_acum_plantel[0]['total']}</span>";

                $treeData[] = array(
                    'id' => $plantel['id_pla'],
                    'parent' => "#",
                    'text' => $plantel['nom_pla'] . $plantel_html,
                    'type' => 'plantel'
                );
            }
        }

        echo json_encode($treeData);
        break;

    /**
     * Caso: eliminar_nodo
     * Descripción: Aplica un borrado lógico estableciendo el estado (eli_eje) a 0.
     * Elimina de la vista tanto al ejecutivo seleccionado como a sus subordinados 
     * directos (id_padre).
     * * Parámetros:
     * @param int $_REQUEST['id'] El ID del ejecutivo que se desea eliminar.
     */
    
    case "eliminar_nodo":
        $id = isset($_REQUEST['id']) ? (int) $_REQUEST['id'] : 0;

        if ($id > 0) {
            $sql = "UPDATE ejecutivo
            SET eli_eje = 0
            WHERE id_eje = $id";

            // Start transaction
            mysqli_begin_transaction($connection);
            
            try {
                // 1. Eliminar el ejecutivo (borrado lógico)
                if (!mysqli_query($connection, $sql)) {
                    throw new Exception('Error eliminando ejecutivo: ' . mysqli_error($connection));
                }
                
                // 2. Limpiar citas asignadas a este ejecutivo (id_eje2)
                $sql_citas = "UPDATE cita SET id_eje2 = NULL WHERE id_eje2 = $id";
                if (!mysqli_query($connection, $sql_citas)) {
                    throw new Exception('Error actualizando citas: ' . mysqli_error($connection));
                }
                
                // 3. Eliminar relaciones con planteles (tabla intermedia)
                $sql_planteles = "DELETE FROM planteles_ejecutivo WHERE id_eje = $id";
                if (!mysqli_query($connection, $sql_planteles)) {
                    throw new Exception('Error eliminando planteles: ' . mysqli_error($connection));
                }
                
                // 4. Actualizar subordinados directos: Hacerlos raíz (id_padre = NULL) para que no desaparezcan del árbol
                $sql_subordinados = "UPDATE ejecutivo SET id_padre = NULL WHERE id_padre = $id";
                if (!mysqli_query($connection, $sql_subordinados)) {
                    throw new Exception('Error actualizando subordinados: ' . mysqli_error($connection));
                }
                
                // Commit all changes
                mysqli_commit($connection);
                echo json_encode(['success' => true, 'message' => 'Ejecutivo eliminado correctamente con todos los cambios aplicados']);
                
            } catch (Exception $e) {
                mysqli_rollback($connection);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            } else {
                echo json_encode(['success' => false, 'message' => 'Error SQL: ' . mysqli_error($connection)]);

        }
        break;

    /**
     * Caso: mover_nodo
     * Descripción: Actualiza la jerarquía cuando se arrastra un ejecutivo a una nueva rama.
     * Identifica si el nuevo padre es un Plantel (ID alfanumérico) o un Ejecutivo (ID numérico).
     * Si se mueve debajo de un ejecutivo, hereda automáticamente el plantel de su nuevo jefe.
     * * Parámetros:
     * @param int $_REQUEST['id'] El ID del ejecutivo que está siendo movido.
     * @param string|int $_REQUEST['parent_id'] El ID del nodo destino.
     */
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

    /**
     * Caso: guardar_nodo
     * Descripción: Centraliza la lógica para Renombrar o Crear nodos. 
     * Evalúa si el ID enviado es un número real de la base de datos (para actualizar) o 
     * un string temporal provisto por el frontend de jsTree (para insertar).
     * * Parámetros:
     * @param int|string $_REQUEST['id'] El ID real a actualizar, o el ID temporal del cliente.
     * @param string $_REQUEST['text'] El nombre nuevo o editado del ejecutivo.
     * @param int|string $_REQUEST['parent_id'] El ID del nodo padre ('#' si es raíz del árbol).
     */
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