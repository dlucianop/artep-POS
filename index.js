const { app, BrowserWindow} = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/js', 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src/html', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function initDatabase() {
    db = new sqlite3.Database(path.join(__dirname, 'src/db', 'data-artep.db'), (err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
        } else {
            console.log('📦 Conectado a la base de datos SQLite');
        }
    });
}


app.whenReady().then(() => {
    initDatabase();
    createWindow();
});

app.on('window-all-close', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error al cerrar la base de datos:', err);
            } else {
                console.log('Base de datos cerrada correctamente.');
            }
        });
    }
});