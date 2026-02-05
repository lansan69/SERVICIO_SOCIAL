let datos = [];
var hot;
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let tableSchema = [];
let tableData = [];
let ejecutivoFullMap = {};

let currentViewId = null;
let currentViewScope = null;

let treeRenamed = false;

const socket = new WebSocket('wss://socket.ahjende.com/wss/?encoding=text');
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
                if (typeof mostrarHistorico === 'function') mostrarHistorico();
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

                socket.send(JSON.stringify({
                    type: 'MODIFICAR_USUARIO',
                    id_cita: id,
                    campo: campo,
                    valor: value,
                    log: "Se asignó valor: " + value + " a " + campo
                }));

                const element = createElementHistorico(randonEjecutivo(), 'modificar', id, campo, oldValue, value);
                insertIntoHistorico(element);

                console.log('Cita actualizada');

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

function eliminar(id, rowIndex) {
    ajaxGeneric("administrar-cita.php", "POST", { action: "eliminar", id_cita: id });

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

                    hot.setDataAtCell(row, id_cita, response.new_id, 'poblar_id');
                    hot.alter('insert_row_above', 0, 1);

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

document.addEventListener("DOMContentLoaded", function () {
    const btnFilter = document.getElementById('btnFilterDate');

    if (btnFilter) {
        btnFilter.addEventListener('click', function () {
            if (currentViewId) {
                console.log("Applying Date Filter...");
                cargarCitasFiltradas(currentViewId, currentViewScope);
                cargarCitasFiltradas(localStorage.getItem("id_guardado"), localStorage.getItem("scope_guardado"));
            } else {
                cargarCitasFiltradas(localStorage.getItem("id_guardado"), localStorage.getItem("scope_guardado"));
                alert("Por favor, seleccione un indicador del árbol primero.");
            }
        });
    }
});

function cargarCitasFiltradas(id, scope) {
    localStorage.setItem("id_guardado", id);
    localStorage.setItem("scope_guardado", scope);
    console.log(`Cargando citas. ID: ${id}, Scope: ${scope}`);

    currentViewId = id;
    currentViewScope = scope;

    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const startDate = startInput ? startInput.value : '';
    const endDate = endInput ? endInput.value : '';

    const url = "administrar-cita.php";
    let action = "";

    let requestData = {
        startDate: startDate,
        endDate: endDate
    };

    if (scope === 'arbol') {
        action = "obtener_modificado";
        requestData.action = action;
        requestData.id_arbol = id;
    } else if (scope === 'plantel') {
        action = "obtener_by_plantel";
        requestData.action = action;
        requestData.id_arbol = id;
    } else {
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

function initializeDynamicTable() {
    const container = document.getElementById('citas');

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
                if (!changes || source === 'loadData' || source === 'cascada_telefono' || source === 'cascada_nombre' || source === 'poblar_id' || source === 'cascada_rango') return;

                changes.forEach(([row, prop, oldValue, newValue]) => {
                    if (oldValue === newValue) return;

                    const elements = tableSchema.map(col => col.data);
                    const index_cita = elements.indexOf('id_cita');
                    const id = hot.getDataAtCell(row, index_cita);

                    if (prop == "nom_eje") {
                        const id_eje = getIdByName(newValue);
                        if (id_eje && ejecutivoFullMap[id_eje]) {

                            socket.send(JSON.stringify({
                                type: 'MODIFICAR_USUARIO_EJECUTIVO',
                                id_cita: id,
                                id_eje: id_eje,
                                log: "Se asignó ejecutivo: " + newValue
                            }));

                            newValue = id_eje;
                            prop = "id_eje2";
                            const index_tel = elements.indexOf('tel_eje');
                            hot.setDataAtCell(row, index_tel, ejecutivoFullMap[id_eje].tel, 'cascada_telefono');
                        }
                    }

                    if (id == null) {
                        if (prop !== "hora_cit" || /^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
                            crearRegistroVacio(row, index_cita, prop, oldValue, newValue);
                        }
                    } else {
                        if (prop === "hora_cit") {
                            const index_r = elements.indexOf('rango_calc');

                            socket.send(JSON.stringify({
                                type: 'MODIFICAR_USUARIO_EJECUTIVO_VALUE',
                                id_cita: id,
                                newValue: newValue,
                                log: "Se modificó la hora a: " + newValue
                            }));

                            hot.setDataAtCell(row, index_r, getRango(newValue), 'cascada_rango');
                        }
                        if (prop !== 'rango_calc' && prop !== 'tel_eje') {
                            guardarCambio(row, prop, oldValue, newValue, id);
                        }
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
            },
        });
    }
}

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

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'MODIFICAR_USUARIO') {
        const { id_cita, campo, valor, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(row => row.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);

            if (visualRow !== null && visualRow !== -1) {
                const colIndex = hot.propToCol(campo);

                if (colIndex !== null && colIndex !== -1) {
                    hot.setCellMeta(visualRow, colIndex, 'className', 'highlight-flash');
                    hot.setDataAtCell(visualRow, colIndex, valor, 'loadData');
                    hot.render();


                    setTimeout(() => {
                        const currentVisualRow = hot.toVisualRow(sourceIndex);
                        if (currentVisualRow !== null && currentVisualRow !== -1) {
                            hot.removeCellMeta(currentVisualRow, colIndex, 'className');
                            hot.render();
                        }
                    }, 1000);
                }
            }
        }

    } else if (message.type === 'AGREGAR_USUARIO') {
        const { row, id_cita, new_id, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        hot.setDataAtCell(row, id_cita, new_id, 'poblar_id');
        hot.alter('insert_row_above', 0, 1);

        if (currentViewId) {
            cargarCitasFiltradas(currentViewId, currentViewScope);
        }

    } else if (message.type === "ELIMINAR_USUARIO") {
        const { usuario, row, type, log } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.alter('remove_row', row);

        if (currentViewId) {
            cargarCitasFiltradas(currentViewId, currentViewScope);
        }

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

                    hot.setDataAtCell(visualRow, colTel, infoEjecutivo.tel, 'cascada_telefono');
                    hot.setDataAtCell(visualRow, colName, infoEjecutivo.name, 'cascada_nombre');

                    hot.setCellMeta(visualRow, colTel, 'className', 'highlight-flash');
                    hot.setCellMeta(visualRow, colName, 'className', 'highlight-flash');
                    hot.render();

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

    } else if (message.type === "MODIFICAR_USUARIO_EJECUTIVO_VALUE") {
        const { id_cita, newValue, log } = message;

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(row => row.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);
            if (visualRow !== null && visualRow !== -1) {
                const colIndex = hot.propToCol('rango_calc');

                hot.setDataAtCell(visualRow, colIndex, getRango(newValue), 'cascada_rango');

                hot.setCellMeta(visualRow, colIndex, 'className', 'highlight-flash');
                hot.render();

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
    else if (message.type === 'MOVER_EJECUTIVO') {
        const { log, node_id, parent_id, position } = message;

        const tree = $('#arbol_ejecutivos').jstree(true);
        tree.move_node(node_id, parent_id, position, function () {
            createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
            flashTreeNode(node_id);
        });
    }
    else if (message.type === 'RENOMBRAR_EJECUTIVO') {
        const { log, node_id, value } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);

        // 1. LOCK: Prevent this change from triggering the "rename_node" event listener below
        isTreeExternalAction = true;

        // 2. ACTION: Update the tree
        tree.rename_node(node_id, value);

        // 3. UNLOCK
        isTreeExternalAction = false;

        // 4. VISUALS
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        flashTreeNode(node_id);
    }
    else if (message.type === 'CREAR_EJECUTIVO') {
        const { log, node_id, parent_id, text, node_type } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);

        isTreeExternalAction = true;
        tree.create_node(parent_id, { id: node_id, text: text, type: node_type });
        isTreeExternalAction = false;

        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        flashTreeNode(node_id);
    }
    else if (message.type === 'ELIMINAR_EJECUTIVO') {
        const { log, node_id } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);

        window.isTreeExternalAction = true;
        tree.delete_node(node_id);
        window.isTreeExternalAction = false;

        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
    }
};

function flashTreeNode(nodeId) {
    const tree = $('#arbol_ejecutivos').jstree(true);

    // get_node(id, true) returns the DOM element (<li>)
    const nodeElement = tree.get_node(nodeId, true);

    if (nodeElement) {
        // Add class to the <li> wrapper
        nodeElement.addClass('highlight-tree-flash');

        // Remove it after 2 seconds
        setTimeout(() => {
            nodeElement.removeClass('highlight-tree-flash');
        }, 2000);
    }
}