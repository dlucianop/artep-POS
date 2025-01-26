function openModal(modalId) {
    const modal = document.getElementById(modalId);
    
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = '';
        } else if (input.type === 'text') {
            input.value = '';
        }
    });

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = '';
        } else if (input.type === 'text') {
            input.value = '';
        }
    });

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    modal.classList.remove('show');
}

function openEditModal(bizcocho) {
    const modal = document.getElementById('modal-editar');
    const id = document.getElementById('editId');
    const categoria = document.getElementById('editCategoria');
    const tamano = document.getElementById('editSize');
    const cantidadBodega = document.getElementById('editCantidadBodega');
    const cantidadProduccion = document.getElementById('editCantidadProduccion');

    id.value = bizcocho.id_bizcocho;
    categoria.value = bizcocho.tipo_bizcocho;
    tamano.value = bizcocho.size_bizcocho;
    cantidadBodega.value = bizcocho.bizcochos_en_bodega || '';
    cantidadProduccion.value = bizcocho.bizcochos_en_proceso || '';

    modal.classList.add('show');
}

function deleteModal(bizcocho) {
    const modal = document.getElementById('modal-eliminar');
    const id = document.getElementById('deleteId');
    const categoria = document.getElementById('deleteCategoria');
    const tamano = document.getElementById('deleteSize')
    const cantidadBodega = document.getElementById('deleteCantidadBodega');
    const cantidadProduccion = document.getElementById('deleteCantidadProduccion');

    id.value = bizcocho.id_bizcocho;
    categoria.value = bizcocho.tipo_bizcocho;
    tamano.value = bizcocho.size_bizcocho;
    cantidadBodega.value = bizcocho.bizcochos_en_bodega || '';
    cantidadProduccion.value = bizcocho.bizcochos_en_proceso || '';

    modal.classList.add('show');
}