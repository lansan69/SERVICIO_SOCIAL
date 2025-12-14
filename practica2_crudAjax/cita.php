<?php
require 'con.php';
require 'template.php';

header('Content-Type: application/json');

$search = $_POST['search'];
$sql = '';

if ($search == '') {
    $sql = 'SELECT id_cita, nom_cita, e.nom_eje as nom_eje FROM cita JOIN ejecutivo as e ON cita.id_eje2 = e.id_eje';
} else {
    $search = '%' . $search . '%';
    $sql = "SELECT id_cita, nom_cita, e.nom_eje as nom_eje FROM cita JOIN ejecutivo as e ON cita.id_eje2 = e.id_eje WHERE nom_cita LIKE '$search'";
}
$response = ejecutarConsulta($sql, $connection);
echo ($response);

mysqli_close($connection);
exit;
?>