// Mostrar formulario 
function mostrarFormularioEjecutivos() {
    const modalElement = document.getElementById("formularioDialog");
    if (modalElement) {
        modalElement.showModal(); 
    }
}

// 1. Preview al seleccionar imagen y pre-validación rápida
$("#fot_eje").change(function() {
    const archivo = this.files[0];
    
    // Limpiar preview si no hay archivo
    if (!archivo) {
        $('#preview').hide();
        $('#img-preview').attr('src', '');
        return;
    }

    // Validar extensión
    const extension = archivo.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(extension)) {
        alert('Solo se permiten archivos JPG y PNG');
        $(this).val(''); // Limpiar el input
        $('#preview').hide();
        return;
    }

    // Validar tamaño (40MB = 41943040 bytes)
    if (archivo.size > 41943040) {
        alert('La imagen no debe exceder 40MB');
        $(this).val(''); // Limpiar el input
        $('#preview').hide();
        return;
    }

    // Si pasa las validaciones, mostrar preview
    mostrarPreview(this);
});

// 2. Mostrar preview de imagen
function mostrarPreview(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#img-preview').attr('src', e.target.result);
            $('#preview').show(); // Esto asume que el contenedor del img tiene id="preview"
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. Submit del formulario con validaciones
$("#formularioEjecutivo").submit(function(e) {
    e.preventDefault();
    
    // Validar campos de texto
    if (!$("#nom_eje").val().trim()) {
        alert('El nombre es requerido');
        return;
    }
    
    if (!$("#tel_eje").val().trim()) {
        alert('El teléfono es requerido');
        return;
    }

    if(!$("#id_pla").val()) {
        alert('El plantel es requerido');
        return;
    }

    // Si todo está bien, enviar
    enviarFormulario();
});

// 4. Enviar formulario completo mediante AJAX
function enviarFormulario() {
    var formData = new FormData($('#formularioEjecutivo')[0]);
    formData.append('action', 'agregar_ejecutivo');
    
    $.ajax({
        url: 'ejecutivo/administrar-ejecutivo.php', // Asegúrate de que esta ruta sea correcta
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        beforeSend: function() {
            // Deshabilitar botón para evitar doble envío
            $('#formularioEjecutivo button[type="submit"]').prop('disabled', true).text('Guardando...');
        },
        success: function(response) {
            if (response.success) {
                // Cerrar el <dialog> nativo
                document.getElementById('formularioDialog').close();

                createDialog("messageDialogo", "dialogMessage2", response.message);
                limpiarFormulario();

                socket.send(JSON.stringify({
                    type: 'CARGAR_USUARIO_FORM',
                    log: `Se cargó nuevo ejecutivo: ${response.data.nom_eje} con ID ${response.data.id_eje} en el plantel ${response.data.plantel}`,
                    user: user
                }));
                
                // Aquí podrías llamar a una función para recargar tu Handsontable
                // ej: cargarDatosHandsontable();
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
            alert('Error de conexión al guardar el ejecutivo');
        },
        complete: function() {
            // Restaurar botón
            $('#formularioEjecutivo button[type="submit"]').prop('disabled', false).text('Guardar');
        }
    });
}

// 5. Limpiar formulario
function limpiarFormulario() {
    $('#formularioEjecutivo')[0].reset();
    $('#preview').hide();
    $('#img-preview').attr('src', '');
}