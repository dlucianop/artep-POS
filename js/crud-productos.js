const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProducto(producto, callback){
    console.log(producto);
    const db = openDataBase();
    const query = `
        INSERT INTO inventario_productos
            (code, category, model, size, decoration, color, stock, price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.run(query, [producto.codeA, producto.categoryA, producto.modelA, producto.sizeA, producto.decorationA, producto.colorA, producto.stockA, producto.priceA ], function (err) {
        if (err) {
            alert(`ERROR al insertar el producto: ${err.message}`);
            console.error(`[ERROR] Consulta fallida: ${err.message}`);
            closeDatabase(db);
            callback(err, null);
            return;
        }

        setTimeout(() => {
            const newProducto = {
                id: producto.codeA,
                categoria: producto.categoryA,
                modelo: producto.modelA,
                tamano: producto.sizeA,
                decoracion: producto.decorationA,
                color: producto.colorA,             
                productos_en_bodega: producto.stockA,
                precio: producto.priceA
            };
            console.log(`Producto creado con el ID: ${producto.codeA}`);
            closeDatabase(db);
            callback(null, newProducto);
        }, 500);
    });
}

function readProductos(callback) {
    const db = openDataBase();
    const query = `
        SELECT *
        FROM inventario_productos
    `;

    try {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                callback(err, null);
                return;
            }

            console.log(`[INFO] Consulta ejecutada con éxito. Filas obtenidas: ${rows.length}`);
            callback(null, rows);
        });
    } catch (err) {
        console.error(`[CRITICAL] Error inesperado: ${err.message}`);
        callback(err, null);
    } finally {
        closeDatabase(db);
        console.log('[INFO] Conexión a la base de datos cerrada.');
    }
}

function updateProducto(producto, callback) {

}

function deleteProducto(producto, callback){

}

module.exports = { createProducto, readProductos, updateProducto, deleteProducto };