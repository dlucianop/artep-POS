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
        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;
        console.warn('📦 Se cargaron bizcochos.');
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
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_producto" step="1" min="0" value="" placeholder="Ingrese stock apartado del producto"></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_producto" step="1" min="0" value="" placeholder="Ingrese stock en proceso del producto"></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            break;

        case "update":
            contenedorId = "update-content";
            html = `
                <p><strong>Código Producto:</strong>
                    <input type="number" id="code_producto" step="1" min="0" value="" placeholder="Ingrese codigo del producto" readonly></p>
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
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_producto" step="1" min="0" value="" placeholder="Ingrese stock apartado del producto"></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_producto" step="1" min="0" value="" placeholder="Ingrese stock en proceso del producto"></p>
                <p><strong>¿Activar alarma?:</strong>
                    <input type="checkbox" id="alarma_producto" ${productoCRUD.stock_critico === 1 ? 'checked' : ''}></p>
                <p><strong>Min. Stock:</strong>
                    <input type="number" id="stock_min_producto" step="1" min="0" value="" placeholder="Ingrese stock minimo para activar la alarma"></p>
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
        modal.querySelector("#color_producto").value = productoCRUD.color;
        modal.querySelector("#precio_producto").value = productoCRUD.price;
        modal.querySelector("#disponibles_producto").value = productoCRUD.stock_disponible; 
        modal.querySelector("#apartados_producto").value = productoCRUD.stock_apartado; 
        modal.querySelector("#procesos_producto").value = productoCRUD.stock_en_proceso; 
        modal.querySelector("#stock_min_producto").value = productoCRUD.stock_min;

        resolve();
    });
}

async function verificacionesProducto(contenedorId, mode) {
    const modal = document.getElementById(contenedorId);

    const getNumber = (selector) => {
        const input = modal.querySelector(selector);
        return input ? parseInt(input.value.trim(), 10) : NaN;
    };

    const getValue = (selector) => {
        const input = modal.querySelector(selector);
        return input ? input.value.trim() : "";
    };

    const code_producto = getNumber("#code_producto");
    if (isNaN(code_producto) || code_producto <= 0) {
        showToast("El código de producto es inválido.", ICONOS.advertencia);
        return Promise.reject(new Error("Código de producto inválido."));
    }

    const categoria = getValue("#categoria_producto");
    if (!categoria) {
        showToast("Debe seleccionar una categoría.", ICONOS.advertencia);
        return Promise.reject(new Error("Categoría vacía."));
    }

    const modelo = getValue("#modelo_producto").trim();
    if (!modelo) {
        showToast("Falta llenar el campo de modelo.", ICONOS.advertencia);
        return Promise.reject(new Error("Modelo vacío."));
    }

    const tamano = getValue("#size_producto");
    if (!tamano) {
        showToast("Debe seleccionar un tamaño.", ICONOS.advertencia);
        return Promise.reject(new Error("Tamaño vacío."));
    }

    const decoracion = getValue("#decoracion_producto").trim();
    if (!decoracion) {
        showToast("Falta llenar el campo de decoración.", ICONOS.advertencia);
        return Promise.reject(new Error("Decoración vacío."));
    }

    const color = getValue("#color_producto").trim();
    if (!color) {
        showToast("Falta llenar el campo de color.", ICONOS.advertencia);
        return Promise.reject(new Error("Color vacío."));
    }

    const precio = getNumber("#precio_producto");
    if (isNaN(precio) || precio <= 0) {
        showToast("El precio unitario es inválido.", ICONOS.advertencia);
        return Promise.reject(new Error("Precio unitario inválido."));
    }

    const disponibles = getNumber("#disponibles_producto");
    if (isNaN(disponibles) || disponibles < 0) {
        showToast("Stock disponible inválido.", ICONOS.advertencia);
        return Promise.reject(new Error("Stock disponible inválido."));
    }

    const apartados = getNumber("#apartados_producto");
    if (isNaN(apartados) || apartados < 0) {
        showToast("Stock apartado inválido.", ICONOS.advertencia);
        return Promise.reject(new Error("Stock apartado inválido."));
    }

    const procesos = getNumber("#procesos_producto");
    if (isNaN(procesos) || procesos < 0) {
        showToast("Stock en proceso inválido.", ICONOS.advertencia);
        return Promise.reject(new Error("Stock en proceso inválido."));
    }

    if (mode === "update") {
        const stock_min = getNumber("#stock_min_producto");
        if (isNaN(stock_min) || stock_min < 0) {
            showToast("Stock mínimo inválido.", ICONOS.advertencia);
            return Promise.reject(new Error("Stock mínimo inválido."));
        }
    }

    return Promise.resolve();
}

document.getElementById("save-create").addEventListener("click", async () => {
    const contenedorId = "create-content";
    const mode = "create";
    try {
        await verificacionesProducto(contenedorId, mode);
        await guardarProducto(mode, contenedorId);
        document.getElementById("create-dialog-s").close();
    } catch (err) {
        showToast(err.message, ICONOS.error);
        console.error("[ERROR] ", err.message);
    }
});

document.getElementById("save-update").addEventListener("click", async () => {
    const contenedorId = "update-content";
    const mode = "update";
    try {
        await verificacionesProducto(contenedorId, mode);
        await guardarProducto(mode, contenedorId);
        document.getElementById("update-dialog-s").close();
    } catch (err) {
        showToast(err.message, ICONOS.error);
        console.error("[ERROR] ", err.message);
    }
});

async function guardarProducto(mode, contenedorId) {
    const code = parseInt(document.querySelector(`#${contenedorId} #code_producto`).value.trim());

    const payload = {
        code, 
        category: document.querySelector(`#${contenedorId} #categoria_producto`).value.trim(),
        model: document.querySelector(`#${contenedorId} #modelo_producto`).value.trim(),
        size: document.querySelector(`#${contenedorId} #size_producto`).value.trim(),
        decoration: document.querySelector(`#${contenedorId} #decoracion_producto`).value.trim(),
        color: document.querySelector(`#${contenedorId} #color_producto`).value.trim(),
        price: +document.querySelector(`#${contenedorId} #precio_producto`).value,
        stock_disponible: +document.querySelector(`#${contenedorId} #disponibles_producto`).value,
        stock_apartado: +document.querySelector(`#${contenedorId} #apartados_producto`).value,
        stock_en_proceso: +document.querySelector(`#${contenedorId} #procesos_producto`).value,
        stock_min: mode === "update"
            ? +document.querySelector(`#${contenedorId} #stock_min_producto`).value
            : 0,
        stock_critico: mode === "update"
            ? (document.querySelector(`#${contenedorId} #alarma_producto`).checked ? 1 : 0)
            : 0,
    };

    if (mode === "create") {
        const dupCode = window.productos.some(p => p.code === payload.code);
        if (dupCode) {
            throw new Error(`Ya existe un producto con Código ${payload.code}.`);
        }
        
        const dupCombo = window.productos.some(p =>
            p.category    === payload.category &&
            p.model       === payload.model &&
            p.size        === payload.size &&
            p.decoration  === payload.decoration &&
            p.color       === payload.color
        );
        if (dupCombo) {
            throw new Error(`Ya existe un producto con esa combinación de categoría, modelo, tamaño, decoración y color.`);
        }

        await createProducto(payload);
        console.warn('📦 Se agregó un nuevo producto.');
        showToast('Producto agregado 📦.', ICONOS.success);

    } else if (mode === "update") {
        const dupCombo = window.productos.some(p =>
            p.category    === payload.category &&
            p.model       === payload.model &&
            p.size        === payload.size &&
            p.decoration  === payload.decoration &&
            p.color       === payload.color &&
            p.code        !== payload.code
        );
        if (dupCombo) {
            throw new Error(`Ya existe un producto con esa combinación de categoría, modelo, tamaño, decoración y color.`);
        }

        await updateProducto(payload);
        console.warn('📦 Se actualizó un producto.');
        showToast('Producto actualizado 📦.', ICONOS.success);
    }

    const bizcochoRelacionado = window.bizcochos.some(b =>
        b.biz_category === payload.category &&
        b.biz_size     === payload.size
    );

    if (!bizcochoRelacionado) {
        const confirmed = await showConfirmDialog(
            `No se encontró un bizcocho con categoría "${payload.category}" y tamaño "${payload.size}". ¿Desea crear este bizcocho base ahora?`,
            "Bizcocho relacionado no encontrado"
        );

        if (confirmed) {
            const nuevoBizcocho = {
                biz_category:     payload.category,
                biz_size:         payload.size,
                stock_disponible: 0,
                stock_apartado:   0,
                stock_en_proceso: 0,
                stock_min: 0,
                stock_critico: 0,
            };

            await createBizcocho(nuevoBizcocho);
            showToast("Bizcocho base creado automáticamente.", ICONOS.info);
        }
    }

    await initProductos();
}

document.getElementById("save-delete").addEventListener("click", async () => {
    const contenedorId = "delete-content";
    const code = parseInt(document.querySelector(`#${contenedorId} #code_producto`).value.trim());

    const confirmed = await showConfirmDialog(
        `¿Seguro que quieres eliminar el producto #${code}?`,
        "Confirmación"
    );

    if (!confirmed) {
        document.getElementById("delete-dialog-s").close();
        showToast("Eliminación cancelada", ICONOS.info);
        return;
    }

    try {
        await deleteProducto(code);
        showToast("Producto eliminado 📦.", ICONOS.success);
        console.warn('📦 Se elimino un producto.');
        document.getElementById("delete-dialog-s").close();
        await initProductos();
    } catch (err) {
        console.error("❌ Error al eliminar producto:", err.message);
        showToast(`[ERROR] al eliminar: ${err.message}`, ICONOS.error);
    }
});

function showConfirmDialog(message = "¿Estás seguro?", title = "Confirmar acción") {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirm-dialog-s');
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
    cerrarDialogo("update-dialog-s", "update-content", "Actualización cancelada"));