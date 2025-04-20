const path = require("path");
const os = require("os");
const { join } = require('path');
const crudV = join(__dirname, '..', 'js', 'crud-ventas.js');
const { 
    createVenta, readVentas, updateVenta, deleteVenta, createVentaDETALLES, readVentasDetalle, updateVentaDetalle, deleteVentaDetalle, readVenta
} = require(crudV);
const toast = join(__dirname, "..", "js", "toast.js");
const ticket = join(__dirname, "..", "js", "generador-ticket.js");
const { showToast, ICONOS } = require(toast);
const { generarRecibos } = require(ticket);

async function initVentas() {
    try {
        const ventas = await new Promise((resolve, reject) => {
        readVentas((err, data) => {
            if (err) return reject(err);
            fillTableVentas(data);
            resolve(data);
        });
        });
        //console.log('Ventas cargadas:', ventas);
    } catch (error) {
        console.error('Error al cargar ventas:', error);
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
    tableBody.innerHTML = '';           // limpiamos contenido previo

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
        /*
        <button type="button" onclick="editarVenta(${sale.id_venta})">✏️ Editar</button>
        <button type="button" onclick="eliminarVenta(${sale.id_venta})">🗑️ Eliminar</button> */
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

async function imprimirVenta(id) {
    console.log('Imprimiendo venta', id);
    try {
        const detalles_venta = await new Promise((res, rej) =>
            readVentasDetalle({ id_ventaVD: id }, (err, data) => err ? rej(err) : res(data))
        );
        
        await generarRecibos({ venta_datos: detalles_venta });

        const fileName = `CerArtep_Nota-${id}.pdf`;
        const savePath = path.join(os.homedir(), 'Downloads', fileName);

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
