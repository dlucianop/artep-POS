const { join, resolve } = require('path');
const { openDataBase, closeDatabase } = require(join(__dirname, '..', 'js', 'connection.js'));

function createOrden(orden, origen) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        let query = '';
        let params = [];

        switch (origen) {
            case "VENTA": {
                if (!orden.id_venta || !orden.fecha_entrega) {
                    return reject(new Error("Orden de venta requiere 'id_venta' y 'fecha_entrega'"));
                }

                query = `
                    INSERT INTO orden_produccion
                        (id_venta, origen, tipo_item, name_item, cantidad_pedida, cantidad_buenos, cantidad_rotos, cantidad_deformes, fase_actual, estado, fecha_entrega, observaciones)
                    VALUES (?, "VENTA", ?, ?, ?, 0, 0, 0, 1, "PENDIENTE", ?, ?);
                `;

                params = [
                    orden.id_venta,
                    orden.tipo_item,
                    orden.name_item,
                    orden.cantidad_pedida,
                    orden.fecha_entrega,
                    orden.observaciones || ''
                ];
                break;
            }

            case "INVENTARIO": {
                if (!orden.tipo_item || !orden.name_item || !orden.cantidad_pedida) {
                    return reject(new Error("Orden de inventario requiere 'tipo_item', 'name_item' y 'cantidad_pedida'"));
                }

                query = `
                    INSERT INTO orden_produccion
                        (origen, tipo_item, name_item, cantidad_pedida, cantidad_buenos, cantidad_rotos, cantidad_deformes, fase_actual, estado, observaciones)
                    VALUES ("INVENTARIO", ?, ?, ?, 0, 0, 0, 1, "PENDIENTE", ?);
                `;

                params = [
                    orden.tipo_item,
                    orden.name_item,
                    orden.cantidad_pedida,
                    orden.observaciones || ''
                ];
                break;
            }

            case "REPOSICION": {
                if (!orden.id_orden_origen || !orden.name_item || !orden.tipo_item || !orden.cantidad_pedida) {
                    return reject(new Error("Orden de reposición requiere 'id_orden_origen', 'name_item', 'tipo_item' y 'cantidad_pedida'"));
                }

                query = `
                    INSERT INTO orden_produccion
                        (origen, tipo_item, name_item, cantidad_pedida, cantidad_buenos, cantidad_rotos, cantidad_deformes, fase_actual, estado, id_orden_origen, observaciones)
                    VALUES ("REPOSICION", ?, ?, ?, 0, 0, 0, 1, "PENDIENTE", ?, ?);
                `;

                params = [
                    orden.tipo_item,
                    orden.name_item,
                    orden.cantidad_pedida,
                    orden.id_orden_origen,
                    orden.observaciones || ''
                ];
                break;
            }

            default:
                return reject(new Error("Origen de orden no válido"));
        }

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al insertar orden de producción: " + err.message));
                }

                if (this.changes === 0) {
                    return reject(new Error("No se insertó ninguna orden"));
                }

                const newOrden = {
                    id_orden: this.lastID,
                    ...orden,
                    cantidad_buenos: 0,
                    cantidad_rotos: 0,
                    cantidad_deformes: 0,
                    estado: "PENDIENTE",
                    fase_actual: 1
                };

                resolve(newOrden);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function updateOrden(orden, origen) {
    switch (origen) {
        case "VENTA":
            //pendiente
            break;
        case "INVENTARIO":
            //pendiente
            break;
        case "REPOSICION":
            //pendiente
            break;
        default:
            break;
    }
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            UPDATE orden_produccion
            SET
                cantidad_buenos
            WHERE id_orden = ?;
        `;

        const params = [
            orden.id_fase,
            orden.cantidad_buenos,
            orden.cantidad_rotos,
            orden.cantidad_deformes,
            orden.id_orden
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar orden: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("No se encontró ninguna orden con ese identificador"));
                }

                resolve("Orden actualizada correctamente.");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readOrdenes() {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * 
            FROM orden_produccion;
        `;
    
        db.all(query, (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("[readOrdenes] Error al leer ordenes de Produccion: " + err.message));
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

function readOrdenesOrigen(origen) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT * 
            FROM orden_produccion
            WHERE origen = ?
        ;`;
    
        db.all(query, origen,(err, rows) => {
            try {
                if (err) {
                    return reject(new Error("[readOrdenesOrigen] Error al leer ordenes de Produccion: " + err.message));
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

function updateEstado(orden){
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            UPDATE orden_produccion
            SET
                estado = ?
            WHERE id_orden = ?;
        `;

        const params = [
            orden.estado,
            orden.id_orden
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("[updateEstado] Error al actualizar orden: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("[updateEstado] No se encontró ninguna orden con ese identificador"));
                }

                resolve("[updateEstado] Orden actualizada correctamente.");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function updateRepo(orden) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            UPDATE orden_produccion
            SET
                cantidad_inicial = ?
            WHERE id_orden = ?;
        `;

        const params = [
            orden.cantidad_inicial,
            orden.id_orden
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("[updateRepo] Error al actualizar orden: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("[updateRepo] No se encontró ninguna orden con ese identificador"));
                }

                resolve("Orden actualizada correctamente.");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function insertDetalle(orden) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            UPDATE orden_produccion
            SET
                id_detalle = ?
            WHERE id_orden = ?;
        `;

        const params = [
            orden.id_detalle,
            orden.id_orden
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar orden: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("Error al insertar detalle en Orden: no se encontro coincidencias"));
                }

                resolve("Orden actualizada correctamente.");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readOrdenByFase(fase_id) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            SELECT 
                op.id_orden, op.id_venta, oo.nombre AS origen, op.id_fase, f.name_fase AS fase_actual, op.fecha_entrega,
                op.categoria, op.size, op.cantidad_inicial, op.cantidad_buenos, op.cantidad_rotos, op.cantidad_deformes
            FROM orden_produccion op
            INNER JOIN origen_orden oo ON op.id_origen = oo.id_origen
            INNER JOIN fase f ON f.id_fase = op.id_fase
            WHERE op.id_fase = ?;
        `;

        db.all(query, [fase_id], (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer órdenes de producción: " + err.message));
                }

                resolve(rows || []);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readOrden(id_orden) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            SELECT op.*, oo.nombre AS origen, f.name_fase AS fase_actual, f.tipo_fase
            FROM orden_produccion op
            INNER JOIN origen_orden oo ON op.id_origen = oo.id_origen
            INNER JOIN fase f ON f.id_fase = op.id_fase
            WHERE op.id_orden = ?
        `;

        db.all(query, id_orden, (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer órdenes de producción: " + err.message));
                }
                resolve(rows || []);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function readOrdenesByVenta(id_venta) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            SELECT op.*, oo.nombre AS origen, f.name_fase AS fase_actual, f.tipo_fase
            FROM orden_produccion op
            INNER JOIN origen_orden oo ON op.id_origen = oo.id_origen
            INNER JOIN fase f ON f.id_fase = op.id_fase
            WHERE op.id_venta = ?
        `;

        db.all(query, [id_venta], (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer órdenes por venta: " + err.message));
                }
                resolve(rows || []);
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function updateCantidadInicial(id_orden, cantidad_inicial) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();

        const query = `
            UPDATE orden_produccion
            SET cantidad_inicial = ?
            WHERE id_orden = ?;
        `;

        db.run(query, [cantidad_inicial, id_orden], function(err) {
            if (err) {
                reject(new Error("Error al actualizar cantidad_inicial: " + err.message));
            } else if (this.changes === 0) {
                reject(new Error("No se encontró orden para actualizar cantidad_inicial"));
            } else {
                resolve("Cantidad inicial actualizada correctamente");
            }
            closeDatabase(db);
        });
    });
}

function searchReposicionOrden(orden) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT *
            FROM orden_produccion
            WHERE id_venta = ? AND id_detalle = ? AND id_origen = 5;
        `;

        const params = [
            orden.id_venta, 
            orden.id_detalle
        ];

        db.get(query, params, (err, row) => {
            if (err) {
                closeDatabase(db);
                return reject(new Error("[searchReposicionOrden] Error al leer la orden: " + err.message));
            }

            closeDatabase(db);
            resolve(row || undefined);
        });
    });
}

module.exports = { 
    readOrdenes,
    createOrden,
    updateEstado,
    readOrdenesOrigen
}