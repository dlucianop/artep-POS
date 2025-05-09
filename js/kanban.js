const { join } = require('path');
const {
    readFases,
    updateFase
} = require(join(__dirname, '..', 'js', 'crud-config.js'));

const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, '..', 'js', 'toast.js'));

window.addEventListener('DOMContentLoaded', initProduccion);

async function initProduccion() {
    try {
        const fases = await readFases();
        window.fases = fases;
        fillEncabezados(fases);
        console.log('Se cargaron encabezados de fases correctamente.');
    } catch (error) {
        console.error('❌ Error al cargar fases:', error.message);
        showToast('Error al cargar panel de Produccion', ICONOS.error);
    }
}

function fillEncabezados(fases) {
    const container = document.querySelector('.kanban-container');
    container.innerHTML = '';
  
    fases.forEach(fase => {
        const column = document.createElement('div');
        column.classList.add('kanban-column');
        column.setAttribute('ondrop', 'drop(event)');
        column.setAttribute('ondragover', 'allowDrop(event)');
    
        const header = document.createElement('h3');
        header.textContent = fase.name_fase;
    
        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('kanban-cards');
        cardsContainer.dataset.faseId = fase.id_fase;
    
        column.appendChild(header);
        column.appendChild(cardsContainer);
        container.appendChild(column);
    });

    console.log('Se generaron ' + fases.length + ' columnas de fases.');
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const card = document.getElementById(data);
    const dropTarget = ev.target.closest(".kanban-cards");
    
    if (dropTarget) {
        dropTarget.appendChild(card);
    }
}

function showDetails(cardId) {
    const dialog = document.getElementById("detail-dialog");
    dialog.showModal();
}