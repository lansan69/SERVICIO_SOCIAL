// Variable global para los datos, ya que Handsontable la usa en la inicialización
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let aux = []

function getRango(hour){
    console.log(hour);
}
const contextMenuSettings = {
    items: {
        row_above: {
            name: 'Insertar columna arriba', // Set custom text for predefined option
        },
        sp1: '---------',
        row_below: {
            name: 'Insertar columna abajo', // Set custom text for predefined option
        },
        sp1: '---------',
        remove_row: {
            name: 'Eliminar', // Set custom text for predefined option
        },
    },
};

function processNombres() {
    // Devuelve un array de solo los valores (Nombres del Ejecutivo)
    return Object.values(ejecutivoName);
}

function crearMapeoInverso() {
    ejecutivoIDMap = {};
    for (const id in ejecutivoName) {
        // Mapeo: Nombre (ej: 'Juan Pérez') -> ID (ej: 1)
        ejecutivoIDMap[ejecutivoName[id]] = id;
    }
}

function get_Ejecutivo_ID(nombreEjecutivo) {
    // Busca el ID numérico usando el nombre seleccionado como clave
    // Nota: El valor devuelto será un string, pero el backend lo maneja.
    return ejecutivoIDMap[nombreEjecutivo];
}

function get_Ejecutivo(str) {
    return str[str[0]]
}

function initializeHandsontable() {
    const container = document.getElementById('citas');
    if (hot) {
        hot.destroy(); // Destruir si ya existe
    }

    hot = new Handsontable(container, {
        themeName: 'ht-theme-main-dark-auto',
        data: datos,  // Carga los datos ya transformados
        colWidths: [110, 140, 130, 160, 150, 180],
        autoRowSize: true, // Calcula el alto según el contenido (útil con autoWrapRow)
        autoColumnSize: {
            useHeaders: true
        },
        colHeaders: ['ID', 'FECHA', 'HORA', 'NOMBRE', 'TELÉFONO', 'EJECUTIVO'],
        columns: [
            { type: 'text', readOnly: true },
            {
                type: 'date',
                dateFormat: 'YYYY-MM-DD',
                correctFormat: true,
            },
            {
                type: 'time',
                timeFormat: 'HH:mm:ss',
                correctFormat: true,
                // Si esta columna va antes de EJECUTIVO, su índice será 4
            },
            { type: 'text' },
            { type: 'text', readOnly: true },
            // ¡Asegúrate de que 'Ejecutivo 3' esté aquí si está en tu BD!
            { type: 'dropdown', source: processNombres() }
        ],
        rowHeaders: true,
        height: 'auto',
        autoWrapRow: true,
        autoWrapCol: true,
        columnSorting: true,
        filters: true,
        beforeRemoveRow: function (index, amount, physicalRows) {
            physicalRows.forEach(rowIndex => {
                const rowData = this.getSourceDataAtRow(rowIndex);

                if (rowData) {
                    const idCita = rowData[0];
                    console.log("Eliminando ID:", idCita);

                    eliminar(idCita);
                }
            });
        },
        afterCreateRow: function (index, amount, source) {
            // 'index' es la fila visual donde se insertó
            // 'amount' es cuántas filas (usualmente 1)
            // 'source' nos dice quién lo disparó (ej: 'ContextMenu')
            if (source === 'ContextMenu' || source === 'action' || source !== 'poblar_id') {

                // Iteramos por si insertó más de una fila
                for (var i = 0; i < amount; i++) {
                    var visualRowIndex = index + i;
                    crearRegistroVacio(visualRowIndex);
                }
            }
        },
        // enable the column menu
        contextMenu: contextMenuSettings,
        dropdownMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        afterChange: function (changes, source) {
            // ... (condicionales source !== 'loadData', etc.) ...
            if (changes && source !== 'loadData' && source !== 'poblar_id' && source !== 'cascada_telefono') {
                changes.forEach(([row, prop, oldValue, newValue]) => {
                    var id = hot.getDataAtCell(row, 0);
                    // ... (chequeo de ID) ...

                    // 1. LÓGICA DE ACTUALIZACIÓN EN CASCADA
                    if (prop == 5) { // El cambio es en la columna EJECUTIVO (índice 3)

                        // Nuevo valor es el NOMBRE del Ejecutivo (ej: "Juan Pérez")

                        // a. Obtener el ID numérico a partir del nombre
                        const nuevoEjecutivoID = get_Ejecutivo_ID(newValue);

                        if (nuevoEjecutivoID) {
                            // b. Obtener el nuevo TELÉFONO usando el ID
                            const nuevoTelefono = ejecutivoTelefonoMap[nuevoEjecutivoID];

                            if (nuevoTelefono) {
                                // c. Actualizar la celda de TELÉFONO (columna 2)
                                this.setDataAtCell(row, 4, nuevoTelefono, 'cascada_telefono');
                                console.log(`Teléfono actualizado a: ${nuevoTelefono}`);
                            }

                            // d. Sobrescribir newValue con el ID numérico para guardarlo en la BD
                            newValue = nuevoEjecutivoID;
                            console.log("ejecutivo ID a guardar: ", newValue);
                        } else {
                            console.error("No se encontró el ID para el ejecutivo seleccionado:", newValue);
                            return; // No guardar si no encontramos el ID
                        }

                    }

                    // 2. Guardar el cambio en la base de datos (Ejecutivo ID o cualquier otro campo)
                    guardarCambio(row, prop, newValue);
                });
            }
        }
    });
}

