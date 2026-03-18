// Mostrar formulario 
function mostrarFormularioEjecutivos() {
    const modalElement = document.getElementById("formularioDialog");
    if (modalElement) {
        modalElement.showModal();
    }
}

// 1. Preview al seleccionar imagen y pre-validación rápida
$("#fot_eje").change(function () {
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
        reader.onload = function (e) {
            $('#img-preview').attr('src', e.target.result);
            $('#preview').show(); // Esto asume que el contenedor del img tiene id="preview"
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. Submit del formulario con validaciones
$("#formularioEjecutivo").submit(function (e) {
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

    if (!$("#id_pla").val()) {
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
        beforeSend: function () {
            // Deshabilitar botón para evitar doble envío
            $('#formularioEjecutivo button[type="submit"]').prop('disabled', true).text('Guardando...');
        },
        success: function (response) {
            if (response.success) {
                // Cerrar el <dialog> nativo
                document.getElementById('formularioDialog').close();

                console.log(response);
                const arbol = $('#arbol_ejecutivos').jstree(true);

                const text_arbol = response.data.nom_eje + 
                    "<span style='color:#ccc;'>|</span>" + 
                    "<span class='badge-click' data-id='{$id}' data-scope='padre' style='display: inline-block; background-color: white; border: 1px solid; border-radius: 50%; width: 20px; height: 20px; line-height: 11px; text-align: center; padding: 0; padding-top: 2.5px; font-size: 12px; font-weight: bold; vertical-align: middle; cursor: pointer;'>0</span>" + 
                    "<span style='color:#ccc;'>|</span>" + 
                    "<span class='badge-click' data-id='{$id}' data-scope='arbol' style='display: inline-block; background-color: purple; color: white; border: 1px solid; border-radius: 50%; width: 20px; height: 20px; line-height: 11px; text-align: center; padding: 0; padding-top: 2.5px; font-size: 12px; font-weight: bold; vertical-align: middle; cursor: pointer;'>0</span>";

                arbol.create_node(response.data.id_pla, {
                    "id": response.data.id,
                    "text": text_arbol,
                    "type": "ejecutivo",
                    "icon": "ejecutivo/uploads/" + response.data.RUTA_IMAGEN
                }, "last");

                console.log(response);
                socket.send(JSON.stringify({
                    type: 'CREAR_EJECUTIVO',
                    log: "Se creó un nuevo nodo",
                    user: user,
                    node_id: response.data.id,
                    parent_id: response.data.id_pla,
                    text: text_arbol,
                    node_type: "ejecutivo",
                    icon: "ejecutivo/uploads/" + response.data.RUTA_IMAGEN
                }));

                createDialog("messageDialogo", "dialogMessage2", response.message);
                limpiarFormulario();

                // Aquí podrías llamar a una función para recargar tu Handsontable
                // ej: cargarDatosHandsontable();
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
            alert('Error de conexión al guardar el ejecutivo');
        },
        complete: function () {
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