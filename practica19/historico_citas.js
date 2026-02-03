var tableSchema2 = [];
var tableData2 = [];
var hot2;

function ajaxHistorico(name, type, action, dat = null) {
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
                if (action === "obtener") {
                    tableSchema2 = response.schema;
                    tableData2 = response.data;
                    initializeDynamicTable2();
                } else {
                    console.log("Log saved locally");
                }
            } else {
                console.error('Error Historico: ' + response.message);
            }
        }
    });
}

function initializeDynamicTable2() {
    const container = document.getElementById('historico_citas');
    if (!container) return;

    const dynamicHeaders = tableSchema2.map(col => col.title);
    const dynamicColumns = tableSchema2.map(col => ({
        ...col,
        readOnly: true
    }));

    if (hot2) {
        hot2.updateSettings({ columns: dynamicColumns, colHeaders: dynamicHeaders, data: tableData2 });
    } else {
        hot2 = new Handsontable(container, {
            data: tableData2,
            colHeaders: dynamicHeaders,
            columns: dynamicColumns,
            width: '100%',
            height: '400px',
            themeName: 'ht-theme-main-dark-auto',
            autoColumnSize: true,
            rowHeaders: true,
            filters: true,
            dropdownMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
        });
    }
}

function obtenerHistorico() {
    ajaxHistorico("historico.php", "GET", "obtener");
}

function insertIntoHistorico(data) {
    // 1. Save to DB
    ajaxHistorico("historico.php", "POST", 'insertar', data);

    // 2. Broadcast via Socket
    if (window.globalSocket && window.globalSocket.readyState === WebSocket.OPEN) {
        const payload = {
            action: 'notification', // Tells receiver to just show a message
            message: data.des,      // The text to display
            user: data.res
        };
        window.globalSocket.send(JSON.stringify(payload));
    }

    // 3. Show Local Toast immediately
    if (typeof window.showBlueToast === 'function') {
        window.showBlueToast(data.des);
    }
}

function mostrarHistorico() {
    obtenerHistorico();
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.remove("hidden");
}

function esconder() {
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.add("hidden");
}

function createElementHistorico(usuario, movimiento, id_cita, campo, oldValue, newValue) {
    const oldValLog = (oldValue === null || oldValue === "") ? "Vacio" : oldValue;
    const newValLog = (newValue === null || newValue === "") ? "Vacio" : newValue;
    const descripcion = `${movimiento}: El campo '${campo}' cambió de "${oldValLog}" a "${newValLog}"`;

    return {
        res: usuario || 'Sistema',
        mov: movimiento,
        des: descripcion,
        id_cit: id_cita,
    };
}