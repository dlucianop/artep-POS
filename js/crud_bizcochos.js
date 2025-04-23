const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createBizcocho(bizcocho) {
    console.log(bizcocho);
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            INSERT INTO inventario_bizcochos
                (id_biz, biz_category, biz_size, stock_total, stock_apartado, stock_disponible, stock_en_proceso, stock_min, stock_max, stock_critico)
            VALUES (?, ?, ?, 0, ?, ?, ?, 0, 0, 0);
        `;

        const params = [
            bizcocho.id_biz,
            bizcocho.biz_category,
            bizcocho.biz_size,
            bizcocho.stock_apartado,
            bizcocho.stock_disponible,
            bizcocho.stock_en_proceso,
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al insertar bizcocho: " + err.message));
                }

                if (this.changes === 0) {
                    return reject(new Error("No se insertó ningún bizcocho"));
                }

                const newBizcocho = {
                    id: bizcocho.id_biz,
                    biz_category: bizcocho.biz_category,
                    biz_size: bizcocho.biz_size,
                    stock_apartado: bizcocho.stock_apartado || 0,
                    stock_disponible: bizcocho.stock_disponible || 0,
                    stock_en_proceso: bizcocho.stock_en_proceso || 0,
                };

                resolve(newBizcocho);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}


function readBizcochos() {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT *
            FROM inventario_bizcochos
        `;

        db.all(query, (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer inventario de bizcochos: " + err.message));
                }

                if (!rows || rows.length === 0) {
                    return resolve([]);
                }

                resolve(rows);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function searchBizcocho(bizcocho) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * 
            FROM inventario_bizcochos
            WHERE biz_category = ? AND biz_size = ?
        `;

        const params = [
            bizcocho.biz_category, 
            bizcocho.biz_size
        ];

        db.get(query, params, (err, row) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer el bizcocho: " + err.message));
                }

                if (!row) { 
                    return resolve([]);
                }

                resolve(row);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function updateBizcocho(bizcocho) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE inventario_bizcochos
            SET stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?
            WHERE biz_category = ? AND biz_size = ?;
        `;

        const params = [
            bizcocho.stock_apartado,
            bizcocho.stock_disponible, 
            bizcocho.stock_en_proceso, 
            bizcocho.biz_category,
            bizcocho.biz_size,
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar bizcocho: " + err.message));
                }

                if (this.changes === 0) {
                    return reject(new Error("No se encontró ningún bizcocho para actualizar."));
                }

                resolve("Bizcocho actualizado correctamente");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}


function deleteBizcocho(id_biz){
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            DELETE FROM inventario_bizcochos
            WHERE id_biz = ?
        `;

        db.run(query, [id_biz], function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al borrar bizcocho: " + err.message));
                }
    
                if (this.changes === 0) {
                    return reject(new Error("No se borró ningún bizcocho (¿existe ese código?)"));
                }
    
                resolve(`Producto con código '${id_biz}' eliminado correctamente`);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

module.exports = { 
    createBizcocho, 
    readBizcochos, 
    updateBizcocho, 
    searchBizcocho, 
    deleteBizcocho 
};