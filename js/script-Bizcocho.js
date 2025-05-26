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
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));

window.addEventListener('DOMContentLoaded', initBizcochos);

async function initBizcochos() {
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
        fillTableBizcochos(bizcochos);
        console.warn('📦 Se cargaron bizcochos.');
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
        <td>${b.biz_size}</td>
        <td>${b.stock_disponible}</td>
        <td>${b.stock_apartado}</td>
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
    document.getElementById("update-dialog").showModal();
}

async function showCreate() {
    document.getElementById('create-content').innerHTML = '';
    const mode = "create";
    await fillBizcocho(null, mode);
    document.getElementById("create-dialog").showModal();
}

async function showDelete(id_biz){
    document.getElementById('delete-content').innerHTML = '';
    const mode = "delete";
    await fillBizcocho(id_biz, mode);
    document.getElementById("delete-dialog").showModal();
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
        modal.querySelector("#size_bizcocho").value = bizcochoCRUD.biz_size;
        modal.querySelector("#disponibles_bizcocho").value = bizcochoCRUD.stock_disponible;
        modal.querySelector("#apartados_bizcocho").value = bizcochoCRUD.stock_apartado;
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
                <p><strong>Código Bizcocho:</strong>
                    <input type="number" id="id_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Categoria:</strong>
                    <select id="categoria_bizcocho"></select></p>
                <p><strong>Tamaño:</strong>
                    <select id="size_bizcocho"></select></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" step="1" min="0" value=""></p>
                <p><strong>¿Alarma?:</strong>
                    <input type="checkbox" id="alarma_bizcocho"></p>
                <p><strong>Min. Stock:</strong>
                    <input type="number" id="stock_min_bizcocho" step="1" min="0" value=""></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarCategorias(contenedorId);
            await cargarTamanos(contenedorId);
            break;

        case "update":
            contenedorId = "update-content";
            html = `
                <p><strong>Código Bizcocho:</strong>
                    <input type="number" id="id_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Categoria:</strong>
                    <select id="categoria_bizcocho"></select></p>
                <p><strong>Tamaño:</strong>
                    <select id="size_bizcocho"></select></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_bizcocho" step="1" min="0" value=""></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" step="1" min="0" value=""></p>
                <p><strong>¿Alarma?:</strong>
                    <input type="checkbox" id="alarma_bizcocho" ${bizcochoCRUD.stock_critico === 1 ? 'checked' : ''}></p>
                <p><strong>Min. Stock:</strong>
                    <input type="number" id="stock_min_bizcocho" step="1" min="0" value=""></p>
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
                <p><strong>Tamaño:</strong>
                    <input type="text" id="size_bizcocho" value="${bizcochoCRUD.biz_size}" readonly></p>
                <p><strong>Stock Disponible:</strong>
                    <input type="number" id="disponibles_bizcocho" value="${bizcochoCRUD.stock_disponible}" readonly></p>
                <p><strong>Stock Apartado:</strong>
                    <input type="number" id="apartados_bizcocho" value="${bizcochoCRUD.stock_apartado}" readonly></p>
                <p><strong>Stock en Proceso:</strong>
                    <input type="number" id="procesos_bizcocho" value="${bizcochoCRUD.stock_en_proceso}" readonly></p>
            `;
            document.getElementById('delete-content').innerHTML = html;
            break;
    }
}


async function verificacionesBiz() {

}

document.getElementById("save-update").addEventListener("click", async () => {
    await verificacionesBiz();
    document.getElementById("update-dialog").close();
});

document.getElementById("save-create").addEventListener("click", async () => {
    await verificacionesBiz();
    document.getElementById("create-dialog").close();
});

document.getElementById("save-delete").addEventListener("click", async () => {
    await verificacionesBiz();
    document.getElementById("delete-dialog").close();
});

