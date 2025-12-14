<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$search = $_POST['search'];
$sql = '';

if ($search == '') {
$sql = 'SELECT * FROM ejecutivo';
}else{
    $search = '%' . $search .'%';
    $sql = "SELECT id_eje, nom_eje, tel_eje FROM ejecutivo WHERE nom_eje LIKE '$search' OR tel_eje LIKE '$search'";
}
$response = ejecutarConsulta($sql, $connection);
echo($response);

mysqli_close($connection);
exit;
?>