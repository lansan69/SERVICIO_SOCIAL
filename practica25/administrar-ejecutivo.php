<?php
// importar archivos necesarios
require 'con.php';
require 'template.php';
require 'querys.php';
// require 'rango.php'; // Rango likely not needed for Executives, but kept if you have other utils there

header('Content-Type: application/json');

// --- 1. DATA PREPARATION (Maps & Lists for Dropdowns) ---

// A. Init Arrays
$listaPlanteles = [];
$plantelMap = [];       // ID -> Name (For display)
$plantelReverseMap = []; // Name -> ID (For saving)

$listaPadres = [];
$padreMap = [];
$padreReverseMap = [];

// B. Fetch Planteles
$sql_plantel = "SELECT id_pla, nom_pla FROM plantel";
$raw_plantel = query($sql_plantel, $connection);

if (is_array($raw_plantel)) {
    foreach ($raw_plantel as $p) {
        $id = $p['id_pla'];
        $nom = $p['nom_pla'];

        $listaPlanteles[] = $nom;
        $plantelMap[$id] = $nom;
        $plantelReverseMap[$nom] = $id;
    }
}

// C. Fetch Ejecutivos (To populate "Padre" dropdown)
// We fetch only active ones for the dropdown list, usually
$sql_padres = "SELECT id_eje, nom_eje FROM ejecutivo WHERE eli_eje = 1";
$raw_padres = query($sql_padres, $connection);

if (is_array($raw_padres)) {
    foreach ($raw_padres as $e) {
        $id = $e['id_eje'];
        $nom = $e['nom_eje'];

        $listaPadres[] = $nom;
        $padreMap[$id] = $nom;
        $padreReverseMap[$nom] = $id;
    }
}

// D. Status Map (eli_eje)
$listaEstatus = ['Activo', 'Inactivo'];
$estatusReverseMap = ['Activo' => 1, 'Inactivo' => 0];


// --- 2. SCHEMA DEFINITION ---

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

$schema = [
    [
        'data' => 'id_eje',
        'title' => 'ID',
        'type' => 'text',
        'readOnly' => true,
    ],
    [
        'data' => 'nom_eje',
        'title' => 'NOMBRE',
        'type' => 'text',
    ],
    [
        'data' => 'tel_eje',
        'title' => 'TELÉFONO',
        'type' => 'text',
    ],
    [
        'data' => 'nom_pla', // Display Name, maps to id_pla
        'title' => 'PLANTEL',
        'type' => 'dropdown',
        'source' => $listaPlanteles,
    ],
    [
        'data' => 'nom_padre', // Display Name, maps to id_padre
        'title' => 'PADRE',
        'type' => 'dropdown',
        'source' => $listaPadres,
    ],
    [
        'data' => 'estatus', // Display "Activo/Inactivo", maps to eli_eje
        'title' => 'ESTATUS',
        'type' => 'dropdown',
        'source' => $listaEstatus,
    ]
];

// --- 3. LOGIC SWITCH ---

switch ($action) {
    case 'modificar':
        $campoDisplay = escape($_POST['campo'], $connection); // This is the field name from schema (e.g. 'nom_pla')
        $valorDisplay = escape($_POST['valor'], $connection); // This is the value (e.g. 'Campus Sur')
        $id_eje = escape($_POST['id_cit'], $connection); // Frontend sends row ID as 'id_cit' usually based on your previous code

        $campoDB = $campoDisplay;
        $valorDB = $valorDisplay;

        // Translation Logic: View Name -> DB ID
        if ($campoDisplay == 'nom_pla') {
            $campoDB = 'id_pla';
            $valorDB = isset($plantelReverseMap[$valorDisplay]) ? $plantelReverseMap[$valorDisplay] : NULL;
        } elseif ($campoDisplay == 'nom_padre') {
            $campoDB = 'id_padre';
            $valorDB = isset($padreReverseMap[$valorDisplay]) ? $padreReverseMap[$valorDisplay] : NULL;
        } elseif ($campoDisplay == 'estatus') {
            $campoDB = 'eli_eje';
            $valorDB = isset($estatusReverseMap[$valorDisplay]) ? $estatusReverseMap[$valorDisplay] : 1;
        }

        // Handle NULLs for updates
        if ($valorDB === NULL) {
            $sql = "UPDATE ejecutivo SET $campoDB = NULL WHERE id_eje = '$id_eje'";
        } else {
            $sql = "UPDATE ejecutivo SET $campoDB = '$valorDB' WHERE id_eje = '$id_eje'";
        }

        $response = ejecutarConsulta($sql, $connection);
        echo $response;
        break;

    case 'obtener':
        // Join with Plantel and Self-Join for Padre to get Names
        $sql = "SELECT 
                    e.id_eje, 
                    e.nom_eje, 
                    e.tel_eje, 
                    e.eli_eje,
                    e.id_pla,
                    p.nom_pla,
                    padre.nom_eje AS nom_padre
                FROM ejecutivo e
                LEFT JOIN plantel p ON e.id_pla = p.id_pla
                LEFT JOIN ejecutivo padre ON e.id_padre = padre.id_eje
                ORDER BY e.nom_eje ASC";

        $raw_data = query($sql, $connection);

        $processedData = [];

        if ($raw_data) {
            foreach ($raw_data as $row) {

                // Logic for Status: 1 -> Activo, 0 -> Inactivo
                $statusLabel = ($row['eli_eje'] == 1) ? 'Activo' : 'Inactivo';

                $processedData[] = [
                    'id_eje' => $row['id_eje'],
                    'nom_eje' => $row['nom_eje'],
                    'tel_eje' => $row['tel_eje'],
                    // If the join returned null (no plantel), return empty string
                    'nom_pla' => isset($row['nom_pla']) ? $row['nom_pla'] : "",
                    'nom_padre' => isset($row['nom_padre']) ? $row['nom_padre'] : "",
                    'estatus' => $statusLabel
                ];
            }
        }

        $finalResponse = [
            'success' => true,
            'schema' => $schema,
            'data' => $processedData,
            // Maps sent if frontend needs them for extra logic
            'maps' => [
                    'plantel' => $plantelMap,
                    'padre' => $padreMap
                ]
        ];
        echo json_encode($finalResponse);
        break;

    case "eliminar":
        // Soft delete: Change eli_eje to 0 (Inactivo)
        $id_eje = escape($_POST['id_cita'], $connection); // Receiving ID
        $sql = "UPDATE ejecutivo SET eli_eje = 0 WHERE id_eje = '$id_eje'";
        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;

    case "agregar_vacio":
        // Create new executive with defaults
        $sql = "INSERT INTO ejecutivo (nom_eje, eli_eje) VALUES ('Nuevo Ejecutivo', 1)";
        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;
}

mysqli_close($connection);
exit;
?>