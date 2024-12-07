document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById("inventory-Btn").addEventListener('click', () => {
        window.location.href = "html/inventory.html"
    });
});


/*document.addEventListener("DOMContentLoaded", () => {
    const dashboardBtn = document.getElementById("dashboard-Btn");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
            alert("¡Botón presionado!");
        });
    } else {
        console.error("No se encontró el botón con ID 'dashboard-Btn'.");
    }
});*/


/*<button id="inventory-Btn">Inventario</button>
            <button id="pos-Btn">Punto de Venta</button>
            <button id="sales-Btn">Historial de Ventas</button>
            <button id="configuration-Btn">Configuración</button>*/