const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js');
const { createBizcocho, readBizcochos, updateBizcocho, deleteBizcocho } = require(crudJS);

function fillTableBizcochos(bizcochos){
    const tableBody = document.querySelector('#table-bizcochos tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    bizcochos.forEach(bizcocho =>{
        const row = document.createElement('tr');
        row.id = 'biz-' + bizcocho.id_bizcocho;
        row.innerHTML = `
        <td>${bizcocho.tipo_bizcocho || 'N/A'}</td>
        <td>${bizcocho.size_bizcocho || 'N/A'}</td>
        <td>${bizcocho.bizcochos_en_bodega || 0}</td>
        <td>${bizcocho.bizcochos_en_proceso || 0}</td>
        <td>
            <button type="button" onclick='openEditModal(${JSON.stringify(bizcocho)})'>Editar</button>
            <button type="button" onclick="deleteModal(this, event, '${row.id}')">Eliminar</button>
        </td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}

readBizcochos((err, data) => {
    if (err) {
        document.querySelector('#error-message').textContent = `Error al leer inventario: ${err}`;
    } else {
        fillTableBizcochos(data);
    }
    
});

/******************************** AGREGAR BIZCOCHO **********************************/
function reloadTable() {
    readBizcochos((err, data) => {
        if (err) {
            document.querySelector('#error-message').textContent = `Error al leer inventario: ${err}`;
        } else {
            fillTableBizcochos(data);
        }
    });
}


function saveNewBizcocho() {
    const categoria = document.getElementById('tipoBizcocho').value;
    const tamano = document.getElementById('sizeBizcocho').value;
    const cantidadBodega = parseInt(document.getElementById('cantidadBodega').value, 10) || 0;
    const cantidadProduccion = parseInt(document.getElementById('cantidadProduccion').value, 10) || 0;
    
    if (!categoria || !tamano || cantidadBodega < 0 || cantidadProduccion < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    createBizcocho({ categoria, tamano, cantidadBodega, cantidadProduccion }, (err) => {
        if (err) {
            alert(`Error al agregar bizcocho: ${err}`);
        } else {
            alert('¡Bizcocho agregado correctamente!');
            reloadTable();
            closeModal('modal-agregar');
        }
    });
}

function updateOldBizcocho(){
    const id = parseInt(document.getElementById('editId').value, 10) || 0;
    const categoria = document.getElementById('editCategoria').value;
    const tamano = document.getElementById('editSize').value;
    const cantidadBodega = parseInt(document.getElementById('editCantidadBodega').value, 10) || 0;
    const cantidadProduccion = parseInt(document.getElementById('editCantidadProduccion').value, 10) || 0;

    if (id < 0 || !categoria || !tamano || cantidadBodega < 0 || cantidadProduccion < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    updateBizcocho({ id, categoria, tamano, cantidadBodega, cantidadProduccion }, (err) => {
        if (err) {
            alert(`Error al editar bizcocho: ${err}`);
        } else {
            alert('¡Bizcocho modificado correctamente!');
            reloadTable();
            closeModal('modal-editar');
        }
    });
}

function eliminarBizcocho(button, event, id_bizcocho) {
    
}