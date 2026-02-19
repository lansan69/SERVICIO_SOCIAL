<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';
require 'rango.php';

header('Content-Type: application/json');

$ejecutivoMap = [];
$listaEjecutivos = [];

// 1. Fetch all "ejecutivos" data for mapping
$sql_executives = "SELECT * FROM ejecutivo";
$raw_executives = query($sql_executives, $connection);

if (is_array($raw_executives)) {
    foreach ($raw_executives as $executive) {
        $nombre = isset($executive['nom_eje']) ? $executive['nom_eje'] : "";
        $id = isset($executive['id_eje']) ? $executive['id_eje'] : "";
        $telefono = isset($executive['tel_eje']) ? $executive['tel_eje'] : "";

        $listaEjecutivos[] = $nombre;

        if ($id != "") {
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono
            ];
        }
    }
}

$colores_clases = [
    "CITA AGENDADA" => "#ff9900a2",
    "INVASIÓN DE CICLO" => "#ffff0083",
    "CITA REAGENDADA" => "#9b27b077",
    "CITA NO ATENDIDA" => "#ff666677",
    "PAGO ESPERADO" => "#ff00ff7a",
    "PERDIDO POR PRECIO" => "#aabbcc79",
    "PERDIDO POR HORARIO" => "#3366996e",
    "REGISTRO" => "#00ffff81",
    "NO LE INTERESA" => "#cc00006e",
    "ASESORÍA REALIZADA" => "#00ff007c"
];

// Definimos la lógica de colores
$colores = [
    "CITA AGENDADA" => "status-agendada",
    "INVASIÓN DE CICLO" => "status-invasion",
    "CITA REAGENDADA" => "status-reagendada",
    "CITA NO ATENDIDA" => "status-no-atendida",
    "PAGO ESPERADO" => "status-pago-esperado",
    "PERDIDO POR PRECIO" => "status-perdido-precio",
    "PERDIDO POR HORARIO" => "status-perdido-horario",
    "REGISTRO" => "status-registro",
    "NO LE INTERESA" => "status-no-interesa",
    "ASESORÍA REALIZADA" => "status-asesoria"
];

$soloNombres = array_keys($colores);

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

// --- SCHEMA DEFINITION ---
$schema = [
    ['data' => 'rango_calc', 'title' => 'RANGO', 'type' => 'text', 'readOnly' => true],
    ['data' => 'id_cita', 'title' => 'ID', 'type' => 'text', 'readOnly' => true],
    ['data' => 'date_cita', 'title' => 'FECHA', 'type' => 'date', 'dateFormat' => 'YYYY-MM-DD', 'correctFormat' => true],
    ['data' => 'hora_cit', 'title' => 'HORA', 'type' => 'time', 'timeFormat' => 'HH:mm:ss', 'correctFormat' => true],
    ['data' => 'nom_cita', 'title' => 'NOMBRE', 'type' => 'text'],
    ['data' => 'tel_eje', 'title' => 'TELÉFONO', 'type' => 'text', 'readOnly' => true],
    ['data' => 'nom_eje', 'title' => 'EJECUTIVO', 'type' => 'dropdown', 'source' => $listaEjecutivos],
    ['data' => 'est_cit', 'title' => 'ESTADO', 'type' => 'dropdown', 'source'=> $soloNombres]
];

// --- HELPER: DATE FILTER CLAUSE ---
function getDateClause($conn)
{
    $start = isset($_REQUEST['startDate']) ? mysqli_real_escape_string($conn, $_REQUEST['startDate']) : '';
    $end = isset($_REQUEST['endDate']) ? mysqli_real_escape_string($conn, $_REQUEST['endDate']) : '';

    $clause = "";
    if (!empty($start) && !empty($end)) {
        $clause = " AND cita.date_cita BETWEEN '$start' AND '$end' ";
    } elseif (!empty($start)) {
        $clause = " AND cita.date_cita >= '$start' ";
    } elseif (!empty($end)) {
        $clause = " AND cita.date_cita <= '$end' ";
    }
    return $clause;
}

