let datos = [];
var hot;
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let tableSchema = [];
let tableData = [];
let ejecutivoFullMap = {};

// Configurations
let cellCommentsConfig = [];
let cellStylesCache = [];
let localCommentCache = {}; // Local cache for change detection

let currentViewId = null;
let currentViewScope = null;
let treeRenamed = false;

const socket = new WebSocket(SOCKET_URL);
const user = generateID(10);
let isExternalAction = false;
let isTableLoading = false;

let comentarios = [];

const contextMenuSettings = {
    items: {
        row_above: { name: 'Insertar columna arriba' },
        sp1: '---------',
        row_below: { name: 'Insertar columna abajo' },
        sp1: '---------',
        remove_row: { name: 'Eliminar' },
        "commentsAddEdit": { name: 'Agregar/Editar comentario' },
        "commentsRemove": { name: 'Eliminar comentario' },
        "historico_cambios": {
            name: "Histórico de cambios",
            callback: function (key, selection, clickEvent) {
                if (typeof mostrarHistorico === 'function') mostrarHistorico();
            }
        },
        "sp2": '---------',
        "color_picker": {
            name: '🎨 Pintar Celda',
            submenu: {
                items: [
                    {
                        key: 'color_picker:green',
                        name: '🟢 Verde (Aprobado)',
                        callback: function (key, selection) {
                            const coords = selection[0];
                            applyColorChange(coords.start.row, coords.start.col, 'cell-green');
                        }
                    },
                    {
                        key: 'color_picker:yellow',
                        name: '🟡 Amarillo (Pendiente)',
                        callback: function (key, selection) {
                            const coords = selection[0];
                            applyColorChange(coords.start.row, coords.start.col, 'cell-yellow');
                        }
                    },
                    {
                        key: 'color_picker:red',
                        name: '🔴 Rojo (Urgente)',
                        callback: function (key, selection) {
                            const coords = selection[0];
                            applyColorChange(coords.start.row, coords.start.col, 'cell-red');
                        }
                    },
                    {
                        key: 'color_picker:clear',
                        name: '❌ Limpiar Color',
                        callback: function (key, selection) {
                            const coords = selection[0];
                            applyColorChange(coords.start.row, coords.start.col, 'clear');
                        }
                    }
                ]
            }
        }
    },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

// ==========================================
// CORE OPERATIONS (AJAX + SOCKET)
// ==========================================

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

                // Note: We don't reload here to prevent UX jitter, we trust the local update
            } else {
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
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
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
            }
        }
    });
}

// ==========================================
// COMMENT & STYLE LOGIC
// ==========================================

function verificarExistenciaComentario(campo, id) {
    var resultado = false;
    $.ajax({
        url: 'administrar-comentarios.php',
        type: 'POST',
        async: false,
        data: {
            action: 'validar',
            id_cita: id,
            id_row: campo
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                resultado = true;
            }
        }
    });
    return resultado;
}

function verificarCambioComentario(row, col, newValue) {
    const key = `${row}_${col}`;

    // Normalize new value (Object, Null, or String -> String)
    let cleanNew = (typeof newValue === 'object' && newValue !== null) ? newValue.value : newValue;
    cleanNew = (cleanNew === null || cleanNew === undefined) ? "" : cleanNew.toString();

    // Get Old Value (undefined -> "")
    let cleanOld = localCommentCache[key];
    cleanOld = (cleanOld === null || cleanOld === undefined) ? "" : cleanOld.toString();

    // Compare
    if (cleanNew === cleanOld) {
        return false; // No Change
    }

    // Update Cache
    localCommentCache[key] = cleanNew;
    return true; // Changed
}

function obtenerComentarios() {
    let rawComments = [];
    $.ajax({
        url: "administrar-comentarios.php",
        type: 'GET',
        async: false,
        data: { action: 'obtener' },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                rawComments = response.data;
            }
        }
    });
    return rawComments;
}

function poblarComentariosHandsontable(rawComments) {
    cellCommentsConfig = [];
    localCommentCache = {}; // Reset

    if (!tableData || tableData.length === 0) return;

    rawComments.forEach(dbComment => {
        const rowIndex = tableData.findIndex(row => row.id_cita == dbComment.row);
        const colIndex = tableSchema.findIndex(col => col.data === dbComment.col);

        if (rowIndex !== -1 && colIndex !== -1) {
            cellCommentsConfig.push({
                row: rowIndex,
                col: colIndex,
                comment: { value: dbComment.comment }
            });
            localCommentCache[`${rowIndex}_${colIndex}`] = dbComment.comment;
        }
    });
}

