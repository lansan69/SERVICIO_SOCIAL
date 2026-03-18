// Mostrar formulario 
function mostrarCardEjecutivos() {
    const modalElement = document.getElementById("ejecutivoInfo");
    if (modalElement) {
        modalElement.showModal();
    }
}

function poblarCardEjecutivo(ejecutivoInfo) {
    if (!ejecutivoInfo) {
        console.warn("No se encontró información del ejecutivo.");
        return;
    }

    $('#card-name').text(ejecutivoInfo.name || 'Sin nombre');
    $('#card-telefono').text(ejecutivoInfo.tel || 'Sin teléfono asignado');
    $('#card-padre').text(ejecutivoInfo.padre || 'Sin superior');
    $('#card-tipo-ejecutivo').text(ejecutivoInfo.tipo || 'Sin tipo asignado');

    if (ejecutivoInfo.foto) {
        $('#card-image').attr('src', 'ejecutivo/uploads/' + ejecutivoInfo.foto);
    } else {
        $('#card-image').attr('src', 'ejecutivo/uploads/image.png'); 
    }
}
