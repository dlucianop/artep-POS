const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const { 
    createProducto, 
    readProductos, 
    searchProduct, 
    updateProducto, 
    deleteProducto  
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, 
    readBizcochos, 
    updateBizcocho, 
    searchBizcocho, 
    deleteBizcocho 
} = require(crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js'));
const {
    readFases, updateFase, readCategorias, readSizes
} = require(join(__dirname, "..", "js", "crud-config.js"));
const {
    readOrdenes, createOrden, updateEstado
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));


window.addEventListener('DOMContentLoaded', initProduccion);

async function initProduccion() {
    try {
        const fases = await readFases();
        window.fases = fases;
        console.warn('📦 Fases cargadas.');
        const categorias = await readCategorias();
        window.categorias = categorias;
        console.warn('📦 Categorias cargadas.');
        const sizes = await readSizes();
        window.sizes = sizes;
        console.warn('📦 Tamaños cargados.');
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
        const cardId = `card-${orden.id_orden}`;

        if (orden.origen === 'VENTA') {
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card card-venta" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Venta #${orden.id_venta}</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        } else if (orden.origen === 'INVENTARIO') {
            const clase = orden.tipo_item === 'bizcocho' ? 'card-inventario-b' : 'card-inventario-p';
            const label = orden.tipo_item === 'bizcocho' ? 'Inventario de Bizcochos' : 'Inventario de Productos';
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card ${clase}" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / ${label}</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}
                </div>
            `;
        } else if (orden.origen === 'REPOSICION') {
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card card-reposicion" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Reposición (Venta #${orden.id_venta})</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        }

        const columna = document.querySelector(`.kanban-column[data-estado="${orden.estado.toLowerCase()}"] .kanban-cards`);
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

/*---------------------FUNCIONES VISUALES--------------------------------------------------------- */

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

async function drop(ev) {
    ev.preventDefault();
    const cardId = ev.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);
    
    if (!card) return;
    
    const targetColumn = ev.target.closest('.kanban-column');
    
    if (!targetColumn) return;

    let idOrden = parseInt(cardId.replace('card-', ''));
    let nuevoEstado = (targetColumn.dataset.estado).toUpperCase();
    let orden = window.ordenes.find(o => o.id_orden === idOrden);

    const confirmed = await showConfirmDialog(
        `¿Desea mover la Orden #${idOrden} de ${orden.estado} a ${nuevoEstado} y cambiar su estado?`,
        "Confirmación"
    );

    if (confirmed) {
        const cardsContainer = targetColumn.querySelector('.kanban-cards');
        cardsContainer.appendChild(card);
        
        const payload = {
            estado: nuevoEstado,
            id_orden: idOrden
        };
        await updateEstado(payload);
    }
    
}

/*-----------------------------funciones------------------------- */

async function verDetalle(id_orden) {
    document.getElementById('update-content').innerHTML = '';
    await fillOrden(id_orden);
    document.getElementById("update-dialog-s").showModal();
}

async function fillOrden(id_orden) {
    window.ordenCRUD = window.ordenes.find(o => o.id_orden === id_orden);

    let html = "";
    let contenedorId = "update-content";

    switch (ordenCRUD.origen) {
        case "VENTA":
            html = `
                <p><strong>Venta:</strong>
                    <input type="number" id="orden_id_venta" value="" readonly></p>
                <p><strong>Producto:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Cantidad Pedida:</strong>
                    <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" readonly></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas buenas"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        case "INVENTARIO":
            html = `
                <p><strong>Producto/Bizcocho:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Tipo:</strong>
                    <select id="orden_tipo_item">
                        <option value="" disabled selected>-- Elija un tipo --</option>
                        <option value="bizcocho">Bizcocho</option>
                        <option value="producto">Producto</option>
                    </select></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas buenas"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        case "REPOSICION":
            html = `
                <p><strong>Orden que repondra:</strong>
                    <input type="number" id="orden_id_orden_origen" value="" readonly></p>
                <p><strong>Producto:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Cantidad Restante:</strong>
                    <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" readonly></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas buenas"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        default:
            break;
    }

}

function cargarFases(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectFase = modal.querySelector("#orden_fase_actual");
        
        selectFase.innerHTML = `<option value="" disabled selected>-- Elija una fase --</option>`;

        window.fases.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_fase;
            option.textContent = c.name_fase;
            selectFase.appendChild(option);
        });

        resolve();
    });
}

function cargarCategorias(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectCate = modal.querySelector("#orden_categoria");
        selectCate.innerHTML = `<option value="" disabled selected>-- Elija una categoría --</option>`;

        window.categorias.forEach(c => {
            const option = document.createElement("option");
            option.value = c.name_categoria;
            option.textContent = c.name_categoria;
            selectCate.appendChild(option);
        });

        resolve();
    });
}

function cargarTamanos(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectSize = modal.querySelector("#orden_size");
        selectSize.innerHTML = `<option value="" disabled selected>-- Elija un tamaño --</option>`;

        window.sizes.forEach(s => {
            const option = document.createElement("option");
            option.value = s.name_size;
            option.textContent = s.name_size;
            selectSize.appendChild(option);
        });

        resolve();
    });
}

function cargarData(ordenCRUD, origen) {
    return new Promise((resolve) => {
        const modal = document.querySelector("#update-content");

        switch (origen) {
            case "VENTA":
                modal.querySelector("#orden_id_venta").value = ordenCRUD.id_venta;
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_pedida").value = ordenCRUD.cantidad_pedida;
                modal.querySelector("#orden_cantidad_buenos").value = ordenCRUD.cantidad_buenos;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            case "INVENTARIO":
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_tipo_item").value = ordenCRUD.tipo_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_buenos").value = ordenCRUD.cantidad_buenos;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            case "REPOSICION":
                modal.querySelector("#orden_id_orden_origen").value = ordenCRUD.id_orden_origen;
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_pedida").value = ordenCRUD.cantidad_pedida;
                modal.querySelector("#orden_cantidad_buenos").value = ordenCRUD.cantidad_buenos;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            default:
                console.warn("Origen no reconocido:", origen);
                break;
        }

        resolve();
    });
}

async function agregarNuevaOrden() {
    document.getElementById('create-content').innerHTML = '';
    document.getElementById("create-dialog-s").showModal();

    let contenedorId = "create-content";
    let html = `
        <p><strong>Inventario:</strong>
            <select id="orden_tipo_item">
                <option value="" disabled selected>-- Elija un inventario --</option>
                <option value="bizcocho">Bizcocho</option>
                <option value="producto">Producto</option>
            </select>
        </p>

        <p><strong>Categoria:</strong>
            <select id="orden_categoria"></select></p>
        <p><strong>Modelo:</strong>
            <input type="text" id="orden_modelo" value="" placeholder="Ingrese modelo"></p>
        <p><strong>Tamaño:</strong>
            <select id="orden_size"></select></p>

        <div id="grupo-producto">
            <p><strong>Decoración:</strong>
                <input type="text" id="orden_decoracion" value="" placeholder="Ingrese decoracion"></p>
            <p><strong>Color:</strong>
                <input type="text" id="orden_color" value="" placeholder="Ingrese color"></p>
        </div>

        <p><strong>Fase:</strong>
            <select id="orden_fase_actual"></select></p>
        <p><strong>Piezas a Producir:</strong>
            <input type="number" id="orden_cantidad_buenos" step="1" min="0" value=""></p>
    `;

    document.getElementById(contenedorId).innerHTML = html;
    await cargarFases(contenedorId);
    await cargarCategorias(contenedorId);
    await cargarTamanos(contenedorId);

    document.getElementById('grupo-producto').style.display = 'none';

    document.getElementById('orden_tipo_item').addEventListener('change', function () {
        const tipo = this.value;
        const grupoProducto = document.getElementById('grupo-producto');

        if (tipo === 'producto') {
            grupoProducto.style.display = 'block';
        } else {
            grupoProducto.style.display = 'none';
            document.getElementById('orden_decoracion').value = '';
            document.getElementById('orden_color').value = '';
        }
    });
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

function cerrarDialogo(dialogId, dialogContent, mensaje) {
    document.getElementById(dialogId).close();
    document.getElementById(dialogContent).innerHTML = '';
    showToast(mensaje, ICONOS.info);
}

document.getElementById("close-dialog-delete").addEventListener("click", () =>
    cerrarDialogo("delete-dialog-s", "delete-content", "Eliminación cancelada"));

document.getElementById("close-dialog-create").addEventListener("click", () =>
    cerrarDialogo("create-dialog-s", "create-content", "Creación cancelada"));

document.getElementById("close-dialog-update").addEventListener("click", () =>
    cerrarDialogo("update-dialog-s", "update-content", "Modificación cancelada"));