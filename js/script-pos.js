const { log } = require('console');
const { join } = require('path');
const { 
    createProducto, 
    readProductos, 
    searchProduct, 
    updateProducto, 
    deleteProducto,
    updateStockProducto
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, 
    readBizcochos, 
    updateBizcocho, 
    searchBizcocho, 
    deleteBizcocho 
} = require(crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js'));
const {
    readDetalles, createVenta, readVentas
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const {
    readFases, updateFase, readCategorias, readSizes
} = require(join(__dirname, "..", "js", "crud-config.js"));
const {
    readOrdenes, createOrden, updateEstado, readOrdenesOrigen
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, 
    showConfirmToast, 
    ICONOS 
} = require(join(__dirname, '..', 'js', 'toast.js'));
const { 
    generarRecibos 
} = require(join(__dirname, "..", "js", "generador-ticket.js"));

window.addEventListener('DOMContentLoaded', initPOS);

async function initPOS() {
    try {
        const categorias = await readCategorias();
        window.categorias = categorias;

        const sizes = await readSizes();
        window.sizes = sizes;

        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;

        const productos = await readProductos();
        window.productos = productos;

        const ordenes = await readOrdenesOrigen("INVENTARIO");
        window.ordenesInv = ordenes;

        const ventas = await readVentas();
        window.ventas = ventas;

        window.carrito = [];

        console.warn('Se cargaron los datos en cache.');

    } catch (error) {
        console.error('❌ Error al cargar datos de POS:', error.message);
        showToast(`[ERROR] al cargar datos: ${error.message}`, ICONOS.error);
    }
}

async function addOrUpdateCart(producto) {
    const index = window.carrito.findIndex(item => item.codigo === producto.codigo);
    if (index === -1) {
        window.carrito.push(producto);
    } else {
        window.carrito[index].cantidad = producto.cantidad;
        window.carrito[index].importe = producto.importe;
    }
}

async function removeFromCart(codigoProducto) {
    window.carrito = window.carrito.filter(item => item.codigo !== codigoProducto);
}

function cargarCategorias(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectCate = modal.querySelector("#categoria_producto");
        selectCate.innerHTML = `<option value="" disabled selected>-- Elija una categoría --</option>`;

        window.categorias.forEach(c => {
            const option = document.createElement("option");
            option.value = c.name_categoria;
            option.textContent = c.name_categoria;
            selectCate.appendChild(option);
        });

        resolve();
    });
}

function cargarTamanos(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectSize = modal.querySelector("#size_producto");
        selectSize.innerHTML = `<option value="" disabled selected>-- Elija un tamaño --</option>`;

        window.sizes.forEach(s => {
            const option = document.createElement("option");
            option.value = s.name_size;
            option.textContent = s.name_size;
            selectSize.appendChild(option);
        });

        resolve();
    });
}

async function addCarrito() {
    document.getElementById('create-content').innerHTML = '';
    document.getElementById("create-dialog-s").showModal();

    let contenedorId = "create-content";
    let html = `
            <p><strong>Código Producto:</strong>
                <input type="number" id="code_producto" step="1" min="0" value="" placeholder="Ingrese codigo del producto"></p>
            <p><strong>Categoria:</strong>
                <select id="categoria_producto"></select></p>
            <p><strong>Modelo:</strong>
                <input type="text" id="modelo_producto" value="" placeholder="Ingrese modelo del producto"></p>
            <p><strong>Tamaño:</strong>
                <select id="size_producto"></select></p>
            <p><strong>Decoración:</strong>
                <input type="text" id="decoracion_producto" value="" placeholder="Ingrese decoracion del producto"></p>
            <p><strong>Color:</strong>
                <input type="text" id="color_producto" value="" placeholder="Ingrese color del producto"></p>
            <p><strong>Precio Unitario($):</strong>
                <input type="number" id="precio_producto" min="0" value="" placeholder="$$$$$"></p>
            <p><strong>Stock Disponible:</strong>
                <input type="number" id="disponibles_producto" step="1" min="0" value="" placeholder="Ingrese stock disponible del producto"></p>
            <p><strong>Cantidad del Pedido:</strong>
                    <input type="number" id="cantidad" step="1" min="0" value="" placeholder="Ingrese pedido de la venta"></p>
    `;
    document.getElementById(contenedorId).innerHTML = html;
    await cargarCategorias(contenedorId);
    await cargarTamanos(contenedorId);
}

