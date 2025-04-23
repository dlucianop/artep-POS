const { join } = require('path');
const os = require("os");
const { 
    createVenta,
    readVentas,
    searchVenta,
    updateVenta,
    createDetalle,
    readDetalles,
    deleteVentaConDetalles,
} = require(join(__dirname, '..', 'js', 'crud-ventas.js'));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));
const { 
    generarRecibos 
} = require(join(__dirname, "..", "js", "generador-ticket.js"));

window.addEventListener('DOMContentLoaded', initVentas);

async function initVentas() {
    try {
        const ventas = await readVentas();
        window.ventas = ventas;
        fillTableVentas(ventas);
        console.log('📦 Se cargaron ventas.');
    } catch (error) {
        console.error('❌ Error al cargar ventas:', error.message);
        showToast('Error al cargar ventas', ICONOS.error);
    }
}

window.addEventListener('DOMContentLoaded', initVentas);

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    let date;
  
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr + 'T00:00:00');
    } else {
        date = new Date(dateStr);
        if (isNaN(date)) return 'Fecha inválida';
    }
  
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
}
  

function fillTableVentas(sales) {
    const tableBody = document.querySelector('#table-ventas tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    sales.forEach(sale => {
        const fechaEntrega = formatDate(sale.fecha_entrega);
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${sale.id_venta || 'N/A'}</td>
        <td>${sale.fecha_venta || 'N/A'}</td>
        <td>${sale.monto || 'N/A'}</td>
        <td>${fechaEntrega || 'N/A'}</td>
        <td>
            <select onchange="estadoVenta(${sale.id_venta}, this.value)">
                <option value="0" ${!sale.entregada ? 'selected' : ''}>Por entregar</option>
                <option value="1" ${sale.entregada ? 'selected' : ''}>Entregada</option>
            </select>
        </td>
        <td class="col-btn">
            <button type="button" onclick="imprimirVenta(${sale.id_venta})">🖨️ Imprimir</button>
        </td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

async function imprimirVenta(id) {
    console.log('Imprimiendo venta', id);
    try {
        const detalles_venta = await readDetalles(id);

        if (!detalles_venta || detalles_venta.length === 0) {
            throw new Error("No se encontraron detalles para la venta con ID: " + id);
        }

        await generarRecibos({ venta_datos: detalles_venta });

        const fileName = `CerArtep_Nota-${id}.pdf`;
        const savePath = join(os.homedir(), 'Downloads', fileName);

        showToast(`Recibo guardado en: ${savePath}`, ICONOS.exito);
    } catch (error) {
        showToast("Hubo un error al generar el recibo.", ICONOS.error);
        console.error("Error al generar recibo:", error);
    }
}

/*function editarVenta(id) {
    console.log('Editando venta', id);
}

function eliminarVenta(id) {
    if (!confirm('¿Seguro que quieres eliminar la venta #' + id + '?')) return;
}*/

async function estadoVenta(id, estado) {
    try {
        /*actualizar inventario Productos, eliminar de stock apartados */
        showToast("Estado de entrega actualizado correctamente.", ICONOS.exito);
    } catch (error) {
        console.error("Error al actualizar estado de entrega:", error);
        showToast("No se pudo actualizar el estado.", ICONOS.error);
    }
}
