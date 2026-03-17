// Función para poblar el select del formulario de agregar ejecutivo
async function poblarSelectEjecutivos() {
    $.ajax({
        url: 'ejecutivo/administrar-ejecutivo.php',
        type: 'POST',
        data: { action: 'obtener_plantel' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const select = $('#id_pla');
                select.empty();
                select.append('<option value="">Selecciona un plantel</option>');
                response.data.forEach(plantel => {
                    select.append(`<option value="${plantel.id_pla}">${plantel.nom_pla}</option>`);
                });

            } else {
                console.error('Error al obtener planteles:', response.message);
            }
        },
        error: function(textStatus, errorThrown) {
            console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
        }
    });
}

// Llamar a la función para poblar el select al cargar la página
$(document).ready(async function() {
    await poblarSelectEjecutivos();
});
