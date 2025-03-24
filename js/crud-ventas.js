const path = require('path');
const { callbackify } = require('util');
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);

function createVenta(datos_venta, callback){
    const db = openDataBase();
    const query = `
        INSERT INTO ventas
            (id_venta, fecha_venta, hora, nombre, telefono, correo, domicilio, fecha_entrega, metodo_pago, forma_pago, monto, pago)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    db.run(query, 
        [
            datos_venta.id_ventaV, 
            datos_venta.fecha_ventaV,
            datos_venta.horaV,
            datos_venta.nombreV, 
            datos_venta.telefonoV, 
            datos_venta.correoV, 
            datos_venta.domicilioV, 
            datos_venta.fecha_entregaV, 
            datos_venta.metodo_pagoV, 
            datos_venta.forma_pagoV, 
            datos_venta.montoV, 
            datos_venta.pagoV
        ], 
        function (err) {
            if (err) {
                console.error(`[ERROR-VENTA] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                callback(err, null);
                return;
            }

            setTimeout(() => {
                const newVenta = {
                    id_venta: datos_venta.id_ventaV, 
                    fecha_venta: datos_venta.fecha_ventaV,
                    hora: datos_venta.horaV,
                    nombre: datos_venta.nombreV, 
                    telefono: datos_venta.telefonoV, 
                    correo: datos_venta.correoV, 
                    domicilio: datos_venta.domicilioV, 
                    fecha_entrega: datos_venta.fecha_entregaV, 
                    metodo_pago: datos_venta.metodo_pagoV, 
                    forma_pago: datos_venta.forma_pagoV, 
                    descuento_porcentaje: datos_venta.montoV, 
                    pago: datos_venta.pagoV
                };
                console.log(`Venta Registrada con exito: ${newVenta.id_venta}`);
                closeDatabase(db);
                callback(null, newVenta);
            }, 500);
        }
    );
}

function readVentas(callback) {
    const db = openDataBase();
    const query = `
        SELECT *
        FROM ventas
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

function updateVenta(datos_venta, callback) {
    /*en proceso */
}

function deleteVenta(datos_venta, callback){
    const db = openDataBase();
    const query = `
        DELETE FROM ventas
        WHERE id_venta
        AND fecha_venta = ?
        AND hora = ?;
    `;

    db.run(
        query,
        [
            datos_venta.id_ventaV, 
            datos_venta.fecha_ventaV,
            datos_venta.horaV,
        ],
        function (err) {
            if (err) {
                console.error(`[ERROR] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                return callback(err, null);
            }

            console.log(`Venta con codigo ${datos_venta.id_ventaV} eliminada correctamente.`);

            const deletedVenta = {
                    id_venta: datos_venta.id_ventaV, 
                    fecha_venta: datos_venta.fecha_ventaV,
                    hora: datos_venta.horaV,
                    nombre: datos_venta.nombreV, 
                    telefono: datos_venta.telefonoV, 
                    correo: datos_venta.correoV, 
                    domicilio: datos_venta.domicilioV, 
                    fecha_entrega: datos_venta.fecha_entregaV, 
                    metodo_pago: datos_venta.metodo_pagoV, 
                    forma_pago: datos_venta.forma_pagoV, 
                    descuento_porcentaje: datos_venta.descuento_porcentajeV, 
                    pago: datos_venta.pagoV
            };

            closeDatabase(db);
            callback(null, deletedVenta);
        }
    );
}

/**          DETALLES DE VENTA      */
function createVentaDETALLES(detalles_venta, callback){
    const db = openDataBase();
    const query = `
        INSERT INTO detalles_venta
            (id_venta, code, price, quantity, importe)
        VALUES (?, ?, ?, ?, ?);
    `;
    db.run(query, 
        [
            detalles_venta.id_ventaVD,
            detalles_venta.codeVD,
            detalles_venta.priceVD,
            detalles_venta.quantityVD, 
            detalles_venta.importeVD
        ], 
        function (err) {
            if (err) {
                console.error(`[ERROR-detalle] Consulta fallida: ${err.message}`);
                closeDatabase(db);
                callback(err, null);
                return;
            }

            setTimeout(() => {
                const newDetalle = {
                    id_venta: detalles_venta.id_ventaVD,
                    code: detalles_venta.codeVD,
                    price: detalles_venta.priceVD,
                    quantity: detalles_venta.quantityVD, 
                    importe: detalles_venta.importeVD
                };
                closeDatabase(db);
                callback(null, newDetalle);
            }, 500);
        }
    );
}

function readVentasDetalle(detalles_venta, callback) {
    const db = openDataBase();
    const query = `
        SELECT *
        FROM detalles_venta
        WHERE id_venta = ?;
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

function updateVentaDetalle(detalles_venta, callback) {
    /*en proceso */
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

function readVenta(idVenta, callback) {
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
        INNER JOIN inventario_productos ip
        ON dv.code = ip.code
        INNER JOIN ventas v
        ON v.id_venta = dv.id_venta
        WHERE dv.id_venta = ?;
    `;

    try {
        db.all(query, [
            idVenta
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

module.exports = { createVenta, readVentas, updateVenta, deleteVenta, createVentaDETALLES, readVentasDetalle, updateVentaDetalle, deleteVentaDetalle, readVenta }