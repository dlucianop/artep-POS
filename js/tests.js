function readVentasDetalle(detalles_venta, callback) {
    const db = openDataBase();
    const query = `
        SELECT 
            v.id_venta AS noDeVenta, v.fecha_venta, v.hora AS hora_venta, 
            v.nombre AS cliente_name, v.telefono, v.correo, v.domicilio, v.fecha_entrega, v.metodo_pago, v.forma_pago,
            ip.code AS codigo, ip.category || ' MOD.' || ip.model || ' TAM.' || ip.size || ' DECOR.' || ip.decoration || ' COL.' || ip.color AS nombre, dv.price AS precioUnit, dv.quantity AS cantidad, dv.importe,
            v.monto, v.pago, (v.pago - v.monto) AS cambio
        FROM ventas v
        INNER JOIN detalles_venta dv
        ON v.id_venta = dv.id_venta
        INNER JOIN inventario_productos ip
        ON ip.code = dv.code
        WHERE v.id_venta = ?;
    `;

    try {
        db.all(query, [
            detalles_venta.id_ventaVD
        ], (err, rows) => {
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



function deleteVentaDetalle(detalles_venta, callback){
    const db = openDataBase();
    const query = `
        DELETE
        FROM detalles_venta
        WHERE id_venta = ?;
    `;

    db.run(
        query,
        [
            detalles_venta.id_ventaV
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Venta con codigo ${datos_venta.id_ventaV} eliminada correctamente.`);

            const deleteddetalles = {
                id_venta: detalles_venta.id_ventaV, 
            };

            closeDatabase(db);
            callback(null, deleteddetalles);
        }
    );
}


function deleteVenta(id_venta){
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            DELETE FROM ventas
            WHERE id_venta = ?;
        `;

        db.run(query, [id_venta], function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al borrar venta: " + err.message));
                }
    
                if (this.changes === 0) {
                    return reject(new Error("No se borró ninguna venta (¿existe ese identificador?)"));
                }
                
                resolve(`Venta con identificador'${id_venta}' eliminado correctamente`);
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
                v.id_venta AS noDeVenta, v.fecha_venta, v.hora AS hora_venta, 
                v.nombre AS cliente_name, v.telefono, v.correo, v.domicilio, v.fecha_entrega, v.metodo_pago, v.forma_pago,
                ip.code AS codigo, 
                ip.category || ' MOD.' || ip.model || ' TAM.' || ip.size || ' DECOR.' || ip.decoration || ' COL.' || ip.color AS nombre, 
                dv.price AS precioUnit, dv.quantity AS cantidad, dv.importe,
                v.monto, v.pago, (v.pago - v.monto) AS cambio
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
            }
        });
    });
}



function searchVenta(idVenta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT 
                v.id_venta as No_venta,
                v.fecha_venta,
                v.hora,
                v.nombre as nombreCliente,
                v.telefono,
                v.correo,
                v.domicilio,
                v.fecha_entrega,
                v.metodo_pago,
                v.forma_pago,
                ip.code as codigoProd,
                dv.price as precioUnit,
                dv.quantity as cantidad,
                dv.importe as importe,
                ip.category || " "|| ip.model || " [Tamaño " || ip.size || "]" || " Decoracion " || ip.decoration || " - Color " || ip.color as descripcion,
                v.monto,
                v.pago
            FROM detalles_venta dv
            INNER JOIN inventario_productos ip ON dv.code = ip.code
            INNER JOIN ventas v ON v.id_venta = dv.id_venta
            WHERE dv.id_venta = ?;
        `;

        db.all(query, [idVenta], (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al consultar la venta: " + err.message));
                }

                if (!rows || rows.length === 0) {
                    return resolve([]); // o `null` si prefieres
                }

                resolve(rows);
            } catch (errFinal) {
                reject(errFinal);
            } finally {
                closeDatabase(db);
                console.log('[INFO] Conexión a la base de datos cerrada.');
            }
        });
    });
}

