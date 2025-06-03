const { join } = require('path');
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
    readOrdenes, createOrden, updateEstado, readOrdenesOrigen
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));

window.addEventListener('DOMContentLoaded', initBizcochos);

async function initBizcochos() {
    try {
        const fases = await readFases();
        window.fases = fases;

        const categorias = await readCategorias();
        window.categorias = categorias;

        const sizes = await readSizes();
        window.sizes = sizes;

        const ordenes = await readOrdenes();
        window.ordenes = ordenes;

        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;
        fillTableBizcochos(bizcochos);

        console.warn('📦 Se cargaron todos los datos en caché.');
    } catch (error) {
        console.error('❌ Error al cargar bizcochos:', error.message);
        showToast(`[ERROR] al cargar bizcochos: ${error.message}`, ICONOS.error);
    }
}

function fillTableBizcochos(bizcochos){
    const tableBody = document.querySelector('#table-bizcochos tbody');
    tableBody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    bizcochos.forEach(b => {
        const row = document.createElement('tr');
        row.id = 'biz-' + b.id_biz;
        row.innerHTML = `
        <td>${b.id_biz}</td>
        <td>${b.biz_category}</td>
        <td>${b.biz_model}</td>
        <td>${b.biz_size}</td>
        <td>${b.stock_disponible}</td>
        <td>${b.stock_en_proceso}</td>
        <td class="col-btn">
            <button onclick="showUpdate(${b.id_biz});">✏️ Editar</button>
            <button onclick="showDelete(${b.id_biz});">🗑️ Eliminar</button>
        </td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

async function showUpdate(id_biz) {
    document.getElementById('update-content').innerHTML = '';
    const mode = "update";
    await fillBizcocho(id_biz, mode);
    document.getElementById("update-dialog-s").showModal();
}

async function showCreate() {
    document.getElementById('create-content').innerHTML = '';
    const mode = "create";
    await fillBizcocho(null, mode);
    document.getElementById("create-dialog-s").showModal();
}

async function showDelete(id_biz){
    document.getElementById('delete-content').innerHTML = '';
    const mode = "delete";
    await fillBizcocho(id_biz, mode);
    document.getElementById("delete-dialog-s").showModal();
}

function cargarCategorias(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectCate = modal.querySelector("#categoria_bizcocho");
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
        const selectSize = modal.querySelector("#size_bizcocho");
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

function cargarData(bizcochoCRUD) {
    return new Promise((resolve) => {
        const modal = document.querySelector("#update-content");

        modal.querySelector("#id_bizcocho").value = bizcochoCRUD.id_biz;
        modal.querySelector("#categoria_bizcocho").value = bizcochoCRUD.biz_category;
        modal.querySelector("#model_bizcocho").value = bizcochoCRUD.biz_model;
        modal.querySelector("#size_bizcocho").value = bizcochoCRUD.biz_size;
        modal.querySelector("#disponibles_bizcocho").value = bizcochoCRUD.stock_disponible;
        modal.querySelector("#procesos_bizcocho").value = bizcochoCRUD.stock_en_proceso;
        modal.querySelector("#stock_min_bizcocho").value = bizcochoCRUD.stock_min;

        resolve();
    });
}

async function fillBizcocho(id_biz, mode) {
    if (mode !== "create") {
        window.bizcochoCRUD = window.bizcochos.find(b => b.id_biz === id_biz);
    }

    let html = "";
    let contenedorId = "";

    switch (mode) {
        case "create":
            contenedorId = "create-content";
            html = `
                <p><strong>Categoria:</strong>
                    <select id="categoria_bizcocho"></select></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="model_bizcocho" value="" placeholder="Ingrese modelo del bizcocho"></p>
                <p><strong>Tamaño:</strong>
                    <select id="size_bizcocho"></select></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" step="1" min="0" value="" placeholder="Ingrese stock disponible del bizcocho"></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" step="1" min="0" value="" placeholder="Ingrese stock en proceso del bizcocho"></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            break;

        case "update":
            contenedorId = "update-content";
            html = `
                <p><strong>Código Bizcocho:</strong>
                    <input type="number" id="id_bizcocho" value="" readonly></p>
                <p><strong>Categoria:</strong>
                    <input type="text" id="categoria_bizcocho" value="" readonly></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="model_bizcocho" value="" readonly></p>
                <p><strong>Tamaño:</strong>
                    <input type="text" id="size_bizcocho" value="" readonly></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" step="1" min="0" value="" placeholder="Ingrese stock disponible del bizcocho"></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" step="1" min="0" value="" placeholder="Ingrese stock en proceso del bizcocho"></p>
                <p><strong>¿Activar alarma?:</strong>
                    <input type="checkbox" id="alarma_bizcocho" ${bizcochoCRUD.stock_critico === 1 ? 'checked' : ''}></p>
                <p><strong>Min. Stock:</strong>
                    <input type="number" id="stock_min_bizcocho" step="1" min="0" value="" placeholder="Ingrese stock minimo para activar la alarma"></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            await cargarData(bizcochoCRUD);
            break;

        case "delete":
            html = `
                <p><strong>Código Bizcocho:</strong>
                    <input type="number" id="id_bizcocho" value="${bizcochoCRUD.id_biz}" readonly></p>
                <p><strong>Categoria:</strong>
                    <input type="text" id="categoria_bizcocho" value="${bizcochoCRUD.biz_category}" readonly></p>
                <p><strong>Modelo:</strong>
                    <input type="text" id="model_bizcocho" value="${bizcochoCRUD.biz_model}" readonly></p>
                <p><strong>Tamaño:</strong>
                    <input type="text" id="size_bizcocho" value="${bizcochoCRUD.biz_size}" readonly></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" value="${bizcochoCRUD.stock_disponible}" readonly></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" value="${bizcochoCRUD.stock_en_proceso}" readonly></p>
            `;
            document.getElementById('delete-content').innerHTML = html;
            break;
    }
}

async function verificacionesBiz(contenedorId, mode) {
    const modal = document.getElementById(contenedorId);

    const getNumber = (selector) => {
        const input = modal.querySelector(selector);
        return input ? parseInt(input.value.trim(), 10) : NaN;
    };

    const getValue = (selector) => {
        const input = modal.querySelector(selector);
        return input ? input.value.trim() : "";
    };

    let id_bizcocho = null;
    if (mode !== "create") {
        id_bizcocho = getNumber("#id_bizcocho");
        if (isNaN(id_bizcocho) || id_bizcocho <= 0) {
            showToast("El código de bizcocho es inválido.", ICONOS.advertencia);
            throw new Error("ID de bizcocho inválido.");
        }
    }

    const categoria = getValue("#categoria_bizcocho");
    if (!categoria) {
        showToast("Debe seleccionar una categoría.", ICONOS.advertencia);
        throw new Error("Categoría vacía.");
    }

    const modelo = getValue("#model_bizcocho");
    if (!modelo) {
        showToast("El modelo del bizcocho es inválido.", ICONOS.advertencia);
        throw new Error("Modelo vacío.");
    }

    const tamano = getValue("#size_bizcocho");
    if (!tamano) {
        showToast("Debe seleccionar un tamaño.", ICONOS.advertencia);
        throw new Error("Tamaño vacío.");
    }

    const disponibles = getNumber("#disponibles_bizcocho");
    if (isNaN(disponibles) || disponibles < 0) {
        showToast("Stock disponible inválido.", ICONOS.advertencia);
        throw new Error("Stock disponible inválido.");
    }

    const procesos = getNumber("#procesos_bizcocho");
    if (isNaN(procesos) || procesos < 0) {
        showToast("Stock en proceso inválido.", ICONOS.advertencia);
        throw new Error("Stock en proceso inválido.");
    }

    let stock_min = 0;
    if (mode === "update") {
        stock_min = getNumber("#stock_min_bizcocho");
        if (isNaN(stock_min) || stock_min < 0) {
            showToast("Stock mínimo inválido.", ICONOS.advertencia);
            throw new Error("Stock mínimo inválido.");
        }
    }

    return {
        ...(mode !== "create" ? { id_biz: id_bizcocho } : {}),
        biz_category: categoria,
        biz_model: modelo,
        biz_size: tamano,
        stock_disponible: disponibles,
        stock_en_proceso: procesos,
        ...(mode === "update" ? { stock_min } : {})
    };
}


document.getElementById("save-create").addEventListener("click", async () => {
    const contenedorId = "create-content";
    const mode = "create";
    try {
        const payload = await verificacionesBiz(contenedorId, mode);
        await guardarBizcocho(mode, payload);
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
        const payload = await verificacionesBiz(contenedorId, mode);
        await guardarBizcocho(mode, payload);
        document.getElementById("update-dialog-s").close();
    } catch (err) {
        showToast(err.message, ICONOS.error);
        console.error("[ERROR] ", err.message);
    }
});

async function guardarBizcocho(mode, payload) {
    if (mode === "create") {
        payload.id_biz = 0;

        const dup = window.bizcochos.some(b =>
            b.biz_category === payload.biz_category &&
            b.biz_size === payload.biz_size &&
            b.biz_model === payload.biz_model
        );
        if (dup) {
            throw new Error(`Ya existe un bizcocho de categoría “${payload.biz_category}”, tamaño “${payload.biz_size}” y modelo “${payload.biz_model}”.`);
        }

        payload.stock_min = 0;
        payload.stock_critico = 0;

        await createBizcocho(payload);
        showToast('Bizcocho agregado 📦.', ICONOS.success);

    } else if (mode === "update") {
        payload.id_biz = +document.querySelector("#update-content #id_bizcocho").value.trim();

        const dup = window.bizcochos.some(b =>
            b.biz_category === payload.biz_category &&
            b.biz_size === payload.biz_size &&
            b.biz_model === payload.biz_model &&
            b.id_biz !== payload.id_biz
        );
        if (dup) {
            throw new Error(`Ya existe un bizcocho de categoría “${payload.biz_category}”, tamaño “${payload.biz_size}” y modelo “${payload.biz_model}”.`);
        }

        payload.stock_critico = document.querySelector("#update-content #alarma_bizcocho").checked ? 1 : 0;

        await updateBizcocho(payload);
        showToast('Bizcocho actualizado 🛠️.', ICONOS.success);
    }

    const nombreBiz = `${payload.biz_category} ${payload.biz_size} Mod.${payload.biz_model}`;
    const ordenRelacionada = window.ordenes.some(o =>
        o.name_item === nombreBiz &&
        o.tipo_item === "bizcocho" &&
        o.origen === "INVENTARIO"
    );

    console.log("[Verificando orden relacionada] ->", nombreBiz);

    if (!ordenRelacionada && (payload.stock_en_proceso ?? 0) > 0) {
        const confirmed = await showConfirmDialog(
            `No se encontró una orden de inventario para este bizcocho, pero la columna "En proceso" indica que hay ${payload.stock_en_proceso} unidad(es). Esto puede causar inconsistencias.`,
            `¿Deseas crear una orden base de tipo "INVENTARIO"?`
        );

        if (confirmed) {
            const nuevaOrdenInventario = {
                tipo_item: "bizcocho",
                name_item: nombreBiz,
                cantidad_pedida: payload.stock_en_proceso ?? 0,
                observaciones: `Creada automáticamente porque se detectó stock en proceso (${payload.stock_en_proceso}) sin orden registrada.`
            };

            await createOrden(nuevaOrdenInventario, "INVENTARIO");
            showToast("Orden base creada automáticamente para el bizcocho.", ICONOS.info);
        }
    }

    await initBizcochos();
}


document.getElementById("save-delete").addEventListener("click", async () => {
    const contenedorId = "delete-content";
    const id_biz = parseInt(document.querySelector(`#${contenedorId} #id_bizcocho`).value.trim());

    const confirmed = await showConfirmDialog(
        `¿Seguro que quieres eliminar el bizcocho #${id_biz}?`,
        "Confirmación"
    );

    if (!confirmed) {
        document.getElementById("delete-dialog-s").close();
        showToast("Eliminación cancelada", ICONOS.info);
        return;
    }

    try {
        await deleteBizcocho(id_biz);
        showToast("Bizcocho eliminado 📦.", ICONOS.success);
        document.getElementById("delete-dialog-s").close();
        await initBizcochos();
    } catch (err) {
        console.error("❌ Error al eliminar bizcocho:", err.message);
        showToast(`[ERROR] al eliminar: ${err.message}`, ICONOS.error);
    }
});

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
    cerrarDialogo("update-dialog-s", "update-content","Actualización cancelada"));