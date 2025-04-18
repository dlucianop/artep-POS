const productoFound = await new Promise((resolve, reject) => {
    readOneProduct({ codeOne: codigoProducto }, (err, data) => {
        if (err) return reject(err);
        resolve(data[0]);
    });
});