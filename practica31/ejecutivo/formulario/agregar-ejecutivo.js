const formularioEjecutivos = document.getElementById('formularioEjecutivo');
formularioEjecutivos.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(formularioEjecutivos);
    formData.append('action', 'agregar_ejecutivo');

    $.ajax({
        url: 'ejecutivo/administrar-ejecutivo-arbol.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                alert('Ejecutivo agregado exitosamente.');
                $('#arbol_ejecutivos').jstree(true).refresh();
                document.getElementById('formularioDialog').close();
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function(textStatus, errorThrown) {
            console.error(textStatus, errorThrown);
            alert('Error al agregar el ejecutivo.');
        }
    });
});