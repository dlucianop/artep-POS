document.addEventListener('DOMContentLoaded', () => {
    const kanban = document.getElementById('kanban');
    let draggedCard = null;
  
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', () => {
        draggedCard = card;
    });
    card.addEventListener('dragend', () => {
        draggedCard = null;
        });
    });
  
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', event => {
        event.preventDefault();
    });
    column.addEventListener('drop', () => {
        if (draggedCard) {
            column.appendChild(draggedCard);
        }
      });
    });
});