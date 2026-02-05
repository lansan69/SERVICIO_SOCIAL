// Variable global para los datos
let datos = [];
var hot; // Variable global para la instancia de Handsontable
let maps = {}; // Stores Plantel and Padre maps from backend

var tableSchema = [];        // Stores column definitions
var tableData = [];          // Stores the actual rows

const socket = new WebSocket('wss://socket.ahjende.com/wss/?encoding=text');
const user = generateID(10);

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
                alert("called");
            }
        }
    },
};

function generateID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        // Pick a random character from the 'chars' string
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function guardarCambio(row, campo, oldValue, value, id) {
    // Llamada AJAX para guardar cambio
    $.ajax({
        url: 'administrar-ejecutivo.php',
        type: 'POST',
        data: {
            action: 'modificar',
            campo: campo,  // e.g., 'nom_pla', 'estatus'
            valor: value,  // e.g., 'Campus Sur', 'Activo'
            id_cit: id     // Sending as id_cit to match PHP $_POST['id_cit']
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                // Log logic (assuming external functions exist)
                const element = createElementHistorico('Sistema', 'modificar', id, campo, oldValue, value);

                socket.send(JSON.stringify({
                    type: 'MODIFICAR_USUARIO',
                    id_cita: id,      // Unique record ID
                    campo: campo,     // Property name (e.g., 'nom_eje')
                    valor: value,      // The new data
                    log: "Se asignó valor: " + value + " a " + campo
                }));

                insertIntoHistorico(element);

                console.log('Registro actualizado');
            } else {
                console.log("error:", response);
                alert('Error: ' + response.message);
            }
        }
    });
}

function eliminar(id) {
    // Sends id_cita to match PHP $_POST['id_cita']
    ajaxGeneric("administrar-ejecutivo.php", "POST", { action: "eliminar", id_cita: id })
    socket.send(JSON.stringify({
        usuario: user,
        row: rowIndex,
        type: 'ELIMINAR_USUARIO',
        id_cita: id,      // Unique record ID
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
                        id_cita: id_cita,      // Unique record ID
                        new_id: response.new_id,
                        log: "Se agregó una cita con id: " + response.new_id
                    }));

                    // Immediately save the value the user just typed
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
            alert("ERROR de conexión.");
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
                maps = response.maps; // Store maps (plantel/padre) if needed for future logic

                initializeDynamicTable();

                // Add an empty row at top for new entries
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
    const container = document.getElementById('citas'); // Ensure your HTML ID matches this
    if (hot) {
        hot.destroy();
    }

    const dynamicHeaders = tableSchema.map(col => col.title);

    const dynamicColumns = tableSchema.map(col => {
        const columnConfig = {
            ...col,
            readOnly: col.readOnly || false
        };
        // Configure Dropdown specifics
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

                // 1. Find the ID column index based on Schema
                const elements = tableSchema.map(col => col.data);

                // IMPORTANT: Changed to 'id_eje' to match new DB schema
                const index_id = elements.indexOf('id_eje');
                const id = hot.getDataAtCell(row, index_id);

                // 2. Logic Handler
                if (id == null || id === "") {
                    // Create new record if ID is missing
                    crearRegistroVacio(row, index_id, prop, oldValue, newValue);
                } else {
                    // Update existing record
                    // Logic simplified: The Backend handles Name -> ID translation
                    guardarCambio(row, prop, oldValue, newValue, id);
                }
            });
        },
        beforeRemoveRow: function (index, amount, physicalRows) {
            const elements = tableSchema.map(col => col.data);
            physicalRows.forEach(rowIndex => {
                const id_col = elements.indexOf('id_eje'); // Changed to id_eje
                const id = hot.getDataAtCell(rowIndex, id_col);
                if (id) eliminar(id);
            });
        },
    });
}

// Search Functionality
const searchField = document.getElementById('search_field');
if (searchField) {
    searchField.addEventListener('keyup', function (event) {
        const searchPlugin = hot.getPlugin('search');
        const queryResult = searchPlugin.query(this.value);
        hot.render();
    });
}

// Iniciar la carga
callAjaxTemplate();

socket.onopen = function () {
    createDialog("myDialog", "dialogMessage", "✅ WebSocket conectado usuario: " + user);
};

function createDialog(id, message_id, message) {
    const dialog = document.getElementById(id);
    const dialogMessage = document.getElementById(message_id);

    // ✅ Set the message content
    dialogMessage.textContent = message;

    // ✅ Open the dialog (non-modal)
    dialog.show();

    // 🕒 Optional: Auto-close after 3 seconds
    setTimeout(() => {
        dialog.close();
    }, 2500);
}

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'MODIFICAR_USUARIO') {
        console.log(message);

        const { id_cita, campo, valor, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        // 1. Find the local row index using the record ID
        const rowData = hot.getSourceData();
        console.log(rowData);
        const rowIndex = rowData.findIndex(row => row.id_eje == id_cita);
        console.log(rowIndex);

        const visualRowIndex = hot.toVisualRow(sourceRowIndex);
        // 2. If the row exists on this client's screen, update it
        if (rowIndex !== -1 ) {
            // We use 'loadData' to avoid the infinite loop you identified!
            const colIndex = hot.propToCol(campo);
            console.log("params color", rowIndex, colIndex);
            hot.setCellMeta(rowIndex, colIndex, 'className', 'highlight-flash');
            hot.render();
            hot.setDataAtCell(rowIndex, hot.propToCol(campo), valor, 'loadData');

            setTimeout(() => {
                hot.removeCellMeta(rowIndex, colIndex, 'className');
                hot.render();

            }, 3000);
        }
    } else if (message.type === 'AGREGAR_USUARIO') {
        const { row, id_cita, new_id, log } = message;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        hot.setDataAtCell(row, id_cita, new_id, 'poblar_id');
        hot.alter('insert_row_above', 0, 1); //Insert new empty row above
    }
    else if (message.type === "ELIMINAR_USUARIO") {
        const { usuario, row, type, log } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        hot.alter('remove_row', row);
    }
    callAjaxTemplate();
};