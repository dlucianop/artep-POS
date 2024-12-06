const express = require('express');
const {app, BrowserWindow} = require('electron');

var pos = express();

function createWindow(){
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreference:{
            nodeIntegreation:true
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(createWindow);


/*app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.get('/test', function (req, res) {
    res.send('Pagina test');
});

app.listen(3000, function() {
    console.log('Este es un ejemplo xd')
});*/