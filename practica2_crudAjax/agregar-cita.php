<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$name = escape($_POST['name'], $connection);
$id_eje = escape($_POST['id_eje'], $connection);

$sql = "INSERT INTO cita (nom_cita, id_eje2) VALUES ('$name','$id_eje')";
$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>