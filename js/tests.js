function imprimirRecibo() {
    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return;
    }

    let idVenta = parseInt(document.getElementById('id-sale').value.trim());
    let metodo_pago = document.getElementById('payment-method').value;
    let forma_pago = document.getElementById('payment-form').value;
    let pago = parseFloat(document.getElementById("pago").value);

    if (!idVenta) {
        showToast("Falta poner el número de venta.", ICONOS.advertencia);
        return;
    }

    readVentas((err, data) => {
        if (err) {
            showToast(`Error al leer inventario: ${err}`, ICONOS.error);
            return;
        }
        
        if (data.some(venta => parseInt(venta.id_venta) === idVenta)) {
            showToast("Ya existe venta con el mismo número, intente con otro.", ICONOS.error);
            return;
        }
    });

    if (!metodo_pago) {
        showToast("Falta agregar un método de pago.", ICONOS.advertencia);
        return;
    }
    
    if (!forma_pago) {
        showToast("Falta agregar una forma de pago.", ICONOS.advertencia);
        return;
    }

    if (!pago) {
        showToast("Falta poner una cantidad en pago.", ICONOS.advertencia);
        return;
    } 

    revisarAlmacen();
    encapsularVenta();

    const codigos = productos.map(item => item.code);
    carrito.forEach(prodcar => {
        const codigoProducto = parseInt(prodcar.codigo);
        const pedido = prodcar.pedido;

        if (codigos.includes(codigoProducto)) {
            readOneProduct({ codeOne: codigoProducto }, (err, data) => {
                if (err) {
                    showToast(`Error lectura: ${err}`, ICONOS.error);
                    return;
                }

                const producto = data[0];
                
                let nuevoDisponible = producto.stock_disponible;
                let nuevoApartado = producto.stock_apartado;
                let nuevoProceso = producto.stock_en_proceso;

                if (nuevoDisponible >= pedido) {
                    nuevoDisponible -= pedido;
                    nuevoApartado += pedido;
                } else {
                    const faltante = pedido - nuevoDisponible;
                    nuevoApartado += nuevoDisponible;
                    nuevoProceso += faltante;
                    nuevoDisponible = 0;
                }

                /*const updateData = {
                    codeE: codigoProducto,
                    stock_disponibleE: nuevoDisponible,
                    stock_apartadoE: nuevoApartado,
                    stock_en_procesoE: nuevoProceso,
                    stock_totalE: nuevoDisponible + nuevoApartado + nuevoProceso,

                    categoryE: producto.category,
                    modelE: producto.model,
                    sizeE: producto.size,
                    decorationE: producto.decoration,
                    colorE: producto.color,
                    priceE: producto.price,
                    stock_minE: producto.stock_min,
                    stock_maxE: producto.stock_max,
                    stock_criticoE: producto.stock_critico
                };

                const createDetalle = {
                    id_ventaVD: id_ventaV,
                    codeVD: codigoProducto,
                    priceVD: producto.price,
                    quantityVD: pedido,
                    importeVD: producto.price * pedido,
                }

                let biz_category = producto.category;
                let biz_size = producto.size;

                searchBizcocho({biz_category, biz_size}, (err, dataB) => {
                    if(err){
                        console.error("[ERROR]. Ocurrio un problema al buscar BIZCOCHO: ", err)
                        return;
                    } 

                    const updateBizcocho = {
                        biz_category: producto.category,
                        biz_size: producto.size,
                        stock_disponible: dataB[0].stock_disponible,
                        stock_en_proceso: dataB[0].stock_en_proceso,
                        stock_min: dataB[0].stock_min,
                        stock_max: dataB[0].stock_max,
                        stock_critico: dataB[0].stock_critico
                    }

                    const newBizcocho = {
                        biz_category: producto.category,
                        biz_size: producto.size,
                        stock_disponible: 0,
                        stock_en_proceso: 0,
                        stock_min: 0,
                        stock_max: 0,
                        stock_critico: 0
                    }
    
                    /*if (dataB.length <= 0){
                        createBizcocho(newBizcocho, (err) =>{
                            if (err) console.error(`Error creacion bizocho: `, err);
                            else console.log(`Bizcocho agregado.`);
                        });
                    } else {
                        updateBizcocho({});
                    }
                });

                
                /*
                updateProducto(updateData, (err) => {
                    if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                    else console.log(`Stock actualizado: ${codigoProducto}`);
                });

                createVentaDETALLES(createDetalle, (err) => {
                    if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                    else console.log(`Stock actualizado: ${codigoProducto}`);
                });*/
            });

        } else {
            /*const newProduct = {
                codeA: codigoProducto,
                categoryA: prodcar.categoria,
                modelA: prodcar.modelo,
                sizeA: prodcar.size,
                decorationA: prodcar.decoracion,
                colorA: prodcar.color,
                priceA: prodcar.precio,
                stock_disponibleA: 0,
                stock_apartadoA: 0,
                stock_en_procesoA: pedido,
                stock_totalA: pedido,
                stock_minA: 0,
                stock_maxA: 0,
                stock_criticoA: 0
            };

            const createDetalle = {
                id_ventaVD: id_ventaV,
                codeVD: codigoProducto,
                priceVD: prodcar.precio,
                quantityVD: pedido,
                importeVD: prodcar.precio * pedido,
            }

            let biz_category = prodcar.categoria;
            let biz_size = prodcar.size;

            searchBizcocho({biz_category, biz_size}, (err, dataB) => {
                if(err){
                    console.error("[ERROR]. Ocurrio un problema al buscar BIZCOCHO: ", err)
                    return;
                } 
                
                if (dataB.length <= 0){
                    //crear
                } else {
                    //actualizar
                }
            });

            /*
            createProducto(newProduct, (err) => {
                if (err) console.error(`Error creación: ${codigoProducto}`, err);
                else {console.log(`Producto creado: ${codigoProducto}`); return};;
            });

            createVentaDETALLES(createDetalle, (err) => {
                if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                else {console.log(`Stock actualizado: ${codigoProducto}`); return;};
            });*/
        }
    });
    generarRecibo();
}