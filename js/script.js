const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud.js');
const { createProduct, readProducts, updateProduct, deleteProduct } = require(crudJS);

function fillTable(products) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code || 'N/A'}</td>
            <td>${product.category || 'N/A'}</td>
            <td class="full-width">${product.model || 'N/A'}</td>
            <td>${product.size || 'N/A'}</td>
            <td class="full-width">${product.decoration || 'N/A'}</td>
            <td class="full-width">${product.color || 'N/A'}</td>
            <td style="background-color: ${product.num_products === 0 ? '#B03A2E' : '#6B8E23'};" class="prodStock">${product.num_products || 0}</td>
            <td class="btnAction">
                <button onclick="editProduct(${product.code})" id="btnUpdate">Modificar</button>
                <button onclick="deleteProduct(${product.code})" id="btnDelete">Eliminar</button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

///************************** AGREGAR PRODUCTO */
document.getElementById('formProduct').addEventListener('submit', (event) => {
    event.preventDefault();
    const modal = document.getElementById("modal");
    const form = document.getElementById("formProduct");

    const newProduct = {
        code: document.getElementById('codProd').value,
        category: document.getElementById('categoryProd').value,
        model: document.getElementById('modelProd').value,
        size: document.getElementById('sProd').value,
        decoration: document.getElementById('decorationProd').value,
        color: document.getElementById('colorProd').value,
    };

    //console.log(newProduct)
    createProduct(newProduct, (err, createdProduct) => {
        if (err) {
            console.error('Error al crear el producto:', err);
        } else {
            readProducts((err, data) => {
                if (err) {
                    document.querySelector('#error-message').textContent = `Error al leer productos: ${err}`;
                } else {
                    alert("Se agrego el producto al Inventario con exito");
                    modal.style.display = "none";
                    form.reset();
                    if (typeof isFormDirty !== 'undefined') {
                        isFormDirty = false;
                    }
                    fillTable(data);
                }
            });
            
        }
    });
});

readProducts((err, data) => {
    if (err) {
        document.querySelector('#error-message').textContent = `Error al leer productos: ${err}`;
    } else {
        fillTable(data);
    }
});

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
