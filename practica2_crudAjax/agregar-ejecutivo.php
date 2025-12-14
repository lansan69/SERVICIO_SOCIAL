<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$name = $_POST['name'];
$tel = $_POST['tel'];

$sql = "INSERT INTO ejecutivo (nom_eje, tel_eje) VALUES ('$name','$tel')";
$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>