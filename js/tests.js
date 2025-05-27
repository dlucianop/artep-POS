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








function eliminarProducto(code) {
    showConfirmToast(
        `¿Seguro que quieres eliminar el producto #${code}?`,
        async (confirmado) => {
            if (!confirmado) {
                showToast("Eliminación cancelada", ICONOS.info);
                return;
            }

            try {
                await deleteProducto(code);
                console.log('📦 Se elimino un producto.');
                showToast("Producto eliminado 📦.", ICONOS.success);
                initProductos();
            } catch (err) {
                console.error("[ERROR] eliminarProducto:", err.message);
                showToast("Error al eliminar", ICONOS.error);
            }
        },
        ICONOS.peligro
    );
}

function agregarNuevoProducto() {
    const form = document.getElementById('formProd');
    form.dataset.mode = 'create';
    renderProducto();
}

function editarProducto(code) {
    const form = document.getElementById('formProd');
    form.dataset.mode = 'edit';
    renderProducto(code);
}

function renderProducto(code) {
    const form = document.getElementById('formProd');
    const prodCodeField = document.getElementById('prodCodeField');

    if (form.dataset.mode === 'create') {
        form.reset();
        prodCodeField.style.display = 'block';
        console.log('Creando nuevo producto 📦');
    } else if (form.dataset.mode === 'edit') {
        const p = window.productos.find(x => x.code === parseInt(code));
        if (!p) return showToast('Producto no encontrado', ICONOS.error);

        document.getElementById('prodCode').value = p.code;
        prodCodeField.style.display = 'none';

        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodModel').value = p.model;
        document.getElementById('prodSize').value = p.size;
        document.getElementById('prodDecoration').value = p.decoration;
        document.getElementById('prodColor').value = p.color;
        document.getElementById('prodPrice').value = parseFloat(p.price);
        document.getElementById('prodDisp').value = parseInt(p.stock_disponible);
        document.getElementById('prodApr').value = parseInt(p.stock_apartado);
        document.getElementById('prodProc').value = parseInt(p.stock_en_proceso);

        console.log('Editando producto con código:', p.code);
    }

    openModal('editProductoModal');
}

