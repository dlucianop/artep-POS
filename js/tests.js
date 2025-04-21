async function imprimirRecibo() {
    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return;
    }

    try {
        await validacionesVenta();
        await revisarAlmacen();
        await revisarAlmacenBiz();

        const codigos = productos.map(item => item.code);
        const get     = (id, def = "") => document.getElementById(id).value.trim() || def;
        const getNum  = (id, def = 0) => parseFloat(get(id, def)) || def;

        const ventaActual = {
            idVenta:       parseInt(get('id-sale', "999999999"), 10) || 999999999,
            fecha_venta:   get('sale-date'),
            hora:          get('sale-hour'),
            nombre:        get('client-name', "-----"),
            telefono:      get('client-phone', "-----"),
            correo:        get('client-mail', "-----"),
            domicilio:     get('client-address', "-----"),
            fecha_entrega: get('sale-entrega', "-----"),
            metodo_pago:   get('payment-method', "-----"),
            forma_pago:    get('payment-form', "-----"),
            monto:         getNum('monto'),
            pago:          getNum('pago')
        };

        await new Promise((res, rej) =>
            createVenta({
                id_ventaV:      ventaActual.idVenta,
                fecha_ventaV:   ventaActual.fecha_venta,
                horaV:          ventaActual.hora,
                nombreV:        ventaActual.nombre,
                telefonoV:      ventaActual.telefono,
                correoV:        ventaActual.correo,
                domicilioV:     ventaActual.domicilio,
                fecha_entregaV: ventaActual.fecha_entrega,
                metodo_pagoV:   ventaActual.metodo_pago,
                forma_pagoV:    ventaActual.forma_pago,
                montoV:         ventaActual.monto,
                pagoV:          ventaActual.pago
            }, (err, data) => err ? rej(err) : res(data))
        );

        for (const prodcar of carrito) {
            const codigo    = parseInt(prodcar.codigo, 10);
            const pedido    = parseInt(prodcar.pedido, 10);
            const precio    = parseFloat(prodcar.precio);
            const categoria = prodcar.categoria;
            const size      = prodcar.size;

            await new Promise((res, rej) =>
                createVentaDETALLES({
                    id_ventaVD:   ventaActual.idVenta,
                    codeVD:       codigo,
                    priceVD:      precio,
                    quantityVD:   pedido,
                    importeVD:    precio * pedido
                }, (err) => err ? rej(err) : res())
            );

            if (codigos.includes(codigo)) {
                const producto = await new Promise((res, rej) =>
                    readOneProduct(codigo, (err, data) => {  // <-- Solo pasa el código
                        if (err) return rej(err);
                        if (!data) return rej(new Error("Producto no encontrado"));
                        res(data);
                    })
                );

                let dispoP = parseInt(producto.stock_disponible, 10);
                let apartP = parseInt(producto.stock_apartado, 10);
                let procP  = parseInt(producto.stock_en_proceso, 10);

                const usadoP      = Math.min(dispoP, pedido);
                const faltaProd   = pedido - usadoP;
                dispoP -= usadoP;
                apartP += usadoP;
                procP  += faltaProd;

                await new Promise((res, rej) =>
                    updateProducto({
                        price:              producto.price,
                        stock_apartado:     apartP,
                        stock_disponible:   dispoP,
                        stock_en_proceso:   procP,
                        code:               producto.code
                    }, (err) => err ? rej(err) : res())
                );

                if (faltaProd > 0) {
                    const bizEntry = bizcochos.find(b => b.biz_category === categoria && b.biz_size === size);
                    if (bizEntry) {
                        const bizco = await new Promise((res, rej) => {
                            searchBizcocho(
                                categoria,
                                size,
                                (err, data) => {
                                    if (err) return rej(err);
                                    res(data || null);
                                }
                            );
                        });

                        let dispoB = parseInt(bizco.stock_disponible, 10);
                        let apartB = parseInt(bizco.stock_apartado, 10);
                        let procB  = parseInt(bizco.stock_en_proceso, 10);

                        const usadoB    = Math.min(dispoB, faltaProd);
                        const faltaBiz  = faltaProd - usadoB;
                        dispoB -= usadoB;
                        apartB += usadoB;
                        procB  += faltaBiz;

                        await new Promise((res, rej) =>
                            updateBizcocho({
                                stock_apartado: apartB,
                                stock_disponible: dispoB, 
                                stock_en_proceso: procB, 
                                stock_min: bizco.stock_min, 
                                stock_max: bizco.stock_max, 
                                stock_critico: bizco.stock_critico,
                                biz_category: bizco.biz_category,
                                biz_size: bizco.biz_size,
                            }, (err) => err ? rej(err) : res())
                        );

                        if (faltaBiz > 0) {
                            await new Promise((res, rej) =>
                                createOrden({
                                    id_ventaO:         ventaActual.idVenta,
                                    id_origenO:        codigo,
                                    fecha_entregaO:    ventaActual.fecha_entrega,
                                    categoriaO:        categoria,
                                    sizeO:             size,
                                    cantidad_inicialO: faltaBiz
                                }, (err) => err ? rej(err) : res())
                            );
                        }

                    } else {
                        await new Promise((res, rej) =>
                            createBizcocho({
                                biz_category:       categoria,
                                biz_size:           size,
                                stock_apartado: 0,
                                stock_disponible:0,
                                stock_en_proceso:faltaProd,
                            }, (err) => err ? rej(err) : res())
                        );
                        await new Promise((res, rej) =>
                            createOrden({
                                id_ventaO:         ventaActual.idVenta,
                                id_origenO:        codigo,
                                fecha_entregaO:    ventaActual.fecha_entrega,
                                categoriaO:        categoria,
                                sizeO:             size,
                                cantidad_inicialO: faltaProd
                            }, (err) => err ? rej(err) : res())
                        );
                    }
                }

            } else {
                await new Promise((res, rej) =>
                    createProducto({
                        code:               codigo,
                        category:           prodcar.categoria,
                        model:              prodcar.modelo,
                        size:               prodcar.size,
                        decoration:         prodcar.decoracion,
                        color:              prodcar.color,
                        price:              precio,
                        stock_total:        0,
                        stock_apartado:     0,
                        stock_disponible:   0,
                        stock_en_proceso:   pedido,
                        stock_min:          0,
                        stock_max:          0,
                        stock_critico:      0
                    }, (err) => err ? rej(err) : res())
                );

                const bizEntry = bizcochos.find(b => b.biz_category === categoria && b.biz_size === size);
                if (bizEntry) {
                    const bizco = await new Promise((res, rej) => {
                        searchBizcocho(
                            categoria,
                            size,
                            (err, data) => {
                                if (err) return rej(err);
                                res(data || null);
                            }
                        );
                    });
                    let dispoB = parseInt(bizco.stock_disponible, 10);
                    let apartB = parseInt(bizco.stock_apartado, 10);
                    let procB  = parseInt(bizco.stock_en_proceso, 10);

                    if (dispoB >= pedido) {
                        dispoB -= pedido;
                        apartB += pedido;
                    } else {
                        const faltaBiz = pedido - dispoB;
                        apartB += dispoB;
                        procB  += faltaBiz;
                        dispoB = 0;
                    }

                    await new Promise((res, rej) =>
                        updateBizcocho({
                            stock_apartado: apartB,
                            stock_disponible: dispoB, 
                            stock_en_proceso: procB, 
                            stock_min: bizco.stock_min, 
                            stock_max: bizco.stock_max, 
                            stock_critico: bizco.stock_critico,
                            biz_category: bizco.biz_category,
                            biz_size: bizco.biz_size,
                        }, (err) => err ? rej(err) : res())
                    );

                    if (procB > 0) {
                        await new Promise((res, rej) =>
                            createOrden({
                                id_ventaO:         ventaActual.idVenta,
                                id_origenO:        codigo,
                                fecha_entregaO:    ventaActual.fecha_entrega,
                                categoriaO:        categoria,
                                sizeO:             size,
                                cantidad_inicialO: procB
                            }, (err) => err ? rej(err) : res())
                        );
                    }

                } else {
                    await new Promise((res, rej) =>
                        createBizcocho({
                            biz_category:      categoria,
                            biz_size:          size,
                            stock_apartado: 0,
                            stock_disponible: 0,
                            stock_en_proceso: pedido,
                            code:          codigo
                        }, (err) => err ? rej(err) : res())
                    );
                    await new Promise((res, rej) =>
                        createOrden({
                            id_ventaO:         ventaActual.idVenta,
                            id_origenO:        codigo,
                            fecha_entregaO:    ventaActual.fecha_entrega,
                            categoriaO:        categoria,
                            sizeO:             size,
                            cantidad_inicialO: pedido
                        }, (err) => err ? rej(err) : res())
                    );
                }
            }
        }

        try {
            const detalles_venta = await new Promise((res, rej) =>
                readVentasDetalle({ id_ventaVD: ventaActual.idVenta }, (err, data) => err ? rej(err) : res(data))
            );
            await generarRecibos({ venta_datos: detalles_venta });
            showToast("Venta y recibo procesados exitosamente.", ICONOS.exito);
            if (typeof window !== "undefined") {
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            showToast("Hubo un error al generar el recibo.", ICONOS.error);
            console.error("Error al generar recibo:", error);
        }
        

    } catch (error) {
        console.log(`Error: ${error}`);
    }
}