async function searchProducto() {
    const searchInput = document.getElementById("search-input").value.trim();

    if (!searchInput) {
        showToast("Campo de búsqueda vacío", ICONOS.info);
        return;
    }

    document.getElementById('results-content').innerHTML = '';
    const titleRES = document.getElementById('results-title');
    titleRES.textContent = `Coincidencias para "${searchInput}":`;

    const resultados = await coincidenciasProducto(searchInput);

    const carritoFilas = document.querySelectorAll("#carrito tr");
    const codigosEnCarrito = Array.from(carritoFilas).map(fila => fila.getAttribute("data-code"));
    const resultadosFiltrados = resultados.filter(producto => !codigosEnCarrito.includes(producto.code.toString()));

    if (!resultadosFiltrados || resultadosFiltrados.length === 0) {
        mostrarSinCoincidencias();
    } else {
        mostrarListaResultados(resultadosFiltrados);
    }

    document.getElementById("results-dialog-s").showModal();
}


function mostrarSinCoincidencias() {
    const content = document.getElementById('results-content');
    const menu = document.getElementById("menu-results");

    content.innerHTML = `<p style="text-align:center; padding: 1rem;">No se encontraron coincidencias.</p>`;
    menu.innerHTML = `<button id="close-dialog-results" class="dialog-btn">Cancelar</button>`;
    document.getElementById("search-input").value = '';

    document.getElementById("close-dialog-results").addEventListener("click", () =>
        cerrarDialogo("results-dialog-s", "results-content", "No se encontraron coincidencias.")
    );
}

async function coincidenciasProducto(searchInput) {
    try {
        const input = searchInput.toLowerCase().trim();
        const palabrasClave = input.split(/\s+/);

        const coincidencias = window.productos.filter(producto => {
            const textoProducto = `${producto.category} TAM.${producto.size} MOD.${producto.model} DECOR.${producto.decoration} COLOR ${producto.color}`.toLowerCase();
            
            return palabrasClave.some(palabra => textoProducto.includes(palabra));
        });

        return coincidencias;

    } catch (error) {
        console.error('❌ Error al buscar coincidencias del producto:', error.message);
        showToast(`[ERROR] Al buscar coincidencias del producto: ${error.message}`, ICONOS.error);
    }
}


function mostrarListaResultados(productos) {
    const menu = document.getElementById("menu-results");
    menu.innerHTML = '';
    const content = document.getElementById('results-content');
    content.innerHTML = '';

    const lista = document.createElement('ul');
    lista.style.listStyle = 'none';
    lista.style.padding = '0';

    productos.forEach(producto => {
        const item = document.createElement('li');
        item.classList.add('resultado-item');

        item.innerHTML = `
            <div style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #ccc;">
                ${producto.category} TAM.${producto.size} MOD.${producto.model} DECOR. ${producto.decoration} COLOR ${producto.color}
            </div>
        `;

        item.addEventListener('click', () => {
            llenarFormularioDesdeProducto(producto);
            document.getElementById("results-dialog-s").close();
        });

        lista.appendChild(item);
    });

    content.appendChild(lista);
}

function llenarFormularioDesdeProducto(producto) {
    document.getElementById('code_producto').value = producto.code || '';
    document.getElementById('categoria_producto').value = producto.category || '';
    document.getElementById('modelo_producto').value = producto.model || '';
    document.getElementById('size_producto').value = producto.size || '';
    document.getElementById('decoracion_producto').value = producto.decoration || '';
    document.getElementById('color_producto').value = producto.color || '';
    document.getElementById('precio_producto').value = producto.price || '';
    document.getElementById('disponibles_producto').value = producto.stock_disponible ?? '';
    
    document.getElementById('cantidad').value = '';
    document.getElementById("search-input").value = '';
}

document.getElementById("clean-create").addEventListener("click", async () => {
    await limpiarFormularioProducto();
});

