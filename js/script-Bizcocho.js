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
        <td>${bizcocho.bizcochos_en_bodega || 'N/A'}</td>
        <td>${bizcocho.bizcochos_en_proceso || 'N/A'}</td>
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