// Variable global para los datos
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let aux = [];
let used_hours = [];

var tableSchema = [];        // Stores column definitions
var tableData = [];          // Stores the actual rows
var ejecutivoFullMap = [];   // Maps ID -> {name, tel}

// Starting the connection
const socket = new WebSocket(SOCKET_URL);
const user = generateID(10);
let isExternalAction = false;

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
                // Implement history logic here
            }
        }
    },
};

function generateID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

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
                // Standard update message
                socket.send(JSON.stringify({
                    type: 'MODIFICAR_USUARIO',
                    id_cita: id,
                    campo: campo,
                    valor: value,
                    log: "Se asignó valor: " + value + " a " + campo
                }));

                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element);

                // Refresh template if needed, though usually socket handles UI
                callAjaxTemplate();
            } else {
                console.log("error:", response);
            }
        }
    });
}

function eliminar(id, rowIndex) {
    ajaxGeneric("administrar-cita.php", "POST", { action: "eliminar", id_cita: id })
    socket.send(JSON.stringify({
        usuario: user,
        row: rowIndex,
        type: 'ELIMINAR_USUARIO',
        id_cita: id,
        log: "Se eliminó la cita con id: " + id
    }));
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
                    socket.send(JSON.stringify({
                        type: 'AGREGAR_USUARIO',
                        row: row,
                        id_cita: id_cita,
                        new_id: response.new_id,
                        log: "Se agregó una cita con id: " + response.new_id
                    }));

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
        }
    });
}

function callAjaxTemplate() {
    ajax("administrar-cita.php");
}

let used = []
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
    data.forEach((currentValue, index) => {
        let formattedTime = getRango(currentValue.hora_cit);
        if (!used.includes(formattedTime)) {
            used.push(formattedTime);
            currentValue.rango_calc = formattedTime;
        }
    });
    return data;
}

function ajax(name) {
    $.ajax({
        url: name,
        type: 'GET',
        data: { action: 'obtener' },
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
                console.error('Error al cargar datos: ' + response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Fallo la llamada AJAX (Carga Inicial):", textStatus, errorThrown);
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
        contextMenu: customContextMenu,
        search: true,
        licenseKey: 'non-commercial-and-evaluation',

        afterChange: function (changes, source) {
            // Filter out system changes to avoid loops
            if (!changes || source === 'loadData' || source === 'cascada_telefono' || source === 'cascada_nombre' || source === 'poblar_id' || source === 'cascada_rango') return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (oldValue === newValue) return;

                const elements = tableSchema.map(col => col.data);
                const index_cita = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(row, index_cita);

                // 1. Handle DROPDOWN (Name) Change
                if (prop == "nom_eje") {
                    const id_eje = getIdByName(newValue);

                    // Send specific message for Cascade update on other clients
                    // We send id_cita (safe) and id_eje (data)
                    socket.send(JSON.stringify({
                        type: 'MODIFICAR_USUARIO_EJECUTIVO',
                        id_cita: id,
                        id_eje: id_eje,
                        log: "Se asignó ejecutivo: " + newValue
                    }));

                    // Prepare for DB save (Backend expects ID, not Name)
                    newValue = id_eje;
                    prop = "id_eje2";
                }

                if (id == null) {
                    // New Record
                    if (prop !== "hora_cit" || /^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
                        crearRegistroVacio(row, index_cita, prop, oldValue, newValue);
                    }
                } else {
                    // Existing Record

                    // 2. Handle TIME Change
                    if (prop === "hora_cit") {
                        // Send specific message to update Range on other clients
                        socket.send(JSON.stringify({
                            type: 'MODIFICAR_USUARIO_EJECUTIVO_VALUE',
                            id_cita: id,
                            newValue: newValue,
                            log: "Se modificó la hora a: " + newValue
                        }));
                    }

                    // Save to DB
                    guardarCambio(row, prop, oldValue, newValue, id);
                }
            });
        },
        beforeRemoveRow: function (index, amount, physicalRows) {
            if (isExternalAction) return;
            const elements = tableSchema.map(col => col.data);
            physicalRows.forEach(rowIndex => {
                const id_col = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(rowIndex, id_col);
                if (id) eliminar(id, rowIndex);
            });
            callAjaxTemplate();
        },
    });
}

function getIdByName(nameValue) {
    const entry = Object.entries(ejecutivoFullMap).find(([id, data]) => data.name === nameValue);
    return entry ? entry[0] : null;
}

const searchField = document.getElementById('search_field');

if (searchField) {
    searchField.addEventListener('keyup', function (event) {
        const searchPlugin = hot.getPlugin('search');
        const queryResult = searchPlugin.query(this.value);
        hot.render();
    });
}

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

