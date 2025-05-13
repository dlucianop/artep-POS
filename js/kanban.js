const { join } = require('path');
const {
    readFases,
    updateFase
} = require(join(__dirname, '..', 'js', 'crud-config.js'));

const {
    createOrden, 
    readOrdenByFase 
} = require(join(__dirname, '..', 'js', 'crud-produccion.js'));

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
        window.today = new Date();
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
    
        fillColumna(cardsContainer, fase.id_fase);
    
        column.appendChild(header);
        column.appendChild(cardsContainer);
        container.appendChild(column);
    });
  
    //console.log('Se generaron ' + fases.length + ' columnas de fases.');
}

async function fillColumna(cardsContainer, fase_id) {
    try {
        const ordenes = await readOrdenByFase(fase_id);
    
        ordenes.forEach(orden => {
            const card = document.createElement('div');
            card.classList.add('kanban-card');
            card.setAttribute('draggable', 'true');
            card.setAttribute('ondragstart', 'drag(event)');
            card.id = `card-${orden.id_orden}`;
    
            card._ordenData = orden;
            card.addEventListener('click', () => showDetails(card));
    
            const entrega = new Date(orden.fecha_entrega);
            const diffDias = Math.ceil((entrega - window.today) / (1000 * 60 * 60 * 24));
    
            card.innerHTML = `
            <article role="button" tabindex="0">
                <header>
                    <h3>${orden.origen}</h3>
                    <h2>#${orden.id_venta}</h2>
                </header>
                <ul>
                    <li>${orden.categoria} ${orden.size}</li>
                    <li>${orden.cantidad_buenos} / <strong>${orden.cantidad_inicial}</strong></li>
                    <li>${diffDias} días restantes</li>
                </ul>
            </article>
            `;
            cardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error(`❌ Error al cargar órdenes de fase ${fase_id}:`, error);
        showToast('Error al cargar ordenes', ICONOS.error);
    }
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

function showDetails(cardElem) {
    document.getElementById('detail-content').innerHTML = '';
    fillDetails(cardElem._ordenData);
    document.getElementById("detail-dialog").showModal();
}

function fillDetails(orden) {
    if (!orden) return console.error('Orden no encontrada en el elemento');

    const entrega = new Date(orden.fecha_entrega);
    const diffDias = Math.ceil((entrega - window.today) / (1000 * 60 * 60 * 24));

    const html = `
        <p><strong>Tipo Orden:</strong> ${orden.origen}</p>
        <p><strong>No. de venta:</strong> ${orden.id_venta}</p>
        <p><strong>Producto:</strong> ${orden.categoria} — ${orden.size}</p>
        <p><strong>Cantidad inicial:</strong> ${orden.cantidad_inicial}</p>
        <p><strong>Cantidad buenos:</strong> ${orden.cantidad_buenos}</p>
        <p><strong>Cantidad rotos:</strong> ${orden.cantidad_rotos}</p>
        <p><strong>Cantidad deformes:</strong> ${orden.cantidad_deformes}</p>
        <p><strong>Fecha de entrega:</strong> ${orden.fecha_entrega} (${diffDias} días restantes)</p>
    `;

    document.getElementById('detail-content').innerHTML = html;
}
  
document.getElementById('close-detail')
    .addEventListener('click', () => {
      document.getElementById('detail-dialog').close();
});