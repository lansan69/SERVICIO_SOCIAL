<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$id = $_POST['id'];
$sql = "DELETE FROM cita WHERE id_cita ='$id'";
$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>