const selector = document.getElementById("selector");
selector.addEventListener("change", callAjax);

function callAjax(event){
    selectorValue = event.target.value;
    search = document.getElementById("search-input");
    search.addEventListener("input", ()=>{
        callAjaxTemplate(search.value);
    });

    if(search.value == ""){
        callAjaxTemplate("");
    }   
}

function callAjaxTemplate(search){
    const ejecutivo = document.querySelector(".table-ejecutivo")
    const cita = document.querySelector(".table-cita")
    const insertEjecutivo = document.querySelector(".insert-ejecutivo")
    const insertCita = document.querySelector(".insert-cita")

    if (selectorValue == "ejecutivo") {
        ejecutivo.classList.remove("visually-hidden");
        cita.classList.add("visually-hidden");
        insertEjecutivo.classList.remove("visually-hidden");
        insertCita.classList.add("visually-hidden");
        ajax("ejecutivo", search);

    } else if (selectorValue == "cita") {
        ejecutivo.classList.add("visually-hidden");
        cita.classList.remove("visually-hidden");
        insertEjecutivo.classList.add("visually-hidden");
        insertCita.classList.remove("visually-hidden");
        ajax("cita",search);
    }
}

function ajax(name,search){
let url = name+".php";
$.ajax({
    url: url,
    type: 'POST',
    data: {
        search: search
    },
    dataType: 'json',
    success: function (response) {
        if (response.success) {
            console.log(response);
            if(name == "ejecutivo"){
                populateEjecutivo(response.data)
            }else if(name=="cita"){
                populateCita(response.data)
            }
        } else {
            alert('Error: ' + response.message);
        }
    }
});
}

function ajax2(name, id) {
    const searchValue = document.getElementById("search-input").value;
    const selectorValue = document.getElementById("selector").value;
    let url = name + ".php";
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            id: id
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);
                if (name == "eliminate-ejecutivo") {
                    ajax(selectorValue, searchValue);
                } else if (name == "eliminate-cita") {
                    ajax(selectorValue, searchValue);
                }
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("❌ ERROR CRÍTICO DE AJAX/PARSING JSON:");
            console.log("  - URL:", url);
            console.log("  - Estado HTTP:", status);
            console.log("  - Mensaje de error:", error);

            // Muestra el texto de respuesta completo. Esto te dirá si hay HTML o texto
            // inesperado (como warnings de PHP) antes o después de tu JSON.
            console.log("  - Respuesta Cruda del Servidor (TEXTO):", xhr.responseText);

            // Alerta genérica para el usuario final
            alert("Error al comunicarse con el servidor o JSON inválido. Revisa la consola para detalles técnicos.");
        }
    });
}

function ajaxAdd(name,data){
    const searchValue = document.getElementById("search-input").value;
    const selectorValue = document.getElementById("selector").value;
    let url = name + ".php";
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);
                if (name == "agregar-ejecutivo") {
                    ajax(selectorValue, searchValue);
                } else if (name == "agregar-cita") {
                    ajax(selectorValue, searchValue);
                }
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("  ERROR CRÍTICO DE AJAX/PARSING JSON:");
            console.log("  - URL:", url);
            console.log("  - Estado HTTP:", status);
            console.log("  - Mensaje de error:", error);

            // Muestra el texto de respuesta completo. Esto te dirá si hay HTML o texto
            // inesperado (como warnings de PHP) antes o después de tu JSON.
            console.log("  - Respuesta Cruda del Servidor (TEXTO):", xhr.responseText);

            // Alerta genérica para el usuario final
            alert("Error al comunicarse con el servidor o JSON inválido. Revisa la consola para detalles técnicos.");
        }
    });
}

function populateEjecutivo(data){
    tbody = document.querySelector(".table-ejecutivo tbody");
    tbody.innerHTML = '';
    data.forEach(element => {
        const row = document.createElement('tr');

        // Cell 1: id_eje
        let cellId = document.createElement('td');
        cellId.textContent = element.id_eje;
        row.appendChild(cellId);

        // Cell 2: nom_eje
        let cellName = document.createElement('td');
        cellName.textContent = element.nom_eje;
        row.appendChild(cellName);

        // Cell 3: tel_eje
        let cellTel = document.createElement('td');
        cellTel.textContent = element.tel_eje;
        row.appendChild(cellTel);

        // Cell 4: Action Buttons
        let cellActions1 = document.createElement('td');
        
        let modifyButton = document.createElement('button');
        modifyButton.classList.add("btn", "btn-info", "btn-sm", "me-2");
        modifyButton.textContent = 'Modificar';
        modifyButton.setAttribute('onclick', `modifyEjecutivo(${element.id_eje})`);
        
        let cellActions2 = document.createElement('td');
        let eliminateButton = document.createElement('button');
        eliminateButton.classList.add("btn", "btn-danger", "btn-sm", "me-2");   
        eliminateButton.textContent = 'Eliminar';
        eliminateButton.setAttribute('onclick', `eliminateEjecutivo(${element.id_eje})`);

        cellActions1.appendChild(modifyButton);
        cellActions2.appendChild(eliminateButton);

        row.appendChild(cellActions1);
        row.appendChild(cellActions2);
        tbody.appendChild(row);
    });

}