switch ($action) {
    case 'modificar':
        $campo = escape($_POST['campo'], $connection);
        $valor = escape($_POST['valor'], $connection);
        $id_cit = escape($_POST['id_cit'], $connection);
        $sql = "UPDATE cita SET $campo = '$valor' WHERE id_cita = '$id_cit'";
        echo ejecutarConsulta($sql, $connection);
        break;

    case "eliminar":
        $id_cita = escape($_POST['id_cita'], $connection);
        $sql = "UPDATE cita SET is_active = 0 WHERE id_cita = '$id_cita'";
        echo ejecutarConsulta($sql, $connection);
        break;

    case "agregar_vacio":
        $sql = "INSERT INTO cita (nom_cita, id_eje2) VALUES ('', NULL)";
        echo ejecutarConsulta($sql, $connection);
        break;

    case "obtener_modificado":
        $raw_id = isset($_REQUEST['id_arbol']) ? str_replace(array("'", '"'), "", $_REQUEST['id_arbol']) : 0;
        $root_id = (int) $raw_id;

        $family_ids = [$root_id];
        $childrenMap = [];
        if (is_array($raw_executives)) {
            foreach ($raw_executives as $ex) {
                $pid = isset($ex['id_padre']) ? $ex['id_padre'] : null;
                $cid = $ex['id_eje'];
                if ($pid !== null)
                    $childrenMap[$pid][] = $cid;
            }
        }

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
        $ids_string = implode(',', $family_ids);
        if (empty($ids_string))
            $ids_string = "0";

        $dateSql = getDateClause($connection);

        $sql = "SELECT cita.id_cita, cita.nom_cita, cita.id_eje2, cita.date_cita, cita.hora_cit, cita.est_cit
                FROM cita
                WHERE cita.is_active = 1 
                AND cita.id_eje2 IN ($ids_string)
                $dateSql
                ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);
        $conteo_arbol = contarArbol($root_id);
        outputData($raw_data, $schema, $ejecutivoMap, $colores, NULL, $conteo_arbol);
        break;

    case "obtener_eje":
        $id_eje_query = escape($_REQUEST['id_eje'], $connection);

        $dateSql = getDateClause($connection);

        $sql = "SELECT cita.id_cita, cita.nom_cita, cita.id_eje2, cita.date_cita, cita.hora_cit, cita.est_cit
                FROM cita
                WHERE cita.is_active = 1 
                AND cita.id_eje2 = $id_eje_query
                $dateSql
                ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);
        $countEstados = contarEje($id_eje_query);
        outputData($raw_data, $schema, $ejecutivoMap,$colores, $countEstados);
        break;

    case "obtener_by_plantel":
        $raw_id = isset($_REQUEST['id_arbol']) ? str_replace(array("'", '"'), "", $_REQUEST['id_arbol']) : '';
        $id_arbol = mysqli_real_escape_string($connection, $raw_id);

        $dateSql = getDateClause($connection);

        $sql = "SELECT DISTINCT cita.id_cita, cita.nom_cita, cita.id_eje2, cita.date_cita, cita.hora_cit, cita.est_cit
                FROM cita
                INNER JOIN planteles_ejecutivo pe ON cita.id_eje2 = pe.id_eje
                WHERE cita.is_active = 1 
                AND pe.id_pla = '$id_arbol' 
                $dateSql
                ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);
        outputData($raw_data, $schema, $ejecutivoMap, $colores);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}

function outputData($raw_data, $schema, $ejecutivoMap, $colores, $estados = NULL, $arbol = NULL)
{
    $processedData = [];
    if (is_array($raw_data)) {
        foreach ($raw_data as $row) {
            $id_eje_actual = $row['id_eje2'];
            $tel_eje_val = isset($ejecutivoMap[$id_eje_actual]) ? $ejecutivoMap[$id_eje_actual]['tel'] : "";
            $nom_eje_val = isset($ejecutivoMap[$id_eje_actual]) ? $ejecutivoMap[$id_eje_actual]['name'] : "";

            $processedData[] = [
                'rango_calc' => "",
                'id_cita' => $row['id_cita'],
                'date_cita' => $row['date_cita'],
                'hora_cit' => $row['hora_cit'],
                'nom_cita' => $row['nom_cita'],
                'tel_eje' => $tel_eje_val,
                'nom_eje' => $nom_eje_val,
                'est_cit' => $row['est_cit']
            ];
        }
    }
    echo json_encode([
        'success' => true,
        'schema' => $schema,
        'data' => $processedData,
        'ejecutivoMap' => $ejecutivoMap,
        'coloresMap' => $colores,
        'count_estado' => $estados,
        'conteo_arbol' => $arbol
    ]);
}

function contarEje($id_ejecutivo)
{
    global $connection, $colores_clases;

    $id = mysqli_real_escape_string($connection, $id_ejecutivo);
    $dateSql = getDateClause($connection);

    $sql = "SELECT est_cit, COUNT(*) as total 
            FROM cita 
            WHERE is_active = 1 
            AND id_eje2 = '$id' 
            $dateSql 
            GROUP BY est_cit";

    $result = query($sql, $connection);
    $stats = [];

    foreach ($colores_clases as $name => $hex) {
        $stats[$name] = [
            'name' => $name,
            'color' => $hex,
            'count' => 0
        ];
    }

    if (is_array($result)) {
        foreach ($result as $row) {
            $statusName = $row['est_cit'];
            $count = (int) $row['total'];

            $color = isset($colores_clases[$statusName]) ? $colores_clases[$statusName] : '#000000';

            $stats[$statusName] = [
                'name' => $statusName,
                'color' => $color,
                'count' => $count
            ];
        }
    }

    return $stats;
}

function contarArbol($id_arbol)
{
    global $connection, $colores_clases, $raw_executives;

    $root_id = (int) $id_arbol;

    $family_ids = [$root_id];
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

    $ids_string = implode(',', $family_ids);
    if (empty($ids_string))
        $ids_string = "0";

    $dateSql = getDateClause($connection);

    $sql = "SELECT est_cit, COUNT(*) as total 
            FROM cita 
            WHERE is_active = 1 
            AND id_eje2 IN ($ids_string) 
            $dateSql 
            GROUP BY est_cit";

    $result = query($sql, $connection);
    $stats = [];

    foreach ($colores_clases as $name => $hex) {
        $stats[$name] = [
            'name' => $name,
            'color' => $hex,
            'count' => 0
        ];
    }

    if (is_array($result)) {
        foreach ($result as $row) {
            $statusName = $row['est_cit'];
            $count = (int) $row['total'];

            $color = isset($colores_clases[$statusName]) ? $colores_clases[$statusName] : '#000000';

            $stats[$statusName] = [
                'name' => $statusName,
                'color' => $color,
                'count' => $count
            ];
        }
    }

    return $stats;
}

mysqli_close($connection);
exit;
?>