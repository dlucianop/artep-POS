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

    db.run(query, [bizcocho.categoria, bizcocho.tamano, bizcocho.cantidadBodega, bizcocho.cantidadProduccion], function (err) {
        if (err) {
            alert(`ERROR al insertar el producto: ${err.message}`);
            console.error(`[ERROR] Consulta fallida: ${err.message}`);
            closeDatabase(db);
            callback(err, null);
            return;
        }

        setTimeout(() => {
            const newBizcocho = {
                id: this.lastID,
                tipo_bizcocho: bizcocho.categoria,
                size_bizcocho: bizcocho.tamano,
                bizcochos_en_bodega: bizcocho.cantidadBodega,
                bizcochos_en_proceso: bizcocho.cantidadProduccion
            };

            console.log(`Producto creado con el ID: ${this.lastID}`);
            closeDatabase(db);
            callback(null, newBizcocho);
        }, 500);
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
        console.log('[INFO] Conexión a la base de datos cerrada.');
    }
}


function updateBizcocho(bizcocho, callback) {
    console.log("Datos del bizcocho a actualizar:", bizcocho);
    const db = openDataBase();
    const query = `
        UPDATE inventario_bizcochos
        SET bizcochos_en_bodega = ?, bizcochos_en_proceso = ?
        WHERE id_bizcocho = ?
        AND tipo_bizcocho = ?
        AND size_bizcocho = ?;
    `;

    db.run(
        query,
        [
            bizcocho.cantidadBodega,
            bizcocho.cantidadProduccion,
            bizcocho.id,
            bizcocho.categoria,
            bizcocho.tamano,
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Bizcocho con ID ${bizcocho.id} actualizado correctamente.`);

            const updatedBizcocho = {
                id: bizcocho.id,
                tipo_bizcocho: bizcocho.categoria,
                size_bizcocho: bizcocho.tamano,
                bizcochos_en_bodega: bizcocho.cantidadBodega,
                bizcochos_en_proceso: bizcocho.cantidadProduccion,
            };

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
        WHERE id_bizcocho = ? AND tipo_bizcocho = ? AND size_bizcocho = ?;
    `;

    db.run(
        query,
        [
            bizcocho.id,
            bizcocho.categoria,
            bizcocho.tamano,
        ],
        function (err) {
            if (err) {
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

module.exports = { createBizcocho, readBizcochos, updateBizcocho, deleteBizcocho };