function obtenerEstilos(callback) {
    $.ajax({
        url: "administrar-estilos.php",
        type: 'GET',
        data: { action: 'obtener_estilos' },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                poblarEstilosHandsontable(response.data);
            }
            if (typeof callback === 'function') callback();
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}

function poblarEstilosHandsontable(styleData) {
    cellStylesCache = []; // Reset
    if (!tableData || tableData.length === 0) return;

    styleData.forEach(item => {
        const rowIndex = tableData.findIndex(row => row.id_cita == item.id_cita);
        const colIndex = tableSchema.findIndex(col => col.data === item.id_col);

        if (rowIndex !== -1 && colIndex !== -1) {
            cellStylesCache.push({
                row: rowIndex,
                col: colIndex,
                className: item.class
            });
        }
    });
}

function applyColorChange(row, col, colorClass) {
    const id_cita = hot.getDataAtRowProp(row, 'id_cita');
    const prop = hot.colToProp(col);

    if (!id_cita) return;

    // Local Visual Update
    hot.setCellMeta(row, col, 'className', colorClass);
    hot.render();

    // Database Update
    $.ajax({
        url: 'administrar-estilos.php',
        type: 'POST',
        data: {
            action: 'guardar_estilo',
            id_cita: id_cita,
            id_col: prop,
            class: colorClass
        }
    });

    // Socket Broadcast
    socket.send(JSON.stringify({
        type: 'PINTAR_CELDA',
        id_cita: id_cita,
        col_prop: prop,
        color_class: colorClass,
        log: "Celda pintada por " + user
    }));
}

// ==========================================
// MAIN LOADING LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const btnFilter = document.getElementById('btnFilterDate');
    if (btnFilter) {
        btnFilter.addEventListener('click', function () {
            if (currentViewId) {
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

    currentViewId = id;
    currentViewScope = scope;

    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const startDate = startInput ? startInput.value : '';
    const endDate = endInput ? endInput.value : '';

    const url = "administrar-cita.php";
    let action = "";
    let requestData = { startDate: startDate, endDate: endDate };

    if (scope === 'arbol') { action = "obtener_modificado"; requestData.action = action; requestData.id_arbol = id; }
    else if (scope === 'plantel') { action = "obtener_by_plantel"; requestData.action = action; requestData.id_arbol = id; }
    else { action = "obtener_eje"; requestData.action = action; requestData.id_eje = id; }

    $.ajax({
        url: url,
        type: 'GET',
        data: requestData,
        dataType: 'json',
        success: function (response) {
            isTableLoading = true;
            if (response.success) {
                tableSchema = response.schema;
                tableData = processData(response.data);

                if (response.ejecutivoMap) {
                    ejecutivoFullMap = response.ejecutivoMap;
                }

                // 1. Process Comments (Sync)
                const rawComments = obtenerComentarios();
                poblarComentariosHandsontable(rawComments);

                // 2. Process Styles (Async Chain)
                obtenerEstilos(function () {
                    // Only initialize after styles are ready
                    initializeDynamicTable();

                    if (hot) {
                        hot.alter('insert_row_above', 0, 1);
                    }

                    setTimeout(() => {
                        isTableLoading = false;
                    }, 150);
                });

            } else {
                alert('Error al cargar datos: ' + response.message);
                isTableLoading = false;
            }
        },
        error: function () {
            isTableLoading = false;
        }
    });
}

function initializeDynamicTable() {
    const container = document.getElementById('citas');

    if (hot) {
        hot.destroy();
        hot = null;
    }
    container.innerHTML = '';

    if (!tableData || tableData.length === 0) {
        container.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100 text-muted p-5">
                <span class="material-icons" style="font-size: 48px; color: #ccc;">touch_app</span>
                <h4 class="mt-3">Sin Resultados</h4>
                <p>Seleccione una burbuja o ajuste el filtro de fechas.</p>
            </div>`;
        return;
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

    // Merge Configs
    const combinedCellConfig = [...cellCommentsConfig, ...cellStylesCache];

    hot = new Handsontable(container, {
        data: tableData,
        colHeaders: dynamicHeaders,
        columns: dynamicColumns,
        cell: combinedCellConfig,
        themeName: 'ht-theme-main-dark-auto',
        autoColumnSize: { useHeaders: true },
        autoRowSize: true,
        rowHeaders: true,
        filters: true,
        comments: true,
        dropdownMenu: true,
        contextMenu: contextMenuSettings,
        search: true,
        licenseKey: 'non-commercial-and-evaluation',

        afterChange: function (changes, source) {
            if (isTableLoading) return;
            if (!changes || source === 'loadData' || source === 'cascada_telefono' || source === 'cascada_nombre' || source === 'poblar_id' || source === 'cascada_rango') return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (oldValue == newValue) return;

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
            if (isExternalAction || isTableLoading) return;
            const elements = tableSchema.map(col => col.data);
            physicalRows.forEach(rowIndex => {
                const id_col = elements.indexOf('id_cita');
                const id = hot.getDataAtCell(rowIndex, id_col);
                if (id) eliminar(id, rowIndex);
            });
        }
    });

    // Add Hook AFTER initialization to prevent startup errors
    hot.addHook('afterSetCellMeta', function (row, col, key, value) {
        if (isExternalAction || isTableLoading) return;

        if (key === 'comment') {
            // Check for actual change (Strict Check)
            if (!verificarCambioComentario(row, col, value)) {
                return;
            }

            const prop = hot.colToProp(col);
            const id_cita = hot.getDataAtRowProp(row, 'id_cita');

            if (!id_cita) return;

            if (!value) {
                // DELETE
                $.ajax({
                    url: 'administrar-comentarios.php',
                    type: 'POST',
                    data: { action: 'eliminar', id_cita: id_cita, id_row: prop }
                });

                socket.send(JSON.stringify({
                    type: 'COMENTARIO',
                    row: row, col: col, comment: null, id_cita: id_cita,
                    log: "Comentario eliminado"
                }));

            } else {
                // ADD / UPDATE
                let commentText = (typeof value === 'object') ? value.value : value;

                // Double check existence (optional, or rely on Upsert logic in PHP if added later)
                let exists = verificarExistenciaComentario(prop, id_cita);
                let action = exists ? 'modificar' : 'agregar';

                $.ajax({
                    url: 'administrar-comentarios.php',
                    type: 'POST',
                    data: {
                        action: action,
                        id_cita: id_cita,
                        id_row: prop,
                        comentario: commentText
                    }
                });

                socket.send(JSON.stringify({
                    type: 'COMENTARIO',
                    row: row, col: col,
                    comment: { value: commentText },
                    id_cita: id_cita,
                    log: "Comentario " + action
                }));
            }
        }
    });
}

// ==========================================
// SOCKET LISTENERS
// ==========================================

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
                        hot.removeCellMeta(visualRow, colIndex, 'className');
                        hot.render();
                    }, 1000);
                }
            }
        }

    } else if (message.type === 'AGREGAR_USUARIO') {
        const { row, id_cita, new_id, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.setDataAtCell(row, id_cita, new_id, 'poblar_id');
        hot.alter('insert_row_above', 0, 1);
        if (currentViewId) cargarCitasFiltradas(currentViewId, currentViewScope);

    } else if (message.type === "ELIMINAR_USUARIO") {
        const { usuario, row, type, log } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.alter('remove_row', row);
        if (currentViewId) cargarCitasFiltradas(currentViewId, currentViewScope);
        isExternalAction = false;

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
                        hot.removeCellMeta(visualRow, colTel, 'className');
                        hot.removeCellMeta(visualRow, colName, 'className');
                        hot.render();
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
                    hot.removeCellMeta(visualRow, colIndex, 'className');
                    hot.render();
                }, 2000);
            }
        }
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

    } else if (message.type === 'COMENTARIO') {
        const { row, col, comment, log, id_cita } = message;
        isExternalAction = true;

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(r => r.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);
            if (visualRow !== null && visualRow !== -1) {
                const plugin = hot.getPlugin('comments');
                if (comment) {
                    plugin.setCommentAtCell(visualRow, col, comment.value);
                    localCommentCache[`${visualRow}_${col}`] = comment.value;
                } else {
                    plugin.removeCommentAtCell(visualRow, col);
                    localCommentCache[`${visualRow}_${col}`] = "";
                }
                hot.setCellMeta(visualRow, col, 'className', 'highlight-flash');
                hot.render();
                setTimeout(() => {
                    hot.removeCellMeta(visualRow, col, 'className');
                    hot.render();
                }, 1000);
            }
        }
        isExternalAction = false;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

    } else if (message.type === 'PINTAR_CELDA') {
        const { id_cita, col_prop, color_class, log } = message;
        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(r => r.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);
            const colIndex = hot.propToCol(col_prop);

            if (visualRow !== null && visualRow !== -1 && colIndex !== null) {
                const classToApply = (color_class === 'clear') ? '' : color_class;

                hot.setCellMeta(visualRow, colIndex, 'className', classToApply);

                // Add Flash Effect (append class)
                const flashClass = classToApply + ' paint-flash';
                hot.setCellMeta(visualRow, colIndex, 'className', flashClass);
                hot.render();

                setTimeout(() => {
                    // Revert to stable class
                    hot.setCellMeta(visualRow, colIndex, 'className', classToApply);
                    hot.render();
                }, 1000);
            }
        }
        createDialog("messageDialogo", "dialogMessage2", log);
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
        isTreeExternalAction = true;
        tree.rename_node(node_id, value);
        isTreeExternalAction = false;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        flashTreeNode(node_id);
    }
    else if (message.type === 'CREAR_EJECUTIVO') {
        const { log, node_id, parent_id, text, node_type } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);
        isTreeExternalAction = true;
        tree.create_node(parent_id, { id: node_id, text: text, type: node_type });
        isTreeExternalAction = false;
        tree.refresh();
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        flashTreeNode(node_id);
    }
    else if (message.type === 'ELIMINAR_EJECUTIVO') {
        const { log, node_id } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);
        isTreeExternalAction = true;
        tree.delete_node(node_id);
        isTreeExternalAction = false;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
    }
};

function flashTreeNode(nodeId) {
    const tree = $('#arbol_ejecutivos').jstree(true);
    const nodeElement = tree.get_node(nodeId, true);
    if (nodeElement) {
        nodeElement.addClass('highlight-tree-flash');
        setTimeout(() => {
            nodeElement.removeClass('highlight-tree-flash');
        }, 2000);
    }
}