async function limpiarFormularioProducto() {
    document.getElementById('code_producto').value = '';
    document.getElementById('categoria_producto').value = '';
    document.getElementById('modelo_producto').value = '';
    document.getElementById('size_producto').value = '';
    document.getElementById('decoracion_producto').value = '';
    document.getElementById('color_producto').value = '';
    document.getElementById('precio_producto').value = '';
    document.getElementById('disponibles_producto').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById("search-input").value = '';
}


document.getElementById("save-create").addEventListener("click", async () => {
    await agregarProductoCarrito();
});

async function agregarProductoCarrito() {

    await validacionesProducto();

    const codigo = parseInt(document.getElementById("code_producto").value, 10);
    const categoria = document.getElementById("categoria_producto").value;
    const modelo = document.getElementById("modelo_producto").value;
    const size = document.getElementById("size_producto").value;
    const decoracion = document.getElementById("decoracion_producto").value;
    const color = document.getElementById("color_producto").value;
    const precio = parseFloat(document.getElementById("precio_producto").value) || 0;
    const cantidad = parseInt(document.getElementById("cantidad").value, 10);

    if (isNaN(codigo) || codigo <= 0) {
        showToast("Código de producto inválido. Debe ser un número mayor a 0.", ICONOS.error);
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        showToast("El precio debe ser un número válido mayor a 0.", ICONOS.error);
        return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        showToast("La cantidad debe ser un número entero mayor a 0.", ICONOS.error);
        return;
    }

    const descripcion = `${categoria} TAM.${size} MOD.${modelo} DECOR. ${decoracion} COLOR ${color}`;
    const importe = precio * cantidad;

    const tbody = document.getElementById("carrito");

    const fila = document.createElement("tr");
    fila.setAttribute("data-code", codigo);

    fila.innerHTML = `
        <td>${codigo}</td>
        <td>${descripcion}</td>
        <td>$${precio.toFixed(2)}</td>
        <td>
            <input type="number" value="${cantidad}" min="1" step="1" class="input-cantidad">
        </td>
        <td class="importe">$${importe.toFixed(2)}</td>
        <td><button class="btn-quitar">🗑️ Quitar</button></td>
    `;

    fila.querySelector(".input-cantidad").addEventListener("input", async function () {
        const nuevaCantidad = parseInt(this.value) || 0;
        const nuevoImporte = nuevaCantidad * precio;
        fila.querySelector(".importe").textContent = `$${nuevoImporte.toFixed(2)}`;
        actualizarMontoTotal();
        await addOrUpdateCart({codigo, categoria, size, modelo, decoracion, color, precio, cantidad: nuevaCantidad, importe: nuevoImporte});
        //console.warn(carrito);
    });

    fila.querySelector(".btn-quitar").addEventListener("click", async function () {
        const confirmed = await showConfirmDialog(
            `¿Desea quitar el producto "${descripcion}" de la venta?`,
            "Quitar producto de VENTA"
        );

        if (confirmed) {
            fila.remove();
            actualizarMontoTotal();
            await removeFromCart(codigo);
            //console.warn(carrito);
            showToast("Se quito un producto de la venta.", ICONOS.advertencia);
        }
    });

    tbody.appendChild(fila);
    actualizarMontoTotal();

    document.getElementById("clean-create").click();
    document.getElementById("create-dialog-s").close();
    showToast("Se agrego un producto a la venta.", ICONOS.info);

    await addOrUpdateCart({codigo, categoria, size, modelo, decoracion, color, precio, cantidad, importe});
    //console.warn(carrito);
}

