<?php
// importar archivos necesarios
require 'con.php';
require 'template.php'; // Assuming this contains respuestaExito/respuestaError/ejecutarConsulta

header('Content-Type: application/json');

$id = $_POST['id'];
$name = $_POST['name'];
$id_eje = $_POST['id_eje'];


$sql = "UPDATE cita SET nom_cita = '$name', id_eje = '$id_eje' WHERE id_cita = '$id'";

// 4. Ejecutar la consulta
$response = ejecutarConsulta($sql, $connection);

// 5. Devolver la respuesta JSON
echo $response;

mysqli_close($connection);
exit;
?>