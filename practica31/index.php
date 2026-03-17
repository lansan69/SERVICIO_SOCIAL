<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jsTree with Google Fonts</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/themes/default/style.min.css" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/styles/handsontable.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/styles/ht-theme-main.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css" />
    <link rel="stylesheet" href="practica.css" />


    <style>
        .highlight-flash {
            background-color: #d4edda !important;
            color: #155724 !important;
            /* Yellow highlight */
            transition: all 1s ease-in-out;
        }

        .highlight-tree-flash {
            background-color: #d4edda !important;
            ;

        }

        .dialog-connected {
            /* Position it top-right as a notification */
            position: fixed;
            top: 20px;
            right: 20px;

            /* Reset default borders and add styling */
            border: none;
            border-radius: 8px;
            padding: 1rem;
            background-color: rgb(79, 192, 79);

            /* Ensure it stays on top of Handsontable */
            z-index: 2000;
        }

        .dialog-message {
            /* Position it top-right as a notification */
            position: fixed;
            top: 20px;
            right: 20px;

            /* Reset default borders and add styling */
            border: none;
            border-radius: 8px;
            padding: 1rem;
            background-color: rgb(79, 192, 177);

            /* Ensure it stays on top of Handsontable */
            z-index: 2000;
        }
    </style>
</head>

<body>
    <div class="square"
        style="display: none; background-color: #d4edda; width: 80vw; height: 80vh; position: absolute; z-index: 999; top:10vh;left:10vw;">
        <h1 style="text-align: center; margin-top: 30px;">CITAS ELIMINADAS</h1>
        <div class="tabla-eliminadas" id="eliminadas-tabla">

        </div>
    </div>
    <div class="main-wrapper">
        <aside class="tree-sidebar shadow-sm">
            <h5 class="mb-3 fw-bold text-primary">
                Organigrama de Ejecutivos
            </h5>
            <hr>
            <button id="btnFormExecutives" 
            class="btn btn-primary btn-sm shadow-sm d-flex align-items-center"
            onclick="mostrarFormularioEjecutivos()">
                <span class="material-icons me-1" style="font-size: 16px;"></span>
                Agregar un ejecutivo
            </button>
            <hr>
            <div id="arbol_ejecutivos">
                <div class="text-center text-muted mt-5">Cargando árbol...</div>
            </div>
        </aside>

        <dialog id="formularioDialog" class="dialog-eliminadas">
            <div class="dialog-header d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Agregar Ejecutivo</h5>
                <button type="button" class="btn-close"
                    onclick="document.getElementById('formularioDialog').close()"></button>
            </div>
            <div class="tabla_eliminadas">
                <?php include 'templates_html/ejecutivos/form.html'; ?>
            </div>
        </dialog>

        <dialog id="eliminadasDialog" class="dialog-eliminadas">
            <div class="dialog-header d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Citas Eliminadas</h5>
                <button type="button" class="btn-close"
                    onclick="document.getElementById('eliminadasDialog').close()"></button>
            </div>
            <div class="tabla_eliminadas" id="tabla_eliminadas_content">

            </div>
        </dialog>

        <style>
            .dialog-eliminadas {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: none;
                border-radius: 8px;
                padding: 2rem;
                background-color: white;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 3000;
                width: 60vw;
                height: 50vh;
                overflow-y: auto;
            }

            .dialog-eliminadas::backdrop {
                background-color: rgba(0, 0, 0, 0.5);
            }
        </style>

        <main class="content-area">
            <div class="header-section text-center">
                <h2 class="fw-bold text-dark">Gestión de Citas</h2>
                <p class="text-muted">Seleccione un indicador en el árbol para ver las citas.</p>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mb-3">

                <div class="d-flex align-items-center gap-2">
                    <label for="ejecutivoSelect" class="fw-bold text-secondary">Usuario:</label>
                    <select class="form-control form-control-sm shadow-sm" id="ejecutivoSelect">
                    </select>
                </div>
                <button id="btnSeeEliminated" class="btn btn-primary btn-sm shadow-sm d-flex align-items-center"
                    onclick="abrirModalEliminadas()" disabled>
                    <span class="material-icons me-1" style="font-size: 16px;"></span>
                    Ver eliminadas
                </button>

                <div class="d-flex align-items-center gap-2">
                    <label for="tipoEjecutivo" class="fw-bold text-secondary">Tipo de ejecutivo:</label>
                    <select class="form-control form-control-sm shadow-sm" id="tipoEjecutivo">
                        <option value="">Ambos</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Admisión">Admisión</option>
                    </select>
                </div>

                <div class="d-flex align-items-center gap-2">
                    <label for="startDate" class="fw-bold text-secondary">Desde:</label>
                    <input type="date" id="startDate" class="form-control form-control-sm shadow-sm"
                        style="width: auto;">
                </div>

                <div class="d-flex align-items-center gap-2">
                    <label for="endDate" class="fw-bold text-secondary">Hasta:</label>
                    <input type="date" id="endDate" class="form-control form-control-sm shadow-sm" style="width: auto;">
                </div>

                <button id="btnFilterDate" class="btn btn-primary btn-sm shadow-sm d-flex align-items-center">
                    <span class="material-icons me-1" style="font-size: 16px;"></span>
                    Filtrar
                </button>
            </div>

            <div class="embudo d-flex flex-row gap-3">
                <div class="embudo-data">
                    <div class="embudo-data-total-citas" id="embudo-data-total-citas"></div>
                    <div class="embudo-data-citas-efectivas" id="embudo-data-citas-efectivas"></div>
                    <div class="embudo-data-registros" id="embudo-data-registros"></div>
                </div>
                <div class="embudo-grafica" style="flex-grow: 1; height: 200px; min-width: 300px; position: relative;">
                    <canvas id="embudoChart"></canvas>
                </div>
            </div>
            <div class="d-flex flex-row gap-3">
                <div class="status-count d-flex flex-column gap-2">
                    <label class="fw-bold text-secondary">Conteo de status: </label>
                    <div class="content" id="conteo-estatus"></div>
                </div>
            </div>

            <div class="d-flex flex-row gap-3">
                <div class="status-count d-flex flex-column gap-2">
                    <label class="fw-bold text-secondary">Conteo de efectividad: </label>
                    <div class="content" id="conteo-estatus-efectividad"></div>
                </div>
            </div>

            <div class="table-card">
                <div id="citas" class="ht-theme-main"></div>
            </div>
        </main>
    </div>
