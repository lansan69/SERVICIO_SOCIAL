const selector = document.getElementById("selector");

selector.addEventListener("change", callAjax);

function callAjax(event){
    selectorValue = event.target.value;

    const ejecutivo = document.querySelector(".table-ejecutivo")
    const cita = document.querySelector(".table-cita")

    if(selectorValue == "ejecutivo"){
        ejecutivo.classList.remove("visually-hidden");
        cita.classList.add("visually-hidden");
        ajax("ejecutivo");
        
    }else if(selectorValue == "cita"){
        ejecutivo.classList.add("visually-hidden");
        cita.classList.remove("visually-hidden");
        ajax("cita");
    }
        
}

function ajax(name){
let url = name+".php";
$.ajax({
    url: url,
    type: 'GET',
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

        tbody.appendChild(row);

    });

}