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
    updateEstadoVenta
} = require(join(__dirname, '..', 'js', 'crud-ventas.js'));
const {
    readOrdenes, createOrden, updateEstado, readOrdenesOrigen
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    createProducto, 
    readProductos, 
    searchProduct, 
    updateProducto, 
    deleteProducto,
    updateStockProducto
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
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

        const productos = await readProductos();
        window.productos = productos;

        console.log('📦 Se cargaron ventas.');
    } catch (error) {
        console.error('❌ Error al cargar ventas:', error.message);
        showToast('Error al cargar ventas', ICONOS.error);
    }
}

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
        const isEntregada = sale.entregada === 1;
        const disabledAttr = isEntregada ? 'disabled' : '';

        row.innerHTML = `
        <td>${sale.id_venta || 'N/A'}</td>
        <td>${sale.fecha_venta || 'N/A'}</td>
        <td>${sale.monto || 'N/A'}</td>
        <td>${fechaEntrega || 'N/A'}</td>
        <td>
            <select data-id="${sale.id_venta}" onchange="estadoVenta(${sale.id_venta}, this.value)">
                <option value="1" ${sale.entregada === 1 ? 'selected' : ''}>Entregada</option>
                <option value="0" ${sale.entregada === 0 ? 'selected' : ''}>No entregada</option>
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

async function estadoVenta(id, estadoSelect) {
    try {
        const estado = parseInt(estadoSelect);

        if (estado === 1) {
            const productos = await readDetalles(id);
            for (const item of productos) {
                const existeProducto = window.productos.find(p => p.code === item.codigo);
                if (!existeProducto) continue;

                const payload = {
                    code: existeProducto.code,
                    stock_apartado: existeProducto.stock_apartado - item.cantidad,
                    stock_disponible: existeProducto.stock_disponible,
                    stock_en_proceso: existeProducto.stock_en_proceso
                };

                //console.log("📦 Producto a actualizar:", payload);
                await updateStockProducto(payload);
            }

            const confirmed = await showConfirmDialog(
                `¿Desea terminar de marcar esta venta como ENTREGADA? Esta acción es IRREVERSIBLE.`,
                "Marcar venta como ENTREGADA"
            );

            if (confirmed) {
                await updateEstadoVenta(id);
                showToast("Estado de entrega actualizado correctamente.", ICONOS.exito);
            } else {
                const select = document.querySelector(`#table-ventas select[data-id='${id}']`);
                if (select) {
                    select.value = "0";
                }
            }
        }
    } catch (error) {
        console.error("❌ Error al actualizar estado de entrega:", error);
        showToast("No se pudo actualizar el estado.", ICONOS.error);
    }
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


function showConfirmDialog(message = "¿Estás seguro?", title = "Confirmar acción") {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        titleEl.textContent = title;
        messageEl.textContent = message;

        yesBtn.onclick = () => {
            dialog.close();
            resolve(true);
        };

        noBtn.onclick = () => {
            dialog.close();
            resolve(false);
        };

        dialog.showModal();
    });
}