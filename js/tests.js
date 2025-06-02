async function crudProducto() {
    for (const producto of window.carrito) {
        const existeProducto = window.productos.find(p => p.code === producto.codigo);
        try {
            if (existeProducto) {
                //await actualizarProducto(producto);
            } else {
                //await crearProducto(producto);
            }
        } catch (error) {
            console.error('❌[crudProducto] Error interno:', error.message);
            showToast(`[crudProducto] Error interno: ${error.message}`, ICONOS.error);
        }
    }
}

async function crudBizcocho() {
    for (const producto of window.carrito) {
        const existeBizcocho = window.bizcochos.find(b => 
            b.biz_category === producto.categoria &&
            b.biz_model === producto.modelo &&
            b.biz_size === producto.size
        );
        try {
            if (existeBizcocho) {
                //await actualizarBizcocho(producto);
            } else {
                //await crearBizcocho(producto);
            }
        } catch (error) {
            console.error('❌[crudBizcocho] Error interno:', error.message);
            showToast(`[crudBizcocho] Error interno: ${error.message}`, ICONOS.error);
        }
    }
}


/*------------------------------------------------------------------------------------------------------------------------- */

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
        let faltan = carrito_item.cantidad;
        console.log(`\n🛒 Item: ${productoEsperado}`);
        console.log(`📦 Cantidad solicitada: ${carrito_item.cantidad}`);

        // PRODUCTO
        if (existeProducto && existeProducto.stock_disponible > 0) {
            console.log(`[PRODUCTO] Stock disponible: ${existeProducto.stock_disponible}`);
            const usado = Math.min(faltan, existeProducto.stock_disponible);
            faltan -= usado;
            console.log(`[PRODUCTO] Se usaron ${usado}. Faltan ahora: ${faltan}`);
        } else {
            if (!existeProducto) {
                console.log(`[PRODUCTO] ❌ No existe el producto en catálogo.`);
            } else {
                console.log(`[PRODUCTO] ⚠️ Existe pero no hay stock disponible (${existeProducto.stock_disponible}).`);
            }
        }

        // ORDEN PRODUCTO
        if (faltan > 0 && existeOrdenProducto && existeOrdenProducto.cantidad_buenos > 0) {
            console.log(`[ORDEN PRODUCTO] Cantidad en orden: ${existeOrdenProducto.cantidad_buenos}`);
            const usado = Math.min(faltan, existeOrdenProducto.cantidad_buenos);
            faltan -= usado;
            console.log(`[ORDEN PRODUCTO] Se usaron ${usado}. Faltan ahora: ${faltan}`);
        } else if (faltan > 0) {
            if (!existeOrdenProducto) {
                console.log(`[ORDEN PRODUCTO] ❌ No existe una orden de inventario para este producto.`);
            } else {
                console.log(`[ORDEN PRODUCTO] ⚠️ Existe pero no tiene cantidad disponible (${existeOrdenProducto.cantidad_buenos}).`);
            }
        }

        // BIZCOCHO
        if (faltan > 0 && existeBizcocho && existeBizcocho.stock_disponible > 0) {
            console.log(`[BIZCOCHO] Stock disponible: ${existeBizcocho.stock_disponible}`);
            const usado = Math.min(faltan, existeBizcocho.stock_disponible);
            faltan -= usado;
            console.log(`[BIZCOCHO] Se usaron ${usado}. Faltan ahora: ${faltan}`);
        } else if (faltan > 0) {
            if (!existeBizcocho) {
                console.log(`[BIZCOCHO] ❌ No existe bizcocho en bodega con esas características.`);
            } else {
                console.log(`[BIZCOCHO] ⚠️ Existe pero no hay stock disponible (${existeBizcocho.stock_disponible}).`);
            }
        }

        // ORDEN BIZCOCHO
        if (faltan > 0 && existeOrdenBizcocho && existeOrdenBizcocho.cantidad_buenos > 0) {
            console.log(`[ORDEN BIZCOCHO] Cantidad en orden: ${existeOrdenBizcocho.cantidad_buenos}`);
            const usado = Math.min(faltan, existeOrdenBizcocho.cantidad_buenos);
            faltan -= usado;
            console.log(`[ORDEN BIZCOCHO] Se usaron ${usado}. Faltan ahora: ${faltan}`);
        } else if (faltan > 0) {
            if (!existeOrdenBizcocho) {
                console.log(`[ORDEN BIZCOCHO] ❌ No existe orden de inventario para bizcochos.`);
            } else {
                console.log(`[ORDEN BIZCOCHO] ⚠️ Existe pero no tiene cantidad disponible (${existeOrdenBizcocho.cantidad_buenos}).`);
            }
        }

        // FINAL
        if (faltan > 0) {
            console.log(`[NUEVA ORDEN]🆕 Se necesita nueva orden para ${faltan} unidad(es).`);
        }

        faltan = Math.max(faltan, 0); // Seguridad

    }