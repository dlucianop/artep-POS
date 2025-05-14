async function drop(ev) {
    ev.preventDefault();
    const targetColumn = ev.target.closest('.kanban-column');
    
    if (!targetColumn) return;
    
    const targetFaseName = targetColumn.querySelector('h3').textContent;
    
    //console.log(`Columna destino: ${targetFaseName}`);
    
    const targetFaseId = targetColumn.querySelector('.kanban-cards').dataset.faseId;
    
    const cardId = ev.dataTransfer.getData("text");
    const cardElem = document.getElementById(cardId);
    
    if (!cardElem) return;
    
    const cardsContainer = targetColumn.querySelector('.kanban-cards');
    cardsContainer.appendChild(cardElem);

    const ordenData = cardElem._ordenData;
    const oldFaseId = ordenData.fase_actual;

    if (targetFaseId !== oldFaseId) {
        try {
            ordenData.fase_actual = targetFaseId;
            let noOrden = `No. de Orden: ${ordenData.id_orden}`;
            let fromto = `${oldFaseId} > ${targetFaseName}`;
            showEdit(cardElem, noOrden, fromto);
        } catch (error) {
            console.error('❌ Error al actualizar fase en base de datos:', error.message);
            showToast('Error al mover la orden', ICONOS.error);
        }
    }
}