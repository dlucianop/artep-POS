/*async function updateData(detalleV, detalleO, ordenData) {
    try {
        const orden = {
            id_fase: ordenData.id_fase,
            cantidad_buenos: parseInt(document.getElementById("orden_cantidad_buenos").value, 10),
            cantidad_rotos: parseInt(document.getElementById("orden_cantidad_rotos").value, 10),
            cantidad_deformes: parseInt(document.getElementById("orden_cantidad_deformes").value, 10),
            id_orden: ordenData.id_orden
        };

        const cantidadProducida = orden.cantidad_buenos;

        await updateOrden(orden);

        const newFase = window.fases.find(f => f.id_fase === orden.id_fase);

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            console.log(bizcocho);

            if (bizcocho && bizcocho.id_biz) {
                bizcocho.stock_en_proceso = Math.max(0, bizcocho.stock_en_proceso - cantidadProducida);
                bizcocho.stock_apartado += cantidadProducida;

                await updateBizcocho(bizcocho);
            } else {
                showToast("❌ No se encontró el bizcocho para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el bizcocho para actualizar');
            }

        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleV.codigo);

            console.log(producto);

            if (producto && producto.code) {
                producto.stock_en_proceso = Math.max(0, producto.stock_en_proceso - cantidadProducida);
                producto.stock_apartado += cantidadProducida;

                await updateProducto(producto);
            } else {
                showToast("❌ No se encontró el producto para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el producto para actualizar');
            }
        }

        showToast("✅ Orden y stock actualizados correctamente.", ICONOS.exito);
        initProduccion();

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        showToast(`ERROR: ${error.message}`, ICONOS.error);
    }
}






try {
    const orden = {
        id_fase: ordenData.id_fase, // nueva fase
        cantidad_buenos: parseInt(document.getElementById("orden_cantidad_buenos").value, 10),
        cantidad_rotos: parseInt(document.getElementById("orden_cantidad_rotos").value, 10),
        cantidad_deformes: parseInt(document.getElementById("orden_cantidad_deformes").value, 10),
        id_orden: ordenData.id_orden
    };

    const cantidadProducida = orden.cantidad_buenos;

    const faseAnterior = window.fases.find(f => f.id_fase === ordenData.id_fase);
    const faseNueva = window.fases.find(f => f.id_fase === orden.id_fase);
    const esUltimaFase = orden.id_fase === 7;

    // Actualiza la orden en base de datos
    await updateOrden(orden);

    // Función interna para actualizar stock según tipo
    async function actualizarStock(tipo, detalle, cantidad, revertir = false, esUltimaFase = false) {
        if (tipo === "Bizcocho") {
            const biz = await searchBizcocho({
                biz_category: detalle.categoria,
                biz_size: detalle.size
            });

            if (biz && biz.id_biz) {
                if (revertir) {
                    biz.stock_en_proceso += cantidad;
                    biz.stock_apartado = Math.max(0, biz.stock_apartado - cantidad);
                } else {
                    if (esUltimaFase) {
                        biz.stock_en_proceso = Math.max(0, biz.stock_en_proceso - cantidad);
                        biz.stock_apartado += cantidad;
                    } else {
                        biz.stock_en_proceso += cantidad;
                    }
                }

                await updateBizcocho(biz);
            } else {
                showToast("❌ No se encontró el bizcocho para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el bizcocho para actualizar');
            }

        } else if (tipo === "Producto") {
            const prod = await searchProduct(detalle.codigo);

            if (prod && prod.code) {
                if (revertir) {
                    prod.stock_en_proceso += cantidad;
                    prod.stock_apartado = Math.max(0, prod.stock_apartado - cantidad);
                } else {
                    if (esUltimaFase) {
                        prod.stock_en_proceso = Math.max(0, prod.stock_en_proceso - cantidad);
                        prod.stock_apartado += cantidad;
                    } else {
                        prod.stock_en_proceso += cantidad;
                    }
                }

                await updateProducto(prod);
            } else {
                showToast("❌ No se encontró el producto para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el producto para actualizar');
            }
        }
    }

    // Revertir stock de la fase anterior
    if (faseAnterior.tipo_fase === "Bizcocho") {
        await actualizarStock("Bizcocho", detalleO, cantidadProducida, true);
    } else if (faseAnterior.tipo_fase === "Producto") {
        await actualizarStock("Producto", detalleV, cantidadProducida, true);
    }

    // Aplicar stock a la nueva fase
    if (faseNueva.tipo_fase === "Bizcocho") {
        await actualizarStock("Bizcocho", detalleO, cantidadProducida, false, esUltimaFase);
    } else if (faseNueva.tipo_fase === "Producto") {
        await actualizarStock("Producto", detalleV, cantidadProducida, false, esUltimaFase);
    }

    showToast("✅ Orden y stock actualizados correctamente.", ICONOS.exito);
    initProduccion();

} catch (error) {
    console.error('❌ ERROR:', error.message);
    showToast(`ERROR: ${error.message}`, ICONOS.error);
}



async function bizcosActions(item, faltante, bizcocho, ventaId, fechaEntrega) {
    let faltanteBizcocho = faltante;

    if (faltanteBizcocho > 0) {
        if (bizcocho) {
            if (bizcocho.stock_disponible >= faltanteBizcocho) {
                bizcocho.stock_apartado += faltanteBizcocho;
                bizcocho.stock_disponible -= faltanteBizcocho;
                faltanteBizcocho = 0;
            } else {
                bizcocho.stock_apartado += bizcocho.stock_disponible;
                faltanteBizcocho -= bizcocho.stock_disponible;
                bizcocho.stock_en_proceso += faltanteBizcocho;
                bizcocho.stock_disponible = 0;
            }
            await updateBizcocho(bizcocho);
        } else {
            await createBizcocho({
                biz_category: item.categoria,
                biz_size: item.size,
                stock_apartado: 0,
                stock_disponible: 0,
                stock_en_proceso: faltanteBizcocho
            });
        }

        if (faltanteBizcocho > 0) {
            await createOrden({
                id_venta: ventaId,
                id_origen: 1,
                fecha_entrega: fechaEntrega,
                categoria: item.categoria,
                size: item.size,
                cantidad_inicial: faltanteBizcocho
            });
        }
    }
}*/


