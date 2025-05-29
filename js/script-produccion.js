const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const { 
    createProducto, readProductos, searchProduct, updateProducto, deleteProducto, updateStockProducto
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, readBizcochos, updateBizcocho, searchBizcocho, deleteBizcocho 
} = require(join(__dirname, "..", "js", "crud_bizcochos.js"));
const {
    readOrdenes, createOrden
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));
const {
    readFases, updateFase
} = require(join(__dirname, '..', 'js', 'crud-config.js'));

window.addEventListener('DOMContentLoaded', initProduccion);

async function initProduccion() {
    try {
        const fases = await readFases();
        window.fases = fases;
        window.today = new Date();
        window.meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril',
            'Mayo', 'Junio', 'Julio', 'Agosto',
            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        await cargarOrdenes();
        await fillColumnas(ordenes);
        console.warn('✅ Todos los datos fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error al cargar panel de Produccion:', error.message);
        showToast('Error al cargar panel de Produccion', ICONOS.error);
    }
}

async function cargarOrdenes() {
    try {
        const ordenes = await readOrdenes();
        window.ordenes = ordenes;
    } catch (err) {
        console.error('❌ Error al cargar ordenes:', err.message);
        showToast('Error al cargar ordenes', ICONOS.error);
    }
}

async function fillColumnas() {
    const columnas = document.querySelectorAll('.kanban-column');

    columnas.forEach(col => {
        col.querySelector('.kanban-cards').innerHTML = '';
    });

    window.ordenes.forEach(orden => {
        const faseNombre = window.fases.find(f => f.id_fase === orden.fase_actual)?.name_fase || 'Desconocida';

        let tarjetaHTML = '';

        if (orden.origen === 'VENTA') {
            tarjetaHTML = `
                <div class="kanban-card card-venta" draggable="true" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Venta #${orden.id_venta}</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        } else if (orden.origen === 'INVENTARIO') {
            if (orden.tipo_item === 'bizcocho') {
                tarjetaHTML = `
                    <div class="kanban-card card-inventario-b" draggable="true" onclick="verDetalle(${orden.id_orden})">
                        <strong>Orden #${orden.id_orden} / Inventario de Bizcochos</strong><br>
                        ${orden.name_item}<br>
                        Cant: ${orden.cantidad_buenos}<br>
                        Fase: ${faseNombre}
                    </div>
                `;
            } else {
                tarjetaHTML = `
                    <div class="kanban-card card-inventario-p" draggable="true" onclick="verDetalle(${orden.id_orden})">
                        <strong>Orden #${orden.id_orden} / Inventario de Productos</strong><br>
                        ${orden.name_item}<br>
                        Cant: ${orden.cantidad_buenos}<br>
                        Fase: ${faseNombre}
                    </div>
                `;
            }
        } else if (orden.origen === 'REPOSICION') {
            tarjetaHTML = `
                <div class="kanban-card card-reposicion" draggable="true" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Reposición (Venta #${orden.id_venta})</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        }

        const columna = document.querySelector(`.kanban-column[data-estado="${orden.estado.toLowerCase()}"] .kanban-cards`);
        console.log(orden.origen);
        if (columna) {
            columna.insertAdjacentHTML('beforeend', tarjetaHTML);
        }
    });
}

function diasRestantes(fechaEntregaStr) {
    if (!fechaEntregaStr) return '—';
    const hoy = new Date();
    const fechaEntrega = new Date(fechaEntregaStr);
    const diffMs = fechaEntrega - hoy;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDias > 0 ? `${diffDias} días` : 'Vencido';
}
