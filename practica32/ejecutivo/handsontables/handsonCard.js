var tableSchema_card = [];
var tableData_card = [];
var hot_card;

async function ajaxCard(name, type, action, dat = null) {
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
                if (action === "obtener_card") {
                    tableSchema_card = response.schema;
                    tableData_card = response.data;
                    initializeDynamicTableCard();
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

async function initializeDynamicTableCard() {
    const container = document.getElementById('card-citas');
    if (!container) return;

    const dynamicHeaders = tableSchema_card.map(col => col.title);
    const dynamicColumns = tableSchema_card.map(col => ({
        ...col,
        readOnly: true
    }));

    if (hot_card) {
        hot_card.updateSettings({
            columns: dynamicColumns,
            colHeaders: dynamicHeaders,
            data: tableData_card
        });
        setTimeout(() => hot_card.render(), 100);
    } else {
        hot_card = new Handsontable(container, {
            data: tableData_card,
            colHeaders: dynamicHeaders,
            columns: dynamicColumns,
            width: '100%',
            height: '400px', 
            themeName: 'ht-theme-main-dark-auto',
            autoColumnSize: true,
            rowHeaders: true,
            filters: true,
            dropdownMenu: true,
            contextMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
        });
        setTimeout(() => hot_card.render(), 100);
    }
}

async function abrirModalCard(id_eje) {
    return new Promise((resolve) => {
        $.ajax({
            url: "citas/administrar-cita.php",
            type: "GET",
            data: { action: "obtener_eje", id_eje: id_eje },
            dataType: 'json',
            success: async function (response) {
                if (response.success) {
                    await mostrarCardEjecutivos();
                    poblarCardEjecutivo(response.ejecutivoMap[id_eje]);
                    tableSchema_card = response.schema;
                    tableData_card = response.data;
                    initializeDynamicTableCard();
                }
                resolve();
            },
            error: function (textStatus, errorThrown) {
                console.error(textStatus, errorThrown);
                resolve();
            }
        });
    });
}