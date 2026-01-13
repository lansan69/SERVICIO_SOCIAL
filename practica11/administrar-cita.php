<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';
require 'rango.php';

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

        // a) For the Dropdown Source (Lista)
        $listaEjecutivos[] = $nombre;

        // b) For the Frontend Cascade Logic (Map)
        // Mapeo: Nombre (ej: 'Juan Pérez') -> [ID, Telefono]
        if ($id != "") {
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono
            ];
        }
    }
} else {
    error_log("Error al obtener la lista de ejecutivos.");
}

$action = $_REQUEST['action'];

// --- SCHEMA DEFINITION (From Previous: Editable) ---
$schema = [
    [
        'data' => 'rango_calc',
        'title' => 'RANGO',
        'type' => 'text',
        'readOnly' => true,
    ],
    [
        'data' => 'id_cita',
        'title' => 'ID',
        'type' => 'text',
        'readOnly' => true,
    ],
    [
        'data' => 'date_cita',
        'title' => 'FECHA',
        'type' => 'date',
        'dateFormat' => 'YYYY-MM-DD',
        'correctFormat' => true,
        // Removed readOnly to allow editing
    ],
    [
        'data' => 'hora_cit',
        'title' => 'HORA',
        'type' => 'time',
        'timeFormat' => 'HH:mm:ss',
        'correctFormat' => true,
        // Removed readOnly to allow editing
    ],
    [
        'data' => 'nom_cita',
        'title' => 'NOMBRE',
        'type' => 'text',
        // Removed readOnly to allow editing
    ],
    [
        'data' => 'tel_eje',
        'title' => 'TELÉFONO',
        'type' => 'text',
        'readOnly' => true,
    ],
    [
        'data' => 'nom_eje',
        'title' => 'EJECUTIVO',
        'type' => 'dropdown',
        'source' => $listaEjecutivos,
        // Removed readOnly to allow editing
    ]
];

