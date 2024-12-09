const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const database = path.join(__dirname,'..', 'db', 'data-artep.db');

const db = new sqlite3.Database(database, (err) => {
    if (err){
        console.log("ERROR: ", err.message);
    } else{
        console.log("Conexion exitosa.");
    }
});

db.all('SELECT p.*, ep.state, ep.num_products ' +
            'FROM productos p ' +
            'INNER JOIN estado_producto ep ' +
            'ON p.code = ep.code; ', [], (err, rows) => {
    if (err) {
        console.error('ERROR al ejecutar la consulta:', err.message);
    } else {
        //console.log('Datos obtenidos:');
        //console.table(rows);

        rows.forEach((row, index) => {
            console.log('Codigo producto:', row.code);      
            console.log('Nombre:', row.model, "[",row.size,"]", row.decoration, "<",row.color,">");
            console.log("Numero de productos y estado: ", row.num_products, row.state)
            console.log("------------------------------------------------------------------------")
        });
    }
});

db.close((err) => {
    if (err) {
        console.error('ERROR al cerrar la base de datos:', err.message);
    } else {
        console.log('Base de datos cerrada correctamente.');
    }
});