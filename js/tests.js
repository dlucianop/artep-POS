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
async function usarStock(fuente, clave, nombreFuente, faltan) {
    if (fuente && fuente[clave] > 0) {
        console.log(`\x1b[32m[%s] Stock disponible: %s\x1b[0m`, nombreFuente, fuente[clave]);
        const usado = Math.min(faltan, fuente[clave]);
        faltan -= usado;
        console.log(`\x1b[33m[${nombreFuente}] Se usaron ${usado}. Faltan ahora: ${faltan}\x1b[0m`);
        //se actualiza
    } else if (faltan > 0) {
        if (!fuente) {
            console.log(`\x1b[31m[${nombreFuente}] ❌ No existe.\x1b[0m`);
            //se crea
            const payload = {
                //data
            }
            createBizcocho(payload);
            createProducto();
        } else {
            console.log(`\x1b[31m[${nombreFuente}] ⚠️ Existe pero no hay stock disponible (${fuente[clave]}).\x1b[0m`);
            //no se hace nada
        }
    }
    return faltan;
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
        let faltan = carrito_item.cantidad;
        console.log(`\n🛒 Item: ${productoEsperado}`);
        console.log(`📦 Cantidad solicitada: ${carrito_item.cantidad}`);

        faltan = await usarStock(existeProducto, "stock_disponible", "PRODUCTO", faltan);
        if (faltan > 0) {
            faltan = await usarStock(existeOrdenProducto, "cantidad_buenos", "ORDEN PRODUCTO", faltan);
        }
        if (faltan > 0) {
            faltan = await usarStock(existeBizcocho, "stock_disponible", "BIZCOCHO", faltan);
        }
        if (faltan > 0) {
            faltan = await usarStock(existeOrdenBizcocho, "cantidad_buenos", "ORDEN BIZCOCHO", faltan);
        }
        if (faltan > 0) {
            console.log(`[NUEVA ORDEN]🆕 Se necesita nueva orden para ${faltan} unidad(es).`);
        }

        faltan = Math.max(faltan, 0);
    }





    switch (nombreFuente) {
                case "PRODUCTO":
                    payload = {
                        stock_apartado: fuente.stock_apartado,
                        stock_disponible: fuente.stock_disponible,
                        stock_en_proceso: fuente.stock_en_proceso,
                        code: fuente.code
                    }
                    await updateStockProducto(payload);
                    break;
                case "ORDEN PRODUCTO": // se actualiza el campo de orden.cantidad_buenos
                    await updateOrden();
                    break;
                case "BIZCOCHO": // se actualiza el campo de producto.stock_disponible
                    await updateBizcocho();
                    break;
                case "ORDEN BIZCOCHO": // se actualiza el campo de producto.stock_disponible
                    await updateOrden();
                    break;
            
                default:
                    break;
            }


let faltan = carrito_item.cantidad; // 200 unidades solicitadas
console.log(`\n🛒 Item: ${productoEsperado}`);
console.log(`📦 Cantidad solicitada: ${carrito_item.cantidad}`);

// Supongamos que existeProducto.stock_disponible = 50
faltan = await usarStock(existeProducto, "stock_disponible", "PRODUCTO", faltan);
// consola:
// [PRODUCTO] Stock disponible: 50
// [PRODUCTO] Se usaron 50. Faltan ahora: 150
// faltan = 150

if (faltan > 0) {
    // Supongamos que existeOrdenProducto.cantidad_buenos = 100
    faltan = await usarStock(existeOrdenProducto, "cantidad_buenos", "ORDEN PRODUCTO", faltan);
    // consola:
    // [ORDEN PRODUCTO] Stock disponible: 100
    // [ORDEN PRODUCTO] Se usaron 100. Faltan ahora: 50
    // faltan = 50
}

if (faltan > 0) {
    // Supongamos que existeBizcocho.stock_disponible = 30
    faltan = await usarStock(existeBizcocho, "stock_disponible", "BIZCOCHO", faltan);
    // consola:
    // [BIZCOCHO] Stock disponible: 30
    // [BIZCOCHO] Se usaron 30. Faltan ahora: 20
    // faltan = 20
}

if (faltan > 0) {
    // Supongamos que existeOrdenBizcocho.cantidad_buenos = 10
    faltan = await usarStock(existeOrdenBizcocho, "cantidad_buenos", "ORDEN BIZCOCHO", faltan);
    // consola:
    // [ORDEN BIZCOCHO] Stock disponible: 10
    // [ORDEN BIZCOCHO] Se usaron 10. Faltan ahora: 10
    // faltan = 10
}

if (faltan > 0) {
    // Como faltan 10 unidades, se crea una nueva orden para cubrirlas
    console.log(`[NUEVA ORDEN]🆕 Se necesita nueva orden para 10 unidad(es).`);
    await createOrden(faltan, productoEsperado);
    faltan = 0; // asumimos que la nueva orden cubre todo lo faltante
}

faltan = Math.max(faltan, 0); // aseguramos que faltan no sea negativo
