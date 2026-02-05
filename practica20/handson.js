let datos = [];
var hot;
let maps = {};

var tableSchema = [];
var tableData = [];

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
                if (typeof mostrarHistorico === "function") mostrarHistorico();
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

function guardarCambio(row, campo, oldValue, value, id) {
    $.ajax({
        url: 'administrar-ejecutivo.php',
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
                const element = createElementHistorico('Sistema', 'modificar', id, campo, oldValue, value);

                socket.send(JSON.stringify({
                    type: 'MODIFICAR_USUARIO',
                    id_cita: id,
                    campo: campo,
                    valor: value,
                    log: "Se asignó valor: " + value + " a " + campo
                }));

                insertIntoHistorico(element);

            } else {
                console.log("error:", response);
            }
        }
    });
}

function eliminar(id) {
    ajaxGeneric("administrar-ejecutivo.php", "POST", { action: "eliminar", id_cita: id })
    socket.send(JSON.stringify({
        usuario: user,
        row: rowIndex,
        type: 'ELIMINAR_USUARIO',
        id_cita: id,
        log: "Se eliminó la cita con id: " + id
    }));
}

function crearRegistroVacio(row, colIndex, prop, oldValue, newValue) {
    $.ajax({
        url: "administrar-ejecutivo.php",
        type: "POST",
        data: { action: "agregar_vacio" },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.new_id) {

                    socket.send(JSON.stringify({
                        type: 'AGREGAR_USUARIO',
                        row: row,
                        id_cita: colIndex,
                        new_id: response.new_id,
                        log: "Se agregó una cita con id: " + response.new_id
                    }));

                    guardarCambio(row, prop, oldValue, newValue, response.new_id);

                    const element = createElementHistorico('Sistema', "agregar", response.new_id, prop, oldValue, newValue);
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
    ajax("administrar-ejecutivo.php");
}

function ajax(name) {
    $.ajax({
        url: name,
        type: 'GET',
        data: { action: 'obtener' },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                tableSchema = response.schema;
                tableData = response.data;
                maps = response.maps;

                initializeDynamicTable();

                hot.alter('insert_row_above', 0, 1);
            } else {
                alert('Error al cargar datos: ' + response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Fallo la llamada AJAX:", textStatus, errorThrown);
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
                const element = createElementHistorico('Sistema', data.action, data.id_cita, "ejecutivo", "visible", "eliminado");
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
                    if (typeof mostrarHistorico === "function") mostrarHistorico();
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
            if (!changes || source === 'loadData' || source === 'poblar_id') return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (oldValue === newValue) return;

                const elements = tableSchema.map(col => col.data);

                const index_id = elements.indexOf('id_eje');
                const id = hot.getDataAtCell(row, index_id);

                if (id == null || id === "") {
                    crearRegistroVacio(row, index_id, prop, oldValue, newValue);
                } else {
                    guardarCambio(row, prop, oldValue, newValue, id);
                }
            });
        },
        beforeRemoveRow: function (index, amount, physicalRows) {
            if (isExternalAction) return;
            const elements = tableSchema.map(col => col.data);
            physicalRows.forEach(rowIndex => {
                const id_col = elements.indexOf('id_eje');
                const id = hot.getDataAtCell(rowIndex, id_col);
                if (id) eliminar(id);
            });
        },
    });
}

const searchField = document.getElementById('search_field');
if (searchField) {
    searchField.addEventListener('keyup', function (event) {
        const searchPlugin = hot.getPlugin('search');
        const queryResult = searchPlugin.query(this.value);
        hot.render();
    });
}

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

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'MODIFICAR_USUARIO') {
        const { id_cita, campo, valor, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(row => row.id_eje == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);

            if (visualRow !== null && visualRow !== -1) {
                const colIndex = hot.propToCol(campo);

                hot.setCellMeta(visualRow, colIndex, 'className', 'highlight-flash');
                hot.render();

                hot.setDataAtCell(visualRow, colIndex, valor, 'loadData');

                setTimeout(() => {
                    const currentVisualRow = hot.toVisualRow(sourceIndex);
                    if (currentVisualRow !== null && currentVisualRow !== -1) {
                        hot.removeCellMeta(currentVisualRow, colIndex, 'className');
                        hot.render();
                    }
                }, 2000);
            }
        }
    } else if (message.type === 'AGREGAR_USUARIO') {
        const { row, id_cita, new_id, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        hot.setDataAtCell(row, id_cita, new_id, 'poblar_id');
        hot.alter('insert_row_above', 0, 1);
        callAjaxTemplate();
    }
    else if (message.type === "ELIMINAR_USUARIO") {
        const { usuario, row, type, log } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.alter('remove_row', row);
        callAjaxTemplate();
    } else if (message.type === 'MOVER_EJECUTIVO'){
        const { log, node_id, parent_id, position } = message;
        
        const tree = $('#arbol_ejecutivos').jstree(true);
        tree.move_node(node_id, parent_id, position, function () {
            createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        });
    }
};