</body>

<dialog id="myDialog" class="dialog-connected">
    <p id="dialogMessage"></p>
</dialog>

<dialog id="messageDialogo" class="dialog-message">
    <p id="dialogMessage2"></p>
</dialog>


<!-- 
    ============================================================
    SCRIPTS Y LIBRERÍAS EXTERNAS
    ============================================================
    
    env.js
    - Archivo de configuración del entorno y variables globales
    
    chart.js (CDN)
    - Librería para la creación de gráficos y visualizaciones de datos
    
    jquery.min.js (CDN)
    - Framework JavaScript para manipulación del DOM y peticiones AJAX
    
    jstree.min.js (CDN)
    - Plugin para la creación y gestión de árboles jerárquicos interactivos
    
    handsontable.full.min.js (CDN)
    - Librería para crear hojas de cálculo interactivas en HTML
    
    historico_citas.js
    - Gestiona el historial de citas médicas o consultas
    - Se carga de forma asincrónica
    
    handson.js
    - Configuración y funcionalidades de la tabla Handsontable
    - Se carga de forma asincrónica
    
    arbol.js
    - Manejo de la estructura de árbol jerárquico en la sección ejecutiva
    
    eliminadas.js
    - Gestión de citas eliminadas y recuperación de datos borrados
    
    formularioEjecutivos.js
    - Formulario y validaciones para usuarios ejecutivos del sistema
    
    ============================================================
-->
<script src="../env.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script async src="citas/historico_citas.js"></script>
<script async src="handson.js"></script>
<script src="ejecutivo/arbol.js"></script>
<script src="citas/eliminadas.js"></script>
<script src="utils/ejecutivos/validacion_forms.js"></script>
<script src="utils/ejecutivos/poblar_plantel.js"></script>
</html>