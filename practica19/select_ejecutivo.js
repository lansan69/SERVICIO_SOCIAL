document.addEventListener("DOMContentLoaded", (event) => {

    const selectElement = document.getElementById("select_ejecutivo");
    // Initialize socket
    const socket = new WebSocket('wss://socket.ahjende.com/wss/?encoding=text');
    let mapEjecutivo = [];

    // --- CSS STYLES ---
    const style = document.createElement('style');
    style.innerHTML = `
        .toast-success {
            visibility: hidden;
            min-width: 200px;
            background-color: #28a745;
            color: #fff;
            text-align: center;
            border-radius: 5px;
            padding: 16px;
            position: fixed;
            z-index: 1000;
            right: 30px;
            top: 30px;
            font-size: 16px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
            opacity: 0;
            transition: opacity 0.5s, top 0.5s;
        }
            .toast-blue {
            visibility: hidden;
            min-width: 200px;
            background-color: #31cacaff;
            opacity: 0.8;
            color: #fff;
            text-align: center;
            border-radius: 5px;
            padding: 16px;
            position: fixed;
            z-index: 1000;
            right: 30px;
            top: 30px;
            font-size: 16px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
            opacity: 0;
            transition: opacity 0.5s, top 0.5s;
        }
        .toast-success.show {
            visibility: visible;
            opacity: 1;
            top: 50px;
        }
    `;
    document.head.appendChild(style);

    // --- AJAX ---
    $.ajax({
        url: "ejecutivo.php",
        type: "GET",
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                mapEjecutivo = response.data;
                selectElement.innerHTML = '<option value="" disabled selected>Seleccione un ejecutivo</option>';
                Object.entries(response.data).forEach(([id, ejecutivo]) => {
                    const option = document.createElement("option");
                    option.value = id;
                    option.textContent = `${id} - ${ejecutivo.name}`;
                    selectElement.appendChild(option);
                });
            } else {
                console.error("Server error:", response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });

    // --- TOAST FUNCTION ---
    function showConnectedToast(selectedID) {
        let toast = document.getElementById("connected-toast");


        if (!toast) {
            toast = document.createElement("div");
            toast.id = "connected-toast";
            toast.className = "toast-success";
            document.body.appendChild(toast);
        }

        const name = mapEjecutivo[selectedID] ? mapEjecutivo[selectedID].name : "Ejecutivo";
        toast.textContent = "Conectado : " + name;

        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    function showBlueToast(message) {
        let toast = document.getElementById("blue-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "blue-toast";
            toast.className = "toast-blue";
            document.body.appendChild(toast);
        }

        toast.textContent = message;

        // 4. Show and Hide logic
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    selectElement.addEventListener("change", () => {
        const selectedID = selectElement.value;
        localStorage.setItem("id_sesion", selectedID);

        console.log("Saved to localStorage:", selectedID);

        if (socket.readyState === WebSocket.OPEN) {
            showConnectedToast(selectedID);
        } else if (socket.readyState === WebSocket.CONNECTING) {
            socket.onopen = () => showConnectedToast(selectedID);
        } else {
            console.warn("Socket is closed or closing.");
        }
    });
});