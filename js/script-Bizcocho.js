const { join } = require('path');
const { 
    createBizcocho, 
    readBizcochos, 
    updateBizcocho, 
    searchBizcocho, 
    deleteBizcocho 
} = require(crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js'));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));

window.addEventListener('DOMContentLoaded', initBizcochos);

async function initBizcochos() {
    try {
        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;
        fillTableBizcochos(bizcochos);
        console.log('📦 Se cargaron bizcochos.');
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
            <button onclick="editarBizcocho(${b.id_biz});">✏️ Editar</button>
            <button onclick="eliminarBizcocho(${b.id_biz});">🗑️ Eliminar</button>
        </td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

function eliminarBizcocho(id_biz) {
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
}

function agregarNuevoBizcocho() {
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
}