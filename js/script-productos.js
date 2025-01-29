const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud-productos.js');
const { readProductos } = require(crudJS);

function fillTableProductos(productos){
    const tableBody = document.querySelector('#table-productos tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    productos.forEach(producto =>{
        const row = document.createElement('tr');
        row.id = 'prod-' + producto.code;
        row.innerHTML = `
        <td>${producto.code || 0}</td>
        <td>${producto.category || 'N/A'}</td>
        <td>${producto.model || 'N/A'}</td>
        <td>${producto.size || 'N/A'}</td>
        <td>${producto.decoration || 'N/A'}</td>
        <td>${producto.color || 'N/A'}</td>
        <td>${producto.stock || 0}</td>
        <td>${producto.price || 0}</td>
        <td class="col-btns">
            <button type="button">Editar</button>
            <button type="button">Eliminar</button>
        </td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

readProductos((err, data) => {
    if (err) {
        document.querySelector('#error-message').textContent = `Error al leer inventario: ${err}`;
    } else {
        fillTableProductos(data);
    }
    
});