function obtenerCampo(column) {
    // Mapeo de índice de columna a nombre de campo en tabla cita
    var campos = {
        0: 'id_cita',  // Columna 0 = campo id_cit
        1: 'date_cita',
        2: 'hora_cit',
        3: 'nom_cita',  // Columna 3 = campo nom_cit (nombre)
        4: 'tel_cita',  // Columna 4 = campo tel_cit (teléfono)
        5: 'id_eje2',   // Columna 5 = campo id_eje2 (ejecutivo)
    };
    return campos[column];  // Retornar el campo correspondiente
}

function guardarCambio(row, column, value) {
    // Patrón Column-to-Field Mapping para mapear índice de columna a campo BD
    var campo = obtenerCampo(column);  // Obtener nombre del campo de BD
    var id = hot.getDataAtCell(row, 0);  // Obtener ID de la cita (columna 0)

    // Llamada AJAX para guardar cambio en cita
    $.ajax({
        url: 'administrar-cita.php',  // Endpoint del controlador de citas
        type: 'POST',  // Método HTTP
        data: {
            action: 'modificar',
            campo: campo,  // Campo de BD a actualizar
            valor: value,  // Nuevo valor
            id_cit: id  // ID de la cita
        },
        dataType: 'json',  // Esperamos respuesta JSON
        success: function (response) {
            // Manejar respuesta exitosa
            if (response.success) {
                console.log('Cita actualizada');
                console.log(response);
            } else {
                console.log(response);
                alert('Error: ' + response.message);
            }
        }
    });
}

function eliminar(id) {
    ajaxGeneric("administrar-cita.php", "POST", { action: "eliminar", id_cita: id })
}

function crearRegistroVacio(rowIndex) {
    $.ajax({
        url: "administrar-cita.php",
        type: "POST",
        data: { action: "agregar_vacio" },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);
                if (response.new_id) {

                    hot.setDataAtCell(rowIndex, 0, response.new_id, 'poblar_id');
                }
            } else {
                console.error(response);
                //alert("ERROR!!, ve la consola para ver la información");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
            alert("ERROR de conexión o servidor, revisa la consola.");
        }
    });
}

function callAjaxTemplate() {
    ajax("administrar-cita.php");
}



function ajax(name) {
    // 1. Definir el mapeo de ID a nombre para el dropdown

    $.ajax({
        url: name,
        type: 'GET',
        data: {
            action: 'obtener'
        },
        dataType: 'json',
        success: function (response) {
            ejecutivoTelefonoMap = {};
            if (response.success && response.data) {

                // 2. Transformar los datos del JSON (array de objetos) a array bidimensional (array de arrays)
                const transformedData = response.data.map(item => {
                    ejecutivoTelefonoMap[item.id_eje2] = item.tel_eje;
                    ejecutivoName[item.id_eje2] = item.nom_eje;
                    getRango(item.hora_cit);
                    
                    return [
                        item.id_cita,
                        item.date_cita,
                        item.hora_cit,
                        item.nom_cita,
                        // Asumimos que no tienes 'tel_cita' y le ponemos cadena vacía
                        // Si la tienes, usa: item.tel_cita,
                        item.tel_eje,
                        // Mapear el ID numérico (ej. '1') al nombre visible (ej. 'Ejecutivo 1')
                        ejecutivoName[item.id_eje2]
                    ];
                });

                // 3. Asignar los datos a la variable global 'datos'
                datos = transformedData;

                // 4. Inicializar Handsontable con los datos cargados
                initializeHandsontable();

                // 5. ¡AQUÍ DEBE CREARSE EL MAPEO INVERSO!
                crearMapeoInverso(); 

                console.log('Datos cargados y Handsontable inicializada.');
            } else {
                alert('Error al cargar datos: ' + response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Fallo la llamada AJAX (Carga Inicial):", textStatus, errorThrown);
            alert("Error de conexión con el servidor durante la carga inicial.");
        }
    });
}

function ajaxGeneric(url, metodo, data) {
    $.ajax({
        url: url,
        type: metodo,
        data: data,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);
                // alert("ÉXITO!!, ve la consola para ver la información");
            } else {
                console.error(response);
                //alert("ERROR!!, ve la consola para ver la información");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
            alert("ERROR de conexión o servidor, revisa la consola.");
        }
    });
}

// Iniciar la carga
callAjaxTemplate();