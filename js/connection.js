const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const database = path.join(__dirname,'..', 'db', 'data-artep.db');

function openDataBase() {
    return new sqlite3.Database(database, (err) => {
        if (err) {
            console.error('Error al abrir la base de datos:', err.message);
        } else {
            console.log('Conexion a base de datos exitosa.');
        }
    });
}

function closeDatabase(db) {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('Desconexion de base de datos exitosa');
        }
    });
}

module.exports = { openDataBase, closeDatabase };