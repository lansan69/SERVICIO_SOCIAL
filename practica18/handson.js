/**
 * handson.js
 * Final Version: Tree Integration + Manual Date Filter Button
 */

// --- GLOBAL VARIABLES ---
let datos = [];
var hot; // Handsontable instance
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let tableSchema = [];
let tableData = [];
let ejecutivoFullMap = {}; // Maps ID -> Name/Phone for dropdowns

// State tracking for refreshing after edits
let currentViewId = null;
let currentViewScope = null;

const contextMenuSettings = {
    items: {
        row_above: { name: 'Insertar columna arriba' },
        sp1: '---------',
        row_below: { name: 'Insertar columna abajo' },
        sp1: '---------',
        remove_row: { name: 'Eliminar' },
        "historico_cambios": {
            name: "Histórico de cambios",
            callback: function (key, selection, clickEvent) {
                // Trigger logic to show history modal if needed
                if (typeof mostrarHistorico === 'function') mostrarHistorico();
            }
        }
    },
};

// --- HELPER FUNCTIONS ---

function processNombres() {
    return Object.values(ejecutivoName);
}

function crearMapeoInverso() {
    ejecutivoIDMap = {};
    for (const id in ejecutivoName) {
        ejecutivoIDMap[ejecutivoName[id]] = id;
    }
}

function get_Ejecutivo_ID(nombreEjecutivo) {
    return ejecutivoIDMap[nombreEjecutivo];
}

function getRango(hour) {
    if (!hour) return "";
    let rawHour = parseInt(hour.split(':')[0]);
    let ampm = rawHour >= 12 ? "PM" : "AM";
    let displayHour = rawHour % 12;
    displayHour = displayHour === 0 ? 12 : displayHour;
    return displayHour + " " + ampm;
}

function processData(data) {
    let used = [];
    if (!data) return [];

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

// --- CRUD OPERATIONS ---

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
                // Log to history
                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element);

                console.log('Cita actualizada');

                // Smart Refresh: Reload the current view to keep consistency
                if (currentViewId) {
                    cargarCitasFiltradas(currentViewId, currentViewScope);
                }
            } else {
                console.log("error:", response);
                alert('Error: ' + response.message);
            }
        }
    });
}

function eliminar(id) {
    ajaxGeneric("administrar-cita.php", "POST", { action: "eliminar", id_cita: id });
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
                    hot.alter('insert_row_above', 0, 1);

                    // Save the value the user just typed into the new row
                    guardarCambio(row, prop, oldValue, newValue, response.new_id);

                    const element = createElementHistorico(randonEjecutivo(), "agregar", response.new_id, prop, oldValue, newValue);
                    insertIntoHistorico(element);
                }
            } else {
                console.error(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
            alert("ERROR de conexión o servidor.");
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

                // Smart Refresh
                if (currentViewId) {
                    cargarCitasFiltradas(currentViewId, currentViewScope);
                }
            } else {
                console.error(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}

// --- EVENT LISTENERS ---

document.addEventListener("DOMContentLoaded", function () {
    // Listener for the "Filtrar" Button
    const btnFilter = document.getElementById('btnFilterDate');

    if (btnFilter) {
        btnFilter.addEventListener('click', function () {
            // Only trigger if a view is currently active
            if (currentViewId) {
                console.log("Applying Date Filter...");
                cargarCitasFiltradas(currentViewId, currentViewScope);
            } else {
                cargarCitasFiltradas(localStorage.getItem("id_guardado"), localStorage.getItem("scope_guardado") );
                alert("Por favor, seleccione un indicador del árbol primero.");
            }
        });
    }
});

// --- MAIN LOGIC: DATA LOADING ---

/**
 * Called by arbol.js when a badge is clicked OR when Filter button is clicked.
 * @param {number|string} id - The ID of the Executive or Plantel.
 * @param {string} scope - 'padre', 'arbol', or 'plantel'.
 */
function cargarCitasFiltradas(id, scope) {
    localStorage.setItem("id_guardado",id);
    localStorage.setItem("scope_guardado", scope);
    console.log(`Cargando citas. ID: ${id}, Scope: ${scope}`);

    // Update global state for refreshes
    currentViewId = id;
    currentViewScope = scope;

    // Get Date Values directly from inputs
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const startDate = startInput ? startInput.value : '';
    const endDate = endInput ? endInput.value : '';

    const url = "administrar-cita.php";
    let action = "";

    // Prepare Data
    let requestData = {
        startDate: startDate,
        endDate: endDate
    };

    // Logic to match PHP expectations based on scope
    if (scope === 'arbol') {
        // Purple Badge (Recursive Tree)
        action = "obtener_modificado";
        requestData.action = action;
        requestData.id_arbol = id;
    } else if (scope === 'plantel') {
        // Plantel Logic
        action = "obtener_by_plantel";
        requestData.action = action;
        requestData.id_arbol = id;
    } else {
        // White Badge (Direct Parent) - Default
        action = "obtener_eje";
        requestData.action = action;
        requestData.id_eje = id;
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

                // Update the executive map so the dropdowns in the table cells work
                if (response.ejecutivoMap) {
                    ejecutivoFullMap = response.ejecutivoMap;
                }

                initializeDynamicTable();

                if (hot) {
                    hot.alter('insert_row_above', 0, 1);
                }
            } else {
                alert('Error al cargar datos: ' + response.message);
            }
        },
        error: function (x, t, e) {
            console.error("Error en cargarCitasFiltradas:", t, e);
        }
    });
}

// --- HANDSONTABLE INITIALIZATION ---

function initializeDynamicTable() {
    const container = document.getElementById('citas');

    // 1. Empty State
    if (!tableData || tableData.length === 0) {
        if (hot) {
            hot.destroy();
            hot = null;
        }
        container.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100 text-muted p-5">
                <span class="material-icons" style="font-size: 48px; color: #ccc;">touch_app</span>
                <h4 class="mt-3">Sin Resultados</h4>
                <p>Seleccione una burbuja o ajuste el filtro de fechas.</p>
            </div>`;
        return;
    }

    // Clear previous empty state message if it exists
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

                    // Name -> Phone Cascade Logic
                    if (prop == "nom_eje") {
                        const id_eje = getIdByName(newValue);
                        if (id_eje && ejecutivoFullMap[id_eje]) {
                            newValue = id_eje; // Convert name to ID for saving
                            prop = "id_eje2"; // Update the database column name
                            const index_tel = elements.indexOf('tel_eje');
                            this.setDataAtCell(row, index_tel, ejecutivoFullMap[id_eje].tel, 'cascada_telefono');
                        }
                    }

                    if (id == null) {
                        // Logic for new row (create empty record first)
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