// Define Global Socket variable
window.globalSocket = null;

document.addEventListener("DOMContentLoaded", (event) => {
    const selectElement = document.getElementById("select_ejecutivo");
    let mapEjecutivo = [];

    // 1. Initialize WebSocket Globally
    window.globalSocket = new WebSocket('wss://socket.ahjende.com/wss/?encoding=text');

    // 2. Socket Handlers
    window.globalSocket.onopen = () => {
        console.log("Socket Connected");
        const storedID = localStorage.getItem("id_sesion");
        if (storedID) showConnectedToast(storedID);
    };

    window.globalSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // A. Handle Notification Messages (Text only)
            if (data.message) {
                window.showBlueToast(data.message);
            }
            // B. Handle Cell Updates (Logic)
            else if (data.action === 'update_cell') {
                const userName = data.user_name || "Un usuario";
                window.showBlueToast(`Cambio realizado por: ${userName}`);

                // Trigger the table update if the function exists
                if (typeof window.applySocketChange === 'function') {
                    window.applySocketChange(data);
                }
            }
        } catch (e) {
            console.log("Non-JSON message received:", event.data);
        }
    };

    // 3. Populate Dropdown
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
            }
        }
    });

    selectElement.addEventListener("change", () => {
        const selectedID = selectElement.value;
        localStorage.setItem("id_sesion", selectedID);
        if (window.globalSocket.readyState === WebSocket.OPEN) {
            showConnectedToast(selectedID);
        }
    });

    // 4. Toast Functions (Helper)
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
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
});

// 5. Global Toast Function (Must be outside DOMContentLoaded to be accessible globally)
window.showBlueToast = function (message) {
    let toast = document.getElementById("blue-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "blue-toast";
        toast.className = "toast-blue";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}