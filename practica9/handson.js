// Variable global para los datos, ya que Handsontable la usa en la inicialización
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let aux = [];
let used_hours = [];

var tableSchema = [];        // Stores column definitions (type, title, width)
var tableData = [];          // Stores the actual rows
var ejecutivoFullMap = [];


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
        "historico_cambios": {
            name: "Histórico de cambios",
            callback: function (key, selection, clickEvent) {
                alert("called");
            }
        }
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

function guardarCambio(row, campo, oldValue, value, id) {
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

                //insertar elemento into logs cita
                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element);

                console.log('Cita actualizada');
                callAjaxTemplate();
            } else {
                console.log("error:");
                console.log(response);
                alert('Error: ' + response.message);
            }
        }
    });
}

function eliminar(id) {
    ajaxGeneric("administrar-cita.php", "POST", { action: "eliminar", id_cita: id })
}

function crearRegistroVacio(row, id_cita, prop, oldValue, newValue) {
    $.ajax({
        url: "administrar-cita.php",
        type: "POST",
        data: { action: "agregar_vacio" },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.new_id) {
                    hot.setDataAtCell(row, id_cita, response.new_id, 'poblar_id');
                    hot.alter('insert_row_above', 0, 1); //Insert new empty row above
                    guardarCambio(row, prop, oldValue, newValue, response.new_id); //insert the value inserted

                    //Agregando al log de cambios
                    const element = createElementHistorico(randonEjecutivo(), "agregar", response.new_id, prop, oldValue, newValue);
                    insertIntoHistorico(element);
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

let used = []
function getRango(hour) {
    let rawHour = parseInt(hour.split(':')[0]);
    let ampm = rawHour >= 12 ? "PM" : "AM";

    let displayHour = rawHour % 12;
    displayHour = displayHour === 0 ? 12 : displayHour;

    const formattedTime = displayHour + " " + ampm;

    return formattedTime;
}

function processData(data) {
    let used = []; // Ensure 'used' is initialized if not global

    data.forEach((currentValue, index) => {
        // 1. Extract the hour correctly
        let formattedTime = getRango(currentValue.hora_cit);

        // 3. Only populate the cell if this hour hasn't been "marked" yet
        if (!used.includes(formattedTime)) {
            used.push(formattedTime);

            currentValue.rango_calc = formattedTime;
        }
    });
    return data;
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
            if (response.success) {
                tableSchema = response.schema;
                tableData = processData(response.data);
                ejecutivoFullMap = response.ejecutivoMap;
                initializeDynamicTable();
                hot.alter('insert_row_above', 0, 1);
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
                const element = createElementHistorico(randonEjecutivo(), data.action, data.id_cita, "cita", "visible", "eliminado");
                insertIntoHistorico(element);
            } else {
                console.error(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
            alert("ERROR de conexión o servidor, revisa la consola.");
        }
    });
}

function initializeDynamicTable() {
    const container = document.getElementById('citas');
    if (hot) {
        hot.destroy();
    }

    const dynamicHeaders = tableSchema.map(col => col.title);

    const dynamicColumns = tableSchema.map(col => {
        const columnConfig = {
            ...col,
            readOnly: col.readOnly || false
        };
        if (col.type === 'dropdown') {
            columnConfig.visibleRows = 10;
            columnConfig.trimDropdown = false;
        }
        return columnConfig;
    });

    // Custom Context Menu Logic
    const customContextMenu = {
        items: {
            "row_above": { name: 'Insertar fila arriba' },
            "row_below": { name: 'Insertar fila abajo' },
            "sp1": "---------",
            "remove_row": { name: 'Eliminar Fila' },
            "sp2": "---------",
            "historico_cambios": {
                name: "Histórico de cambios",
                callback: function (key, selection, clickEvent) {
                    mostrarHistorico();
                }
            }
        }
    };

    hot = new Handsontable(container, {
        data: tableData,
        colHeaders: dynamicHeaders,
        columns: dynamicColumns,
        themeName: 'ht-theme-main-dark-auto',
        autoColumnSize: { useHeaders: true },
        autoRowSize: true,
        rowHeaders: true,
        filters: true,
        dropdownMenu: true,

        // --- APPLY THE CUSTOM MENU HERE ---
        contextMenu: customContextMenu,

        search: true,
        licenseKey: 'non-commercial-and-evaluation',

        afterChange: function (changes, source) {
            if (!changes || source === 'loadData' || source === 'cascada_telefono' || source === 'poblar_id' || source === 'cascada_rango') return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (oldValue === newValue) return;

                const elements = tableSchema.map(col => col.data);
                const index_cita = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(row, index_cita);

                if (prop == "nom_eje") {
                    const id_eje = getIdByName(newValue);
                    newValue = id_eje;
                    prop = "id_eje2";
                    const index_tel = elements.indexOf('tel_eje');
                    this.setDataAtCell(row, index_tel, ejecutivoFullMap[id_eje].tel, 'cascada_telefono');
                }

                if (id == null) {
                    if (prop !== "hora_cit" || /^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
                        crearRegistroVacio(row, index_cita, prop, oldValue, newValue);
                    }
                } else {
                    if (prop === "hora_cit") {
                        const index_r = elements.indexOf('rango_calc');
                        hot.setDataAtCell(row, index_r, getRango(newValue), 'cascada_rango');
                    }
                    guardarCambio(row, prop, oldValue, newValue, id);
                }
            });
        },
        beforeRemoveRow: function (index, amount, physicalRows) {
            const elements = tableSchema.map(col => col.data);
            physicalRows.forEach(rowIndex => {
                const id_col = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(rowIndex, id_col);
                if (id) eliminar(id);
            });
        },
    });
}

function getIdByName(nameValue) {
    const entry = Object.entries(ejecutivoFullMap).find(([id, data]) => data.name === nameValue);
    return entry ? entry[0] : null;
}

// Get the input element for searching
const searchField = document.getElementById('search_field');

searchField.addEventListener('keyup', function (event) {
    const searchPlugin = hot.getPlugin('search');
    const queryResult = searchPlugin.query(this.value);

    hot.render();
});


function randonEjecutivo() {
    const keys = Object.keys(ejecutivoFullMap);
    const total = keys.length;

    if (total === 0) return null;

    const randomIndex = Math.floor(Math.random() * total);
    const randomId = keys[randomIndex];
    
    
    return ejecutivoFullMap[randomId].name;
}

// Iniciar la carga
callAjaxTemplate();