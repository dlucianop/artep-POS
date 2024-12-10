const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'database.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProduct(){
    //
}

function readProducts(callback) {
    const db = openDataBase();
    db.all('SELECT p.*, ep.state, ep.num_products ' +
           'FROM productos p ' +
           'INNER JOIN estado_producto ep ' +
           'ON p.code = ep.code ' +
           'WHERE ep.state = "TERMINADO";', [], (err, rows) => {
        if (err) {
            console.error('ERROR al ejecutar la consulta:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
        closeDatabase(db);
    });
}

function updateProduct(){

}

function deleteProduct(){

}

module.exports = { createProduct, readProducts, updateProduct, deleteProduct };