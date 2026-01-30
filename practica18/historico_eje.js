var tableSchema2 = [];
var tableData2 = [];
var hot2;

/**
 * FIXED: Combined AJAX logic to handle both inserting and fetching
 * Pointing to historico_ejecutivos.php
 */
function ajaxHistorico(name, type, action, dat = null) {
    let requestData = { action: action };

    // Merge data (e.g., { id_eje: 123 } or { res: 'Sys', mov: '...', ... })
    if (dat) {
        requestData = { ...requestData, ...dat };
    }

    $.ajax({
        url: "historico_ejecutivos.php", // Updated backend file
        type: type,
        data: requestData,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                // If fetching (Read), update table
                if (action === "obtener") {
                    tableSchema2 = response.schema;
                    tableData2 = response.data;
                    initializeDynamicTable2(); // Render Handsontable
                }
                // If inserting (Create), just log success
                else {
                    console.log("Log guardado exitosamente");
                }
            } else {
                console.error('Error Backend:', response.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
}

/**
 * Renders or Updates the History Table
 * Container ID remains 'historico_citas' based on your HTML, 
 * even though it displays Executives.
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
        readOnly: true // History is read-only
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
            height: '100%', // Fills the modal container
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

/**
 * Fetches history. 
 * Optional: filter_id to get history for a specific Executive.
 */
function obtenerHistorico(filter_id = null) {
    const params = filter_id ? { id_eje: filter_id } : null;
    ajaxHistorico("historico_ejecutivos.php", "GET", "obtener", params);
}

/**
 * Inserts a new log entry.
 */
function insertIntoHistorico(data) {
    // data must contain: res, mov, des, id_eje
    ajaxHistorico("historico_ejecutivos.php", "POST", 'insertar', data);
}

/**
 * Shows the modal and loads data.
 * Tries to detect the selected row in the Main Table ('hot') 
 * to show specific history.
 */
function mostrarHistorico() {
    let selectedId = null;

    // Check if the main table 'hot' exists and has a selection
    if (typeof hot !== 'undefined') {
        const selected = hot.getSelected();
        if (selected && selected.length > 0) {
            // Get the row index of the selection
            const rowIndex = selected[0][0];

            // Look for 'id_eje' column index in the main table schema
            // (Assuming 'tableSchema' is global from handson.js)
            if (typeof tableSchema !== 'undefined') {
                const colData = tableSchema.map(c => c.data);
                const idColIndex = colData.indexOf('id_eje');

                if (idColIndex > -1) {
                    selectedId = hot.getDataAtCell(rowIndex, idColIndex);
                }
            }
        }
    }

    // Load data (filtered by ID if found, otherwise load all)
    obtenerHistorico(selectedId);

    // Show Modal
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.remove("hidden");

    // Refresh layout after showing (fixes render issues in hidden divs)
    setTimeout(() => {
        if (hot2) hot2.render();
    }, 100);
}

function esconder() {
    const modal = document.querySelector(".container_historico");
    if (modal) modal.classList.add("hidden");
}


/**
 * Generates a structured object for the history log.
 * Adapted for Executives (uses id_eje).
 */
function createElementHistorico(usuario, movimiento, id_eje_val, campo, oldValue, newValue) {
    // Standardize null/empty displays for the description
    const oldValLog = (oldValue === null || oldValue === "") ? "Vacio" : oldValue;
    const newValLog = (newValue === null || newValue === "") ? "Vacio" : newValue;

    // Build a clean, readable description
    const descripcion = `${movimiento}: El campo '${campo}' cambió de "${oldValLog}" a "${newValLog}"`;

    return {
        res: usuario || 'Sistema',
        mov: movimiento,
        des: descripcion,
        id_eje: id_eje_val, // Matches PHP $_REQUEST['id_eje']
    };
}