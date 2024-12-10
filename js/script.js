const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud.js');
const { readProducts } = require(crudJS);

function fillTable(products) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code || 'N/A'}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.model || 'N/A'}</td>
            <td>${product.size || 'N/A'}</td>
            <td>${product.decoration || 'N/A'}</td>
            <td>${product.color || 'N/A'}</td>
            <td>${product.num_products || 0}</td>
            <td class="btnAction">
                <button onclick="editProduct(${product.code})" id="btnUpdate">Modificar</button>
                <button onclick="deleteProduct(${product.code})" id="btnDelete">Eliminar</button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

readProducts((err, data) => {
    if (err) {
        document.querySelector('#error-message').textContent = `Error al leer productos: ${err}`;
    } else {
        fillTable(data);
    }
});

///************************** AGREGAR PRODUCTO */


//*************************** BUSCAR PRODUCTO */

function searchProduct() {
    const table = document.getElementById('inventoryTable');
    const input = document.getElementById('searchProduct').value.toUpperCase();
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let found = false;

        for (let i = 0; i < cells.length - 2; i++) {
            if (cells[i] && cells[i].textContent.toUpperCase().includes(input)) {
                found = true;
                break;
            }
        }

        row.style.display = found ? '' : 'none';
    });
}
