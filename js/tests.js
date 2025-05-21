async function updateData(detalleV, detalleO, ordenData) {
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
