<?php
// Función para ejecutar consultas y obtener datos
function query($query, $connection)
{
    $result = mysqli_query($connection, $query);
    if (!$result)
        return null;

    $datos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $datos[] = $row;
    }
    return $datos;
}
?>