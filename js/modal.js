const modal = document.getElementById('modal-agregar');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');

openModal.addEventListener('click', () => {
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = 0;
    });

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    modal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = 0;
    });

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    modal.classList.remove('show');
});