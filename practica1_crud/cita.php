<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$sql = 'SELECT id_cita, nom_cita, e.nom_eje as nom_eje FROM cita JOIN ejecutivo as e ON cita.id_eje2 = e.id_eje';

$response = ejecutarConsulta($sql, $connection);

echo $response;
?>