function populateCita(data) {
    tbody = document.querySelector(".table-cita tbody");
    tbody.innerHTML = '';
    data.forEach(element => {
        const row = document.createElement('tr');

        // Cell 1: id_eje
        let cellId = document.createElement('td');
        cellId.textContent = element.id_cita;
        row.appendChild(cellId);

        // Cell 2: nom_eje
        let cellName = document.createElement('td');
        cellName.textContent = element.nom_cita;
        row.appendChild(cellName);

        // Cell 3: tel_eje
        let cellTel = document.createElement('td');
        cellTel.textContent = element.nom_eje;
        row.appendChild(cellTel);

        // Cell 4: Action Buttons
        let cellActions1 = document.createElement('td');

        let modifyButton = document.createElement('button');
        modifyButton.classList.add("btn", "btn-info", "btn-sm", "me-2");
        modifyButton.textContent = 'Modificar';
        modifyButton.setAttribute('onclick', `modifyCita(${element.id_eje})`);

        let cellActions2 = document.createElement('td');
        let eliminateButton = document.createElement('button');
        eliminateButton.classList.add("btn", "btn-danger", "btn-sm", "me-2");   
        eliminateButton.textContent = 'Eliminar';
        eliminateButton.setAttribute('onclick', `eliminateCita(${element.id_eje})`);

        cellActions1.appendChild(modifyButton);
        cellActions2.appendChild(eliminateButton);

        tbody.appendChild(row);

    });

}


function eliminateEjecutivo(id) {
    if (confirm("¿Seguro que quieres eliminar?")) {
        ajax2("eliminate-ejecutivo", id);
    }
}

function eliminateCita(id) {
    if (confirm("¿Seguro que quieres eliminar?")) {
        ajax2("eliminate-cita", id);
    }
}

// Variable global para el formulario de inserción
const formInsertCita = document.getElementById("form-insert-cita");
const formInsertEjecutivo = document.getElementById("form-insert-ejecutivo");

// Event Listener para el formulario de Ejecutivo
if (formInsertEjecutivo) {
    formInsertEjecutivo.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío estándar del formulario
        insertarEjecutivo();
    });
}
// Event Listener para el formulario de Cita
if (formInsertCita) {
    formInsertCita.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío estándar del formulario
        insertarCita();
    });
}

function ajaxAdd(name, data) {
    const searchValue = document.getElementById("search-input").value;
    const selectorValue = document.getElementById("selector").value;
    let url = name + ".php";
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);
                if (name == "agregar-ejecutivo") {
                    ajax(selectorValue, searchValue);
                } else if (name == "agregar-cita") {
                    ajax(selectorValue, searchValue);
                }
            } else {
                alert('Error: ' + response.message);
                console.error(response);
            }
        },
        error: function (xhr, status, error) {
            console.error("ERROR CRÍTICO DE AJAX/PARSING JSON:");
            console.log("  - URL:", url);
            console.log("  - Estado HTTP:", status);
            console.log("  - Mensaje de error:", error);

            // Muestra el texto de respuesta completo. Esto te dirá si hay HTML o texto
            // inesperado (como warnings de PHP) antes o después de tu JSON.
            console.log("  - Respuesta Cruda del Servidor (TEXTO):", xhr.responseText);

            // Alerta genérica para el usuario final
            alert("Error al comunicarse con el servidor o JSON inválido. Revisa la consola para detalles técnicos.");
        }
    });
}

function insertarEjecutivo(){
    const nomEje = document.getElementById("nombre-ejecutivo-input").value;
    const telEje = document.getElementById("telefono-ejecutivo-input").value;

    const dataObject = {
        name: nomEje,
        tel: telEje
    }

    ajaxAdd("agregar-ejecutivo", dataObject)
}

