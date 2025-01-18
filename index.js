const {app, BrowserWindow} = require('electron');

function createWindow(){
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile("html/punto-de-venta.html");
}

app.whenReady().then(createWindow);