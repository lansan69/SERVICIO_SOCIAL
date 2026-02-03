let datos = [];
var hot;
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let tableSchema = [];
let tableData = [];
let ejecutivoFullMap = [];
let used_hours = [];

// --- 1. SOCKET LISTENER LOGIC ---
window.applySocketChange = function (data) {
    if (!hot) return;

    const allData = hot.getData();
    const idColumnIndex = tableSchema.findIndex(col => col.data === 'id_cita');

    let targetRow = -1;
    // Find row by ID
    for (let i = 0; i < allData.length; i++) {
        if (allData[i][idColumnIndex] == data.id_cita) {
            targetRow = i;
            break;
        }
    }

    if (targetRow !== -1) {
        const targetCol = tableSchema.findIndex(col => col.data === data.field);
        if (targetCol !== -1) {
            // Update cell (Source 'socket' prevents loops)
            hot.setDataAtCell(targetRow, targetCol, data.value, 'socket');
            // Illuminate
            highlightCell(targetRow, targetCol);
        }
    }
};

function highlightCell(row, col) {
    hot.setCellMeta(row, col, 'className', 'cell-updated');
    hot.render();
    setTimeout(() => {
        hot.setCellMeta(row, col, 'className', '');
        hot.render();
    }, 1000);
}

// --- 2. HELPERS & DATA ---
function processNombres() { return Object.values(ejecutivoName); }
function crearMapeoInverso() {
    ejecutivoIDMap = {};
    for (const id in ejecutivoName) ejecutivoIDMap[ejecutivoName[id]] = id;
}
function get_Ejecutivo_ID(nombreEjecutivo) { return ejecutivoIDMap[nombreEjecutivo]; }

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
    data.forEach((currentValue) => {
        let formattedTime = getRango(currentValue.hora_cit);
        if (!used.includes(formattedTime)) {
            used.push(formattedTime);
            currentValue.rango_calc = formattedTime;
        }
    });
    return data;
}

function getIdByName(nameValue) {
    const entry = Object.entries(ejecutivoFullMap).find(([id, data]) => data.name === nameValue);
    return entry ? entry[0] : null;
}

function randonEjecutivo() {
    const keys = Object.keys(ejecutivoFullMap);
    if (keys.length === 0) return null;
    return ejecutivoFullMap[keys[Math.floor(Math.random() * keys.length)]].name;
}

// --- 3. MAIN AJAX & LOGIC ---
function guardarCambio(row, campo, oldValue, value, id) {
    $.ajax({
        url: 'administrar-cita.php', type: 'POST', dataType: 'json',
        data: { action: 'modificar', campo: campo, valor: value, id_cit: id },
        success: function (response) {
            if (response.success) {
                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element); // Defined in historico.js
                console.log('Cita actualizada');
            } else {
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
        url: "administrar-cita.php", type: "POST", dataType: 'json',
        data: { action: "agregar_vacio" },
        success: function (response) {
            if (response.success && response.new_id) {
                hot.setDataAtCell(row, id_cita, response.new_id, 'poblar_id');
                hot.alter('insert_row_above', 0, 1);
                guardarCambio(row, prop, oldValue, newValue, response.new_id);

                const element = createElementHistorico(randonEjecutivo(), "agregar", response.new_id, prop, oldValue, newValue);
                insertIntoHistorico(element);
            }
        }
    });
}

function ajax(name) {
    $.ajax({
        url: name, type: 'GET', dataType: 'json',
        data: { action: 'obtener' },
        success: function (response) {
            ejecutivoTelefonoMap = {}; used_hours = []
            if (response.success) {
                tableSchema = response.schema;
                tableData = processData(response.data);
                ejecutivoFullMap = response.ejecutivoMap;
                initializeDynamicTable();
                hot.alter('insert_row_above', 0, 1);
            } else { alert('Error: ' + response.message); }
        }
    });
}

function ajaxGeneric(url, metodo, data) {
    $.ajax({
        url: url, type: metodo, data: data, dataType: 'json',
        success: function (response) {
            if (response.success) {
                const element = createElementHistorico(randonEjecutivo(), data.action, data.id_cita, "cita", "visible", "eliminado");
                insertIntoHistorico(element);
            }
        }
    });
}

// --- 4. TABLE INITIALIZATION ---
function initializeDynamicTable() {
    const container = document.getElementById('citas');
    if (hot) hot.destroy();

    const dynamicHeaders = tableSchema.map(col => col.title);
    const dynamicColumns = tableSchema.map(col => {
        let config = { ...col, readOnly: col.readOnly || false };
        if (col.type === 'dropdown') { config.visibleRows = 10; config.trimDropdown = false; }
        return config;
    });

    const customContextMenu = {
        items: {
            "row_above": { name: 'Insertar fila arriba' },
            "sp1": "---------",
            "remove_row": { name: 'Eliminar Fila' },
            "sp2": "---------",
            "historico_cambios": {
                name: "Histórico de cambios",
                callback: function () { if (typeof mostrarHistorico === 'function') mostrarHistorico(); }
            }
        }
    };

    hot = new Handsontable(container, {
        data: tableData, colHeaders: dynamicHeaders, columns: dynamicColumns,
        themeName: 'ht-theme-main-dark-auto', autoColumnSize: { useHeaders: true },
        autoRowSize: true, rowHeaders: true, filters: true, dropdownMenu: true,
        contextMenu: customContextMenu, search: true, licenseKey: 'non-commercial-and-evaluation',

        afterChange: function (changes, source) {
            // IGNORE sources: loadData, socket, etc.
            if (!changes || ['loadData', 'socket', 'cascada_telefono', 'poblar_id', 'cascada_rango'].includes(source)) return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (oldValue === newValue) return;

                const elements = tableSchema.map(col => col.data);
                const index_cita = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(row, index_cita);

                if (prop == "nom_eje") {
                    const id_eje = getIdByName(newValue);
                    newValue = id_eje; prop = "id_eje2";
                    const index_tel = elements.indexOf('tel_eje');
                    hot.setDataAtCell(row, index_tel, ejecutivoFullMap[id_eje].tel, 'cascada_telefono');
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
                    // A. Save to Database
                    guardarCambio(row, prop, oldValue, newValue, id);

                    // B. Send Socket Update
                    if (window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) {
                        const payload = {
                            action: 'update_cell',
                            id_cita: id,
                            field: prop,
                            value: newValue,
                            user_name: localStorage.getItem("id_sesion") || "Unknown"
                        };
                        window.globalSocket.send(JSON.stringify(payload));
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

// Init
ajax("administrar-cita.php");

// Search Listener
const searchField = document.getElementById('search_field');
if (searchField) {
    searchField.addEventListener('keyup', function (event) {
        if (hot) {
            hot.getPlugin('search').query(this.value);
            hot.render();
        }
    });
}