async function validacionesProducto() {
    const contenedorId = "create-content";
    const modal = document.getElementById(contenedorId);

    const getNumber = (selector) => {
        const input = modal.querySelector(selector);
        return input ? parseInt(input.value.trim(), 10) : NaN;
    };

    const getValue = (selector) => {
        const input = modal.querySelector(selector);
        return input ? input.value.trim() : "";
    };

    const code_producto = getNumber("#code_producto");
    if (isNaN(code_producto) || code_producto <= 0) {
        showToast("Debe ingresar un código de producto válido.", ICONOS.advertencia);
        return Promise.reject(new Error("ID de producto inválido."));
    }

    const categoria = getValue("#categoria_producto");
    if (!categoria) {
        showToast("Debe seleccionar una categoría.", ICONOS.advertencia);
        return Promise.reject(new Error("Categoría vacía."));
    }

    const modelo = getValue("#modelo_producto");
    if (!modelo) {
        showToast("Debe ingresar un modelo de producto válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Modelo vacio."));
    }

    const tamano = getValue("#size_producto");
    if (!tamano) {
        showToast("Debe seleccionar un tamaño.", ICONOS.advertencia);
        return Promise.reject(new Error("Tamaño vacío."));
    }

    const decoracion = getValue("#decoracion_producto");
    if (!decoracion) {
        showToast("Debe ingresar una decoración de producto válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Decoración vacía."));
    }

    const color = getValue("#color_producto");
    if (!color) {
        showToast("Debe ingresar un color de producto válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Color vacío."));
    }

    const precio = getNumber("#precio_producto");
    if (isNaN(precio) || precio <= 0) {
        showToast("Debe ingresar un precio unitario para el producto válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Precio producto inválido."));
    }

    const stock_disponible = getNumber("#disponibles_producto");
    if (isNaN(stock_disponible) || stock_disponible < 0) {
        showToast("Debe ingresar una cantidad de stock disponible válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Stock disponible producto inválido."));
    }

    const cantidad = getNumber("#cantidad");
    if (isNaN(cantidad) || cantidad <= 0) {
        showToast("Debe ingresar una cantidad válida para el pedido.", ICONOS.advertencia);
        return Promise.reject(new Error("Cantidad de pedido de producto inválido."));
    }

    return Promise.resolve();
}

/*--------------------------------------CAMPOS DE MONTO, PAGO Y CAMBIO------------------------------------------- */

function actualizarMontoTotal() {
    const importes = document.querySelectorAll(".importe");
    let total = 0;

    importes.forEach(el => {
        const valor = parseFloat(el.textContent.replace("$", "")) || 0;
        total += valor;
    });

    document.getElementById("pos_monto").value = total.toFixed(2);
    actualizarCambio();
}


function actualizarCambio() {
    const monto = parseFloat(document.getElementById("pos_monto").value) || 0;
    const pago = parseFloat(document.getElementById("pos_pago").value) || 0;

    const cambio = pago - monto;
    document.getElementById("pos_cambio").value = cambio >= 0 ? cambio.toFixed(2) : "0.00";
}

document.getElementById("pos_pago").addEventListener("input", actualizarCambio);

/*--------------------------------------ACCIONES------------------------------------------- */

async function cleanCarrito() {
    const confirmed = await showConfirmDialog(
        `¿Desea mover limpiar todos los datos de la venta? ESTA ACCION ES IRREVERSIBLE`,
        "Cancelar venta"
    );

    if (confirmed) {
        showToast(`Venta cancelada. Que tenga buen día.`, ICONOS.advertencia);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        showToast("Acción LIMPIAR VENTA cancelada", ICONOS.error);
    }
}

