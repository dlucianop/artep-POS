const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const { 
    createProducto, readProductos, searchProduct, updateProducto, deleteProducto 
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, readBizcochos, updateBizcocho, searchBizcocho, deleteBizcocho 
} = require(join(__dirname, "..", "js", "crud_bizcochos.js"));
const {
    createOrden, insertDetalle, readOrdenByFase
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));
const { generarRecibos } = require(join(__dirname, "..", "js", "generador-ticket.js"));

const inputSearch = document.getElementById("product-by-search");
const resultsContainer = document.getElementById("search-results");
window.carrito = [];

window.addEventListener('DOMContentLoaded', initPOS);

async function initPOS() {
    try {
        await cargarProductos();
        await cargarBizcochos();
        await cargarVentas();

        console.log('✅ Todos los datos del punto de venta fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error inesperado en la carga del sistema:', error.message);
        showToast('Error al iniciar el sistema POS', ICONOS.error);
    }
}

async function cargarProductos() {
    try {
        const productos = await readProductos();
        window.productos = productos;
        console.log('📦 Productos cargados.');
    } catch (err) {
        console.error('❌ Error al cargar productos:', err.message);
        showToast('Error al cargar productos', ICONOS.error);
    }
}

async function cargarBizcochos() {
    try {
        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;
        console.log('📦 Bizcochos cargados.');
    } catch (err) {
        console.error('❌ Error al cargar bizcochos:', err.message);
        showToast('Error al cargar bizcochos', ICONOS.error);
    }
}

async function cargarVentas() {
    try {
        const ventas = await readVentas();
        window.ventas = ventas;
        console.log('📦 Ventas cargadas.');
    } catch (err) {
        console.error('❌ Error al cargar ventas:', err.message);
        showToast('Error al cargar ventas', ICONOS.error);
    }
}

function filtrarProductos(textoS) {
    if (!window.productos || !Array.isArray(window.productos)) return [];

    const busqueda = textoS.toLowerCase();

    return window.productos.filter(producto => {
        return (
            producto.category.toLowerCase().includes(busqueda) ||
            producto.model.toLowerCase().includes(busqueda) ||
            producto.size.toLowerCase().includes(busqueda) ||
            producto.decoration.toLowerCase().includes(busqueda) ||
            producto.color.toLowerCase().includes(busqueda)
        );
    });
}

function renderResults(filteredProducts) {
    resultsContainer.innerHTML = "";

    if (filteredProducts.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontraron coincidencias.</p>";
        resultsContainer.style.display = "block";
        return;
    }

    const ul = document.createElement("ul");

    filteredProducts.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.code} - ${producto.category} Modelo ${producto.model} [${producto.size}] Decoración ${producto.decoration} | Color ${producto.color}`;

        li.addEventListener('click', () => {
            inputSearch.value = "";
            inputSearch.focus();
            resultsContainer.style.display = "none";

            document.getElementById("productCode").value = producto.code;
            document.getElementById("productCategory").value = producto.category;
            document.getElementById("productModel").value = producto.model;
            document.getElementById("productSize").value = producto.size;
            document.getElementById("productDecoration").value = producto.decoration;
            document.getElementById("productColor").value = producto.color;
            document.getElementById("productPrice").value = producto.price;

            document.getElementById("product-stock-disponible").value = producto.stock_disponible;
            document.getElementById("product-stock-pedido").value = 1;
        });

        ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);
    resultsContainer.style.display = "block";
}

inputSearch.addEventListener("input", (e) => {
    const texto = e.target.value.trim();

    if (texto === "") {
        resultsContainer.style.display = "none";
        resultsContainer.innerHTML = "";
        return;
    }

    const productosFiltrados = filtrarProductos(texto);
    renderResults(productosFiltrados);
});

function agregarProductoCarrito() {
    inputSearch.focus();

    const code = parseInt(document.getElementById("productCode").value);
    const tableBody = document.querySelector("#table-products tbody");
    const existingRow = Array.from(tableBody.rows).find(row => parseInt(row.cells[0].textContent) === code);

    if (!code) {
        showToast("Debes ingresar un código de producto.", ICONOS.error);
        return;
    }

    if (existingRow) {
        showToast("El producto ya está en el carrito.", ICONOS.advertencia);
        return;
    }

    const producto = {
        codigo: code,
        categoria: document.getElementById("productCategory").value,
        modelo: document.getElementById("productModel").value,
        size: document.getElementById("productSize").value,
        decoracion: document.getElementById("productDecoration").value,
        color: document.getElementById("productColor").value,
        precio: parseFloat(document.getElementById("productPrice").value),
        stock: parseInt(document.getElementById("product-stock-disponible").value),
        pedido: parseInt(document.getElementById("product-stock-pedido").value || 1)
    };

    if (Object.values(producto).includes("") || isNaN(producto.precio) || isNaN(producto.stock) || isNaN(producto.pedido)) {
        showToast("Por favor, complete todos los campos antes de agregar el producto.", ICONOS.advertencia);
        return;
    }
    if (producto.precio <= 0) {
        showToast("El precio debe ser mayor a $0.", ICONOS.advertencia);
        return;
    }
    if (producto.stock < 0) {
        showToast("El stock disponible no puede ser negativo.", ICONOS.advertencia);
        return;
    }
    if (producto.pedido < 1) {
        showToast("El pedido debe tener al menos 1 producto.", ICONOS.advertencia);
        return;
    }

    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) emptyRow.remove();

    const productName = `${producto.categoria} Modelo ${producto.modelo} [${producto.size}] Decoración ${producto.decoracion} | Color ${producto.color}`;
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${producto.codigo}</td>
        <td>${productName}</td>
        <td>${producto.precio.toFixed(2)}</td>
        <td>
            <input 
                id="cantidad_${producto.codigo}" 
                class="cantidad-venta-input" 
                type="number" 
                min="1" 
                value="${producto.pedido}"
                onchange="actualizarTotal(${producto.codigo}, ${producto.precio})"
        </td>
        <td id="total_${producto.codigo}">${(producto.precio * producto.pedido).toFixed(2)}</td>
        <td class="col-btn">
            <button type="button" onclick="eliminarProdCarrito(${producto.codigo})">🗑️ Eliminar</button>
        </td>
    `;
    tableBody.appendChild(newRow);

    agregarAlCarrito(producto);
    closeModal('addProductModal');
    totalVenta();
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(p => p.codigo === producto.codigo);

    if (existente) {
        showToast("El producto ya está en el carrito.", ICONOS.advertencia);
        return;
    }

    carrito.push(producto);
    showToast("Producto agregado al carrito.", ICONOS.exito);
    totalVenta();
}

