// Variable global para los datos, ya que Handsontable la usa en la inicialización
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let aux = [];
let used_hours = [];

function getRango(hour){
    let h;
    console.log(hour);
    if(hour != null)
        hour[1] == ":"?h=hour[0]:h=hour[0]+hour[1];
    else    
        h = "10"
    console.log(hour, h);
    let time = "AM";
    let h_int = parseInt(h,10); //convertimos a un formato 12 hrs

    if(parseInt(h,10) >= 12){
        time = "PM";
        h_int = h_int%13 + 1;
    }

    let next;

    if(h_int == 8 && time == "PM"){
        next = h_int;
        h_int--;
    }else{
        next = h_int+1;
    }

    return(h_int.toString())
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
        colWidths: [150,110, 140, 130, 160, 150, 180],
        autoRowSize: true, // Calcula el alto según el contenido (útil con autoWrapRow)
        autoColumnSize: {
            useHeaders: true
        },
        colHeaders: ['RANGO','ID', 'FECHA', 'HORA', 'NOMBRE', 'TELÉFONO', 'EJECUTIVO'],
        columns: [
            { type: 'text', readOnly: true },
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
        filters: true,
        beforeRemoveRow: function (index, amount, physicalRows) {
            physicalRows.forEach(rowIndex => {
                const rowData = this.getSourceDataAtRow(rowIndex);

                if (rowData) {
                    const idCita = rowData[1];
                    console.log("Eliminando ID:", idCita);

                    eliminar(idCita);
                }
            });
        },
        // enable the column menu
        contextMenu: contextMenuSettings,
        dropdownMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        afterChange: function (changes, source) {
            // ... (condicionales source !== 'loadData', etc.) ...
            if (changes && source !== 'loadData' && source !== 'poblar_id' && source !== 'cascada_telefono' && source != 'cascada_hora') {
                changes.forEach(([row, prop, oldValue, newValue]) => {
                    let id = hot.getDataAtCell(row,1);
                    if (id== null){
                        crearRegistroVacio(row);
                    }
                    // var id = hot.getDataAtCell(row, 1);
                    // console.log(row, prop, oldValue,newValue);
                    // ... (chequeo de ID) ...

                    // 1. LÓGICA DE ACTUALIZACIÓN EN CASCADA
                    if (prop == 3) {
                        this.setDataAtCell(row, 0, getRango(newValue), 'cascada_hora');
                        console.log(`Rango actualizado a: ${getRango(newValue) }`);
                    }
                    if (prop == 6) { // El cambio es en la columna EJECUTIVO (índice 5)

                        // Nuevo valor es el NOMBRE del Ejecutivo (ej: "Juan Pérez")

                        // a. Obtener el ID numérico a partir del nombre
                        const nuevoEjecutivoID = get_Ejecutivo_ID(newValue);


                        if (nuevoEjecutivoID) {
                            // b. Obtener el nuevo TELÉFONO usando el ID
                            const nuevoTelefono = ejecutivoTelefonoMap[nuevoEjecutivoID];

                            if (nuevoTelefono) {
                                // c. Actualizar la celda de TELÉFONO (columna 2)
                                this.setDataAtCell(row, 5, nuevoTelefono, 'cascada_telefono');
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
        1: 'id_cita',  // Columna 0 = campo id_cit
        2: 'date_cita',
        3: 'hora_cit',
        4: 'nom_cita',  // Columna 3 = campo nom_cit (nombre)
        5: 'tel_cita',  // Columna 4 = campo tel_cit (teléfono)
        6: 'id_eje2',   // Columna 5 = campo id_eje2 (ejecutivo)
    };
    return campos[column];  // Retornar el campo correspondiente
}

function guardarCambio(row, column, value) {
    // Patrón Column-to-Field Mapping para mapear índice de columna a campo BD
    var campo = obtenerCampo(column);  // Obtener nombre del campo de BD
    var id = hot.getDataAtCell(row, 1);  // Obtener ID de la cita (columna 0)

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

    ajax("administrar-cita.php");
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

                    hot.setDataAtCell(rowIndex, 1, response.new_id, 'poblar_id');
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
            used_hours = []
            if (response.success && response.data) {

                // 2. Transformar los datos del JSON (array de objetos) a array bidimensional (array de arrays)
                const transformedData = response.data.map(item => {
                    ejecutivoTelefonoMap[item.id_eje2] = item.tel_eje;
                    ejecutivoName[item.id_eje2] = item.nom_eje;
                    let adition = null;

                    if (parseInt(getRango(item.hora_cit)) > used_hours[used_hours.length - 1] || used_hours.length == 0) {
                        used_hours.push(parseInt(getRango(item.hora_cit)));
                        adition = getRango(item.hora_cit);
                    }
                    
                    return [
                        adition,
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