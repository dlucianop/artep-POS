const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud-productos.js');
const { createProducto, readProductos, updateProducto, deleteProducto } = require(crudJS);

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
            <button type="button" onclick='openEditModalProd(${JSON.stringify(producto)})'>Editar</button>
            <button type="button" onclick='deleteModalProd(${JSON.stringify(producto)})'>Eliminar</button>
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

function reloadTable() {
    readProductos((err, data) => {
        if (err) {
            document.querySelector('#error-message').textContent = `Error al leer inventario: ${err}`;
        } else {
            fillTableProductos(data);
        }
    });
}

function saveNewProducto(){
    const codeA = parseInt(document.getElementById('addCodeProd').value, 10) || 0;
    const categoryA = document.getElementById('addCategoryProd').value;
    const sizeA = document.getElementById('addSizeProd').value;
    const modelA = document.getElementById('addModelProd').value;
    const decorationA = document.getElementById('addDecorProd').value;
    const colorA = document.getElementById('addColorProd').value;
    const priceA = parseFloat(document.getElementById('addPrecioProd').value, 10) || 0;
    const stockA = parseInt(document.getElementById('addCantBodProd').value, 10) || 0;

    if( !codeA || !categoryA || !sizeA || !modelA || !decorationA || !colorA || priceA < 0 || stockA < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }
    
    createProducto({ codeA, categoryA, sizeA, modelA, decorationA, colorA, priceA, stockA }, (err) => {
        if(err){
            alert(`Error al agregar producto: ${err}`);
        } else{
            alert('¡Producto agregado correctamente!');
            reloadTable();
            closeModal('modal-agregar');
        }
    });
}

function updateOldProducto(){
    const codeE = parseInt(document.getElementById('editCodeProd').value, 10) || 0;
    const categoryE = document.getElementById('editCategoryProd').value;
    const sizeE = document.getElementById('editSizeProd').value;
    const modelE = document.getElementById('editModelProd').value;
    const decorationE = document.getElementById('editDecorProd').value;
    const colorE = document.getElementById('editColorProd').value;
    const priceE = parseFloat(document.getElementById('editPrecioProd').value, 10) || 0;
    const stockE = parseInt(document.getElementById('editCantBodProd').value, 10) || 0;
    
    if( !codeE || !categoryE || !sizeE || !modelE || !decorationE || !colorE || priceE < 0 || stockE < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    updateProducto({ codeE, categoryE, sizeE, modelE, decorationE, colorE, priceE, stockE }, (err) => {
        if(err){
            alert(`Error al editar producto: ${err}`);
        } else{
            alert('¡Producto modificado correctamente!');
            reloadTable();
            closeModal('modal-editar')
        }
    });
}

function confirmDeleteProducto(){
    const codeD = document.getElementById('deleteCodeProd');
    const categoryD = document.getElementById('deleteCategoryProd');
    const sizeD = document.getElementById('deleteSizeProd');
    const modelD = document.getElementById('deleteModelProd');
    const decorationD = document.getElementById('deleteDecorProd');
    const colorD = document.getElementById('deleteColorProd');
    const priceD = document.getElementById('deletePrecioProd');
    const stockD = document.getElementById('deleteCantBodProd');
}