socket.onopen = function () {
    createDialog("myDialog", "dialogMessage", "✅ WebSocket conectado usuario: " + user);
};

function createDialog(id, message_id, message) {
    const dialog = document.getElementById(id);
    const dialogMessage = document.getElementById(message_id);
    if (dialog && dialogMessage) {
        dialogMessage.textContent = message;
        dialog.show();
        setTimeout(() => {
            dialog.close();
        }, 2500);
    }
}

// --- RECEIVER LOGIC ---
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    // 1. STANDARD CELL UPDATE
    if (message.type === 'MODIFICAR_USUARIO') {
        const { id_cita, campo, valor, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        const rowData = hot.getSourceData();
        // Find Physical Index via ID
        const sourceIndex = rowData.findIndex(row => row.id_cita == id_cita);

        if (sourceIndex !== -1) {
            // Convert to Visual Index (Handles Sorting/Filtering)
            const visualRow = hot.toVisualRow(sourceIndex);

            if (visualRow !== null && visualRow !== -1) {
                const colIndex = hot.propToCol(campo);

                if (colIndex !== null && colIndex !== -1) {
                    // Update Data
                    hot.setDataAtCell(visualRow, colIndex, valor, 'loadData');

                    // Apply Highlight
                    hot.setCellMeta(visualRow, colIndex, 'className', 'highlight-flash');
                    hot.render();

                    // Remove Highlight
                    setTimeout(() => {
                        const currentVisualRow = hot.toVisualRow(sourceIndex);
                        if (currentVisualRow !== null && currentVisualRow !== -1) {
                            hot.removeCellMeta(currentVisualRow, colIndex, 'className');
                            hot.render();
                        }
                    }, 2000);
                }
            }
        }

        // 2. ADD NEW ROW
    } else if (message.type === 'AGREGAR_USUARIO') {
        const { row, id_cita, new_id, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        hot.setDataAtCell(row, id_cita, new_id, 'poblar_id');
        hot.alter('insert_row_above', 0, 1);
        callAjaxTemplate();

        // 3. REMOVE ROW
    } else if (message.type === "ELIMINAR_USUARIO") {
        const { usuario, row, type, log } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.alter('remove_row', row);
        callAjaxTemplate();

        // 4. CASCADE UPDATE: NAME + PHONE
    } else if (message.type === "MODIFICAR_USUARIO_EJECUTIVO") {
        const { id_cita, id_eje, log } = message;

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(row => row.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);

            if (visualRow !== null && visualRow !== -1) {
                const infoEjecutivo = ejecutivoFullMap[id_eje];
                if (infoEjecutivo) {
                    const colTel = hot.propToCol('tel_eje');
                    const colName = hot.propToCol('nom_eje');

                    // Update Data
                    hot.setDataAtCell(visualRow, colTel, infoEjecutivo.tel, 'cascada_telefono');
                    hot.setDataAtCell(visualRow, colName, infoEjecutivo.name, 'cascada_nombre');

                    // Highlight Both
                    hot.setCellMeta(visualRow, colTel, 'className', 'highlight-flash');
                    hot.setCellMeta(visualRow, colName, 'className', 'highlight-flash');
                    hot.render();

                    // Remove Highlight
                    setTimeout(() => {
                        const currentVisualRow = hot.toVisualRow(sourceIndex);
                        if (currentVisualRow !== null && currentVisualRow !== -1) {
                            hot.removeCellMeta(currentVisualRow, colTel, 'className');
                            hot.removeCellMeta(currentVisualRow, colName, 'className');
                            hot.render();
                        }
                    }, 2000);
                }
            }
        }

        // 5. CASCADE UPDATE: CALCULATED RANGE
    } else if (message.type === "MODIFICAR_USUARIO_EJECUTIVO_VALUE") {
        const { id_cita, newValue, log } = message;

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(row => row.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);
            if (visualRow !== null && visualRow !== -1) {
                const colIndex = hot.propToCol('rango_calc');

                // Update Data
                hot.setDataAtCell(visualRow, colIndex, getRango(newValue), 'cascada_rango');

                // Highlight
                hot.setCellMeta(visualRow, colIndex, 'className', 'highlight-flash');
                hot.render();

                // Remove Highlight
                setTimeout(() => {
                    const currentVisualRow = hot.toVisualRow(sourceIndex);
                    if (currentVisualRow !== null && currentVisualRow !== -1) {
                        hot.removeCellMeta(currentVisualRow, colIndex, 'className');
                        hot.render();
                    }
                }, 2000);
            }
        }
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
    }
};