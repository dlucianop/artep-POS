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
    fillModalFields(modal, bizcocho);
    modal.classList.add('show');
}

function deleteModal(bizcocho) {
    const modal = document.getElementById('modal-eliminar');
    fillModalFields(modal, bizcocho);
    modal.classList.add('show');
}

function fillModalFields(modal, bizcocho) {
    const fields = {
        editId: bizcocho.id_bizcocho,
        editCategoria: bizcocho.tipo_bizcocho,
        editSize: bizcocho.size_bizcocho,
        editCantidadBodega: bizcocho.bizcochos_en_bodega || '',
        editCantidadProduccion: bizcocho.bizcochos_en_proceso || '',
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

