const { log } = require('console');
const { join } = require('path');
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
    readDetalles
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const {
    readFases, updateFase, readCategorias, readSizes
} = require(join(__dirname, "..", "js", "crud-config.js"));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, '..', 'js', 'toast.js'));
const { 
    generarRecibos 
} = require(join(__dirname, "..", "js", "generador-ticket.js"));

window.addEventListener('DOMContentLoaded', initPOS);

async function initPOS() {
    try {
        const categorias = await readCategorias();
        window.categorias = categorias;

        const sizes = await readSizes();
        window.sizes = sizes;

        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;

        const productos = await readProductos();
        window.productos = productos;

        console.warn('Se cargaron los datos en cache.');

    } catch (error) {
        console.error('❌ Error al cargar bizcochos:', error.message);
        showToast(`[ERROR] al cargar bizcochos: ${error.message}`, ICONOS.error);
    }
}

function cargarCategorias(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectCate = modal.querySelector("#categoria_producto");
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
        const selectSize = modal.querySelector("#size_producto");
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

async function addCarrito() {
    document.getElementById('create-content').innerHTML = '';
    document.getElementById("create-dialog-s").showModal();

    let contenedorId = "create-content";
    let html = `
            <p><strong>Código Producto:</strong>
                <input type="number" id="code_producto" step="1" min="0" value="" placeholder="Ingrese codigo del producto"></p>
            <p><strong>Categoria:</strong>
                <select id="categoria_producto"></select></p>
            <p><strong>Modelo:</strong>
                <input type="text" id="modelo_producto" value="" placeholder="Ingrese modelo del producto"></p>
            <p><strong>Tamaño:</strong>
                <select id="size_producto"></select></p>
            <p><strong>Decoración:</strong>
                <input type="text" id="decoracion_producto" value="" placeholder="Ingrese decoracion del producto"></p>
            <p><strong>Color:</strong>
                <input type="text" id="color_producto" value="" placeholder="Ingrese color del producto"></p>
            <p><strong>Precio Unitario($):</strong>
                <input type="number" id="precio_producto" min="0" value="" placeholder="$$$$$"></p>
            <p><strong>Stock Disponible:</strong>
                <input type="number" id="disponibles_producto" step="1" min="0" value="" placeholder="Ingrese stock disponible del producto"></p>
            <p><strong>Cantidad del Pedido:</strong>
                    <input type="number" id="cantidad" step="1" min="0" value="" placeholder="Ingrese pedido de la venta"></p>
    `;
    document.getElementById(contenedorId).innerHTML = html;
    await cargarCategorias(contenedorId);
    await cargarTamanos(contenedorId);
}

async function searchProducto() {
    const searchInput = document.getElementById("search-input").value.trim();

    if (!searchInput) {
        showToast("Campo de búsqueda vacío", ICONOS.info);
        return;
    }

    document.getElementById('results-content').innerHTML = '';
    const titleRES = document.getElementById('results-title');
    titleRES.textContent = `Coincidencias para "${searchInput}":`;

    const resultados = await coincidenciasProducto(searchInput);

    if (!resultados || resultados.length === 0) {
        mostrarSinCoincidencias();
    } else {
        mostrarListaResultados(resultados);
    }
    

    document.getElementById("results-dialog-s").showModal();
}

function mostrarSinCoincidencias() {
    const content = document.getElementById('results-content');
    const menu = document.getElementById("menu-results");

    content.innerHTML = `<p style="text-align:center; padding: 1rem;">No se encontraron coincidencias.</p>`;
    menu.innerHTML = `<button id="close-dialog-results" class="dialog-btn">Cancelar</button>`;
    document.getElementById("search-input").value = '';

    document.getElementById("close-dialog-results").addEventListener("click", () =>
        cerrarDialogo("results-dialog-s", "results-content", "No se encontraron coincidencias.")
    );
}

async function coincidenciasProducto(searchInput) {
    try {
        const input = searchInput.toLowerCase().trim();
        const palabrasClave = input.split(/\s+/);

        const coincidencias = window.productos.filter(producto => {
            const textoProducto = `${producto.category} MOD.${producto.model} TAM.${producto.size} DECOR.${producto.decoration} COL.${producto.color}`.toLowerCase();
            
            return palabrasClave.some(palabra => textoProducto.includes(palabra));
        });

        return coincidencias;

    } catch (error) {
        console.error('❌ Error al buscar coincidencias del producto:', error.message);
        showToast(`[ERROR] Al buscar coincidencias del producto: ${error.message}`, ICONOS.error);
    }
}


function mostrarListaResultados(productos) {
    const menu = document.getElementById("menu-results");
    menu.innerHTML = '';
    const content = document.getElementById('results-content');
    content.innerHTML = '';

    const lista = document.createElement('ul');
    lista.style.listStyle = 'none';
    lista.style.padding = '0';

    productos.forEach(producto => {
        const item = document.createElement('li');
        item.classList.add('resultado-item');

        item.innerHTML = `
            <div style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #ccc;">
                <strong>${producto.category}</strong> - 
                Modelo: ${producto.model}, 
                Tamaño: ${producto.size}, 
                Decoración: ${producto.decoration}, 
                Color: ${producto.color}
            </div>
        `;

        item.addEventListener('click', () => {
            llenarFormularioDesdeProducto(producto);
            document.getElementById("results-dialog-s").close();
        });

        lista.appendChild(item);
    });

    content.appendChild(lista);
}

function llenarFormularioDesdeProducto(producto) {
    document.getElementById('code_producto').value = producto.code || '';
    document.getElementById('categoria_producto').value = producto.category || '';
    document.getElementById('modelo_producto').value = producto.model || '';
    document.getElementById('size_producto').value = producto.size || '';
    document.getElementById('decoracion_producto').value = producto.decoration || '';
    document.getElementById('color_producto').value = producto.color || '';
    document.getElementById('precio_producto').value = producto.price || '';
    document.getElementById('disponibles_producto').value = producto.stock_disponible ?? '';
    
    document.getElementById('cantidad').value = '';
    document.getElementById("search-input").value = '';
}

document.getElementById("clean-create").addEventListener("click", async () => {
    await limpiarFormularioProducto();
});

async function limpiarFormularioProducto() {
    document.getElementById('code_producto').value = '';
    document.getElementById('categoria_producto').value = '';
    document.getElementById('modelo_producto').value = '';
    document.getElementById('size_producto').value = '';
    document.getElementById('decoracion_producto').value = '';
    document.getElementById('color_producto').value = '';
    document.getElementById('precio_producto').value = '';
    document.getElementById('disponibles_producto').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById("search-input").value = '';

    showToast(`Todos los campos del formulario PRODUCTO han sido limpiados.`, ICONOS.advertencia);
}

/*--------------------------------------ACCIONES------------------------------------------- */

async function cleanCarrito() {
    const confirmed = await showConfirmDialog(
        `¿Desea mover limpiar todos los datos de la venta? ESTA ACCION ES IRREVERSIBLE`,
        "Cancelar venta"
    );

    if (confirmed) {
        let ventaId = +document.getElementById("pos_id_venta").value || 0;
        showToast(`Venta #${ventaId} cancelada. Que tenga buen día.`, ICONOS.advertencia);

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        showToast("Acción LIMPIAR VENTA cancelada", ICONOS.error);
    }
}

async function printCarrito() {
    const confirmed = await showConfirmDialog(
        `¿Desea terminar la venta e imprimir la nota de venta`,
        "Imprimir venta"
    );

    if (confirmed) {
        let ventaId = +document.getElementById("pos_id_venta").value || 0;
        //const detalles_venta = await readDetalles(ventaId);
        
        //await generarRecibos({ venta_datos: detalles_venta });
        showToast(`Venta #${ventaId} y recibo procesados exitosamente. Que tenga buen día.`, ICONOS.success);

        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } else {
        showToast("Acción IMPRIMIR NOTA cancelada", ICONOS.error);
    }
}

/*--------------------------------------DIALOGOS------------------------------------------- */

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

document.getElementById("close-dialog-create").addEventListener("click", () =>
    cerrarDialogo("create-dialog-s", "create-content", "Agregación cancelada"));