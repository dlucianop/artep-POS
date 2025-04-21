const path = require('path');
const dbJS = path.join(__dirname, '..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProducto(producto, callback) {
    const db = openDataBase();
    const query = `
        INSERT INTO inventario_productos 
            (code, category, model, size, decoration, color, price, stock_apartado, stock_disponible, stock_en_proceso)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.run(query, [
        producto.code,
        producto.category,
        producto.model,
        producto.size,
        producto.decoration,
        producto.color,
        producto.price,
        producto.stock_apartado || 0,
        producto.stock_disponible || 0,
        producto.stock_en_proceso || 0
    ], function (err) {
        if (err) {
            closeDatabase(db);
            return callback(err);
        }

        const newProducto = {
            code: producto.code,
            category: producto.category,
            model: producto.model,
            size: producto.size,
            decoration: producto.decoration,
            color: producto.color,
            price: producto.price,
            stock_apartado: producto.stock_apartado || 0,
            stock_disponible: producto.stock_disponible || 0,
            stock_en_proceso: producto.stock_en_proceso || 0,
            stock_total: 0,
            stock_min: 0,
            stock_max: 0,
            stock_critico: 0
        };

        closeDatabase(db);
        callback(null, newProducto);
    });
}

function readProductos(callback) {
    const db = openDataBase();
    const query = `SELECT * FROM inventario_productos;`;

    db.all(query, [], (err, rows) => {
        if (err) {
            closeDatabase(db);
            return callback(err, null);
        }
        closeDatabase(db);
        callback(null, rows);
    });
}

function readOneProduct(code, callback) {
    const db = openDataBase();
    const query = `SELECT * FROM inventario_productos WHERE code = ?;`;

    db.get(query, [code], (err, row) => {
        closeDatabase(db);
        if (err) return callback(err, null);
        callback(null, row);
    });
}

function updateProducto(producto, callback) {
    const db = openDataBase();
    const query = `
        UPDATE inventario_productos
        SET 
            price = ?,
            stock_apartado = ?,
            stock_disponible = ?,
            stock_en_proceso = ?
        WHERE code = ?;
    `;

    db.run(query, [
        producto.price,
        producto.stock_apartado,
        producto.stock_disponible,
        producto.stock_en_proceso,
        producto.code
    ], function (err) {
        closeDatabase(db);
        if (err) return callback(err, null);
        
        callback(null, {
            code: producto.code,
            ...producto
        });
    });
}

function deleteProducto(producto, callback) {
    const db = openDataBase();
    const query = `DELETE FROM inventario_productos WHERE code = ?;`;

    db.run(query, [producto.code], function (err) {
        closeDatabase(db);
        if (err) return callback(err, null);
        callback(null, { code: producto.code });
    });
}

module.exports = { 
    createProducto, 
    readProductos, 
    readOneProduct, 
    updateProducto, 
    deleteProducto 
};