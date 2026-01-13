// Variable global para los datos
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let aux = [];
let used_hours = [];

var tableSchema = [];
var tableData = [];
var ejecutivoFullMap = [];
var arbolMap = [];


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

function refreshCurrentView() {
    const select = document.getElementById('select_ejecutivo');
    const id = select ? select.value : null;

    // Get current scope value ('padre', 'arbol', 'plantel')
    const scopeElement = document.querySelector('input[name="scope_filter"]:checked');
    const scope = scopeElement ? scopeElement.value : 'padre';

    if (id && id !== "") {
        // Pass the scope string instead of a boolean
        cargarCitasFiltradas(id, scope);
    } else {
        searchByFather();
    }
}

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
    $.ajax({
        url: 'administrar-cita.php',
        type: 'POST',
        data: {
            action: 'modificar',
            campo: campo,
            valor: value,
            id_cit: id
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                // Log and History logic
                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element);

                console.log('Cita actualizada');

                // *** CHANGE: Do not call searchByFather(). Call the smart refresh. ***
                refreshCurrentView();
            } else {
                console.log("error:", response);
                alert('Error: ' + response.message);
            }
        }
    });
}

function eliminar(id) {
    // Note: ensure ajaxGeneric also calls refreshCurrentView on success if you use it for deletes
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

function searchByFather() {
    ajax("administrar-cita.php");
}

let used = []
function getRango(hour) {
    if (!hour) return ""; // Safety check
    let rawHour = parseInt(hour.split(':')[0]);
    let ampm = rawHour >= 12 ? "PM" : "AM";
    let displayHour = rawHour % 12;
    displayHour = displayHour === 0 ? 12 : displayHour;
    return displayHour + " " + ampm;
}

function processData(data) {
    let used = [];
    if (!data) return []; // Safety check

    data.forEach((currentValue) => {
        if (!currentValue.hora_cit) {
            currentValue.rango_calc = "";
            return;
        }
        let formattedTime = getRango(currentValue.hora_cit);
        if (!used.includes(formattedTime)) {
            used.push(formattedTime);
            currentValue.rango_calc = formattedTime;
        }
    });
    return data;
}

function ajax(name, arbol = false) {
    $.ajax({
        url: name,
        type: 'GET',
        data: {
            action: 'obtener',
            tree: arbol
        },
        dataType: 'json',
        success: function (response) {
            ejecutivoTelefonoMap = {};
            used_hours = []
            if (response.success) {
                tableSchema = response.schema;
                tableData = processData(response.data);

                // Important: Update global map
                ejecutivoFullMap = response.ejecutivoMap;

                // Only populate select on initial load or explicit reset
                poblarSelectEjecutivos(ejecutivoFullMap);

                initializeDynamicTable();
                if (hot) hot.alter('insert_row_above', 0, 1);
            } else {
                alert('Error al cargar datos: ' + response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
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

                // *** Update: Refresh correctly after delete ***
                refreshCurrentView();
            } else {
                console.error(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}

function initializeDynamicTable() {
    const container = document.getElementById('citas');

    // 1. CHECK IF DATA IS EMPTY
    if (!tableData || tableData.length === 0) {
        if (hot) {
            hot.destroy();
            hot = null;
        }
        container.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100 text-muted p-5">
                <span class="material-icons" style="font-size: 48px; color: #ccc;">search_off</span>
                <h4 class="mt-3">No Result</h4>
                <p>No se encontraron registros.</p>
            </div>`;
        return;
    }

    if (!hot) {
        container.innerHTML = '';
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

    if (hot) {
        hot.updateSettings({
            columns: dynamicColumns,
            colHeaders: dynamicHeaders,
            data: tableData
        });
    } else {
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
            contextMenu: contextMenuSettings,
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
                        if (id_eje && ejecutivoFullMap[id_eje]) {
                            newValue = id_eje;
                            prop = "id_eje2";
                            const index_tel = elements.indexOf('tel_eje');
                            this.setDataAtCell(row, index_tel, ejecutivoFullMap[id_eje].tel, 'cascada_telefono');
                        }
                    }

                    if (id == null) {
                        // Logic for new row
                        if (prop !== "hora_cit" || /^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
                            crearRegistroVacio(row, index_cita, prop, oldValue, newValue);
                        }
                    } else {
                        // Logic for update
                        if (prop === "hora_cit") {
                            const index_r = elements.indexOf('rango_calc');
                            hot.setDataAtCell(row, index_r, getRango(newValue), 'cascada_rango');
                        }
                        // Only save if it's not a cascading visual update
                        if (prop !== 'rango_calc' && prop !== 'tel_eje') {
                            guardarCambio(row, prop, oldValue, newValue, id);
                        }
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
}

function getIdByName(nameValue) {
    if (!ejecutivoFullMap) return null;
    const entry = Object.entries(ejecutivoFullMap).find(([id, data]) => data.name === nameValue);
    return entry ? entry[0] : null;
}

function randonEjecutivo() {
    const keys = Object.keys(ejecutivoFullMap);
    if (keys.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomId = keys[randomIndex];
    return ejecutivoFullMap[randomId].name;
}

function poblarSelectEjecutivos(mapa) {
    // Alias for poblarSelect to keep compatibility
    poblarSelect(mapa, "Ejecutivo");
}

function poblarSelect(mapa, titulo = "Ejecutivo") {
    const select = document.getElementById('select_ejecutivo');
    if (!select) return;

    // 1. Capture current value
    const currentVal = select.value;

    // 2. Clear
    select.innerHTML = "";

    // 3. Build options
    let options = `<option value="">-- Seleccione ${titulo} --</option>`;
    if (mapa && typeof mapa === 'object') {
        Object.keys(mapa).forEach(id => {
            const item = mapa[id];
            const name = item.name || item;
            options += `<option value="${id}">${name}</option>`;
        });
    }
    select.innerHTML = options;

    // 4. Restore value if possible
    if (currentVal && mapa[currentVal]) {
        select.value = currentVal;
    }
}

// --- EVENT LISTENERS ---
// Listener: SELECTOR CHANGE
document.getElementById('select_ejecutivo').addEventListener('change', function () {
    const idSeleccionado = this.value;
    const scopeElement = document.querySelector('input[name="scope_filter"]:checked');
    const scope = scopeElement ? scopeElement.value : 'padre';

    if (idSeleccionado) {
        // Send the specific scope (padre/arbol/plantel)
        cargarCitasFiltradas(idSeleccionado, scope);
    }
});

// Listener: RADIO BUTTONS CHANGE
document.querySelectorAll('input[name="scope_filter"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const scope = this.value;

        // 1. Reload the Select Dropdown (Planteles OR Ejecutivos)
        cargarSelectOptions(scope);

        // 2. If an item is already selected, trigger the filter immediately
        const idSeleccionado = document.getElementById('select_ejecutivo').value;
        if (idSeleccionado) {
            cargarCitasFiltradas(idSeleccionado, scope);
        }
    });
});

function cargarSelectOptions(scope) {
    // Determine which PHP action to call based on scope
    // If 'plantel', fetch schools. If 'padre' or 'arbol', fetch executives.
    const action = (scope === 'plantel') ? "obtener_arboles" : "obtener_ejecutivos";
    
    // Determine the label for the dropdown default option
    let label = "Ejecutivo";
    if (scope === 'arbol') label = "Arbol (Jefe)";
    if (scope === 'plantel') label = "Plantel";

    $.ajax({
        url: "administrar-cita.php",
        type: 'GET',
        data: { action: action }, 
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                // If fetching planteles, the map is in response.arboles
                // If fetching executives, the map is in response.ejecutivoMap
                let mapToLoad = {};
                
                if (scope === 'plantel') {
                    arbolMap = response.arboles || {};
                    mapToLoad = arbolMap;
                    
                    // Note: When in 'Plantel' mode, we might want to keep the GLOBAL executive map 
                    // intact so the table dropdowns still work for editing names, 
                    // but the SELECT element shows Planteles.
                } else {
                    ejecutivoFullMap = response.ejecutivoMap || {};
                    mapToLoad = ejecutivoFullMap;
                }

                poblarSelect(mapToLoad, label);
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (x, t, e) {
            console.error("Error en cargarSelectOptions:", t, e);
        }
    });
}

function cargarCitasFiltradas(id, scope) {
    const url = "administrar-cita.php";
    let action = "";
    let requestData = {};

    // Determine Action and ID Parameter based on Scope
    if (scope === 'plantel') {
        action = "obtener_by_plantel";
        requestData = { action: action, id_arbol: id }; // PHP expects 'id_arbol' for planteles
    } else if (scope === 'arbol') {
        action = "obtener_modificado";
        requestData = { action: action, id_arbol: id }; // PHP expects 'id_arbol' for Tree root
    } else {
        // Default to 'padre' (single executive)
        action = "obtener_eje";
        requestData = { action: action, id_eje: id };
    }

    $.ajax({
        url: url,
        type: 'GET',
        data: requestData,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                tableSchema = response.schema;
                tableData = processData(response.data);

                // CRITICAL: Always ensure the Executive Map is up to date for the TABLE cells
                // (Even if we filtered by Plantel, the table cells contain Executives)
                if (response.ejecutivoMap) {
                    ejecutivoFullMap = response.ejecutivoMap;
                }

                initializeDynamicTable();

                if (hot) {
                    hot.alter('insert_row_above', 0, 1);
                }
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (x, t, e) {
            console.error("Error en cargarCitasFiltradas:", t, e);
        }
    });
}

function ajaxCustom(url, action, ejeId, esArbol = false) {
    $.ajax({
        url: url,
        type: 'GET',
        data: {
            action: action,
            id_eje: ejeId,
            tree: esArbol ? 1 : 0 // Enviamos flag booleano a PHP
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                // Actualizamos los datos globales
                tableSchema = response.schema;
                tableData = processData(response.data);

                // Actualizamos el mapa de ejecutivos para el dropdown de la tabla
                ejecutivoFullMap = response.ejecutivoMap;

                // Solo poblamos el SELECT principal si no tiene opciones o si es la carga inicial
                // Esto evita que el dropdown se cierre o parpadee mientras el usuario interactúa
                if (document.getElementById('select_ejecutivo').options.length <= 1) {
                    poblarSelect(ejecutivoFullMap);
                }

                // Refrescamos Handsontable
                initializeDynamicTable();

                // Agregamos la fila vacía de inserción al inicio
                hot.alter('insert_row_above', 0, 1);
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (x, t, e) {
            console.error("Error en ajaxCustom:", t, e);
        }
    });
}