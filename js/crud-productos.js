const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);
const toast = join(__dirname, "..", "js", "toast.js");
const { showToast, ICONOS } = require(toast);

function createProducto(producto, callback){
    const db = openDataBase();
    const query = `
        INSERT INTO inventario_productos 
            ("code", "category", "model", "size", "decoration", "color", "price", "stock_total", "stock_apartado", "stock_disponible", "stock_en_proceso", "stock_min", "stock_max", "stock_critico") 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.run(query, 
        [
            producto.codeA, 
            producto.categoryA, 
            producto.modelA, 
            producto.sizeA, 
            producto.decorationA, 
            producto.colorA,
            producto.priceA,
            producto.stock_totalA,
            producto.stock_apartadoA,
            producto.stock_disponibleA,
            producto.stock_en_procesoA,
            producto.stock_minA,
            producto.stock_maxA,
            producto.stock_criticoA
        ], 
        function (err) {
            if (err) {
                showToast(`[ERROR] Consulta fallida: ${err.message}`, ICONOS.error);
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
                    precio: producto.priceA,
                    total: producto.stock_totalA,
                    apartado: producto.stock_apartadoA,
                    disponible: producto.stock_disponibleA,
                    proceso: producto.stock_en_procesoA,
                    min: producto.stock_minA,
                    max: producto.stock_maxA,
                    critico: producto.stock_criticoA
                };
                showToast(`Producto creado con el ID: ${newProducto.id}`, ICONOS.exito);
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
        FROM inventario_productos;
    `;

    try {
        db.all(query, [], (err, rows) => {
            if (err) {
                showToast(`[ERROR] Consulta fallida: ${err.message}`, ICONOS.error);
                callback(err, null);
                return;
            }
            callback(null, rows);
        });
    } catch (err) {
        showToast(`[CRITICAL] Error inesperado: ${err.message}`, ICONOS.error);
        callback(err, null);
    } finally {
        closeDatabase(db);
    }
}

function readOneProduct(producto, callback) {
    const db = openDataBase();
    const query = `
        SELECT *
        FROM inventario_productos
        WHERE code = ?;
    `;

    try {
        db.all(query, 
            [
                producto.codeOne
            ], 
        (err, rows) => {
            if (err) {
                showToast(`[ERROR] Consulta fallida: ${err.message}`, ICONOS.error);
                callback(err, null);
                return;
            }
            callback(null, rows);
        });
    } catch (err) {
        showToast(`[CRITICAL] Error inesperado: ${err.message}`, ICONOS.error);
        callback(err, null);
    } finally {
        closeDatabase(db);
    }
}

function updateProducto(producto, callback) {
    const db = openDataBase();
    const query = `
        UPDATE inventario_productos
        SET category = ?, model = ?, size = ?, decoration = ?, color = ?, price = ?, stock_total = ?, stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?, stock_min = ?, stock_max = ?, stock_critico = ?
        WHERE code = ?;
    `;
    db.run(
        query,
        [
            producto.categoryE, 
            producto.modelE, 
            producto.sizeE, 
            producto.decorationE, 
            producto.colorE,
            producto.priceE,
            producto.stock_totalE,
            producto.stock_apartadoE,
            producto.stock_disponibleE,
            producto.stock_en_procesoE,
            producto.stock_minE,
            producto.stock_maxE,
            producto.stock_criticoE,
            producto.codeE
        ],
        function (err) {
            if (err) {
                showToast(`[ERROR] Consulta fallida: ${err.message}`, ICONOS.error);
                closeDatabase(db);
                return callback(err, null);
            }
            showToast(`Producto actualizado: ${producto.codeE}`, ICONOS.exito);

            const updatedProducto = {
                id: producto.codeE,
                categoria: producto.categoryE,
                modelo: producto.modelE,
                tamano: producto.sizeE,
                decoracion: producto.decorationE,
                color: producto.colorE,
                precio: producto.priceE,
                total: producto.stock_totalE,
                apartado: producto.stock_apartadoE,
                disponible: producto.stock_disponibleE,
                proceso: producto.stock_en_procesoE,
                min: producto.stock_minE,
                max: producto.stock_maxE,
                critico: producto.stock_criticoE
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
        WHERE code = ?;
    `;

    db.run(
        query,
        [
            producto.codeD,
        ],
        function (err) {
            if (err) {
                showToast(`[ERROR] Consulta fallida: ${err.message}`, ICONOS.error);
                closeDatabase(db);
                return callback(err, null);
            }
            showToast(`Producto eliminado: ${producto.codeD}`, ICONOS.exito);

            const deletedProducto = {
                id: producto.codeD,
            };

            closeDatabase(db);
            callback(null, deletedProducto);
        }
    );
}

module.exports = { createProducto, readProductos, updateProducto, deleteProducto, readOneProduct};