async function productosActions(item, pedido, producto) {
    let faltante = pedido;

    if (producto) {
        if (producto.stock_disponible >= pedido) {
            producto.stock_apartado += pedido;
            producto.stock_disponible -= pedido;
            faltante = 0;
        } else {
            producto.stock_apartado += producto.stock_disponible;
            faltante -= producto.stock_disponible;
            producto.stock_en_proceso += faltante;
            producto.stock_disponible = 0;
        }
        await updateProducto(producto);
    } else {
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
            stock_en_proceso: faltante
        });
    }

    return faltante;
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
}


function updateBizcocho(bizcocho) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE inventario_bizcochos
            SET stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?
            WHERE biz_category = ? AND biz_size = ?;
        `;

        const params = [
            bizcocho.stock_apartado,
            bizcocho.stock_disponible, 
            bizcocho.stock_en_proceso, 
            bizcocho.biz_category,
            bizcocho.biz_size,
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar bizcocho: " + err.message));
                }

                if (this.changes === 0) {
                    return reject(new Error("No se encontró ningún bizcocho para actualizar."));
                }

                resolve("Bizcocho actualizado correctamente");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}

function updateProducto(producto) {
    return new Promise((resolve, reject) => {
        const db = openDataBase();
        const query = `
            UPDATE inventario_productos
            SET 
                category = ?, model = ?, size = ?, decoration = ?, color = ?, price = ?,
                stock_apartado = ?, stock_disponible = ?, stock_en_proceso = ?
            WHERE code = ?;
        `;

        const params = [
            producto.category,
            producto.model,
            producto.size,
            producto.decoration,
            producto.color,
            producto.price,
            producto.stock_apartado,
            producto.stock_disponible,
            producto.stock_en_proceso,
            producto.code
        ];

        db.run(query, params, function (err) {
            try {
                if (err) {
                    return reject(new Error("Error al actualizar producto: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("No se encontró ningún producto con ese código"));
                }

                resolve("Producto actualizado correctamente");
            } catch (err) {
                reject(err);
            } finally {
                closeDatabase(db);
            }
        });
    });
}