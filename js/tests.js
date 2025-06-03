function generarPayloadOrdenVenta(fuente, dataVenta, usado, extraObs = "") {
    return {
        id_venta: dataVenta.id_venta,
        origen: "VENTA",
        name_item: fuente.name_item,
        cantidad_pedida: usado,
        cantidad_buenos: 0,
        cantidad_rotos: 0,
        cantidad_deformes: 0,
        fase_actual: fuente.fase_actual ?? 1, 
        estado: fuente.estado ?? "PENDIENTE",
        fecha_entrega: dataVenta.fecha_entrega,
        observaciones: `${extraObs}Generada desde ${fuente.origen || "fuente"} para venta #${dataVenta.id_venta}.`,
    };
}

async function usarStock(fuente, clave, nombreFuente, faltan, carrito_item, dataVenta) {
    let payload;

    if (fuente && fuente[clave] > 0) {
        const original = fuente[clave];
        const usado = Math.min(faltan, original);
        const restante = original - usado;
        faltan -= usado;

        console.log(
            `\x1b[32m[${nombreFuente}] ✅ Stock disponible: ${original}\x1b[0m\n` +
            `\x1b[33m[${nombreFuente}] ➖ Se usaron: ${usado}\x1b[0m\n` +
            `\x1b[33m[${nombreFuente}] 📦 Queda restante: ${restante}\x1b[0m\n` +
            `\x1b[33m[${nombreFuente}] ⚠️ Faltan por cubrir: ${faltan}\x1b[0m\n` +
            `\x1b[33m[${nombreFuente}] 🔄 Se procederá con la actualización.\x1b[0m`
        );

        const comunes = {
            stock_apartado: fuente.stock_apartado + usado,
            stock_disponible: fuente.stock_disponible - usado,
            stock_en_proceso: fuente.stock_en_proceso
        };

        switch (nombreFuente) {
            case "PRODUCTO":
                payload = { ...comunes, code: fuente.code };
                console.log(
                    `\x1b[36m[${nombreFuente}] 🔄 Se actualizará el stock del PRODUCTO con código: ${fuente.code}\x1b[0m`
                );
                console.log(payload);
                // await updateStockProducto(payload);
                break;

            case "BIZCOCHO":
                payload = { ...comunes, id_biz: fuente.id_biz };
                console.log(
                    `\x1b[36m[${nombreFuente}] 🔄 Se actualizará el stock del BIZCOCHO con código: ${fuente.id_biz}\x1b[0m`
                );
                console.log(payload);
                // await updateStockBizcocho(payload);
                

                payload = {
                    id_venta: dataVenta.id_venta,
                    origen: "VENTA",
                    name_item: carrito_item.categoria + " TAM." + carrito_item.size + " MOD." + carrito_item.modelo + " " + "DECOR." + carrito_item.decoracion + " " + "COLOR " + carrito_item.color,
                    cantidad_pedida: usado,
                    cantidad_buenos: 0,
                    cantidad_rotos: 0,
                    cantidad_deformes: 0,
                    fase_actual: 5, // Fase inicial de productos, adefinir
                    estado: "PENDIENTE",
                    fecha_entrega: dataVenta.fecha_entrega,
                    observaciones: `Se utilizaron ${usado} unidades de bizcocho para completar la venta #${dataVenta.id_venta}, requieren ser procesados para ser convertidos en Productos.`,
                };
                console.log(
                    `\x1b[32m[${nombreFuente}] ➕ Se creará una nueva ORDEN vinculada a la venta #${dataVenta.id_venta} desde ${nombreFuente}.\x1b[0m`
                );
                console.log(payload);
                // await createOrden(payload);

                break;

            case "ORDEN PRODUCTO":
            case "ORDEN BIZCOCHO":
                let ordenEliminada = false;

                if (fuente.cantidad_buenos - usado === 0) {
                    ordenEliminada = true;
                    console.log(
                        `\x1b[31m[${nombreFuente}] 🗑️ Se eliminará la ORDEN #${fuente.id_orden} porque se agotó completamente.\x1b[0m`
                    );
                    // await deleteOrden(fuente.id_orden);
                } else {
                    payload = {
                        cantidad_buenos: fuente.cantidad_buenos - usado,
                        id_orden: fuente.id_orden
                    };
                    console.log(
                        `\x1b[36m[${nombreFuente}] 🔄 Se actualizará la cantidad_buenos de la ORDEN #${fuente.id_orden}\x1b[0m`
                    );
                    console.log(payload);

                    if (nombreFuente === "ORDEN BIZCOCHO") {
                        // await updateCantidadOrdenB(payload);
                    } else {
                        // await updateCantidadOrdenP(payload);
                    }
                }

                const extraObs = ordenEliminada
                    ? `Orden original #${fuente.id_orden} eliminada por uso total. `
                    : "";

                payload = generarPayloadOrdenVenta(fuente, dataVenta, usado, extraObs);
                console.log(
                    `\x1b[32m[${nombreFuente}] ➕ Se creará una nueva ORDEN vinculada a la venta #${dataVenta.id_venta} desde ${nombreFuente}.\x1b[0m`
                );
                console.log(payload);
                // await createOrden(payload);
                break;
        }

    } else if (faltan > 0) {
        if (!fuente) {
            console.log(`\x1b[31m[${nombreFuente}] ❌ No existe.\x1b[0m`);
            switch (nombreFuente) { //aqui lo mismo no se si voy bien o mis datos pueden cruzarse
                case "PRODUCTO":
                    console.log(`\x1b[33m[${nombreFuente}] ➕ Se creará un nuevo registro de PRODUCTO.\x1b[0m`);
                    payload = {
                        code: carrito_item.codigo,
                        category: carrito_item.categoria,
                        model: carrito_item.modelo,
                        size: carrito_item.size,
                        decoration: carrito_item.decoracion,
                        color: carrito_item.color,
                        price: carrito_item.precio,
                        stock_apartado: 0,
                        stock_disponible: 0,
                        stock_en_proceso: 0
                    };
                    console.log(payload);
                    //await createProducto(payload);
                    break;
                case "BIZCOCHO":
                    console.log(`\x1b[33m[${nombreFuente}] ➕ Se creará un nuevo registro de BIZCOCHO.\x1b[0m`);
                    payload = {
                        biz_category: carrito_item.categoria,
                        biz_size: carrito_item.size,
                        biz_model: carrito_item.modelo,
                        stock_apartado: 0,
                        stock_disponible: 0,
                        stock_en_proceso: 0
                    };
                    console.log(payload);
                    /*await createBizcocho(payload);*/
                    break;
                case "ORDEN PRODUCTO":
                case "ORDEN BIZCOCHO":
                default:
                    console.log(`\x1b[33m[${nombreFuente}] ℹ️ No se requiere crear nada de momento.\x1b[0m`);
                    break;
            }
        } else {
            console.log(`\x1b[31m[${nombreFuente}] ⚠️ Existe pero no hay stock disponible (${fuente[clave]}).\x1b[0m`);
        }
    }

    return faltan;
}

