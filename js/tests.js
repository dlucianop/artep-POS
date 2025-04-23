const path = require('path')
const dbJS = path.join(__dirname,'..', 'js', 'connection.js');
const { openDataBase, closeDatabase } = require(dbJS);
const toast = join(__dirname, "..", "js", "toast.js");
const { showToast, ICONOS } = require(toast);

function createOrden(orden, callback) {
    const db = openDataBase();
    const query = `
        INSERT INTO orden_produccion
            (id_venta, id_origen, id_fase, fecha_entrega, categoria, size, cantidad_inicial, cantidad_buenos, cantidad_rotos, cantidad_deformes) 
        VALUES (?, ?, 1, ?, ?, ?, ?, 0, 0, 0);
    `;

    db.run(query, 
        [
            orden.id_ventaO,
            orden.id_origenO,
            orden.fecha_entregaO,
            orden.categoriaO, 
            orden.sizeO, 
            orden.cantidad_inicialO
        ], 
        function (err) {
            if (err) {
                closeDatabase(db);
                callback(err, null);
                return;
            }

            setTimeout(() => {
                const newOrden = {
                    id_venta: orden.id_ventaO,
                    id_origen: orden.id_origenO,
                    fecha_entreg: orden.fecha_entregaO,
                    categoria: orden.categoriaO, 
                    size: orden.sizeO, 
                    cantidad_inicial: orden.cantidad_inicialO,
                    cantidad_buenos: 0,
                    cantidad_rotos: 0,
                    cantidad_deformes: 0,
                };
                closeDatabase(db);
                callback(null, newOrden);
            }, 500);
        }
    );
}

function readOrdenbyFASE(orden, callback) {
    const db = openDataBase();
    const query = `
        SELECT 
            op.id_orden, op.id_venta, oo.nombre AS origen, f.name_fase AS fase_actual, op.fecha_entrega,
            op.categoria, op.size, op.cantidad_inicial, op.cantidad_buenos, op.cantidad_rotos, op.cantidad_deformes
        FROM orden_produccion op
        INNER JOIN origen_orden oo
        ON op.id_origen = oo.id_origen
        INNER JOIN fase f
        ON f.id_fase = op.id_fase
        WHERE op.id_fase = ?
    `;
    try {
        db.all(query, 
            [
                orden.faseO
            ], 
        (err, rows) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, rows);
        });
    } catch (err) {
        callback(err, null);
    } finally {
        closeDatabase(db);
    }
}

module.exports = { createOrden, readOrdenbyFASE }
