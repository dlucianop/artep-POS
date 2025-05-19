const { join } = require('path');
const { openDataBase, closeDatabase } = require(join(__dirname,'..', 'js', 'connection.js'));

function createVenta(venta){
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            INSERT INTO ventas
                (id_venta, fecha_venta, hora, nombre, telefono, correo, domicilio, fecha_entrega, metodo_pago, forma_pago, monto, pago)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const params = [
            venta.id_venta, 
            venta.fecha_venta,
            venta.hora,
            venta.nombre, 
            venta.telefono, 
            venta.correo, 
            venta.domicilio, 
            venta.fecha_entrega, 
            venta.metodo_pago, 
            venta.forma_pago, 
            venta.monto, 
            venta.pago
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al insertar venta: " + err.message));
                }
        
                if (this.changes === 0) {
                    return reject(new Error("No se insertó ninguna venta"));
                }
        
                const newVenta = {
                    id_venta: venta.id_venta, 
                    fecha_venta: venta.fecha_venta,
                    hora: venta.hora,
                    nombre: venta.nombre, 
                    telefono: venta.telefono, 
                    correo: venta.correo, 
                    domicilio: venta.domicilio, 
                    fecha_entrega: venta.fecha_entrega, 
                    metodo_pago: venta.metodo_pago, 
                    forma_pago: venta.forma_pago, 
                    monto: venta.monto, 
                    pago: venta.pago
                };

                resolve(newVenta);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readVentas() {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT *
            FROM ventas
        `;

        db.all(query, (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer las ventas: " + err.message));
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

function searchVenta(id_venta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * 
            FROM ventas
            WHERE id_venta = ?;
        `;
        
        db.get(query, id_venta, (err, row) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer la venta: " + err.message));
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

function updateVenta(venta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE ventas
            SET 
                nombre = ?, telefono = ?, correo = ?, domicilio = ?, fecha_entrega = ?, metodo_pago = ?, forma_pago = ?, pago = ?
            WHERE id_venta = ?;
        `;

        const params = [
            venta.nombre, 
            venta.telefono, 
            venta.correo, 
            venta.domicilio, 
            venta.fecha_entrega, 
            venta.metodo_pago, 
            venta.forma_pago, 
            venta.pago,
            venta.id_venta
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar datos de venta: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("No se encontró ninguna venta con ese identificador."));
                }

                resolve("Venta actualizada correctamente");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });

    });
}

/*-------------------------------------------------------------DETALLES DE VENTA ------------------------------------------------------------------------------------ */

function createDetalle(detalles){
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            INSERT INTO detalles_venta
                (id_venta, code, price, quantity, importe)
            VALUES (?, ?, ?, ?, ?);
        `;

        const params = [
            detalles.id_venta, 
            detalles.code,
            detalles.price,
            detalles.quantity,
            detalles.importe
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al insertar detalle de venta: " + err.message));
                }
        
                if (this.changes === 0) {
                    return reject(new Error("No se insertó ningun detalle de venta"));
                }
        
                const newDetalle = {
                    id_venta: detalles.id_venta, 
                    code: detalles.code,
                    price: detalles.price,
                    quantity: detalles.quantity,
                    importe: detalles.importe
                };

                resolve(newDetalle);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readDetalles(id_venta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT 
                id_detalle,
                v.id_venta AS noDeVenta,
                v.fecha_venta,
                v.hora AS hora_venta,
                v.nombre AS cliente_name,
                v.telefono,
                v.correo,
                v.domicilio,
                v.fecha_entrega,
                v.metodo_pago,
                v.forma_pago,
                ip.code AS codigo,
                ip.category || ' MOD.' || ip.model || ' TAM.' || ip.size || ' DECOR.' || ip.decoration || ' COL.' || ip.color AS nombre,
                dv.price AS precioUnit,
                dv.quantity AS cantidad,
                dv.importe,
                v.monto,
                v.pago,
                (v.pago - v.monto) AS cambio
            FROM ventas v
            INNER JOIN detalles_venta dv ON v.id_venta = dv.id_venta
            INNER JOIN inventario_productos ip ON ip.code = dv.code
            WHERE v.id_venta = ?;
        `;

        db.all(query, [id_venta], (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al obtener los detalles de la venta: " + err.message));
                }

                if (!rows || rows.length === 0) {
                    return resolve([]);
                }

                resolve(rows);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
                console.log('[INFO] Conexión a la base de datos cerrada.');
            }
        });
    });
}


function updateDetalle(detalles_venta, callback) {
    /*Probablemente nunca se use PENDIENTE */
}

function deleteVentaConDetalles(id_venta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        db.serialize(() => {
            const deleteDetallesQuery = `
                DELETE FROM detalles_venta
                WHERE id_venta = ?;
            `;

            db.run(deleteDetallesQuery, [id_venta], function (err) {
                if (err) {
                    closeDatabase(db);
                    return reject(new Error("Error al eliminar los detalles de la venta: " + err.message));
                }

                const deleteVentaQuery = `
                    DELETE FROM ventas
                    WHERE id_venta = ?;
                `;

                db.run(deleteVentaQuery, [id_venta], function (err2) {
                    try {
                        if (err2) {
                            return reject(new Error("Error al eliminar la venta: " + err2.message));
                        }

                        if (this.changes === 0) {
                            return reject(new Error("No se eliminó ninguna venta (¿existe ese ID?)"));
                        }

                        resolve(`Venta con ID '${id_venta}' y sus detalles eliminados correctamente.`);
                    } catch (errFinal) {
                        reject(errFinal);
                    } finally {
                        closeDatabase(db);
                    }
                });
            });
        });
    });
}

module.exports = { 
    createVenta,
    readVentas,
    searchVenta,
    updateVenta,
    createDetalle,
    readDetalles,
    deleteVentaConDetalles,
 }