async function printCarrito() {
    let dataVenta;
    try {
        dataVenta = await validacionesVenta();
    } catch (error) {
        console.error("Error en la validación de la venta:", error.message);
        showToast(`Error en la validación de la venta: ${error.message}`, ICONOS.error);
        return;
    }

    for (const carrito_item of window.carrito) {
        let productoEsperado = 
            carrito_item.categoria + " TAM." +
            carrito_item.size + " MOD." + carrito_item.modelo + " " +
            "DECOR." + carrito_item.decoracion + " " +
            "COLOR " + carrito_item.color;
        let bizcochoEsperado = 
            carrito_item.categoria + " TAM." +
            carrito_item.size + " MOD." + carrito_item.modelo;

        let existeProducto = window.productos.find(p => p.code === carrito_item.codigo);
        let existeOrdenProducto = window.ordenesInv.find(o =>
            o.tipo_item === "producto" &&
            o.name_item === productoEsperado
        );

        let existeBizcocho = window.bizcochos.find(b => b.biz_category === carrito_item.categoria && b.biz_model === carrito_item.modelo && b.biz_size === carrito_item.size);
        let existeOrdenBizcocho = window.ordenesInv.find(o =>
            o.tipo_item === "bizcocho" &&
            o.name_item === bizcochoEsperado
        );

        /*-------------------------------------------------LOGICA PARA ORDENES-------------------------------------------------------------------------------- */
        let faltan = carrito_item.cantidad; //200
        console.warn(`\n🛒 Item: ${productoEsperado}`);
        console.warn(`📦 Cantidad solicitada: ${carrito_item.cantidad}`);

        faltan = await usarStock(existeProducto, "stock_disponible", "PRODUCTO", faltan, carrito_item, dataVenta);

        if (faltan > 0) {
            faltan = await usarStock(existeOrdenProducto, "cantidad_buenos", "ORDEN PRODUCTO", faltan, carrito_item, dataVenta);
        }

        if (faltan > 0) {
            faltan = await usarStock(existeBizcocho, "stock_disponible", "BIZCOCHO", faltan, carrito_item, dataVenta);
        }

        if (faltan > 0) {
            faltan = await usarStock(existeOrdenBizcocho, "cantidad_buenos", "ORDEN BIZCOCHO", faltan, carrito_item, dataVenta);
        }

        if (faltan > 0) {
            console.log(`[NUEVA ORDEN]🆕 Se necesita nueva orden para ${faltan} unidad(es).`);
            payload = {
                id_venta: dataVenta.id_venta,
                origen: "VENTA",
                name_item: productoEsperado,
                cantidad_pedida: faltan,
                cantidad_buenos: 0,
                cantidad_rotos: 0,
                cantidad_deformes: 0,
                fase_actual: 1,
                estado: "PENDIENTE",
                fecha_entrega: dataVenta.fecha_entrega,
                observaciones: `Se generó una nueva orden de producción desde cero para cubrir ${faltan} unidad(es) faltante(s) de la venta #${dataVenta.id_venta}.`,
            }
            console.log(
                `\x1b[32m[NUEVA ORDEN] ➕ Se creará una nueva ORDEN vinculada a la venta #${dataVenta.id_venta}\x1b[0m`
            );
            console.log(payload);
            //await createOrden(faltan, productoEsperado);
            faltan = 0;
        }

        faltan = Math.max(faltan, 0);

    }

    const confirmed = await showConfirmDialog(
        `¿Desea terminar la venta e imprimir la nota de venta?`,
        "Imprimir venta"
    );

    if (confirmed) {
        console.log(dataVenta);

        
        /* //esto ya esta bien
        await createVenta(dataVenta);
        let ventaId = +document.getElementById("pos_id_venta").value;
        const detalles_venta = await readDetalles(ventaId);
        await generarRecibos({ venta_datos: detalles_venta });
        showToast(`Venta #${ventaId} y recibo procesados exitosamente. Que tenga buen día.`, ICONOS.success);
        */

        setTimeout(() => {
            window.location.reload();
        }, 2500);
        
    } else {
        showToast("Acción IMPRIMIR NOTA cancelada", ICONOS.error);
    }
}