<?php
// importar archivos necesarios
require 'con.php';
require 'template.php'; // Assuming this contains respuestaExito/respuestaError/ejecutarConsulta

header('Content-Type: application/json');

$id = $_POST['id'];
$name = $_POST['name'];
$tel = $_POST['tel'];


$sql = "UPDATE ejecutivo SET nom_eje = '$name', tel_eje = '$tel' WHERE id_eje = '$id'";

// 4. Ejecutar la consulta
$response = ejecutarConsulta($sql, $connection);

// 5. Devolver la respuesta JSON
echo $response;

mysqli_close($connection);
exit;
?>