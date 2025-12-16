<?php
// importar archivos necesarios
require 'con.php';
require 'template.php'; // Assuming this contains respuestaExito/respuestaError/ejecutarConsulta

header('Content-Type: application/json');

$action = $_REQUEST['action'];

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
        ejecutivo.tel_eje as tel_eje, 
        cita.id_eje2 as id_eje2,
        ejecutivo.nom_eje as nom_eje,
        cita.date_cita as date_cita,
        cita.hora_cit as hora_cit
        FROM cita 
        LEFT JOIN ejecutivo 
        ON cita.id_eje2 = ejecutivo.id_eje
        ORDER BY hora_cit";

        $response = ejecutarConsulta($sql, $connection);
        echo ($response);
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