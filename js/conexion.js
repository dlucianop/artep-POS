const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'data-artep.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err){
        alert("OCURRIO UN ERROR: ", err.message);
    } else{
        alert("Conexion exitosa");
    }
});

function createProducts(id_producto, categoria, modelo, size, decorado, color, callback) {
    const sql = 'INSERT INTO productos (id_producto, categoria, modelo, size, decorado, color) ' +
                'VALUES (?, ?, ?, ?, ?, ?)';
    
    db.run(sql, [id_producto, categoria, modelo, size, decorado, color], function(err) {
        if (err) {
            console.error('Error al insertar producto:', err.message);
            callback(err);
        } else {
            console.log('Producto insertado correctamente con ID:', this.lastID);
            callback(null, this.lastID);
        }
    });
}


function readProducts(callback){
    db.all('SELECT p.*, ep.estado, ep.numero_productos ' +
            'FROM productos p ' +
            'INNER JOIN estado_producto ep ' +
            'ON p.id_producto = ep.id_producto; ', (err, rows) => {
                if (err){
                    console.error("ERROR: ", err.message);
                    callback(err, null);
                } else {
                    callback(null, rows);
                }
    });
}

function updateProducts(id_producto, categoria, modelo, size, decorado, color, callback) {
    const sql = 'UPDATE productos SET categoria = ?, modelo = ?, size = ?, decorado = ?, color = ? ' +
                'WHERE id_producto = ?';

    db.run(sql, [categoria, modelo, size, decorado, color, id_producto], function(err) {
        if (err) {
            console.error('Error al actualizar producto:', err.message);
            callback(err);
        } else {
            console.log('Producto actualizado correctamente');
            callback(null, this.changes);
        }
    });
}

function deleteProducts(id_producto, callback) {
    const sql = 'DELETE FROM productos WHERE id_producto = ?';

    db.run(sql, [id_producto], function(err) {
        if (err) {
            console.error('Error al eliminar producto:', err.message);
            callback(err);
        } else {
            console.log('Producto eliminado correctamente');
            callback(null, this.changes);
        }
    });
}

function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('Conexión con la base de datos cerrada');
        }
    });
}

module.exports = {
    createProducts,
    readProducts,
    updateProducts,
    deleteProducts,
    closeDatabase
};