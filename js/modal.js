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

    id.disabled = false;
    id.value = bizcocho.id_bizcocho;
    id.disabled = true;

    categoria.disabled = false;
    categoria.value = bizcocho.tipo_bizcocho;
    categoria.disabled = true;

    tamano.disabled = false;
    tamano.value = bizcocho.size_bizcocho;
    tamano.disabled = true;

    document.getElementById('editCantidadBodega').value = bizcocho.bizcochos_en_bodega;
    document.getElementById('editCantidadProduccion').value = bizcocho.bizcochos_en_proceso;

    modal.classList.add('show');
}