async function guardarProducto(event) {
    event.preventDefault();

    const form = document.getElementById('formProd');
    const mode = form.dataset.mode;
    const code = parseInt(document.getElementById('prodCode').value.trim());

    const payload = {
        code, 
        category: document.getElementById('prodCategory').value,
        model: document.getElementById('prodModel').value,
        size: document.getElementById('prodSize').value,
        decoration: document.getElementById('prodDecoration').value,
        color: document.getElementById('prodColor').value,
        price: +document.getElementById('prodPrice').value,
        stock_disponible: +document.getElementById('prodDisp').value,
        stock_apartado: +document.getElementById('prodApr').value,
        stock_en_proceso: +document.getElementById('prodProc').value
    };

    try {
        if (mode === 'create') {
            const dupCode = window.productos.some(p => p.code === payload.code);
            if (dupCode) {
                return showToast(`Ya existe un producto con código ${payload.code}.`, ICONOS.advertencia);
            }

            const dupCombo = window.productos.some(p =>
                p.category === payload.category &&
                p.model === payload.model &&
                p.size === payload.size &&
                p.decoration === payload.decoration &&
                p.color === payload.color
            );
            if (dupCombo) {
                return showToast(
                    `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                    ICONOS.advertencia
                );
            }

            await createProducto(payload);
            console.log('📦 Se agrego un nuevo producto.');
            showToast('Producto agregado', ICONOS.success);
            closeModal('editProductoModal');
            await initProductos();

        } else if (mode === 'edit') {
            const dupCombo = window.productos.some(p =>
                p.category === payload.category &&
                p.model === payload.model &&
                p.size === payload.size &&
                p.decoration === payload.decoration &&
                p.color === payload.color &&
                p.code !== payload.code
            );
            if (dupCombo) {
                return showToast(
                    `Ya existe un producto con categoría “${payload.category}”, modelo “${payload.model}”, tamaño “${payload.size}”, decoración “${payload.decoration}” y color “${payload.color}”.`,
                    ICONOS.advertencia
                );
            }

            await updateProducto(payload);
            console.log('📦 Se modifico un producto.');
            showToast('Producto actualizado', ICONOS.success);
            closeModal('editProductoModal');
            await initProductos();

        } else {
            console.warn('guardarProducto: modo desconocido', mode);
        }
    } catch (err) {
        console.error('[ERROR] guardarProducto:', err);
        showToast('Error al guardar el producto', ICONOS.error);
    }
}

/*

<!-- MODAL >
    <div id="editProductoModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('editProductoModal')">&times;</span>
            <form id="formProd" data-mode="" onsubmit="guardarProducto(event)">
                <div class="prod-form-field" id="prodCodeField" style="display:none;">
                    <label for="">Codigo del Producto</label>
                    <input id="prodCode" type="number" step="1" min="0">
                </div>
                <div class="prod-form-field">
                    <label for="prodCategory">Categoría:</label>
                    <select id="prodCategory" required>
                        <option value="" disabled selected>-- Elija una categoría --</option>
                        <option value="Vaso">Vaso</option>
                        <option value="Taza">Taza</option>
                        <option value="Plato">Plato</option>
                        <option value="Jarrón">Jarrón</option>
                        <option value="Termo">Termo</option>
                        <option value="Maceta">Maceta</option>
                        <option value="Cuenco">Cuenco</option>
                        <option value="Decoración de pared">Decoración de pared</option>
                        <option value="Escultura">Escultura</option>
                        <option value="Figuras">Figuras</option>
                        <option value="Lámpara">Lámpara</option>
                        <option value="Florero">Florero</option>
                        <option value="Tetera">Tetera</option>
                        <option value="Vasija">Vasija</option>
                        <option value="Ladrillo decorativo">Ladrillo decorativo</option>
                        <option value="Azulejos">Azulejos</option>
                        <option value="Plato de sobremesa">Plato de sobremesa</option>
                        <option value="Tazón">Tazón</option>
                        <option value="Salero y/o pimentero">Salero y/o pimentero</option>
                        <option value="Candelabro">Candelabro</option>
                    </select>
                </div>

                <div class="prod-form-field">
                    <label for="prodModel">Modelo:</label>
                    <input id="prodModel" type="text" required>
                </div>

                <div class="prod-form-field">
                    <label for="prodSize">Tamaño:</label>
                    <select id="prodSize" required>
                        <option value="" disabled selected>-- Elija un tamaño --</option>
                        <option value="Mini">Mini</option>
                        <option value="Pequeño">Pequeño</option>
                        <option value="Mediano">Mediano</option>
                        <option value="Grande">Grande</option>
                        <option value="Extra Grande">Extra Grande</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>

                <div class="prod-form-field">
                    <label for="prodDecoration">Decoración:</label>
                    <input id="prodDecoration" type="text">
                </div>

                <div class="prod-form-field">
                    <label for="prodColor">Color:</label>
                    <input id="prodColor" type="text">
                </div>

                <div class="prod-form-field">
                    <label for="prodPrice">Precio Unitario:</label>
                    <input id="prodPrice" type="number" step="0.01" min="0" required>
                </div>

                <div class="prod-form-field">
                    <label for="prodDisp">Stock Disponible:</label>
                    <input id="prodDisp" type="number" min="0" required>
                </div>

                <div class="prod-form-field">
                    <label for="prodApr">Stock Apartado:</label>
                    <input id="prodApr" type="number" min="0" required>
                </div>

                <div class="prod-form-field">
                    <label for="prodProc">Stock en Proceso:</label>
                    <input id="prodProc" type="number" min="0" required>
                </div>

                <div class="modal-actions">
                    <button type="submit">Guardar</button>
                    <button type="button" onclick="closeModal('editProductoModal')">Cancelar</button>
                </div>
            </form>
        </div>
    </div-->*/