document.querySelectorAll('.increment').forEach(button => {
    button.addEventListener('click', () => {
      const row = button.closest('.product-car');
      const input = row.querySelector('input[type="number"]');
      const unitPrice = parseFloat(row.cells[2].textContent.replace('$', ''));
      const subtotalCell = row.cells[4];

      input.value = parseInt(input.value) + 1;
      subtotalCell.textContent = `$${(unitPrice * parseInt(input.value)).toFixed(2)}`;
    });
  });

  document.querySelectorAll('.decrement').forEach(button => {
    button.addEventListener('click', () => {
      const row = button.closest('.product-car');
      const input = row.querySelector('input[type="number"]');
      const unitPrice = parseFloat(row.cells[2].textContent.replace('$', ''));
      const subtotalCell = row.cells[4];

      if (input.value > 0) {
        input.value = parseInt(input.value) - 1;
        subtotalCell.textContent = `$${(unitPrice * parseInt(input.value)).toFixed(2)}`;
      }
    });
  });

  document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', () => {
      button.closest('tr').remove();
    });
  });

  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
      const row = input.closest('.product-car');
      const unitPrice = parseFloat(row.cells[2].textContent.replace('$', ''));
      const subtotalCell = row.cells[4];

      subtotalCell.textContent = `$${(unitPrice * parseInt(input.value || 0)).toFixed(2)}`;
    });
  });

  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.value === '' || parseInt(input.value) < 0) {
        input.value = 0;
      }
    });
  });