/*function eliminarBizcocho(id_biz) {
    showConfirmToast(
        `¿Seguro que quieres eliminar el bizcocho #${id_biz}?`,
        async (confirmado) => {
            if (!confirmado) {
                showToast("Eliminación cancelada", ICONOS.info);
                return;
            }
            try {
                await deleteBizcocho(id_biz);
                console.log('📦 Se eliminaron bizcochos.');
                showToast("Bizcocho eliminado 📦.", ICONOS.success);
                initBizcochos();
            } catch (err) {
                console.error("❌ Error al eliminar bizcocho:", err.message);
                showToast(`[ERROR] al cargar bizcochos: ${err.message}`, ICONOS.error);
            }
        },
        ICONOS.peligro
    );
}*/

/*function agregarNuevoBizcocho() {
    const form = document.getElementById('formBiz');
    form.dataset.mode = 'create';
    renderBizco();
}

function editarBizcocho(id_biz) {
    const form = document.getElementById('formBiz');
    form.dataset.mode = 'edit';
    renderBizco(id_biz);
}
  
function renderBizco(id_biz) {
    const form = document.getElementById('formBiz');
    const bizCodeField = document.getElementById("bizCodeField");

    if (form.dataset.mode === 'create') {
        form.reset();
        bizCodeField.style.display = "block";
        console.log('Creando nuevo bizcocho 📦');
    } else if (form.dataset.mode === 'edit') {
        const b = window.bizcochos.find(x => x.id_biz === parseInt(id_biz));
        if (!b) return showToast("Bizcocho no encontrado en inventario.", ICONOS.error);
        
        document.getElementById('bizId').value        = b.id_biz;
        bizCodeField.style.display = "none";

        document.getElementById('bizCategory').value  = b.biz_category;
        document.getElementById('bizSize').value      = b.biz_size;
        document.getElementById('stockDisp').value    = b.stock_disponible;
        document.getElementById('stockApr').value     = b.stock_apartado;
        document.getElementById('stockProc').value    = b.stock_en_proceso;
        
        console.log('Editando bizcocho con código:', b.id_biz);
    }
    openModal('editBizcoModal');
}

async function guardarBizcocho(event) {
    event.preventDefault();

    const form = document.getElementById('formBiz');
    const mode = form.dataset.mode;
    const id_biz      = parseInt(document.getElementById('bizId').value.trim());

    const payload = {
        id_biz,
        biz_category:    document.getElementById('bizCategory').value,
        biz_size:        document.getElementById('bizSize').value,
        stock_disponible:+document.getElementById('stockDisp').value,
        stock_apartado:  +document.getElementById('stockApr').value,
        stock_en_proceso:+document.getElementById('stockProc').value
    };

    try {
        if (mode === "create") {
            const dupId = window.bizcochos.some(b => b.id_biz === payload.id_biz);
            if (dupId) {
                return showToast(`Ya existe un bizcocho con ID ${payload.id_biz}.`, ICONOS.advertencia);
            }

            const dupCatSize = window.bizcochos.some(b =>
                b.biz_category === payload.biz_category &&
                b.biz_size     === payload.biz_size
            );
            if (dupCatSize) {
                return showToast(
                    `Ya existe un bizcocho de categoría “${payload.biz_category}” y tamaño “${payload.biz_size}”.`,
                    ICONOS.advertencia
                );
            }
            await createBizcocho(payload);
            console.log('📦 Se agrego un nuevo bizcocho.');
            showToast('Bizcocho agregado', ICONOS.success);
            closeModal('editBizcoModal');
            await initBizcochos();
        } else if (mode === "edit") {
            const dupCatSize = window.bizcochos.some(b =>
                b.biz_category === payload.biz_category &&
                b.biz_size     === payload.biz_size &&
                b.id_biz       !== payload.id_biz
            );
            if (dupCatSize) {
                return showToast(
                    `Ya existe un bizcocho de categoría “${payload.biz_category}” y tamaño “${payload.biz_size}”.`,
                    ICONOS.advertencia
                );
            }
            await updateBizcocho(payload);
            console.log('📦 Se actualizco un bizcocho.');
            showToast('Bizcocho actualizado', ICONOS.success);
            closeModal('editBizcoModal');
            await initBizcochos();
        }
    } catch (err) {
        console.error('[ERROR] al guardar Productos:', err.message);
        showToast(`Error al guardar el producto: ${err.message}`, ICONOS.error);
    }
}*/