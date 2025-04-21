const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud-productos.js');
const { createProducto, readProductos, updateProducto, deleteProducto } = require(crudJS);
const toast = join(__dirname, '..', 'js', 'toast.js');
const { showToast, showConfirmToast, ICONOS } = require(toast);

window.addEventListener('DOMContentLoaded', initProductos);

async function initProductos() {
    try {
        const productos = await new Promise((res, rej) =>
            readProductos((err, data) => err ? rej(err) : res(data))
        );
        window.productos = productos;
        fillTableProductos(productos);
        console.log('Se cargaron productos.');
    } catch (error) {
        console.error('Error al cargar productos:', error);
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
                <button onclick="renderProducto('${p.code}');">✏️ Editar</button>
                <button onclick="eliminarProducto('${p.code}');">🗑️ Eliminar</button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

function eliminarProducto(code) {
    showConfirmToast(
        `¿Seguro que quieres eliminar el producto #${code}?`,
        async (confirmado) => {
            if (!confirmado) {
                showToast("Eliminación cancelada", ICONOS.info);
                return;
            }

            try {
                await new Promise((resolve, reject) => {
                    deleteProducto(
                        { code: code }, 
                        (err) => err ? reject(err) : resolve()
                    );
                });
                showToast("Producto eliminado", ICONOS.success);
                initProductos();
            } catch (err) {
                console.error("[ERROR] eliminarProducto:", err);
                showToast("Error al eliminar", ICONOS.error);
            }
        },
        ICONOS.peligro
    );
}

function prepareNewProd() {
    const form = document.getElementById('formProd');
    form.reset();
    form.dataset.mode = 'create';
    openModal('editProductoModal');
}

function renderProducto(code) {
    const p = window.productos.find(x => x.code === parseInt(code));
    if (!p) return showToast('Producto no encontrado', ICONOS.error);

    const form = document.getElementById('formProd');
    form.dataset.mode = 'edit';

    document.getElementById('prodCode').value     = p.code;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodModel').value    = p.model;
    document.getElementById('prodSize').value     = p.size;
    document.getElementById('prodDecoration').value = p.decoration;
    document.getElementById('prodColor').value    = p.color;

    document.getElementById('prodPrice').value    = parseFloat(p.price);
    document.getElementById('prodDisp').value     = parseInt(p.stock_disponible);
    document.getElementById('prodApr').value      = parseInt(p.stock_apartado);
    document.getElementById('prodProc').value     = parseInt(p.stock_en_proceso);

    openModal('editProductoModal');
}


function guardarProducto(event) {
    event.preventDefault();

    const form = document.getElementById('formProd');
    const mode = form.dataset.mode;
    const code = parseInt(document.getElementById('prodCode').value.trim());

    const payload = {
        code, 
        category:         document.getElementById('prodCategory').value,
        model:            document.getElementById('prodModel').value,
        size:             document.getElementById('prodSize').value,
        decoration:       document.getElementById('prodDecoration').value,
        color:            document.getElementById('prodColor').value,
        price:            +document.getElementById('prodPrice').value,
        stock_disponible: +document.getElementById('prodDisp').value,
        stock_apartado:   +document.getElementById('prodApr').value,
        stock_en_proceso: +document.getElementById('prodProc').value
    };

    console.log(payload);
    console.log(mode);

    // MODO CREAR
    if (mode === 'create') {
        const dupCode = window.productos.some(p => p.code === payload.code);
        if (dupCode) {
            return showToast(`Ya existe un producto con código ${payload.code}.`, ICONOS.advertencia);
        }

        const dupCombo = window.productos.some(p =>
            p.category   === payload.category &&
            p.model      === payload.model &&
            p.size       === payload.size &&
            p.decoration === payload.decoration &&
            p.color      === payload.color
        );
        if (dupCombo) {
            return showToast(
                `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                ICONOS.advertencia
            );
        }

        createProducto(payload, (err) => {
            if (err) {
                console.error('Error al crear producto:', err);
                return showToast('Error al agregar', ICONOS.error);
            }
            showToast('Producto agregado', ICONOS.success);
            closeModal('editProductoModal');
            initProductos();
        });

    // MODO EDITAR
    } else if (mode === 'edit') {
        const dupCombo = window.productos.some(p =>
            p.category   === payload.category &&
            p.model      === payload.model &&
            p.size       === payload.size &&
            p.decoration === payload.decoration &&
            p.color      === payload.color &&
            p.code       !== payload.code  // Este filtro es clave para evitar duplicados en editar
        );
        if (dupCombo) {
            return showToast(
                `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                ICONOS.advertencia
            );
        }

        updateProducto(payload, (err) => {
            if (err) {
                console.error('Error al actualizar producto:', err);
                return showToast('Error al actualizar', ICONOS.error);
            }
            showToast('Producto actualizado', ICONOS.success);
            closeModal('editProductoModal');
            initProductos();
        });

    // MODO DESCONOCIDO
    } else {
        console.warn('guardarProducto: modo desconocido', mode);
    }
}

