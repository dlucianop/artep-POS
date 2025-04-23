const { join } = require('path');
const { 
    createProducto, 
    readProductos, 
    searchProduct, 
    updateProducto, 
    deleteProducto  
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, '..', 'js', 'toast.js'));

window.addEventListener('DOMContentLoaded', initProductos);

async function initProductos() {
    try {
        const productos = await readProductos();
        window.productos = productos;
        fillTableProductos(productos);
        console.log('📦 Se cargaron productos.');
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
                <button onclick="editarProducto('${p.code}');">✏️ Editar</button>
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
                await deleteProducto(code);
                console.log('📦 Se elimino un producto.');
                showToast("Producto eliminado 📦.", ICONOS.success);
                initProductos();
            } catch (err) {
                console.error("[ERROR] eliminarProducto:", err.message);
                showToast("Error al eliminar", ICONOS.error);
            }
        },
        ICONOS.peligro
    );
}

function agregarNuevoProducto() {
    const form = document.getElementById('formProd');
    form.dataset.mode = 'create';
    renderProducto();
}

function editarProducto(code) {
    const form = document.getElementById('formProd');
    form.dataset.mode = 'edit';
    renderProducto(code);
}

function renderProducto(code) {
    const form = document.getElementById('formProd');
    const prodCodeField = document.getElementById('prodCodeField');

    if (form.dataset.mode === 'create') {
        form.reset();
        prodCodeField.style.display = 'block';
        console.log('Creando nuevo producto 📦');
    } else if (form.dataset.mode === 'edit') {
        const p = window.productos.find(x => x.code === parseInt(code));
        if (!p) return showToast('Producto no encontrado', ICONOS.error);

        document.getElementById('prodCode').value = p.code;
        prodCodeField.style.display = 'none';

        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodModel').value = p.model;
        document.getElementById('prodSize').value = p.size;
        document.getElementById('prodDecoration').value = p.decoration;
        document.getElementById('prodColor').value = p.color;
        document.getElementById('prodPrice').value = parseFloat(p.price);
        document.getElementById('prodDisp').value = parseInt(p.stock_disponible);
        document.getElementById('prodApr').value = parseInt(p.stock_apartado);
        document.getElementById('prodProc').value = parseInt(p.stock_en_proceso);

        console.log('Editando producto con código:', p.code);
    }

    openModal('editProductoModal');
}

async function guardarProducto(event) {
    event.preventDefault();

    const form = document.getElementById('formProd');
    const mode = form.dataset.mode;
    const code = parseInt(document.getElementById('prodCode').value.trim());

    const payload = {
        code, 
        category: document.getElementById('prodCategory').value,
        model: document.getElementById('prodModel').value,
        size: document.getElementById('prodSize').value,
        decoration: document.getElementById('prodDecoration').value,
        color: document.getElementById('prodColor').value,
        price: +document.getElementById('prodPrice').value,
        stock_disponible: +document.getElementById('prodDisp').value,
        stock_apartado: +document.getElementById('prodApr').value,
        stock_en_proceso: +document.getElementById('prodProc').value
    };

    try {
        if (mode === 'create') {
            const dupCode = window.productos.some(p => p.code === payload.code);
            if (dupCode) {
                return showToast(`Ya existe un producto con código ${payload.code}.`, ICONOS.advertencia);
            }

            const dupCombo = window.productos.some(p =>
                p.category === payload.category &&
                p.model === payload.model &&
                p.size === payload.size &&
                p.decoration === payload.decoration &&
                p.color === payload.color
            );
            if (dupCombo) {
                return showToast(
                    `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                    ICONOS.advertencia
                );
            }

            await createProducto(payload);
            console.log('📦 Se agrego un nuevo producto.');
            showToast('Producto agregado', ICONOS.success);
            closeModal('editProductoModal');
            await initProductos();

        } else if (mode === 'edit') {
            const dupCombo = window.productos.some(p =>
                p.category === payload.category &&
                p.model === payload.model &&
                p.size === payload.size &&
                p.decoration === payload.decoration &&
                p.color === payload.color &&
                p.code !== payload.code
            );
            if (dupCombo) {
                return showToast(
                    `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                    ICONOS.advertencia
                );
            }

            await updateProducto(payload);
            console.log('📦 Se modifico un producto.');
            showToast('Producto actualizado', ICONOS.success);
            closeModal('editProductoModal');
            await initProductos();

        } else {
            console.warn('guardarProducto: modo desconocido', mode);
        }
    } catch (err) {
        console.error('[ERROR] guardarProducto:', err);
        showToast('Error al guardar el producto', ICONOS.error);
    }
}
