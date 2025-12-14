<?php
// Función para ejecutar consultas y obtener datos
function ejecutarConsulta($query, $connection)
{
    $result = mysqli_query($connection, $query);
    if (!$result)
        return respuestaError();

    if (mysqli_field_count($connection) === 0) {

        // Verificamos si la consulta generó un ID autoincrementable (INSERT)
        $new_id = mysqli_insert_id($connection);

        if ($new_id > 0) {
            // ¡IMPORTANTE! 
            // Construimos la respuesta JSON manual para asegurar que 'new_id' 
            // esté en la raíz del objeto, tal como lo espera tu JS.
            return json_encode([
                'success' => true,
                'new_id' => $new_id,
                'message' => 'Registro creado con éxito'
            ]);
        }

        // Para UPDATE o DELETE, usamos tu función estándar
        return respuestaExito(true, 'Operación ejecutada con éxito.');
    }

    $datos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $datos[] = $row;
    }
    return respuestaExito($datos, $query);
}

// Función para escape de datos (prevención SQL Injection)
function escape($valor, $connection)
{
    return mysqli_real_escape_string($connection, $valor);
}

// Respuesta exitosa estándar
function respuestaExito($data = null, $message = 'OK')
{
    return json_encode([
        'success' => true,
        'data' => $data,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
}

// Respuesta de error estándar
function respuestaError($message = 'Error', $code = 400)
{
    return json_encode([
        'success' => false,
        'message' => $message,
        'code' => $code
    ], JSON_UNESCAPED_UNICODE);
}
?>