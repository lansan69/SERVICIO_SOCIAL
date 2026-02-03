var tableSchema2 = [];
var tableData2 = [];
var hot2;

/**
 * FIXED: Combined AJAX logic to handle both inserting and fetching
 */
function ajaxHistorico(name, type, action, dat = null) {
    console.log(action);
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
                // IMPORTANT: If we are fetching, update variables and RENDER
                if (action === "obtener") {
                    tableSchema2 = response.schema;
                    tableData2 = response.data;
                    initializeDynamicTable2(); // Trigger rendering
                }
                else {
                    console.log("Log guardado exitosamente");
                }
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}

/**
 * Renders or Updates the History Table
 */
function initializeDynamicTable2() {
    const container = document.getElementById('historico_citas');
    if (!container) {
        console.error("Contenedor 'historico_citas' no encontrado en el DOM");
        return;
    }

    const dynamicHeaders = tableSchema2.map(col => col.title);
    const dynamicColumns = tableSchema2.map(col => ({
        ...col,
        readOnly: true // History should usually be read-only
    }));

    if (hot2) {
        // Update existing instance
        hot2.updateSettings({
            columns: dynamicColumns,
            colHeaders: dynamicHeaders,
            data: tableData2
        });
    } else {
        // Create new instance
        hot2 = new Handsontable(container, {
            data: tableData2,
            colHeaders: dynamicHeaders,
            columns: dynamicColumns,
            width: '100%',
            height: '400px', // Set a height for visibility in modals
            themeName: 'ht-theme-main-dark-auto',
            autoColumnSize: true,
            rowHeaders: true,
            filters: true,
            dropdownMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
        });
    }
}

// --- Trigger Functions ---

function obtenerHistorico() {
    ajaxHistorico("historico.php", "GET", "obtener");
}

function insertIntoHistorico(data) {
    console.log(data);
    ajaxHistorico("historico.php", "POST", 'insertar', data);
    socket.send(JSON.stringify(data));
    showBlueToast(data.descripcion)
}

function mostrarHistorico() {
    obtenerHistorico(); // This now triggers initializeDynamicTable2 automatically
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.remove("hidden");
}

function esconder() {
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.add("hidden");
}


/**
 * Generates a structured object for the history log.
 * @param {string} usuario - Who made the change.
 * @param {string} movimiento - Type of action (e.g., 'Edición', 'Eliminación').
 * @param {number|string} id_cita - ID of the record.
 * @param {string} campo - The column name modified.
 * @param {any} oldValue - Previous value.
 * @param {any} newValue - New value.

 */
function createElementHistorico(usuario, movimiento, id_cita, campo, oldValue, newValue) {
    // Standardize null/empty displays for the description
    const oldValLog = (oldValue === null || oldValue === "") ? "Vacio" : oldValue;
    const newValLog = (newValue === null || newValue === "") ? "Vacio" : newValue;

    // Build a clean, readable description
    const descripcion = `${movimiento}: El campo '${campo}' cambió de "${oldValLog}" a "${newValLog}"`;
    
    return {
        res: usuario || 'Sistema',
        mov: movimiento,
        des: descripcion,
        id_cit: id_cita,
    };
}