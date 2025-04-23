const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const { 
    createProducto, readProductos, searchProduct, updateProducto, deleteProducto 
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, readBizcochos, updateBizcocho, searchBizcocho, deleteBizcocho 
} = require(join(__dirname, "..", "js", "crud_bizcochos.js"));
const {
    createOrden, readOrdenByFase
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));
const { generarRecibos } = require(join(__dirname, "..", "js", "generador-ticket.js"));

window.addEventListener('DOMContentLoaded', initPOS);

async function initPOS() {
    try {
        await cargarProductos();
        await cargarBizcochos();
        await cargarVentas();

        console.log('✅ Todos los datos del punto de venta fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error inesperado en la carga del sistema:', error.message);
        showToast('Error al iniciar el sistema POS', ICONOS.error);
    }
}

async function cargarProductos() {
    try {
        const productos = await readProductos();
        window.productos = productos;
        console.log('📦 Productos cargados.');
    } catch (err) {
        console.error('❌ Error al cargar productos:', err.message);
        showToast('Error al cargar productos', ICONOS.error);
    }
}

async function cargarBizcochos() {
    try {
        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;
        console.log('📦 Bizcochos cargados.');
    } catch (err) {
        console.error('❌ Error al cargar bizcochos:', err.message);
        showToast('Error al cargar bizcochos', ICONOS.error);
    }
}

async function cargarVentas() {
    try {
        const ventas = await readVentas();
        window.ventas = ventas;
        console.log('📦 Ventas cargadas.');
    } catch (err) {
        console.error('❌ Error al cargar ventas:', err.message);
        showToast('Error al cargar ventas', ICONOS.error);
    }
}