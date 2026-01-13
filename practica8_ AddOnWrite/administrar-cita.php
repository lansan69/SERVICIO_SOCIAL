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
        if($id != ""){
            $ejecutivoMap[$id] = [
                'name' => $nombre,
                'tel' => $telefono
            ];
        }
    }
} else {
    error_log("Error al obtener la lista de ejecutivos.");
}

// echo json_encode(array(""=> $ejecutivoMap));

$action = $_REQUEST['action'];

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
    ],
    [
        'data' => 'hora_cit',
        'title' => 'HORA',
        'type' => 'time',
        'timeFormat' => 'HH:mm:ss',
        'correctFormat' => true,
    ],
    [
        'data' => 'nom_cita',
        'title' => 'NOMBRE',
        'type' => 'text',
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
    ]
];

switch ($action) {
    case 'modificar':
        $campo = escape($_POST['campo'], $connection);
        $valor = escape($_POST['valor'], $connection);
        $id_cit = escape($_POST['id_cit'], $connection);


        $sql = "UPDATE cita SET $campo = '$valor' WHERE id_cita = '$id_cit'";

        // 4. Ejecutar la consulta
        $response = ejecutarConsulta($sql, $connection);

        // 5. Devolver la respuesta JSON
        echo $response;
        break;
    case 'obtener':
        $sql = "SELECT cita.id_cita as id_cita, 
        cita.nom_cita as nom_cita, 
        cita.id_eje2 as id_eje2,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita 
        LEFT JOIN ejecutivo 
        ON cita.id_eje2 = ejecutivo.id_eje
        ORDER BY (cita.hora_cit IS NULL), cita.hora_cit";

        $raw_data = query($sql, $connection);

        if($raw_data == null){
            $finalResponse = [
            'success' => false,
            'message' => 'Error en la consulta'
            ];

            return json_encode($finalResponse, true);
        }
        foreach ($raw_data as $row) {

            $rango = getRangoPHP($row['hora_cit']);

            // Validate if the executive exists in the map (handle NULLs)
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

                // Use the validated variables
                'tel_eje' => $tel_eje_val,
                'nom_eje' => $nom_eje_val
            ];
        }
        $finalResponse = [
            'success' => true,
            'schema' => $schema,
            'data' => $processedData,
            'ejecutivoMap' => $ejecutivoMap // Send the map for frontend cascade logic
        ];
        echo json_encode($finalResponse);
        break;

    case "eliminar":
        $id_cita = escape($_POST['id_cita'], $connection);
        $sql = "DELETE FROM cita WHERE id_cita = '$id_cita'";

        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;
    case "agregar_vacio":
        $sql = "INSERT INTO cita (nom_cita, id_eje2) VALUES ('', NULL)"; // Ajusta según tu estructura
        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
        break;
}
mysqli_close($connection);
exit;
?>