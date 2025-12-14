<?php
// importar archivos necesarios
require 'con.php';
require 'template.php'; // Assuming this contains respuestaExito/respuestaError/ejecutarConsulta

header('Content-Type: application/json');

$campo = escape($_POST['campo'], $connection);
$valor = escape($_POST['valor'], $connection);
$id_cit = escape($_POST['id_cit'], $connection);


$sql = "UPDATE cita SET $campo = '$valor' WHERE id_cita = '$id_cit'";

// 4. Ejecutar la consulta
$response = ejecutarConsulta($sql, $connection);

// 5. Devolver la respuesta JSON
echo $response;

mysqli_close($connection);
exit;
?>