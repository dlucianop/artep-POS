const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProducto(producto, callback){
    const db = openDataBase();
    const query = `
        INSERT INTO inventario_productos
            (code, category, model, size, decoration, color, stock, price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.run(query, 
        [
            producto.codeA, 
            producto.categoryA, 
            producto.modelA, 
            producto.sizeA, 
            producto.decorationA, 
            producto.colorA, 
            producto.stockA, 
            producto.priceA 
        ], 
        function (err) {
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
        }
    );
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
    const db = openDataBase();
    const query = `
        UPDATE inventario_productos
        SET model = ?, decoration = ?, color = ?, stock = ?, price = ?
        WHERE code = ?
        AND category = ?
        AND size = ?;
    `;
    db.run(
        query,
        [
            producto.modelE,
            producto.decorationE,
            producto.colorE,
            producto.stockE,
            producto.priceE,
            producto.codeE,
            producto.categoryE,
            producto.sizeE
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Producto con codigo ${producto.codeE} actualizado correctamente.`);

            const updatedProducto = {
                id: producto.codeE,
                categoria: producto.categoryE,
                modelo: producto.modelE,
                tamano: producto.sizeE,
                decoracion: producto.decorationE,
                color: producto.colorE,             
                productos_en_bodega: producto.stockE,
                precio: producto.priceE
            };

            closeDatabase(db);
            callback(null, updatedProducto);
        }
    );
}

function deleteProducto(producto, callback){
    const db = openDataBase();
    const query = `
        DELETE FROM inventario_productos
        WHERE code = ?
        AND category = ?
        AND size = ?;
    `;

    db.run(
        query,
        [
            producto.codeD,
            producto.categoryD,
            producto.sizeD
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Producto con codigo ${producto.codeD} eliminado correctamente.`);

            const deletedProducto = {
                id: producto.codeD,
                categoria: producto.categoryD,
                modelo: producto.modelD,
                tamano: producto.sizeD,
                decoracion: producto.decorationD,
                color: producto.colorD,             
                productos_en_bodega: producto.stockD,
                precio: producto.priceD
            };

            closeDatabase(db);
            callback(null, deletedProducto);
        }
    );
}

module.exports = { createProducto, readProductos, updateProducto, deleteProducto };