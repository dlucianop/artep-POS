function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById(modalId).style.animation = "fadeIn ease 0.5s forwards";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const inputs = modal.querySelectorAll('input');

    resetModalInputs(modal);
    modal.style.animation = "fadeOut ease 0.5s forwards";

    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

function resetModalInputs(modal) {
    modal.querySelectorAll('input').forEach(input => {
        input.value = input.type === 'number' ? null : null;
    });

    const resultados = document.getElementById("search-results");
    resultados.style.display = "none";
    resultados.innerHTML = "";

    modal.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });
}


function openEditModal(bizcocho) {
    const modal = document.getElementById('modal-editar');
    fillModalEditFields(modal, bizcocho);
    modal.classList.add('show');
}

function fillModalEditFields(modal, bizcocho) {
    const fields = {
        editId: bizcocho.id_bizcocho,
        editCategoria: bizcocho.tipo_bizcocho,
        editSize: bizcocho.size_bizcocho,
        editCantidadBodega: bizcocho.bizcochos_en_bodega || '',
        editCantidadProduccion: bizcocho.bizcochos_en_proceso || ''
    };

    Object.entries(fields).forEach(([key, value]) => {
        const input = modal.querySelector(`#${key}`);
        if (input && input.value !== value) {
            input.value = value;
        }
    });
}

function deleteModal(bizcocho) {
    const modal = document.getElementById('modal-eliminar');
    fillModalDeleteFields(modal, bizcocho);
    modal.classList.add('show');
}

function fillModalDeleteFields(modal, bizcocho) {
    const fields = {
        deleteId: bizcocho.id_bizcocho,
        deleteCategoria: bizcocho.tipo_bizcocho,
        deleteSize: bizcocho.size_bizcocho,
        deleteCantidadBodega: bizcocho.bizcochos_en_bodega || '',
        deleteCantidadProduccion: bizcocho.bizcochos_en_proceso || ''
    };

    Object.entries(fields).forEach(([key, value]) => {
        const input = modal.querySelector(`#${key}`);
        if (input && input.value !== value) {
            input.value = value;
        }
    });
}

/**PRODUCTOS */
function openEditModalProd(producto) {
    const modal = document.getElementById('modal-editar');
    fillModalEditProdFields(modal, producto);
    modal.classList.add('show');
}

function fillModalEditProdFields(modal, producto) {
    console.log(producto);
    const fields = {
        editCodeProd: producto.code,
        editCategoryProd: producto.category,
        editSizeProd: producto.size,
        editModelProd: producto.model,
        editDecorProd: producto.decoration,
        editColorProd: producto.color,
        editPrecioProd: producto.price,
        editCantBodProd: producto.stock,
    };

    Object.entries(fields).forEach(([key, value]) => {
        const input = modal.querySelector(`#${key}`);
        if (input && input.value !== value) {
            input.value = value;
        }
    });
}

function deleteModalProd(producto) {
    const modal = document.getElementById('modal-eliminar');
    fillModalDeleteProdFields(modal, producto);
    modal.classList.add('show');
}

function fillModalDeleteProdFields(modal, producto) {
    const fields = {
        deleteCodeProd: producto.code,
        deleteCategoryProd: producto.category,
        deleteSizeProd: producto.size,
        deleteModelProd: producto.model,
        deleteDecorProd: producto.decoration,
        deleteColorProd: producto.color,
        deletePrecioProd: producto.price,
        deleteCantBodProd: producto.stock,
    };

    Object.entries(fields).forEach(([key, value]) => {
        const input = modal.querySelector(`#${key}`);
        if (input && input.value !== value) {
            input.value = value;
        }
    });
}