async function productosActions(item, mode, prod) {
    try {
        let stock = parseInt(item.stock ?? prod?.stock_disponible ?? 0);
        let pedido = parseInt(item.pedido ?? prod?.stock_apartado ?? 0);

        let faltante = Math.max(0, pedido - stock);
        let apartar = Math.min(stock, pedido);

        if (mode === "Create") {
            const producto = {
                code: item.codigo,
                category: item.categoria,
                model: item.modelo,
                size: item.size,
                decoration: item.decoracion,
                color: item.color,
                price: parseFloat(item.precio) || 0,
                stock_apartado: apartar,
                stock_disponible: Math.max(0, stock - pedido),
                stock_en_proceso: 0
            };
            await createProducto(producto);

        } else if (mode === "Update") {
            const producto = {
                code: prod.code,
                category: prod.category,
                model: prod.model,
                size: prod.size,
                decoration: prod.decoration,
                color: prod.color,
                price: parseFloat(item.precio) || prod.price,
                stock_apartado: apartar,
                stock_disponible: Math.max(0, stock - pedido),
                stock_en_proceso: prod.stock_en_proceso
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

async function bizcosActions(item, mode, bizcocho, faltante) {
    try {
        let faltanteRestante = faltante;

        if (mode === "Create") {
            const stock_disponible = parseInt(item.stock ?? 0);
            const apartar = Math.min(stock_disponible, faltanteRestante);

            const bizco = {
                biz_category: item.categoria,
                biz_size: item.size,
                stock_apartado: apartar,
                stock_disponible: Math.max(0, stock_disponible - apartar),
                stock_en_proceso: Math.max(0, faltanteRestante - apartar),
            };
            await createBizcocho(bizco);

            faltanteRestante = faltanteRestante - apartar;

        } else if (mode === "Update") {
            const apartar = Math.min(bizcocho.stock_disponible, faltanteRestante);

            const bizco = {
                biz_category: item.categoria,
                biz_size: item.size,
                stock_apartado: bizcocho.stock_apartado + apartar,
                stock_disponible: Math.max(0, bizcocho.stock_disponible - apartar),
                stock_en_proceso: bizcocho.stock_en_proceso + (faltanteRestante - apartar),
            };
            await updateBizcocho(bizco);

            faltanteRestante = faltanteRestante - apartar;
        }

        return Math.max(0, faltanteRestante);

    } catch (error) {
        console.error('❌ bizcosActions ERROR:', error);
        showToast(`Error en bizcosActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function ordenesActions(ventaId, fecha_entrega, item, faltanteRestante) {
    try {
        const orden = {
            id_venta: ventaId,
            id_origen: 1,
            fecha_entrega,
            categoria: item.categoria,
            size: item.size,
            cantidad_inicial: faltanteRestante
        };
        const newOrden = await createOrden(orden);
        return newOrden;
    } catch (error) {
        console.error('❌ ordenesActions ERROR:', error);
        showToast(`Error en ordenesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function detallesActions(ventaId, item) {
    try {
        const newDetalle = await createDetalle({
            id_venta:    ventaId,
            code:        item.codigo,
            price:       item.precio,
            quantity:    item.pedido,
            importe:     item.precio * item.pedido
        });
        return newDetalle;
    } catch (error) {
        console.error('❌ detallesActions ERROR:', error);
        showToast(`Error en detallesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function imprimirRecibo() {
    try {
        await validaciones();

        const { ventaId, fecha_entrega } = await ventasActions();

        for (const item of window.carrito) {
            const pedido = item.pedido;
            const producto = window.productos.find(p => p.code === item.codigo);
            const bizcocho = window.bizcochos.find(b => b.biz_category === item.categoria && b.biz_size === item.size);

            let modeP = "";
            let modeB = "";

            if (!producto && !bizcocho) {
                console.warn(`Ni el PRODUCTO con código ${item.codigo} ni el BIZCOCHO ${item.categoria} (${item.size}) fueron encontrados.`);

                window.productos.push({
                    code: item.codigo,
                    category: item.categoria || "",
                    model: item.modelo || "",
                    size: item.size || "",
                    decoration: item.decoracion || "",
                    color: item.color || "",
                    price: parseFloat(item.precio) || 0,
                    stock_apartado: 0,
                    stock_critico: 0,
                    stock_disponible: 0,
                    stock_en_proceso: 0,
                    stock_max: 0,
                    stock_min: 0,
                    stock_total: 0
                });

                modeP = "Create";

                window.bizcochos.push({
                    biz_category: item.categoria || "",
                    biz_size: item.size || "",
                    stock_apartado: 0,
                    stock_critico: 0,
                    stock_disponible: parseInt(item.stock) || 0,
                    stock_en_proceso: 0,
                    stock_max: 0,
                    stock_min: 0,
                    stock_total: 0
                });

                modeB = "Create";

            } else if (!producto) {
                console.warn(`PRODUCTO con código ${item.codigo} no encontrado.`);

                window.productos.push({
                    code: item.codigo,
                    category: item.categoria || "",
                    model: item.modelo || "",
                    size: item.size || "",
                    decoration: item.decoracion || "",
                    color: item.color || "",
                    price: parseFloat(item.precio) || 0,
                    stock_apartado: 0,
                    stock_critico: 0,
                    stock_disponible: 0,
                    stock_en_proceso: 0,
                    stock_max: 0,
                    stock_min: 0,
                    stock_total: 0
                });

                modeP = "Create";
                modeB = "Update";

            } else if (!bizcocho) {
                console.warn(`BIZCOCHO ${item.categoria} (${item.size}) no encontrado.`);

                window.bizcochos.push({
                    biz_category: item.categoria || "",
                    biz_size: item.size || "",
                    stock_apartado: 0,
                    stock_critico: 0,
                    stock_disponible: parseInt(item.stock) || 0,
                    stock_en_proceso: 0,
                    stock_max: 0,
                    stock_min: 0,
                    stock_total: 0
                });
                modeB = "Create";
                modeP = "Update";

            } else {
                console.log(`PRODUCTO con código ${item.codigo} y BIZCOCHO ${item.categoria} (${item.size}) encontrados.`);
                modeB = "Update";
                modeP = "Update";
            }

            const faltante = await productosActions(item, modeP, producto);
            const faltanteRestante = await bizcosActions(item, modeB, bizcocho, faltante);

            let newOrden = null;
            if (faltanteRestante > 0) {
                newOrden = await ordenesActions(ventaId, fecha_entrega, item, faltanteRestante);
            }

            const newDetalle = await detallesActions(ventaId, item);

            if (faltanteRestante > 0) {
                const payload = {
                    id_detalle: parseInt(newDetalle.id_detalle, 10) || null,
                    id_orden:   newOrden ? parseInt(newOrden.id_orden, 10) : null
                };
                console.log(payload);
                await insertDetalle(payload);
            }
            
        }
        const detalles_venta = await readDetalles(ventaId);
        await generarRecibos({ venta_datos: detalles_venta });
        showToast("Venta y recibo procesados exitosamente.", ICONOS.exito);

        setTimeout(() => window.location.reload(), 3000);
        
    } catch (error) {
        console.error("❌ Error al imprimir recibo:", error?.message || error);
        showToast(`Error al imprimir recibo: ${error?.message || error}`, ICONOS.error);
    }
}