function insertarCita() {
    // 1. Obtener valores de los inputs
    const nomCita = document.getElementById("nombre-cita-input").value;
    const idEje = document.getElementById("ejecutivo-cita-input").value;

    const dataObject = {
        name: nomCita,
        id_eje: idEje
    }

    ajaxAdd("agregar-cita", dataObject)
}


function ajaxUpdate(name, data) {
    const searchValue = document.getElementById("search-input").value;
    const selectorValue = document.getElementById("selector").value;
    let url = name + ".php"; // e.g., modificar-ejecutivo.php

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log(response);

                ajax(selectorValue, searchValue);
            } else {
                alert('Error al modificar: ' + response.message);
                console.error(response);
            }
        },
        error: function (xhr, status, error) {
            console.error("ERROR CRÍTICO DE AJAX/PARSING JSON (Update):");
            console.log("  - URL:", url);
            console.log("  - Respuesta Cruda del Servidor (TEXTO):", xhr.responseText);
            alert("Error al comunicarse con el servidor o JSON inválido durante la actualización. Revisa la consola.");
        }
    });
}


// --- Logic for Modifying Ejecutivo ---

function modifyEjecutivo(id) {
    const $row = $(`.table-ejecutivo tbody tr:has(td:first-child:contains("${id}"))`);
    if ($row.length === 0) return; // Exit if row not found

    const row = $row[0];

    const cells = row.querySelectorAll('td');

    // 1. Get current values
    const currentName = cells[1].textContent;
    const currentTel = cells[2].textContent;

    // 2. Change name cell to input
    cells[1].innerHTML = `<input type="text" class="form-control form-control-sm" value="${currentName}" id="edit-name-${id}" required>`;

    // 3. Change telephone cell to input
    cells[2].innerHTML = `<input type="tel" class="form-control form-control-sm" value="${currentTel}" id="edit-tel-${id}" maxlength="12" required>`;

    // 4. Change 'Modificar' button to 'Guardar' (Save)
    const modifyCell = cells[3];
    const saveButton = modifyCell.querySelector('button');
    saveButton.textContent = 'Guardar';
    saveButton.classList.remove('btn-info');
    saveButton.classList.add('btn-success');
    // Change the onclick function to the new update logic
    saveButton.setAttribute('onclick', `updateEjecutivo(${id})`);
}

function modifyCita(id) {
    const $row = $(`.table-cita tbody tr:has(td:first-child:contains("${id}"))`);
    if ($row.length === 0) return; // Exit if row not found

    const row = $row[0];
    const cells = row.querySelectorAll('td');

    const currentName = cells[1].textContent; // Cita Name (nom_cita)
    const currentEjeName = cells[2].textContent; // Executive Name (nom_eje)

    cells[1].innerHTML = `<input type="text" class="form-control form-control-sm" value="${currentName}" id="edit-cita-name-${id}" required>`;
    cells[2].innerHTML = `<input type="text" class="form-control form-control-sm" value="" placeholder="Nuevo ID Ejecutivo" id="edit-eje-id-${id}" required>`;

    const saveButton = modifyCell.querySelector('button');

    if (saveButton && saveButton.textContent === 'Modificar') {
        saveButton.textContent = 'Guardar';
        saveButton.classList.remove('btn-info');
        saveButton.classList.add('btn-success');

        // FIX: Change the onclick function to the new update logic
        saveButton.setAttribute('onclick', `updateCita(${id})`);
    }
}
function updateEjecutivo(id) {
    // 1. Get the new values from the temporary input fields
    const newName = document.getElementById(`edit-name-${id}`).value;
    const newTel = document.getElementById(`edit-tel-${id}`).value;

    if (newName.trim() === "" || newTel.trim() === "") {
        alert("Nombre y Teléfono no pueden estar vacíos.");
        return;
    }

    const dataObject = {
        id: id,
        name: newName,
        tel: newTel
    };

    // 2. Call the AJAX update function
    ajaxUpdate("modificar-ejecutivo", dataObject);
}

function updateCita(id) {
    // 1. Get the new values from the temporary input fields
    const newName = document.getElementById(`edit-cita-name-${id}`).value;
    const newId = document.getElementById(`edit-eje-id-${id}`).value;

    if (newName.trim() === "" || newId.trim() === "") {
        alert("Nombre y Id_eje no pueden estar vacíos.");
        return;
    }

    const dataObject = {
        id: id,
        name: newName,
        id_eje: newId
    };

    // 2. Call the AJAX update function
    ajaxUpdate("modificar-cita", dataObject);
}