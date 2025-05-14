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
        window.meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril',
            'Mayo', 'Junio', 'Julio', 'Agosto',
            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
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

async function drop(ev) {
    ev.preventDefault();
    const targetColumn = ev.target.closest('.kanban-column');
    
    if (!targetColumn) return;
    
    const targetFaseName = targetColumn.querySelector('h3').textContent;
    
    //console.log(`Columna destino: ${targetFaseName}`);
    
    const targetFaseId = parseInt(targetColumn.querySelector('.kanban-cards').dataset.faseId);
    
    const cardId = ev.dataTransfer.getData("text");
    const cardElem = document.getElementById(cardId);
    
    if (!cardElem) return;
    
    const cardsContainer = targetColumn.querySelector('.kanban-cards');
    cardsContainer.appendChild(cardElem);

    const ordenData = cardElem._ordenData;
    const oldFaseId = parseInt(ordenData.id_fase);

    console.log(oldFaseId," > ", targetFaseId);

    if (targetFaseId !== oldFaseId) {
        try {
            const noOrden = `No. de Orden: ${ordenData.id_orden}`;
            const simbolo = oldFaseId < targetFaseId ? '>' : '<';
            const fromto = oldFaseId < targetFaseId ? `${ordenData.fase_actual} ${simbolo} ${targetFaseName}` : `${targetFaseName} ${simbolo} ${ordenData.fase_actual}`;
    
            ordenData.fase_actual = targetFaseName;
            ordenData.id_fase = targetFaseId;
    
            showEdit(cardElem, noOrden, fromto);
        } catch (error) {
            console.error('❌ Error al actualizar fase en base de datos:', error.message);
            showToast('Error al mover la orden', ICONOS.error);
        }
    } else {
        showToast('No se puede mover la tarjeta en la misma columna', ICONOS.error);
    }
}


function showEdit(cardElem, noOrden, fromto) {
    window.cardEditando = cardElem;
    document.getElementById('edit-content').innerHTML = '';
    fillData(cardElem._ordenData, noOrden, fromto);
    document.getElementById("edit-dialog").showModal();
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
    const [year, month, day] = orden.fecha_entrega.split('-');
    const formattedDate = `${day}-${meses[Number(month) - 1]}-${year}`;

    const html = `
        <p><strong>Tipo Orden:</strong> ${orden.origen}</p>
        <p><strong>No. de venta:</strong> ${orden.id_venta}</p>
        <p><strong>Producto:</strong> ${orden.categoria} TAM.${orden.size}</p>
        <p><strong>Cantidad inicial:</strong> ${orden.cantidad_inicial}</p>
        <p><strong>Cantidad buenos:</strong> ${orden.cantidad_buenos}</p>
        <p><strong>Cantidad rotos:</strong> ${orden.cantidad_rotos}</p>
        <p><strong>Cantidad deformes:</strong> ${orden.cantidad_deformes}</p>
        <p><strong>Fecha de entrega:</strong> ${formattedDate} (${diffDias} días restantes)</p>
    `;

    document.getElementById('detail-content').innerHTML = html;
}

function fillData(orden, noOrden, fromto) {
    if (!orden) return console.error('Orden no encontrada en el elemento');

    document.getElementById("noOrdenH").textContent = noOrden;
    document.getElementById("fases").textContent = fromto;
    const html = ``;
    document.getElementById('edit-content').innerHTML = html;
}
  
document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('detail-dialog').close();
});

/*document.getElementById('cancel-edit').addEventListener('click', () => {
        document.getElementById('edit-dialog').close();
});*/

document.getElementById('update-edit').addEventListener('click', () => {
    document.getElementById('edit-dialog').close();
});