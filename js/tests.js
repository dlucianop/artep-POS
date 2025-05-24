async function crearOrdenReposicion(ventaId, fecha_entrega, item, faltanteRestante) {
    try {
        const orden = {
            id_venta: ventaId,
            id_origen: 5,
            fecha_entrega,
            categoria: item.categoria,
            size: item.size,
            cantidad_inicial: faltanteRestante,
            id_detalle: item.id_detalle
        };

        const newOrden = await createOrden(orden);
        return newOrden;
    } catch (error) {
        console.error('❌ ordenesActions ERROR:', error);
        showToast(`Error en ordenesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function updateOrdenInventario(orden) {
    try {
        const ordenData = await readOrdenById(orden.id_orden);
        const detalleO = await readDetalleOrden(orden.id_orden);
        const newFase = await getFaseById(orden.id_fase);

        const cantidadProducida = orden.cantidad_buenos;

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            await updateBizcocho({
                stock_apartado: bizcocho.stock_apartado,
                stock_disponible: bizcocho.stock_disponible + cantidadProducida,
                stock_en_proceso: bizcocho.stock_en_proceso,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
            });
        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleO.codigo);

            await updateStockProducto({
                stock_apartado: producto.stock_apartado,
                stock_disponible: producto.stock_disponible + cantidadProducida,
                stock_en_proceso: producto.stock_en_proceso,
                code: producto.code
            });
        }

        await updateOrden(orden);
    } catch (error) {
        console.error("❌ Error en updateOrdenInventario:", error);
        showToast("Error en orden de inventario", ICONOS.error);
    }
}

async function updateOrdenReposicion(orden) {
    try {
        const ordenData = await readOrdenById(orden.id_orden);
        const detalleO = await readDetalleOrden(orden.id_orden);
        const detalleV = await searchDetalleVenta(detalleO.id_detalle);

        const cantidadProducida = orden.cantidad_buenos;
        const cantidadInicialActual = detalleO?.cantidad_inicial || ordenData?.cantidad_inicial || 0;
        const faltante = cantidadInicialActual - cantidadProducida;

        const newFase = await getFaseById(orden.id_fase);
        const ultimaFase = await getUltimaFase();

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            await updateBizcocho({
                stock_apartado: bizcocho.stock_apartado,
                stock_disponible: faltante > 0
                    ? bizcocho.stock_disponible - faltante
                    : bizcocho.stock_disponible,
                stock_en_proceso: bizcocho.stock_en_proceso + cantidadProducida,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
            });
        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleV.codigo);
            const esUltimaFase = newFase.id_fase === ultimaFase.id_fase;

            await updateStockProducto({
                stock_apartado: esUltimaFase
                    ? producto.stock_apartado + cantidadProducida
                    : producto.stock_apartado,
                stock_disponible: producto.stock_disponible,
                stock_en_proceso: esUltimaFase
                    ? producto.stock_en_proceso
                    : producto.stock_en_proceso + cantidadProducida,
                code: producto.code
            });
        }

        await updateOrden(orden);
    } catch (error) {
        console.error("❌ Error en updateOrdenReposicion:", error);
        showToast("Error en orden de reposición", ICONOS.error);
    }
}

async function getCantidadConDefault(idCampo, valorAnterior) {
    const valor = parseInt(document.getElementById(idCampo).value.trim(), 10);
    return isNaN(valor) ? valorAnterior : valor;
}