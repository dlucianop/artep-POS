const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js');
const { createBizcocho, readBizcochos, updateBizcocho, deleteBizcocho } = require(crudJS);
const toast = join(__dirname, "..", "js", "toast.js");
const { showToast, showConfirmToast, ICONOS } = require(toast);

window.addEventListener('DOMContentLoaded', initBizcochos);

async function initBizcochos() {
    try {
        const bizcochos = await new Promise((res, rej) => {
            readBizcochos((err, data) => err ? rej(err) : res(data));
        });
        window.bizcochos = bizcochos;
        fillTableBizcochos(bizcochos);
        console.log('Se cargaron datos.');
    } catch (error) {
        console.error('Error al cargar bizcochos:', error);
        showToast("Error al cargar inventario", ICONOS.error);
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
            <button onclick="renderBizco(${b.id_biz});">✏️ Editar</button>
            <button onclick="eliminarBizcocho(${b.id_biz});">🗑️ Eliminar</button>
        </td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

function eliminarBizcocho(id) {
    showConfirmToast(
        `¿Seguro que quieres eliminar el bizcocho #${id}?`,
        async () => {
        try {
            await new Promise((res, rej) =>
                deleteBizcocho({ id_bizcocho:id }, err => err ? rej(err) : res())
            );
            showToast("Bizcocho eliminado", ICONOS.success);
            initBizcochos();
        } catch (err) {
            console.error(err);
            showToast("Error al eliminar", ICONOS.error);
        }
        }
    );
}

function prepareNewBizco() {
    const form = document.getElementById('formBiz');
    form.reset();
    form.dataset.mode = 'create';
    openModal('editBizcoModal');
}
  
function renderBizco(id) {
    const b = window.bizcochos.find(x => x.id_biz === id);
    if (!b) return showToast("Bizcocho no encontrado", ICONOS.error);
  
    const form = document.getElementById('formBiz');
    form.dataset.mode = 'edit';
    document.getElementById('bizId').value        = b.id_biz;
    document.getElementById('bizCategory').value  = b.biz_category;
    document.getElementById('bizSize').value      = b.biz_size;
    document.getElementById('stockDisp').value    = b.stock_disponible;
    document.getElementById('stockApr').value     = b.stock_apartado;
    document.getElementById('stockProc').value    = b.stock_en_proceso;
  
    openModal('editBizcoModal');
}

function guardarBizcocho(event) {
    event.preventDefault();
    const form = document.getElementById('formBiz');
    const mode = form.dataset.mode;
    const id      = document.getElementById('bizId').value.trim();
    const payload = {
        id_biz:           +id,
        biz_category:    document.getElementById('bizCategory').value,
        biz_size:        document.getElementById('bizSize').value,
        stock_disponible:+document.getElementById('stockDisp').value,
        stock_apartado:  +document.getElementById('stockApr').value,
        stock_en_proceso:+document.getElementById('stockProc').value
    };
  
    const dupId = window.bizcochos.some(b => b.id_biz === payload.id_biz);
    if (mode === 'create' && dupId) {
        return showToast(`Ya existe un bizcocho con ID ${payload.id_biz}.`, ICONOS.advertencia);
    }

    const dupCatSize = window.bizcochos.some(b =>
        b.biz_category === payload.biz_category &&
        b.biz_size     === payload.biz_size &&
        (mode === 'create' || b.id_biz !== payload.id_biz)
    );
    if (dupCatSize) {
        return showToast(
            `Ya existe un bizcocho de categoría “${payload.biz_category}” y tamaño “${payload.biz_size}”.`,
            ICONOS.advertencia
        );
    }
  
    if (mode === 'create') {
        createBizcocho(payload, (err, created) => {
            if (err) {
            console.error("Error al crear bizcocho:", err);
            return showToast("Error al agregar", ICONOS.error);
            }
            showToast("Bizcocho agregado", ICONOS.success);
            closeModal('editBizcoModal');
            initBizcochos();
        });
    } else if (mode === 'edit') {
        updateBizcocho(payload, (err, updated) => {
            if (err) {
            console.error("Error al actualizar bizcocho:", err);
            return showToast("Error al actualizar", ICONOS.error);
            }
            showToast("Bizcocho actualizado", ICONOS.success);
            closeModal('editBizcoModal');
            initBizcochos();
        });
    } else {
        console.warn("GuardarBizcocho: modo desconocido", mode);
    }
}