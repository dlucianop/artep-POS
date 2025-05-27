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
    readFases, updateFase, readCategorias, readSizes
} = require(join(__dirname, "..", "js", "crud-config.js"));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, '..', 'js', 'toast.js'));

window.addEventListener('DOMContentLoaded', initProductos);

async function initProductos() {
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
        const productos = await readProductos();
        window.productos = productos;
        fillTableProductos(productos);
        console.warn('📦 Se cargaron productos.');
    } catch (error) {
        console.error('❌ Error al cargar productos:', error.message);
        showToast('Error al cargar inventario', ICONOS.error);
    }
}

function fillTableProductos(productos) {
    const tableBody = document.getElementById('tablaProductosBody');
    tableBody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    productos.forEach(p => {
        const row = document.createElement('tr');
        row.id = 'prod-' + p.code;
        row.innerHTML = `
            <td>${p.code}</td>
            <td>${p.category}</td>
            <td>${p.model}</td>
            <td>${p.size}</td>
            <td>${p.decoration}</td>
            <td>${p.color}</td>
            <td>${p.price.toFixed(2)}</td>
            <td>${p.stock_disponible}</td>
            <td>${p.stock_apartado}</td>
            <td>${p.stock_en_proceso}</td>
            <td class="col-btn">
                <button onclick="showUpdate(${p.code});">✏️ Editar</button>
                <button onclick="showDelete(${p.code});">🗑️ Eliminar</button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

async function showUpdate(code) {
    document.getElementById('update-content').innerHTML = '';
    const mode = "update";
    await fillProducto(code, mode);
    document.getElementById("update-dialog-s").showModal();
}

async function showCreate() {
    document.getElementById('create-content').innerHTML = '';
    const mode = "create";
    await fillProducto(null, mode);
    document.getElementById("create-dialog-s").showModal();
}

async function showDelete(code){
    document.getElementById('delete-content').innerHTML = '';
    const mode = "delete";
    await fillProducto(code, mode);
    document.getElementById("delete-dialog-s").showModal();
}

async function fillProducto(code, mode) {
    if (mode !== "create") {
        window.productoCRUD = window.productos.find(p => p.code === code);
    }

    let html = "";
    let contenedorId = "";

    switch (mode) {
        case "create":
            contenedorId = "create-content";
            html = `
                <p><strong>Código Producto:</strong>
                    <input type="number" id="code_producto" step="1" min="0" value=""></p>
                <p><strong>Categoria:</strong>
                    <select id="categoria_producto"></select></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="modelo_producto" value=""></p>
                <p><strong>Tamaño:</strong>
                    <select id="size_producto"></select></p>
                <p><strong>Decoración:</strong>
                    <input type="text" id="decoracion_producto" value=""></p>
                <p><strong>Color:</strong>
                    <input type="text" id="color_producto" value=""></p>
                <p><strong>Precio Unitario($):</strong>
                    <input type="number" id="precio_producto" min="0" value=""></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_producto" step="1" min="0" value=""></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_producto" step="1" min="0" value=""></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_producto" step="1" min="0" value=""></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            break;

        case "update":
            contenedorId = "update-content";
            html = `
                <p><strong>Código Producto:</strong>
                    <input type="number" id="code_producto" step="1" min="0" value=""></p>
                <p><strong>Categoria:</strong>
                    <select id="categoria_producto"></select></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="modelo_producto" value=""></p>
                <p><strong>Tamaño:</strong>
                    <select id="size_producto"></select></p>
                <p><strong>Decoración:</strong>
                    <input type="text" id="decoracion_producto" value=""></p>
                <p><strong>Color:</strong>
                    <input type="text" id="color_producto" value=""></p>
                <p><strong>Precio Unitario($):</strong>
                    <input type="number" id="precio_producto" min="0" value=""></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_producto" step="1" min="0" value=""></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_producto" step="1" min="0" value=""></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_producto" step="1" min="0" value=""></p>
                <p><strong>¿Alarma?:</strong>
                    <input type="checkbox" id="alarma_producto" ${productoCRUD.stock_critico === 1 ? 'checked' : ''}></p>
                <p><strong>Min. Stock:</strong>
                    <input type="number" id="stock_min_producto" step="1" min="0" value=""></p>
            `;

            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            await cargarData(productoCRUD);
            break;

        case "delete":
            html = `
                <p><strong>Código Producto:</strong>
                    <input type="number" id="code_producto" step="1" min="0" value="${productoCRUD.code}" readonly></p>
                <p><strong>Categoria:</strong>
                    <input id="categoria_producto" value="${productoCRUD.category}" readonly></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="modelo_producto" value="${productoCRUD.model}" readonly></p>
                <p><strong>Tamaño:</strong>
                    <input id="size_producto" value="${productoCRUD.size}" readonly></p>
                <p><strong>Decoración:</strong>
                    <input type="text" id="decoracion_producto" value="${productoCRUD.decoration}" readonly></p>
                <p><strong>Color:</strong>
                    <input type="text" id="color_producto" value="${productoCRUD.color}" readonly></p>
                <p><strong>Precio Unitario($):</strong>
                    <input type="number" id="precio_producto" min="0" value="${productoCRUD.price}" readonly></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_producto" step="1" min="0" value="${productoCRUD.stock_disponible}" readonly></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_producto" step="1" min="0" value="${productoCRUD.stock_apartado}" readonly></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_producto" step="1" min="0" value="${productoCRUD.stock_en_proceso}" readonly></p>
            `;

            document.getElementById('delete-content').innerHTML = html;
            break;
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

function cargarData(productoCRUD) {
    return new Promise((resolve) => {
        const modal = document.querySelector("#update-content");
        modal.querySelector("#code_producto").value = productoCRUD.code;
        modal.querySelector("#categoria_producto").value = productoCRUD.category; 
        modal.querySelector("#modelo_producto").value = productoCRUD.model; 
        modal.querySelector("#size_producto").value = productoCRUD.size; 
        modal.querySelector("#decoracion_producto").value = productoCRUD.decoration; 
        modal.querySelector("#precio_producto").value = productoCRUD.price;
        modal.querySelector("#disponibles_producto").value = productoCRUD.stock_disponible; 
        modal.querySelector("#apartados_producto").value = productoCRUD.stock_apartado; 
        modal.querySelector("#procesos_producto").value = productoCRUD.stock_en_proceso; 
        modal.querySelector("#stock_min_producto").value = productoCRUD.stock_min;

        resolve();
    });
}