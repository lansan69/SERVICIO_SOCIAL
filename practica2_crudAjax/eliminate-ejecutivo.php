<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$id = $_POST['id'];
$sql = "DELETE FROM ejecutivo WHERE id_eje ='$id'";
$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>