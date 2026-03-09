let datos = [];

let embudoChartInstance = null; //grafico

var hot;
let ejecutivoTelefonoMap = {};
let ejecutivoName = {};
let tableSchema = [];
let tableData = [];
let ejecutivoFullMap = {};
let coloresFullMap = {};
let conteoEstados = {};

let conteoEstadosEfec = {};
let coloresFullMapEfec = {};

let cellCommentsConfig = [];
let cellStylesCache = [];
let localCommentCache = {};

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

function updateEmbudoTotals() {
    let totalCitas = 0;
    if (hot) {
        totalCitas = hot.getSourceData().filter(r => r.id_cita).length;
    } else if (tableData) {
        totalCitas = tableData.filter(r => r.id_cita).length;
    }

    let totalRegistros = 0;
    if (conteoEstados && conteoEstados["REGISTRO"]) {
        totalRegistros = conteoEstados["REGISTRO"].count;
    }

    let totalEfectivas = 0;
    if (conteoEstadosEfec && conteoEstadosEfec["CITA EFECTIVA"]) {
        totalEfectivas = conteoEstadosEfec["CITA EFECTIVA"].count;
    }

    const elTotalCitas = document.getElementById("embudo-data-total-citas");
    const elRegistros = document.getElementById("embudo-data-registros");
    const elEfectivas = document.getElementById("embudo-data-citas-efectivas");

    if (elTotalCitas) elTotalCitas.innerHTML = `<span class="fw-bold">Total Citas:</span> ${totalCitas} | 100%`;
    if (elRegistros) elRegistros.innerHTML = `<span class="fw-bold">Registros:</span> ${totalRegistros} | <span class="text-muted" style="font-size:0.9em">${((totalRegistros / (totalCitas + 0.000001)) * 100).toFixed(2)}% </span>`;
    if (elEfectivas) elEfectivas.innerHTML = `<span class="fw-bold">Efectivas:</span> ${totalEfectivas} | <span class="text-muted" style="font-size:0.9em">${((totalEfectivas / (totalCitas + 0.000001)) * 100).toFixed(2)}% </span>`;

    const ctx = document.getElementById('embudoChart');
    if (!ctx) return;

    const chartLabels = ['Total Citas', 'Registros', 'Efectivas'];
    const chartData = [totalCitas, totalRegistros, totalEfectivas];

    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)'
    ];
    const borderColors = [
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)'
    ];

    if (embudoChartInstance) {
        embudoChartInstance.data.datasets[0].data = chartData;
        embudoChartInstance.update('active');
    } else {
        embudoChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Cantidad',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let value = context.raw || 0;
                                let porcentajeTotal = (totalCitas > 0) ? ((value / totalCitas) * 100).toFixed(1) + '%' : '0%';
                                return `${context.formattedValue} (${porcentajeTotal} del total)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { display: false }
                    },
                    y: {
                        grid: { display: false }
                    }
                },
                animation: {
                    duration: 800
                }
            }
        });
    }
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
                    updateEmbudoTotals();
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

    let cleanNew = (typeof newValue === 'object' && newValue !== null) ? newValue.value : newValue;
    cleanNew = (cleanNew === null || cleanNew === undefined) ? "" : cleanNew.toString();

    let cleanOld = localCommentCache[key];
    cleanOld = (cleanOld === null || cleanOld === undefined) ? "" : cleanOld.toString();

    if (cleanNew === cleanOld) {
        return false;
    }

    localCommentCache[key] = cleanNew;
    return true;
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
    localCommentCache = {};

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
    cellStylesCache = [];
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

function renderConteoEstatus(conteoObject) {
    conteoEstados = conteoObject;
    const container = document.getElementById("conteo-estatus");

    container.innerHTML = "";

    if (!conteoObject || Object.keys(conteoObject).length === 0) {
        container.innerHTML = "<p>No hay datos disponibles.</p>";
        return;
    }

    const listContainer = document.createElement("div");

    listContainer.style.display = "flex";
    listContainer.style.flexWrap = "wrap";
    listContainer.style.gap = "10px";

    Object.values(conteoObject).forEach(status => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "status-item";
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.border = "1px solid #ccc";
        itemDiv.style.padding = "5px 10px";
        itemDiv.style.borderRadius = "5px";
        itemDiv.style.backgroundColor = "#f9f9f9";

        const colorBox = document.createElement("span");
        colorBox.style.display = "inline-block";
        colorBox.style.width = "15px";
        colorBox.style.height = "15px";
        colorBox.style.borderRadius = "50%";
        colorBox.style.backgroundColor = status.color;
        colorBox.style.marginRight = "8px";
        colorBox.style.border = "1px solid rgba(0,0,0,0.1)";

        const nameSpan = document.createElement("span");
        nameSpan.innerText = status.name;
        nameSpan.style.fontWeight = "bold";
        nameSpan.style.marginRight = "5px";
        nameSpan.style.fontSize = "12px";

        const countSpan = document.createElement("span");
        countSpan.innerText = `(${status.count})`;
        countSpan.style.fontSize = "12px";

        itemDiv.appendChild(colorBox);
        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(countSpan);

        listContainer.appendChild(itemDiv);
    });

    container.appendChild(listContainer);
}

function renderConteoEstatusEfectividad(conteoObject) {
    conteoEstadosEfec = conteoObject;
    const container = document.getElementById("conteo-estatus-efectividad");

    container.innerHTML = "";

    if (!conteoObject || Object.keys(conteoObject).length === 0) {
        container.innerHTML = "<p>No hay datos disponibles.</p>";
        return;
    }

    const listContainer = document.createElement("div");

    listContainer.style.display = "flex";
    listContainer.style.flexWrap = "wrap";
    listContainer.style.gap = "10px";

    Object.values(conteoObject).forEach(status => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "status-item";
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.border = "1px solid #ccc";
        itemDiv.style.padding = "5px 10px";
        itemDiv.style.borderRadius = "5px";
        itemDiv.style.backgroundColor = "#f9f9f9";

        const colorBox = document.createElement("span");
        colorBox.style.display = "inline-block";
        colorBox.style.width = "15px";
        colorBox.style.height = "15px";
        colorBox.style.borderRadius = "50%";
        colorBox.style.backgroundColor = status.color;
        colorBox.style.marginRight = "8px";
        colorBox.style.border = "1px solid rgba(0,0,0,0.1)";

        const nameSpan = document.createElement("span");
        nameSpan.innerText = status.name;
        nameSpan.style.fontWeight = "bold";
        nameSpan.style.marginRight = "5px";
        nameSpan.style.fontSize = "12px";

        const countSpan = document.createElement("span");
        countSpan.innerText = `(${status.count})`;
        countSpan.style.fontSize = "12px";

        itemDiv.appendChild(colorBox);
        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(countSpan);

        listContainer.appendChild(itemDiv);
    });

    container.appendChild(listContainer);
}

function applyColorChange(row, col, colorClass) {
    console.log("in applying color function");
    const id_cita = hot.getDataAtRowProp(row, 'id_cita');
    const prop = hot.colToProp(col);

    if (!id_cita) return;

    hot.setCellMeta(row, col, 'className', colorClass);
    hot.render();

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

    socket.send(JSON.stringify({
        type: 'PINTAR_CELDA',
        id_cita: id_cita,
        col_prop: prop,
        color_class: colorClass,
        log: "Celda pintada por " + user
    }));
}

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

cargarCitasFiltradas(1000, "padre");

function cargarCitasFiltradas(id, scope) {
    console.log("scope: ", scope);
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

    switch (scope) {
    case 'arbol':
        requestData.action = "obtener_modificado";
        requestData.id_arbol = id; 
        break;

    case 'plantel':
        requestData.action = "obtener_by_plantel";
        requestData.id_arbol = id; 
        break;

    default:
        requestData.action = "obtener_eje";
        requestData.id_eje = id;
        break;
}

    $.ajax({
        url: url,
        type: 'GET',
        data: requestData,
        dataType: 'json',
        success: function (response) {
            isTableLoading = true;
            if (response.success) {
                console.log(scope, response);
                tableSchema = response.schema;
                tableData = processData(response.data);

                if (response.ejecutivoMap) {
                    ejecutivoFullMap = response.ejecutivoMap;
                }

                if (response.coloresMap) {
                    coloresFullMap = response.coloresMap;
                }

                if (response.count_estado) {
                    renderConteoEstatus(response.count_estado);
                }
                else if (response.conteo_arbol) {
                    renderConteoEstatus(response.conteo_arbol);
                }

                if (response.coloresMapEfectividad) {
                    coloresFullMapEfec = response.coloresMapEfectividad
                }

                if (response.conteo_efectividad) {
                    renderConteoEstatusEfectividad(response.conteo_efectividad);
                } else if (response.conteo_arbol_efectividad){
                    renderConteoEstatusEfectividad(response.conteo_arbol_efectividad);
                }


                
                const rawComments = obtenerComentarios();
                poblarComentariosHandsontable(rawComments);
                
                obtenerEstilos(function () {
                    initializeDynamicTable();
                    
                    if (hot) {
                        hot.alter('insert_row_above', 0, 1);
                    }
                    
                    setTimeout(() => {
                        isTableLoading = false;
                        updateEmbudoTotals();
                    }, 150);
                });

            } else {
                alert('Error al cargar datos: ' + response.message);
                isTableLoading = false;
            }
        },
        error: function () {
            isTableLoading = false;
            console.error("Fallo al hacer consulta");
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

                if (prop == "efe_cit") {

                    applyColorChange(row, elements.indexOf(prop), coloresFullMapEfec[hot.getDataAtCell(row, prop)]);

                    if (conteoEstadosEfec) {
                        if (oldValue && conteoEstadosEfec[oldValue]) {
                            conteoEstadosEfec[oldValue].count = Math.max(0, conteoEstadosEfec[oldValue].count - 1);
                        }

                        if (newValue) {
                            if (conteoEstadosEfec[newValue]) {
                                conteoEstadosEfec[newValue].count++;
                            } else {
                                conteoEstadosEfec[newValue] = {
                                    name: newValue,
                                    color: coloresFullMapEfec[newValue],
                                    count: 1
                                };
                            }
                        }

                        renderConteoEstatusEfectividad(conteoEstadosEfec);
                        updateEmbudoTotals();
                    }
                }

                if (prop == "est_cit") {
                    applyColorChange(row, elements.indexOf(prop), coloresFullMap[hot.getDataAtCell(row, prop)]);

                    if (conteoEstados) {
                        if (oldValue && conteoEstados[oldValue]) {
                            conteoEstados[oldValue].count = Math.max(0, conteoEstados[oldValue].count - 1);
                        }

                        if (newValue) {
                            if (conteoEstados[newValue]) {
                                conteoEstados[newValue].count++;
                            } else {
                                conteoEstados[newValue] = {
                                    name: newValue,
                                    color: coloresFullMap[newValue],
                                    count: 1
                                };
                            }
                        }

                        renderConteoEstatus(conteoEstados);
                        updateEmbudoTotals();
                    }
                }

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
                    refreshTree();
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

    hot.addHook('afterSetCellMeta', function (row, col, key, value) {
        if (isExternalAction || isTableLoading) return;

        if (key === 'comment') {
            if (!verificarCambioComentario(row, col, value) && value) {
                return;
            }

            const prop = hot.colToProp(col);
            const id_cita = hot.getDataAtRowProp(row, 'id_cita');

            if (!id_cita) return;

            if (!value) {
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
                let commentText = (typeof value === 'object') ? value.value : value;

                let exists = verificarExistenciaComentario(prop, id_cita);
                let action = exists ? 'modificar' : 'agregar';
                let comment_aux = exists ? 'modificado' : 'agregado';

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
                    log: "Comentario " + comment_aux
                }));
            }
        }
    });
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
                    const oldValue = hot.getDataAtCell(visualRow, colIndex);

                    if (campo === 'est_cit' && conteoEstados) {
                        if (oldValue && conteoEstados[oldValue]) conteoEstados[oldValue].count = Math.max(0, conteoEstados[oldValue].count - 1);
                        if (valor) {
                            if (conteoEstados[valor]) conteoEstados[valor].count++;
                            else conteoEstados[valor] = { name: valor, color: coloresFullMap[valor] || '#000', count: 1 };
                        }
                        renderConteoEstatus(conteoEstados);
                        updateEmbudoTotals();
                    }

                    if (campo === 'efe_cit' && conteoEstadosEfec) {
                        if (oldValue && conteoEstadosEfec[oldValue]) conteoEstadosEfec[oldValue].count = Math.max(0, conteoEstadosEfec[oldValue].count - 1);
                        if (valor) {
                            if (conteoEstadosEfec[valor]) conteoEstadosEfec[valor].count++;
                            else conteoEstadosEfec[valor] = { name: valor, color: coloresFullMapEfec[valor] || '#000', count: 1 };
                        }
                        renderConteoEstatusEfectividad(conteoEstadosEfec);
                        updateEmbudoTotals();
                    }

                    const cellMeta = hot.getCellMeta(visualRow, colIndex);
                    const previousClass = (cellMeta.className || '').replace('highlight-flash', '').trim();

                    hot.setCellMeta(visualRow, colIndex, 'className', (previousClass + ' highlight-flash').trim());
                    hot.setDataAtCell(visualRow, colIndex, valor, 'loadData');
                    hot.render();

                    setTimeout(() => {
                        hot.setCellMeta(visualRow, colIndex, 'className', previousClass);
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

                    const metaTel = hot.getCellMeta(visualRow, colTel);
                    const prevTel = (metaTel.className || '').replace('highlight-flash', '').trim();

                    const metaName = hot.getCellMeta(visualRow, colName);
                    const prevName = (metaName.className || '').replace('highlight-flash', '').trim();

                    hot.setDataAtCell(visualRow, colTel, infoEjecutivo.tel, 'cascada_telefono');
                    hot.setDataAtCell(visualRow, colName, infoEjecutivo.name, 'cascada_nombre');

                    hot.setCellMeta(visualRow, colTel, 'className', (prevTel + ' highlight-flash').trim());
                    hot.setCellMeta(visualRow, colName, 'className', (prevName + ' highlight-flash').trim());
                    hot.render();

                    setTimeout(() => {
                        hot.setCellMeta(visualRow, colTel, 'className', prevTel);
                        hot.setCellMeta(visualRow, colName, 'className', prevName);
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

                const cellMeta = hot.getCellMeta(visualRow, colIndex);
                const previousClass = (cellMeta.className || '').replace('highlight-flash', '').trim();

                hot.setDataAtCell(visualRow, colIndex, getRango(newValue), 'cascada_rango');

                hot.setCellMeta(visualRow, colIndex, 'className', (previousClass + ' highlight-flash').trim());
                hot.render();

                setTimeout(() => {
                    hot.setCellMeta(visualRow, colIndex, 'className', previousClass);
                    hot.render();
                    refreshTree();
                }, 2000);
            }
        }
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

    } else if (message.type === 'COMENTARIO') {
        const { row, col, comment, log, id_cita } = message;
        isExternalAction = true;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);

        const rowData = hot.getSourceData();
        const sourceIndex = rowData.findIndex(r => r.id_cita == id_cita);

        if (sourceIndex !== -1) {
            const visualRow = hot.toVisualRow(sourceIndex);

            if (visualRow !== null && visualRow !== -1) {
                const cellMeta = hot.getCellMeta(visualRow, col);
                const previousClass = (cellMeta.className || '').replace('highlight-flash', '').trim();

                const plugin = hot.getPlugin('comments');
                if (comment) {
                    plugin.setCommentAtCell(visualRow, col, comment.value);
                    localCommentCache[`${visualRow}_${col}`] = comment.value;
                } else {
                    plugin.removeCommentAtCell(visualRow, col);
                    localCommentCache[`${visualRow}_${col}`] = "";
                }

                hot.setCellMeta(visualRow, col, 'className', (previousClass + ' highlight-flash').trim());
                hot.render();

                setTimeout(() => {
                    hot.setCellMeta(visualRow, col, 'className', previousClass);
                    hot.render();
                }, 1000);
            }
        }
        isExternalAction = false;

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

                const flashClass = (classToApply + ' paint-flash').trim();
                hot.setCellMeta(visualRow, colIndex, 'className', flashClass);
                hot.render();

                setTimeout(() => {
                    hot.setCellMeta(visualRow, colIndex, 'className', classToApply);
                    hot.render();
                }, 1000);
            }
        }
        createDialog("messageDialogo", "dialogMessage2", log);
    }
    else if (message.type === 'MOVER_EJECUTIVO') {
        if(user === message.user) return;
        const { log, node_id, parent_id, position } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);
        tree.move_node(node_id, parent_id, position, function () {
            createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
            flashTreeNode(node_id);
        });
        $('#arbol_ejecutivos').jstree(true).refresh();
    }
    else if (message.type === 'RENOMBRAR_EJECUTIVO') {
        if(user === message.user) return;
        const { log, node_id, value } = message;
        const tree = $('#arbol_ejecutivos').jstree(true);
        isTreeExternalAction = true;
        tree.rename_node(node_id, value);
        isTreeExternalAction = false;
        createDialog("messageDialogo", "dialogMessage2", log + " usuario: " + user);
        flashTreeNode(node_id);
    }
    else if (message.type === 'CREAR_EJECUTIVO') {
        if(user === message.user) return;
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
        if(user === message.user) return;
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

function refreshTree() {
    const tree = $('#arbol_ejecutivos').jstree(true);
    tree.refresh();
}

async function obtenerDatosArbol() {
    try {
        const response = await fetch('administrar.ejecutivo-arbol.php?action=obtener_arbol');
        
        if (!response.ok) {
            throw new Error(`Error en la red: ${response.status}`);
        }

        const treeData = await response.json();
        
        // Retorna el arreglo de nodos (id, parent, text, type)
        return treeData;
    } catch (error) {
        console.error("No se pudo cargar el árbol:", error);
        return [];
    }
}