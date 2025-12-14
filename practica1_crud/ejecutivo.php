<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$sql = 'SELECT * FROM ejecutivo';

$response = ejecutarConsulta($sql, $connection);
echo($response);

mysqli_close($connection);
exit;
?>