const { join } = require('path');
const { openDataBase, closeDatabase } = require(join(__dirname,'..', 'js', 'connection.js'));

function readFases() {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            SELECT *
            FROM fase
        `;

        db.all(query, (err, rows) => {
            try {
                if (err) {
                    return reject(new Error("Error al leer fases: " + err.message));
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


function updateFase(fase) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE fase
            SET name_fase = ?, tipo_fase = ?
            WHERE id_fase = ?;
        `;

        const params = [
            fase.name_fase,
            fase.tipo_fase,
            fase.id_fase
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar fase: " + err.message));
                }

                if (this.changes === 0) {
                    return reject(new Error("No se encontró ninguna fase que coincida..."));
                }

                resolve("Fase actualizada correctamente");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

module.exports = {
    readFases,
    updateFase,
}