const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createBizcocho(bizcocho, callback) {
    const db = openDataBase();
    const query = `
        INSERT INTO inventario_bizcochos
            (biz_category, biz_size, stock_total, stock_apartado, stock_disponible, stock_en_proceso, stock_min, stock_max, stock_critico)
        VALUES (?, ?, 0, ?, ?, ?, 0, 0, 0);
    `;

    db.run(query, [
        bizcocho.biz_category,
        bizcocho.biz_size,
        bizcocho.stock_apartado,
        bizcocho.stock_disponible,
        bizcocho.stock_en_proceso,
    ], function (err) {
        if (err) {
            console.error(`[ERROR] Consulta fallida: ${err.message}`);
            closeDatabase(db);
            return callback(err);
        }

        const newBizcocho = {
            id: this.lastID,
            biz_category: bizcocho.biz_category,
            biz_size: bizcocho.biz_size,
            stock_disponible: bizcocho.stock_disponible,
            stock_en_proceso: bizcocho.stock_en_proceso,
            stock_min: bizcocho.stock_min,
            stock_max: bizcocho.stock_max,
            stock_critico: bizcocho.stock_critico
        };

        console.log(`Bizcocho insertado correctamente. ID: ${this.lastID}`);
        closeDatabase(db);
        callback(null, newBizcocho);
    });
}


function readBizcochos(callback) {
    const db = openDataBase();
    const query = `
        SELECT *
        FROM inventario_bizcochos
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
    }
}


function updateBizcocho(bizcocho, callback) {
    //console.log("Datos del bizcocho a actualizar:", bizcocho);
    const db = openDataBase();
    const query = `
        UPDATE inventario_bizcochos
        SET stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?
        WHERE biz_category = ? AND biz_size = ?;
    `;

    db.run(
        query,
        [
            bizcocho.stock_apartado,
            bizcocho.stock_disponible, 
            bizcocho.stock_en_proceso, 
            bizcocho.biz_category,
            bizcocho.biz_size,
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            const updatedBizcocho = {
                id: this.lastID,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
                stock_disponible: bizcocho.stock_disponible,
                stock_en_proceso: bizcocho.stock_en_proceso,
                stock_min: bizcocho.stock_min,
                stock_max: bizcocho.stock_max,
                stock_critico: bizcocho.stock_critico
            };

            console.log(`Bizcocho actualizado correctamente. ID: ${this.lastID}`);

            closeDatabase(db);
            callback(null, updatedBizcocho);
        }
    );
}

function deleteBizcocho(bizcocho, callback){
    console.log("Datos del bizcocho a eliminar:", bizcocho);
    const db = openDataBase();
    const query = `
        DELETE FROM inventario_bizcochos
        WHERE id_biz = ?
    `;

    db.run(
        query,
        [
            bizcocho.id_bizcocho
        ],
        function (err) {
            if (err) {console.log(query, bizcocho.id_bizcocho);
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Bizcocho con ID ${bizcocho.id} eliminado correctamente.`);

            const deletedBizcocho = {
                id: bizcocho.id,
                tipo_bizcocho: bizcocho.categoria,
                size_bizcocho: bizcocho.tamano,
                bizcochos_en_bodega: bizcocho.cantidadBodega,
                bizcochos_en_proceso: bizcocho.cantidadProduccion,
            };

            closeDatabase(db);
            callback(null, deletedBizcocho);
        }
    );
}

function searchBizcocho(bizcocho, callback) {
    const db = openDataBase();
    const query = `
        SELECT * 
        FROM inventario_bizcochos
        WHERE biz_category = ? AND biz_size = ?
    `;
    db.all(
        query,
        [
            bizcocho.biz_category, 
            bizcocho.biz_size
        ],
        (err, rows) => {
            try {
                if (err) {
                    console.error(`[ERROR] Consulta fallida: ${err.message}`);
                    callback(err, null);
                    return;
                }
                if (rows.length < 0) {
                    console.log("No se encontraron coincidencias.", rows);
                }
                callback(null, rows);
            } catch (error) {
                callback(error, null);
            } finally {
                closeDatabase(db);
            }
        }
    );
}

module.exports = { createBizcocho, readBizcochos, updateBizcocho, searchBizcocho, deleteBizcocho };