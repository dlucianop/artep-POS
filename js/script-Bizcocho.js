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
            <button type="button" onclick='deleteModal(${JSON.stringify(bizcocho)})'>Eliminar</button>
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

function confirmDeleteBizcocho(){
    const id = parseInt(document.getElementById('deleteId').value, 10) || 0;
    const categoria = document.getElementById('deleteCategoria').value;
    const tamano = document.getElementById('deleteSize').value;
    const cantidadBodega = parseInt(document.getElementById('deleteCantidadBodega').value, 10) || 0;
    const cantidadProduccion = parseInt(document.getElementById('deleteCantidadProduccion').value, 10) || 0;

    if (id < 0 || !categoria || !tamano || cantidadBodega < 0 || cantidadProduccion < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    const isSure = confirm('¿Está muy seguro de que quiere eliminar este bizcocho? Esta acción no se puede deshacer.');
    
    if (!isSure) {
        alert('Acción de eliminación cancelada.');
        closeModal('modal-eliminar');
        return;
    }

    deleteBizcocho({ id, categoria, tamano, cantidadBodega, cantidadProduccion }, (err) => {
        if (err) {
            alert(`Error al borrar bizcocho: ${err}`);
        } else {
            alert('Se elimino el bizcocho del inventario.');
            reloadTable();
            closeModal('modal-eliminar');
        }
    });
}

/***********************************SEARCH FILTERS */
document.getElementById("filter-type").addEventListener("change", function() {
    filterTable();
});
  
document.getElementById("filter-size").addEventListener("change", function() {
    filterTable();
});
  
function filterTable() {
    var typeFilter = document.getElementById("filter-type").value.toLowerCase();
    var sizeFilter = document.getElementById("filter-size").value.toLowerCase();
    var table = document.getElementById("table-bizcochos");
    var rows = table.getElementsByTagName("tr");
  
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var matchFound = true;
  
        if (typeFilter && cells[0].innerText.toLowerCase() !== typeFilter) {
            matchFound = false;
        }
  
        if (sizeFilter && cells[1].innerText.toLowerCase() !== sizeFilter) {
            matchFound = false;
        }
  
        if (matchFound) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
  
  