function formatearFechaLarga(fecha) {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia}-${mes}-${año}`;
}

function formatearHora(fecha) {
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    const minutosFormat = minutos.toString().padStart(2, '0');
    return `${horas}:${minutosFormat} ${ampm}`;
}

/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */
async function usarStock(fuente, clave, nombreFuente, faltan) {
    let payload;

    if (fuente && fuente[clave] > 0) {
        const original = fuente[clave];
        const usado = Math.min(faltan, original);
        const restante = original - usado;
        faltan -= usado;

        console.log(`\x1b[32m[${nombreFuente}] ✅ Stock disponible: ${original}\x1b[0m`);
        console.log(`\x1b[33m[${nombreFuente}] ➖ Se usaron: ${usado}\x1b[0m`);
        console.log(`\x1b[33m[${nombreFuente}] 📦 Queda restante: ${restante}\x1b[0m`);
        console.log(`\x1b[33m[${nombreFuente}] ⚠️ Faltan por cubrir: ${faltan}\x1b[0m`);

    } else if (faltan > 0) {
        if (!fuente) {
            console.log(`\x1b[31m[${nombreFuente}] ❌ No existe.\x1b[0m`);
            switch (nombreFuente) {
                case "PRODUCTO":
                    console.log(`\x1b[33m[${nombreFuente}] ➕ Se creará un nuevo registro de PRODUCTO.\x1b[0m`);
                    // await createProducto();
                    break;
                case "BIZCOCHO":
                    console.log(`\x1b[33m[${nombreFuente}] ➕ Se creará un nuevo registro de BIZCOCHO.\x1b[0m`);
                    // await createBizcocho();
                    break;
                case "ORDEN PRODUCTO":
                case "ORDEN BIZCOCHO":
                default:
                    console.log(`\x1b[33m[${nombreFuente}] ℹ️ No se requiere crear nada.\x1b[0m`);
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
            await createOrden(faltan, productoEsperado);
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

async function validacionesVenta() {
    const carrito = document.querySelector("#carrito");
    
    if (!carrito || carrito.rows.length === 0) {
        showToast("Debe agregar al menos un producto para realizar la venta.", ICONOS.advertencia);
        return Promise.reject(new Error("El carrito está vacío."));
    }

    const getNumber = (selector) => {
        const input = document.querySelector(selector);
        return input ? parseInt(input.value.trim(), 10) : NaN;
    };

    const getValue = (selector) => {
        const input = document.querySelector(selector);
        return input ? input.value.trim() : "";
    };

    const id_venta = getNumber("#pos_id_venta");
    if (isNaN(id_venta) || id_venta <= 0) {
        showToast("Falta ingresar un número de venta válido.", ICONOS.advertencia);
        return Promise.reject(new Error("Número de venta inválido."));
    }
    
    const fecha_entregaN = getValue("#pos_fecha_entrega");
    if (!fecha_entregaN) {
        showToast("Falta ingresar la fecha de entrega.", ICONOS.advertencia);
        return Promise.reject(new Error("Fecha de entrega inválida."));
    }

    const forma_pago = getValue("#pos_forma_pago");
    if (!forma_pago) {
        showToast("Falta seleccionar una forma de pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Forma de pago inválido."));
    }

    const metodo_pago = getValue("#pos_metodo_pago");
    if (!metodo_pago) {
        showToast("Falta seleccionar una método de pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Método de pago inválido."));
    }

    const pago = getNumber("#pos_pago");
    if (isNaN(pago) || pago <= 0) {
        showToast("Falta ingresar una cantidad de pago.", ICONOS.advertencia);
        return Promise.reject(new Error("Cantidad de pago inválido."));
    }

    const monto = getNumber("#pos_monto");
    if (isNaN(monto) || monto <= 0) {
        showToast("Error interno: monto no calculado.", ICONOS.error);
        return Promise.reject(new Error("Monto inválido."));
    }
    
    const nombre = getValue("#pos_nombre");
    const telefono = getValue("#pos_telefono");
    const correo = getValue("#pos_correo");
    const domicilio = getValue("#pos_domicilio");

    //return Promise.resolve();

    const now = new Date();
    const fecha_venta = formatearFechaLarga(now);
    const hora = formatearHora(now);
    const fecha_entrega = formatearFechaLarga(new Date(fecha_entregaN));

    return {
        id_venta,
        fecha_venta,
        hora,
        nombre,
        telefono,
        correo,
        domicilio,
        fecha_entrega,
        metodo_pago,
        forma_pago,
        monto,
        pago
    };
}

/*--------------------------------------DIALOGOS------------------------------------------- */

function showConfirmDialog(message = "¿Estás seguro?", title = "Confirmar acción") {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        titleEl.textContent = title;
        messageEl.textContent = message;

        yesBtn.onclick = () => {
            dialog.close();
            resolve(true);
        };

        noBtn.onclick = () => {
            dialog.close();
            resolve(false);
        };

        dialog.showModal();
    });
}

function cerrarDialogo(dialogId, dialogContent, mensaje) {
    document.getElementById(dialogId).close();
    document.getElementById(dialogContent).innerHTML = '';
    showToast(mensaje, ICONOS.info);
}

document.getElementById("close-dialog-create").addEventListener("click", () =>
    cerrarDialogo("create-dialog-s", "create-content", "Agregación cancelada"));