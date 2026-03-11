var tableSchema_eliminadas = [];
var tableData_eliminadas = [];
var hot_eliminadas;

async function ajaxEliminadas(name, type, action, dat = null) {
    let requestData = { action: action };
    if (dat) {
        requestData = { ...requestData, ...dat };
    }

    $.ajax({
        url: name,
        type: type,
        data: requestData,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (action === "obtener_eliminada") {
                    tableSchema_eliminadas = response.schema;
                    tableData_eliminadas = response.data;
                    initializeDynamicTableEliminadas();
                }
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (textStatus, errorThrown) {
            console.error(textStatus, errorThrown);
        }
    });
}

async function initializeDynamicTableEliminadas() {
    const container = document.getElementById('tabla_eliminadas_content');
    if (!container) return;

    const dynamicHeaders = tableSchema_eliminadas.map(col => col.title);
    const dynamicColumns = tableSchema_eliminadas.map(col => ({
        ...col,
        readOnly: true
    }));

    const menuConfig = {
        items: {
            "deshacer_eliminacion": {
                name: "Deshacer eliminación",
                callback: function(key, selection) {
                    if (selection && selection.length > 0) {
                        const rowIndex = selection[0].start.row;
                        deshacerEliminacion(rowIndex);
                    }
                }
            }
        }
    };

    if (hot_eliminadas) {
        hot_eliminadas.updateSettings({
            columns: dynamicColumns,
            colHeaders: dynamicHeaders,
            data: tableData_eliminadas,
            contextMenu: menuConfig
        });
        setTimeout(() => hot_eliminadas.render(), 100);
    } else {
        hot_eliminadas = new Handsontable(container, {
            data: tableData_eliminadas,
            colHeaders: dynamicHeaders,
            columns: dynamicColumns,
            width: '100%',
            height: '400px', 
            themeName: 'ht-theme-main-dark-auto',
            autoColumnSize: true,
            rowHeaders: true,
            filters: true,
            dropdownMenu: true,
            contextMenu: menuConfig,
            licenseKey: 'non-commercial-and-evaluation'
        });
        setTimeout(() => hot_eliminadas.render(), 100);
    }
}

function deshacerEliminacion(rowIndex) {
    const row = tableData_eliminadas[rowIndex];
    if (row) {
        console.log("Restaurando fila:", row);
    }

    ajaxEliminadas("administrar-cita.php", "POST", 'restaurar', { id_cita: row.id_cita });
    hot_eliminadas.alter('remove_row', rowIndex);
    
    socket.send(JSON.stringify({
        usuario: user,
        row: rowIndex,
        type: 'RESTAURAR_CITA',
        id_cita: row.id_cita,
        log: "Se restauró la cita con id: " + row.id_cita + " por el usuario " + user
    }));
}

function obtenerEliminadas() {
    ajaxEliminadas("eliminadas.php", "POST", "obtener_eliminada");
}

function insertIntoEliminadas(data) {
    ajaxEliminadas("eliminadas.php", "POST", 'insertar', data);
}

function mostrarEliminadas() {
    const modal = document.querySelector(".container_eliminadas");
    if (modal) modal.classList.remove("hidden");
    obtenerEliminadas();
}

async function abrirModalEliminadas() {
    return new Promise((resolve) => {
        $.ajax({
            url: "administrar-cita.php",
            type: "GET",
            data: { action: "obtener_eliminada" },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const dialog = document.getElementById('eliminadasDialog');
                    if (dialog) dialog.show();
                    tableSchema_eliminadas = response.schema;
                    tableData_eliminadas = response.data;
                    initializeDynamicTableEliminadas();
                }
                resolve();
            },
            error: function (textStatus, errorThrown) {
                console.error(textStatus, errorThrown);
                const dialog = document.getElementById('eliminadasDialog');
                if (dialog) dialog.show();
                resolve();
            }
        });
    });
}