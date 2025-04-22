const path = require('path');
const dbJS = path.join(__dirname, '..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProducto(producto) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            INSERT INTO inventario_productos 
                (code, category, model, size, decoration, color, price, stock_total, stock_apartado, stock_disponible, stock_en_proceso, stock_min, stock_max, stock_critico)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0, 0, 0);
        `;
  
        const params = [
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
        ];
  
        db.run(query, params, function (err) {
            closeDatabase(db);
    
            if (err) {
                return reject(new Error("Error al insertar producto: " + err.message));
            }
    
            if (this.changes === 0) {
                return reject(new Error("No se insertó ningún producto"));
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
            };
    
            resolve(newProducto);
        });
    });
}

function readProductos() {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * FROM inventario_productos;
        `;
    
        db.all(query, (err, rows) => {
            closeDatabase(db);
                if (err) {
                return reject(new Error("Error al leer inventario de productos: " + err.message));
            }
    
            if (!rows || rows.length === 0) {
                return reject(new Error("No se encontraron productos en el inventario."));
            }
            resolve(rows);
        });
    });
}

function searchProduct(code) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * FROM inventario_productos
            WHERE code = ?;
        `;
        
        db.get(query, code, (err, row) => {
            closeDatabase(db);
                if (err) {
                return reject(new Error("Error al leer el producto: " + err.message));
            }
    
            if (!row || row.length === 0) {
                return reject(new Error("No se encontraron coincidencias de producto"));
            }
            resolve(row);
        });
    });
}

function updateProducto(producto) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE inventario_productos
            SET 
                category = ?, model = ?, size = ?, decoration = ?, color = ?, price = ?,
                stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?
            WHERE code = ?;
        `;

        const params = [
            producto.category,
            producto.model,
            producto.size,
            producto.decoration,
            producto.color,
            producto.price,
            producto.stock_apartado,
            producto.stock_disponible,
            producto.stock_en_proceso,
            producto.code
        ];

        db.run(query, params, function (err) {
            closeDatabase(db);
      
            if (err) {
                return reject(new Error("Error al actualizar producto: " + err.message));
            }
            if (this.changes === 0) {
                return reject(new Error("No se encontró ningún producto con ese código"));
            }
            resolve("Producto actualizado correctamente");
        });
    });
}

function deleteProducto(code) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            DELETE FROM inventario_productos 
            WHERE code = ?;
        `;

        db.run(query, [code], function (err) {
            closeDatabase(db);

            if (err) {
                return reject(new Error("Error al borrar producto: " + err.message));
            }

            if (this.changes === 0) {
                return reject(new Error("No se borró ningún producto (¿existe ese código?)"));
            }

            resolve(`Producto con código '${code}' eliminado correctamente`);
        });
    });
}

module.exports = { 
    createProducto, 
    readProductos, 
    searchProduct, 
    updateProducto, 
    deleteProducto 
};