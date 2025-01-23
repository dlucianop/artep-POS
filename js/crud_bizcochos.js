const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createBizcocho(bizcocho, callback) {
    const db = openDataBase();
    const query = `
    INSERT INTO inventario_bizcochos
	    (tipo_bizcocho, size_bizcocho, bizcochos_en_bodega, bizcochos_en_proceso) 
    VALUES (?, ?, ?, ?);
    `;

    db.run(query, [bizcocho.tipo_bizcocho, bizcocho.size_bizcocho, bizcocho.bizcochos_en_bodega, bizcocho.bizcochos_en_proceso], function(err) {
        if (err) {
            alert('ERROR al insertar el producto:', err.message);
            closeDatabase(db);
            callback(err, null);
            return;
        } 
        console.log(`Producto creado con el ID: ${this.lastID}`);
    });
}

function readBizcochos(callback){
    const db = openDataBase();
    const query = `
    SELECT *
    FROM inventario_bizcochos`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('ERROR al ejecutar la consulta:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
        closeDatabase(db);
    });
}

function updateBizcocho(){

}

function deleteBizcocho(){

}

module.exports = { createBizcocho, readBizcochos, updateBizcocho, deleteBizcocho };