function actualizarTotal(codigo, precio) {
    const cantidad = parseInt(document.getElementById(`cantidad_${codigo}`).value);
    
    const productoEnCarrito = carrito.find(p => p.codigo === codigo);
    if (productoEnCarrito) {
        productoEnCarrito.pedido = cantidad;
        productoEnCarrito.precio = precio; 
    }

    document.getElementById(`total_${codigo}`).textContent = (precio * cantidad).toFixed(2);
    totalVenta();
}

function eliminarProdCarrito(codigo) {
    const filas = document.querySelectorAll('#table-products tbody tr');
    filas.forEach(fila => {
        if (parseInt(fila.cells[0].textContent) === codigo) {
            fila.remove();
        }
    });
    
    window.carrito = carrito.filter(producto => producto.codigo !== codigo);
    totalVenta();
}

function totalVenta() {
    let total = 0;

    carrito.forEach(producto => {
        const cantidad = producto.pedido;
        total += producto.precio * cantidad;
    });

    document.getElementById("monto").value = total.toFixed(2);

    const pago = parseFloat(document.getElementById("pago").value) || 0;
    const cambio = pago - total;
    document.getElementById("cambio").value = (cambio < 0 ? 0 : cambio).toFixed(2);
}

document.getElementById("pago").addEventListener("input", totalVenta);


function cancelarVenta() {
    showConfirmToast("¿Desea limpiar la pantalla de venta?", (confirmed) => {
        if (!confirmed) return;

        showToast("Venta limpiada 😄", ICONOS.info);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}

async function validaciones() {
    let idVenta = parseInt(document.getElementById('id-sale').value.trim(), 10);
    let metodo_pago = document.getElementById('payment-method').value.trim();
    let forma_pago = document.getElementById('payment-form').value.trim();
    let pago = parseFloat(document.getElementById("pago").value);
    let fechaEntrega = document.getElementById('sale-entrega').value.trim();
    const emptyRow = document.getElementById("rowvoid");
    
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return Promise.reject(new Error("Falta poner el número de venta."));
    }

    if (isNaN(idVenta) || idVenta <= 0) {
        showToast("Falta poner el número de venta.", ICONOS.advertencia);
        return Promise.reject(new Error("Falta poner el número de venta."));
    }

    if (window.ventas && Array.isArray(window.ventas) && window.ventas.some(venta => parseInt(venta.id_venta) === idVenta)) {
        showToast("Ya existe venta con el mismo número, intente con otro.", ICONOS.error);
        return Promise.reject(new Error("Venta duplicada con el mismo número."));
    }

    if (!metodo_pago) {
        showToast("Falta agregar un método de pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Falta método de pago."));
    }

    if (!forma_pago) {
        showToast("Falta agregar una forma de pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Falta forma de pago."));
    }

    if (isNaN(pago) || pago <= 0) {
        showToast("Falta poner una cantidad válida en pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Pago inválido o vacío."));
    }

    if (!fechaEntrega) {
        showToast("Falta poner una fecha de entrega.", ICONOS.advertencia);
        return Promise.reject(new Error("Falta fecha de entrega."));
    }

    return Promise.resolve();
}

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

        await createVenta(venta);
        return { ventaId, fecha_entrega: venta.fecha_entrega };
    } catch (error) {
        console.error('❌ ventasActions ERROR:', error);
        showToast(`Error en ventasActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

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
                modeP = "Create";
                modeB = "Create";

            } else if (!producto) {
                console.warn(`PRODUCTO con código ${item.codigo} no encontrado.`);
                modeP = "Create";
                modeB = "Update";

            } else if (!bizcocho) {
                console.warn(`BIZCOCHO ${item.categoria} (${item.size}) no encontrado.`);
                modeB = "Create";
                modeP = "Update";

            } else {
                console.log(`PRODUCTO con código ${item.codigo} y BIZCOCHO ${item.categoria} (${item.size}) encontrados.`);
                modeB = "Update";
                modeP = "Update";

            }

            const faltante = await productosActions(item, modeP, producto);
            await cargarProductos();
            
            const bizcochoActualizado = window.bizcochos.find(b => b.biz_category === item.categoria && b.biz_size === item.size);
            const faltanteRestante = await bizcosActions(item, modeB, bizcochoActualizado, faltante);
            await cargarBizcochos();

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