async function ventasActions() {
    try {
        const ventaId = document.getElementById("id-sale").value;
        const venta = {
            id_venta: ventaId,
            fecha_venta: document.getElementById("sale-date").value,
            hora: document.getElementById("sale-hour").value,
            nombre: document.getElementById("client-name").value,
            telefono: document.getElementById("client-phone").value,
            correo: document.getElementById("client-mail").value,
            domicilio: document.getElementById("client-address").value,
            fecha_entrega: document.getElementById("sale-entrega").value,
            metodo_pago: document.getElementById("payment-method").value,
            forma_pago: document.getElementById("payment-form").value,
            monto: parseFloat(document.getElementById("monto").value),
            pago: parseFloat(document.getElementById("pago").value)
        };

        /*await createVenta(venta);*/
        return { ventaId, fecha_entrega: venta.fecha_entrega };
    } catch (error) {
        console.error('❌ ventasActions ERROR:', error);
        showToast(`Error en ventasActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function productosActions(item, pedido, producto) {
    try {
        let faltante = pedido;

        if (producto) {
            if (producto.stock_disponible >= pedido) {
                producto.stock_disponible -= pedido;
                producto.stock_apartado = (producto.stock_apartado || 0) + pedido;
                faltante = 0;
            } else {
                const cubierto = producto.stock_disponible;
                producto.stock_disponible = 0;
                producto.stock_apartado = (producto.stock_apartado || 0) + cubierto;
                faltante = pedido - cubierto;
                producto.stock_en_proceso = (producto.stock_en_proceso || 0) + faltante;
            }
            console.log(producto, faltante);
            /*await updateProducto(producto);*/
        } else {
            console.log("create", item, pedido)
            /*await createProducto({
                code: item.codigo,
                category: item.categoria,
                model: item.modelo,
                size: item.size,
                decoration: item.decoracion,
                color: item.color,
                price: item.precio,
                stock_apartado: 0,
                stock_disponible: 0,
                stock_en_proceso: pedido
            });*/
            faltante = 0;
            await cargarProductos();
        }

        return faltante;
    } catch (error) {
        console.error('❌ productosActions ERROR:', error);
        showToast(`Error en productosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function bizcosActions(item, faltante, bizcocho, ventaId, fechaEntrega) {
    try {
        let faltanteBizcocho = faltante;

        console.log(faltanteBizcocho);

        if (faltanteBizcocho > 0) {
            if (bizcocho) {
                if (bizcocho.stock_disponible >= faltanteBizcocho) {
                    bizcocho.stock_disponible -= faltanteBizcocho;
                    bizcocho.stock_apartado = (bizcocho.stock_apartado || 0) + faltanteBizcocho;
                    faltanteBizcocho = 0;
                } else {
                    const cubierto = bizcocho.stock_disponible;
                    bizcocho.stock_disponible = 0;
                    bizcocho.stock_apartado = (bizcocho.stock_apartado || 0) + cubierto;
                    faltanteBizcocho -= cubierto;
                    bizcocho.stock_en_proceso = (bizcocho.stock_en_proceso || 0) + faltanteBizcocho;
                }
                /*await updateBizcocho(bizcocho);*/
            } else {
                /*const nuevoBizcocho = await createBizcocho({
                    biz_category: item.categoria,
                    biz_size: item.size,
                    stock_apartado: 0,
                    stock_disponible: 0,
                    stock_en_proceso: faltanteBizcocho
                });*/
                window.bizcochos.push(nuevoBizcocho);
                await cargarBizcochos();
            }

            if (faltanteBizcocho > 0) {
                /*await createOrden({
                    id_venta: ventaId,
                    id_origen: 1,
                    fecha_entrega: fechaEntrega,
                    categoria: item.categoria,
                    size: item.size,
                    cantidad_inicial: faltanteBizcocho
                });*/
            }
        }
    } catch (error) {
        console.error('❌ bizcosActions ERROR:', error);
        showToast(`Error en bizcosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function detallesActions(item, ventaId) {
    try {
        /*await createDetalle({
            id_venta: ventaId,
            code: item.codigo,
            price: item.precio,
            quantity: item.pedido,
            importe: item.precio * item.pedido
        });*/
    } catch (error) {
        console.error('❌ detallesActions ERROR:', error);
        showToast(`Error en detallesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function imprimirRecibo() {
    try {
        //await validaciones();

        const { ventaId, fecha_entrega } = await ventasActions();

        for (const item of window.carrito) {
            const pedido = item.pedido;
            const producto = window.productos.find(p => p.code === item.codigo);
            const bizcocho = window.bizcochos.find(b => b.biz_category === item.categoria && b.biz_size === item.size);

            const faltante = await productosActions(item, pedido, producto);
            await bizcosActions(item, faltante, bizcocho, ventaId, fecha_entrega);
            await detallesActions(item, ventaId);
        }

        const detalles_venta = await readDetalles(ventaId);
        await generarRecibos({ venta_datos: detalles_venta });
        showToast("Venta y recibo procesados exitosamente.", ICONOS.exito);
        /*setTimeout(() => window.location.reload(), 2000);*/
        
    } catch (error) {
        console.error("❌ Error al imprimir recibo:", error?.message || error);
        showToast(`Error al imprimir recibo: ${error?.message || error}`, ICONOS.error);
    }
}



async function imprimirRecibo() {
    try {
        //await validaciones();

        const { ventaId, fecha_entrega } = await ventasActions();

        for (const item of window.carrito) {
            const pedido = item.pedido;
            const producto = window.productos.find(p => p.code === item.codigo);
            const bizcocho = window.bizcochos.find(b => b.biz_category === item.categoria && b.biz_size === item.size);

            console.log(bizcocho);

            if (!producto) {
                showToast(`Producto con código ${item.codigo} no encontrado.`, ICONOS.error);
                console.error(`Producto con código ${item.codigo} no encontrado.`);
                continue;
            }

            if (!bizcocho) {
                showToast(`Bizcocho ${item.categoria} (${item.size}) no encontrado. Se asumirá como nuevo.`, ICONOS.informacion);
                console.error(`Bizcocho ${item.categoria} (${item.size}) no encontrado. Se asumirá como nuevo.`);
                continue;
            }

            //const faltante = await productosActions(item, pedido, producto);
            //await bizcosActions(item, faltante, bizcocho, ventaId, fecha_entrega);
           // await detallesActions(item, ventaId);
        }

        //const detalles_venta = await readDetalles(ventaId);
        //console.log(detalles_venta);
        //await generarRecibos({ venta_datos: detalles_venta });
        showToast("Venta y recibo procesados exitosamente.", ICONOS.exito);
        /*setTimeout(() => window.location.reload(), 2000);*/
        
    } catch (error) {
        console.error("❌ Error al imprimir recibo:", error?.message || error);
        showToast(`Error al imprimir recibo: ${error?.message || error}`, ICONOS.error);
    }
}

/**///////////////////////////////// */
async function ventasActions() {
    try {
        const ventaId = document.getElementById("id-sale").value || 0;
        const venta = {
            id_venta: ventaId || 0,
            fecha_venta: document.getElementById("sale-date").value || "01/01/9999",
            hora: document.getElementById("sale-hour").value || '24:00:00',
            nombre: document.getElementById("client-name").value,
            telefono: document.getElementById("client-phone").value,
            correo: document.getElementById("client-mail").value,
            domicilio: document.getElementById("client-address").value,
            fecha_entrega: document.getElementById("sale-entrega").value || "01/01/9999",
            metodo_pago: document.getElementById("payment-method").value || "Efectivo",
            forma_pago: document.getElementById("payment-form").value || "Pago en una sola exhibicion",
            monto: parseFloat(document.getElementById("monto").value) || 0,
            pago: parseFloat(document.getElementById("pago").value) || 0
        };

        /*await createVenta(venta);*/
        return { ventaId, fecha_entrega: venta.fecha_entrega };
    } catch (error) {
        console.error('❌ ventasActions ERROR:', error);
        showToast(`Error en ventasActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function productosActions(item, pedido, producto) {
    try {
        let faltante = pedido;

        if (producto) {
            if (producto.stock_disponible >= pedido) {
                producto.stock_disponible -= pedido;
                producto.stock_apartado = (producto.stock_apartado || 0) + pedido;
                faltante = 0;
            } else {
                const cubierto = producto.stock_disponible;
                producto.stock_disponible = 0;
                producto.stock_apartado = (producto.stock_apartado || 0) + cubierto;
                faltante = pedido - cubierto;
                producto.stock_en_proceso = (producto.stock_en_proceso || 0) + faltante;
            }
            console.log(producto, faltante);
            //await updateProducto(producto);
        } else {
            console.log("create", item, pedido)
            await createProducto({
                code: item.codigo,
                category: item.categoria,
                model: item.modelo,
                size: item.size,
                decoration: item.decoracion,
                color: item.color,
                price: item.precio,
                stock_apartado: 0,
                stock_disponible: 0,
                stock_en_proceso: pedido
            });
            faltante = 0;
            //await cargarProductos();
        }

        return faltante;
    } catch (error) {
        console.error('❌ productosActions ERROR:', error);
        showToast(`Error en productosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function bizcosActions(item, faltante, bizcocho, ventaId, fechaEntrega) {
    try {
        let faltanteBizcocho = faltante;

        if (faltanteBizcocho > 0) {
            if (bizcocho) {
                if (bizcocho.stock_disponible >= faltanteBizcocho) {
                    bizcocho.stock_disponible -= faltanteBizcocho;
                    bizcocho.stock_apartado = (bizcocho.stock_apartado || 0) + faltanteBizcocho;
                    faltanteBizcocho = 0;
                } else {
                    const cubierto = bizcocho.stock_disponible;
                    bizcocho.stock_disponible = 0;
                    bizcocho.stock_apartado = (bizcocho.stock_apartado || 0) + cubierto;
                    faltanteBizcocho -= cubierto;
                    bizcocho.stock_en_proceso = (bizcocho.stock_en_proceso || 0) + faltanteBizcocho;
                }
                await updateBizcocho(bizcocho);
            } else {
                const nuevoBizcocho = await createBizcocho({
                    biz_category: item.categoria,
                    biz_size: item.size,
                    stock_apartado: 0,
                    stock_disponible: 0,
                    stock_en_proceso: faltanteBizcocho
                });
                window.bizcochos.push(nuevoBizcocho);
                await cargarBizcochos();
            }

            if (faltanteBizcocho > 0) {
                await createOrden({
                    id_venta: ventaId,
                    id_origen: 1,
                    fecha_entrega: fechaEntrega,
                    categoria: item.categoria,
                    size: item.size,
                    cantidad_inicial: faltanteBizcocho
                });
            }
        }
    } catch (error) {
        console.error('❌ bizcosActions ERROR:', error);
        showToast(`Error en bizcosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function detallesActions(item, ventaId) {
    try {
        await createDetalle({
            id_venta: ventaId,
            code: item.codigo,
            price: item.precio,
            quantity: item.pedido,
            importe: item.precio * item.pedido
        });
    } catch (error) {
        console.error('❌ detallesActions ERROR:', error);
        showToast(`Error en detallesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}


























async function productosActions(item, mode, prod) {
    try {
        let stock = parseInt(item.stock) || 0;
        let pedido = parseInt(item.pedido) || 0;

        if (mode === "Create") {
            const apartar = Math.min(stock, pedido);
            const faltante = Math.max(0, pedido - stock);

            const producto = {
                code: Math.max(0, item.codigo),
                category: item.categoria,
                model: item.modelo,
                size: item.size,
                decoration: item.decoracion,
                color: item.color,
                price: parseFloat(item.precio) || 0,
                stock_apartado: apartar,
                stock_disponible: Math.max(0, stock - pedido),
                stock_en_proceso: faltante
            };

            await createProducto(producto);
        } else if (mode === "Update") {
            const producto = {
                category: prod.category,
                model: prod.model,
                size: prod.size,
                decoration: prod.decoration,
                color: prod.color,
                price: item.precio,
                stock_apartado: prod.stock_apartado,
                stock_disponible: prod.stock_disponible,
                stock_en_proceso: prod.stock_en_proceso,
                code: prod.code
            };

            await updateProducto(producto);
        }

        return faltante;

    } catch (error) {
        console.error('❌ productosActions ERROR:', error);
        showToast(`Error en productosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}