const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js');
const { createBizcocho, readBizcochos, updateBizcocho, deleteBizcocho } = require(crudJS);

function fillTableBizcochos(bizcochos){
    const tableBody = document.querySelector('#table-bizcochos tbody');
    tableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    bizcochos.forEach(bizcocho =>{
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${bizcocho.tipo_bizcocho || 'N/A'}</td>
        <td>${bizcocho.size_bizcocho || 'N/A'}</td>
        <td>${bizcocho.bizcochos_en_bodega || 0}</td>
        <td>${bizcocho.bizcochos_en_proceso || 0}</td>
        <td>
            <button>Editar</button>
            <button>Eliminar</button>
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


document.getElementById('agregarBizcocho').addEventListener('click', function () {
    const categoria = document.getElementById('tipoBizcocho').value;
    const tamano = document.getElementById('sizeBizcocho').value;
    const cantidadBodega = parseInt(document.getElementById('cantidadBodega').value, 10) || 0;
    const cantidadProduccion = parseInt(document.getElementById('cantidadProduccion').value, 10) || 0;

    if (!categoria || !tamano || cantidadBodega < 0 || cantidadProduccion < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    console.log(categoria, tamano, cantidadBodega, cantidadProduccion);

    createBizcocho({ categoria, tamano, cantidadBodega, cantidadProduccion }, (err, newBizcocho) => {
        if (err) {
            alert(`Ocurrió un error: ${err}`);
        } else {
            reloadTable();
            alert('Bizcocho agregado correctamente!');
        }
    });

    document.getElementById('closeModal').click();
});

  