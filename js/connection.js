const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { showToast, ICONOS } = require(path.join(__dirname, "..", "js", "toast.js"));

const database = path.join(__dirname, '..', 'db', 'data-artep.db');

function openDataBase() {
    try {
        return new sqlite3.Database(database);
    } catch (err) {
        showToast(`[BD] Error al abrir la base de datos: ${err.message}`, ICONOS.error);
        return null;
    }
}

function closeDatabase(db) {
    db.close((err) => {
        if (err) {
            showToast(`[BD] Error al cerrar la base de datos: ${err.message}`, ICONOS.error);
        } else {
            console.log("[BD] Base de datos cerrada correctamente");
        }
    });
}

module.exports = { openDataBase, closeDatabase };