switch ($action) {
    // --- RESTORED METHOD: MODIFICAR ---
    case 'modificar':
        $campo = escape($_POST['campo'], $connection);
        $valor = escape($_POST['valor'], $connection);
        $id_cit = escape($_POST['id_cit'], $connection);

        $sql = "UPDATE cita SET $campo = '$valor' WHERE id_cita = '$id_cit'";

        $response = ejecutarConsulta($sql, $connection);
        echo $response;
        break;

    // --- RESTORED METHOD: ELIMINAR ---
    case "eliminar":
        $id_cita = escape($_POST['id_cita'], $connection);
        $sql = "UPDATE cita SET is_active = 0 WHERE id_cita = '$id_cita'";

        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;

    // --- RESTORED METHOD: AGREGAR VACIO ---
    case "agregar_vacio":
        $sql = "INSERT INTO cita (nom_cita, id_eje2) VALUES ('', NULL)";
        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;

    // --- EXISTING METHOD: OBTENER EJECUTIVOS (From Current) ---
    case 'obtener_ejecutivos':
        $sql = "SELECT cita.id_cita as id_cita, 
        cita.nom_cita as nom_cita, 
        cita.id_eje2 as id_eje2,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita
        LEFT JOIN ejecutivo 
        ON cita.id_eje2 = ejecutivo.id_eje
        WHERE cita.is_active = 1
        ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);

        if ($raw_data == null) {
            $finalResponse = [
                'success' => false,
                'message' => 'Error en la consulta'
            ];
            echo json_encode($finalResponse, true);
            break;
        }
        foreach ($raw_data as $row) {
            $rango = getRangoPHP($row['hora_cit']);
            $id_eje_actual = $row['id_eje2'];
            $tel_eje_val = "";
            $nom_eje_val = "";

            if (isset($ejecutivoMap[$id_eje_actual])) {
                $tel_eje_val = $ejecutivoMap[$id_eje_actual]['tel'];
                $nom_eje_val = $ejecutivoMap[$id_eje_actual]['name'];
            }

            $processedData[] = [
                'rango_calc' => "",
                'id_cita' => isset($row['id_cita']) ? $row['id_cita'] : "",
                'date_cita' => isset($row['date_cita']) ? $row['date_cita'] : "",
                'hora_cit' => isset($row['hora_cit']) ? $row['hora_cit'] : "",
                'nom_cita' => isset($row['nom_cita']) ? $row['nom_cita'] : "",
                'tel_eje' => $tel_eje_val,
                'nom_eje' => $nom_eje_val
            ];
        }
        $finalResponse = [
            'success' => true,
            'ejecutivoMap' => $ejecutivoMap
        ];
        echo json_encode($finalResponse);
        break;

    // --- EXISTING METHOD: OBTENER ARBOLES (From Current) ---
    case 'obtener_arboles':
        $sql = "SELECT id_pla, nom_pla FROM plantel";

        $raw_data = query($sql, $connection);

        if ($raw_data == null) {
            $finalResponse = [
                'success' => false,
                'message' => 'Error en la consulta'
            ];
            echo json_encode($finalResponse, true);
            break;
        }
        foreach ($raw_data as $row) {
            $arbolMap[$row['id_pla']] = [
                'name' => $row['nom_pla'],
            ];
        }
        $finalResponse = [
            'success' => true,
            'arboles' => $arbolMap
        ];
        echo json_encode($finalResponse);
        break;

    // --- EXISTING METHOD: OBTENER (Common) ---
    case 'obtener':
        $sql = "SELECT cita.id_cita as id_cita, 
        cita.nom_cita as nom_cita, 
        cita.id_eje2 as id_eje2,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita
        LEFT JOIN ejecutivo 
        ON cita.id_eje2 = ejecutivo.id_eje
        WHERE cita.is_active = 1
        ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);

        if ($raw_data == null) {
            $finalResponse = [
                'success' => false,
                'message' => 'Error en la consulta'
            ];
            echo json_encode($finalResponse, true);
            break;
        }
        foreach ($raw_data as $row) {
            $rango = getRangoPHP($row['hora_cit']);
            $id_eje_actual = $row['id_eje2'];
            $tel_eje_val = "";
            $nom_eje_val = "";

            if (isset($ejecutivoMap[$id_eje_actual])) {
                $tel_eje_val = $ejecutivoMap[$id_eje_actual]['tel'];
                $nom_eje_val = $ejecutivoMap[$id_eje_actual]['name'];
            }

            $processedData[] = [
                'rango_calc' => "",
                'id_cita' => isset($row['id_cita']) ? $row['id_cita'] : "",
                'date_cita' => isset($row['date_cita']) ? $row['date_cita'] : "",
                'hora_cit' => isset($row['hora_cit']) ? $row['hora_cit'] : "",
                'nom_cita' => isset($row['nom_cita']) ? $row['nom_cita'] : "",
                'tel_eje' => $tel_eje_val,
                'nom_eje' => $nom_eje_val
            ];
        }
        $finalResponse = [
            'success' => true,
            'schema' => $schema,
            'data' => $processedData,
            'ejecutivoMap' => $ejecutivoMap
        ];
        echo json_encode($finalResponse);
        break;

    // --- EXISTING METHOD: OBTENER MODIFICADO (From Current - Tree Logic) ---
    case "obtener_modificado":
        // 1. Get the Root Executive ID
        $raw_id = isset($_REQUEST['id_arbol']) ? str_replace(array("'", '"'), "", $_REQUEST['id_arbol']) : 0;
        $root_id = (int) $raw_id;

        $processedData = [];

        // 2. LOGIC TO FIND ALL DESCENDANTS (The Tree)
        $family_ids = [];
        $family_ids[] = $root_id;

        // Step A: Build map
        $childrenMap = [];
        if (is_array($raw_executives)) {
            foreach ($raw_executives as $ex) {
                $pid = isset($ex['id_padre']) ? $ex['id_padre'] : null;
                $cid = $ex['id_eje'];

                if ($pid !== null) {
                    $childrenMap[$pid][] = $cid;
                }
            }
        }

        // Step B: BFS
        $queue = [$root_id];
        while (!empty($queue)) {
            $current_parent = array_shift($queue);
            if (isset($childrenMap[$current_parent])) {
                foreach ($childrenMap[$current_parent] as $child_id) {
                    $family_ids[] = $child_id;
                    $queue[] = $child_id;
                }
            }
        }

        // Step C: Comma separated string
        $ids_string = implode(',', $family_ids);
        if (empty($ids_string)) {
            $ids_string = "0";
        }

        // 3. SQL QUERY
        $sql = "SELECT cita.id_cita as id_cita, 
        cita.nom_cita as nom_cita, 
        cita.id_eje2 as id_eje2,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita
        WHERE cita.is_active = 1 
        AND cita.id_eje2 IN ($ids_string)
        ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);

        if ($raw_data === false) {
            echo json_encode([
                'success' => false,
                'message' => 'Error en la consulta SQL: ' . mysqli_error($connection)
            ]);
            break;
        }

        if (is_array($raw_data)) {
            foreach ($raw_data as $row) {
                $id_eje_actual = $row['id_eje2'];
                $tel_eje_val = "";
                $nom_eje_val = "";

                if (isset($ejecutivoMap[$id_eje_actual])) {
                    $tel_eje_val = $ejecutivoMap[$id_eje_actual]['tel'];
                    $nom_eje_val = $ejecutivoMap[$id_eje_actual]['name'];
                }

                $processedData[] = [
                    'rango_calc' => "",
                    'id_cita' => isset($row['id_cita']) ? $row['id_cita'] : "",
                    'date_cita' => isset($row['date_cita']) ? $row['date_cita'] : "",
                    'hora_cit' => isset($row['hora_cit']) ? $row['hora_cit'] : "",
                    'nom_cita' => isset($row['nom_cita']) ? $row['nom_cita'] : "",
                    'tel_eje' => $tel_eje_val,
                    'nom_eje' => $nom_eje_val
                ];
            }
        }

        $finalResponse = [
            'success' => true,
            'schema' => $schema,
            'data' => $processedData,
            'ejecutivoMap' => $ejecutivoMap,
            'debug_ids' => $ids_string
        ];
        echo json_encode($finalResponse);
        break;

    // --- EXISTING METHOD: OBTENER EJE (From Current) ---
    case "obtener_eje":
        $id_eje_query = escape($_REQUEST['id_eje'], $connection);

        $processedData = [];

        $sql = "SELECT cita.id_cita as id_cita, 
        cita.nom_cita as nom_cita, 
        cita.id_eje2 as id_eje2,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita
        LEFT JOIN ejecutivo 
        ON cita.id_eje2 = ejecutivo.id_eje
        WHERE cita.is_active = 1 AND cita.id_eje2 = $id_eje_query
        ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);

        if ($raw_data === false) {
            echo json_encode([
                'success' => false,
                'message' => 'Error en la consulta SQL'
            ]);
            break;
        }

        foreach ($raw_data as $row) {
            $rango = getRangoPHP($row['hora_cit']);
            $id_eje_actual = $row['id_eje2'];
            $tel_eje_val = "";
            $nom_eje_val = "";

            if (isset($ejecutivoMap[$id_eje_actual])) {
                $tel_eje_val = $ejecutivoMap[$id_eje_actual]['tel'];
                $nom_eje_val = $ejecutivoMap[$id_eje_actual]['name'];
            }

            $processedData[] = [
                'rango_calc' => "",
                'id_cita' => isset($row['id_cita']) ? $row['id_cita'] : "",
                'date_cita' => isset($row['date_cita']) ? $row['date_cita'] : "",
                'hora_cit' => isset($row['hora_cit']) ? $row['hora_cit'] : "",
                'nom_cita' => isset($row['nom_cita']) ? $row['nom_cita'] : "",
                'tel_eje' => $tel_eje_val,
                'nom_eje' => $nom_eje_val
            ];
        }
        $finalResponse = [
            'success' => true,
            'schema' => $schema,
            'data' => $processedData,
            'ejecutivoMap' => $ejecutivoMap
        ];
        echo json_encode($finalResponse);
        break;
}
mysqli_close($connection);
exit;
?>