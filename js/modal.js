function openModal(modalId) {
    const modal = document.getElementById(modalId);
    resetModalInputs(modal);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    resetModalInputs(modal);
    modal.classList.remove('show');
}

function resetModalInputs(modal) {
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number' && input.value !== '0') {
            input.value = "";
        } else if (input.type === 'text' && input.value !== '') {
            input.value = '';
        }
    });

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
        if (select.selectedIndex !== 0) {
            select.selectedIndex = 0;
        }
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
    /*fillModalEditProdFields(modal, bizcocho);*/
    modal.classList.add('show');
}

function fillModalEditProdFields(modal, producto) {
    const fields = {
        
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
    /*fillModalDeleteProdFields(modal, bizcocho);*/
    modal.classList.add('show');
}

function fillModalDeleteProdFields(modal, producto) {
    const fields = {

    };

    Object.entries(fields).forEach(([key, value]) => {
        const input = modal.querySelector(`#${key}`);
        if (input && input.value !== value) {
            input.value = value;
        }
    });
}