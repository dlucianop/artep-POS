const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'database.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createProduct(product, callback) {
    const db = openDataBase();
    
    const query = `
        INSERT INTO productos (code, category, model, size, decoration, color)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.run(query, [product.code, product.category, product.model, product.size, product.decoration, product.color], function(err) {
        if (err) {
            console.error('ERROR al insertar el producto:', err.message);
            closeDatabase(db);
            callback(err, null);
            return;
        } 
        console.log(`Producto creado con el ID: ${this.lastID}`);
        
        const db2 = openDataBase();
        const query2 = `
            INSERT INTO estado_producto (state, code, num_products)
            VALUES ("CRUDO", ?, 0);
        `;

        db2.run(query2, [product.code], function(err) {
            if (err) {
                console.error('ERROR al insertar estado del producto:', err.message);
                closeDatabase(db2);
                callback(err, null);
                return;
            }
            console.log(`Estado de producto creado con el ID: ${this.lastID}`);
            
            closeDatabase(db2);
            callback(null, { id: this.lastID, ...product });
        });
    });
}



function readProducts(callback) {
    const db = openDataBase();

    const query = `
        SELECT p.*, 
            ep.state, 
            CASE 
                WHEN ep.state = "TERMINADO" THEN ep.num_products
                ELSE 0 
            END AS num_products
        FROM productos p 
        INNER JOIN estado_producto ep
        ON p.code = ep.code
        ORDER BY 
            CASE 
                WHEN ep.state = "TERMINADO" AND ep.num_products > 0 THEN 0 
                ELSE 1 
            END,
        p.code;
    `;
    
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

function updateProduct(){

}

function deleteProduct(){

}

module.exports = { createProduct, readProducts, updateProduct, deleteProduct };