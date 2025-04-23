const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    const indexPath = path.join(__dirname, 'html', 'index.html');
    console.log("Index Path: ", indexPath); //si entra porque hasta arriba muestra el nombre de la pagina que es Punto de Venta
    win.loadFile(indexPath);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
