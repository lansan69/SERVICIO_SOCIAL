<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$sql = "SELECT cita.id_cita as id_cita, 
cita.nom_cita as nom_cita, 
ejecutivo.tel_eje as tel_eje, 
cita.id_eje2 as id_eje2  
FROM cita JOIN ejecutivo 
ON cita.id_eje2 = ejecutivo.id_eje";

$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>