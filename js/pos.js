const { constants } = require('buffer');
const { group } = require('console');
const { join } = require('path');
const { text } = require('stream/consumers');
const crudP = join(__dirname, '..', 'js', 'crud-productos.js');
const crudV = join(__dirname, "..", "js", "crud-ventas.js");
const toast = join(__dirname, "..", "js", "toast.js");
const { createProducto, readProductos, updateProducto, readOneProduct } = require(crudP);
const { createVenta, readVentas, createVentaDETALLES } = require(crudV);
const { showToast, ICONOS } = require(toast);

let productos = [];
let ventaData = [];
let carrito = [];
const resultsContainer = document.getElementById("search-results");
const inputSearch = document.getElementById("product-by-search");

function revisarAlmacen() {
    readProductos((err, data) => {
        if (err){
            console.log(`Error al leer el inventario de Productos: ${err}`);
        } else {
            productos = data
        }
    });
}

function filtrarProductos(listaproductos, textoS) {
    let busqueda = textoS.toLowerCase();

    return listaproductos.filter(producto => {
        return(
            producto.category.toLowerCase().includes(busqueda) ||
            producto.model.toLowerCase().includes(busqueda) ||
            producto.size.toLowerCase().includes(busqueda) ||
            producto.decoration.toLowerCase().includes(busqueda)  ||
            producto.color.toLowerCase().includes(busqueda)
        );
    });
}

function renderResults(filteredProducts) {
    resultsContainer.innerHTML = "";

    switch(filteredProducts.length) {
        case 0:
            resultsContainer.innerHTML = "<p>No se encontraron coincidencias.</p>";
            resultsContainer.style.display = "block";
            return;
        default: {
            let ul = document.createElement("ul");

            filteredProducts.forEach(producto => {
                let li = document.createElement('li');
                li.textContent = `${producto.code} - ${producto.category} Modelo ${producto.model} [${producto.size}] Decoracion ${producto.decoration} | Color ${producto.color}`;
    
                li.addEventListener('click', () => {
                    inputSearch.value = "";
                    inputSearch.focus();
                    resultsContainer.style.display = "none";
                    document.getElementById("productCode").value = `${producto.code}`;
                    document.getElementById("productCategory").value = `${producto.category}`;
                    document.getElementById("productModel").value = `${producto.model}`;
                    document.getElementById("productSize").value = `${producto.size}`;
                    document.getElementById("productDecoration").value = `${producto.decoration}`;
                    document.getElementById("productColor").value = `${producto.color}`;
                    document.getElementById("productPrice").value = `${producto.price}`;

                    document.getElementById("product-stock-disponible").value = `${producto.stock_disponible}`;
                    document.getElementById("product-stock-pedido").value = 1;
                });
                ul.appendChild(li);
            });
            resultsContainer.appendChild(ul);
            resultsContainer.style.display = "block";
        }
    }
}

inputSearch.addEventListener("input", (e) => {
    const texto = e.target.value;
    switch (texto.trim()) {
        case "":
            resultsContainer.style.display = "none";
            resultsContainer.innerHTML = "";
            break;
        default:
            const productosFiltrados = filtrarProductos(productos, texto);
            renderResults(productosFiltrados);
            break;
    }
});

/*-----------------------------ARREGLOS------------------------------------------------------------------------ */

function agregarProducto(codigo, categoria, modelo, size, decoracion, color, precio, stock, pedido) {
    let producto_car = {
        codigo: codigo,
        categoria: categoria,
        modelo: modelo,
        size: size,
        decoracion: decoracion,
        color: color,
        precio: precio,
        stock: stock,
        pedido: pedido
    };
    
    carrito.push(producto_car);
  }
  
function eliminarProducto(codigo, categoria, modelo, size) {
    carrito = carrito.filter(producto => 
        !(producto.codigo === codigo && 
          producto.categoria === categoria && 
          producto.modelo === modelo && 
          producto.size === size)
    );
}

function encapsularVenta() {
    ventaData.length = 0;

    let idVenta = parseInt(document.getElementById('id-sale').value.trim()) || 999999999;
    let fecha_venta = document.getElementById('sale-date').value;
    let hora = document.getElementById('sale-hour').value;
    let nombre = document.getElementById('client-name').value || "-----";
    let telefono = document.getElementById('client-phone').value || "-----";
    let correo  = document.getElementById('client-mail').value || "-----";
    let domicilio = document.getElementById('client-address').value || "-----";
    let fecha_entrega = document.getElementById('sale-entrega').value || "-----";
    let metodo_pago = document.getElementById('payment-method').value || "-----";
    let forma_pago = document.getElementById('payment-form').value || "-----";

    let monto = parseFloat(document.getElementById("monto").value) || 0;
    let descuento = parseFloat(document.getElementById("monto").value) || 0;
    let pago = parseFloat(document.getElementById("pago").value) || 0;
    let total = parseFloat(document.getElementById("total").value) || 0;
    let cambio = parseFloat(document.getElementById("cambio").value) || 0;

    let venta = {
        idVenta: idVenta,
        fecha_venta: fecha_venta,
        hora: hora,
        nombre: nombre,
        telefono: telefono,
        correo: correo,
        domicilio: domicilio,
        fecha_entrega: fecha_entrega,
        metodo_pago: metodo_pago,
        forma_pago: forma_pago,
        monto: monto,
        descuento: descuento,
        pago: pago,
        total: total,
        cambio: cambio
    }

    ventaData.push(venta);
}

/*----------------------------------------------------------------------------------------------------------- */

function agregarProductoCarrito() {
    inputSearch.focus();
    let code = document.getElementById("productCode").value;
    const tableBody = document.querySelector("#table-products tbody");
    const existingRow = Array.from(tableBody.rows).find(row => row.cells[0].textContent === code);

    if (!code) {
        showToast("Debes ingresar un código de producto.", ICONOS.error);
        return;
    }

    if (existingRow) {
        showToast("El producto ya está en el carrito.", ICONOS.advertencia);
        return;
    }

    let form_productCategory = document.getElementById("productCategory").value;
    let form_productModel = document.getElementById("productModel").value;
    let form_productSize = document.getElementById("productSize").value;
    let form_productDecoration = document.getElementById("productDecoration").value;
    let form_productColor = document.getElementById("productColor").value;
    let form_productPrice = document.getElementById("productPrice").value;
    
    let form_stockDisponible = document.getElementById("product-stock-disponible").value;
    let form_pedido = document.getElementById("product-stock-pedido").value || 1;

    if (!code || !form_productCategory || !form_productPrice || !form_stockDisponible || !form_productModel || !form_productSize || !form_productDecoration || !form_productColor) {
        showToast("Por favor, complete todos los campos antes de agregar el producto.", ICONOS.advertencia);
        return;
    } else {
        if (parseFloat(form_productPrice) <= 0) {
            showToast("El precio debe ser mayor a $0.", ICONOS.advertencia);
            return;
        }
        if (parseInt(form_stockDisponible) < 0) {
            showToast("El stock disponible no puede ser negativo. Puede dejarlo en 0 (cero).", ICONOS.advertencia);
            return;
        }
        if (parseInt(form_pedido) < 1) {
            showToast("El pedido debe tener al menos 1 producto.", ICONOS.advertencia);
            return;
        }
    }

    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        emptyRow.remove();
    }

    let newRow = document.createElement("tr");
    let form_productName = `${form_productCategory} Modelo ${form_productModel} [${form_productSize}] Decoracion ${form_productDecoration} | Color ${form_productColor}`;
    newRow.innerHTML = `
        <td>${code}</td>
        <td>${form_productName}</td>
        <td>${parseFloat(form_productPrice).toFixed(2)}</td>
        <td>${parseInt(form_pedido)}</td>
        <td>${(parseFloat(form_productPrice).toFixed(2) * parseInt(form_pedido)).toFixed(2)}</td>
    `;

    tableBody.appendChild(newRow);
    agregarProducto(parseInt(code), form_productCategory, form_productModel, form_productSize, form_productDecoration, form_productColor, parseFloat(form_productPrice), parseInt(form_stockDisponible), parseInt(form_pedido));
    closeModal('addProductModal');
    showToast("Producto agregado a la venta.", ICONOS.exito);
    totalVenta();
}

function totalVenta() {
    const monto = carrito.reduce((acc, prod) => acc + (prod.precio * prod.pedido), 0);
    const porcDesc = parseFloat(document.getElementById("porcentaje-descuento").value) || 0;
    const descuento = monto * (porcDesc / 100);
    const total = monto - descuento;
    
    document.getElementById("monto").value = monto.toFixed(2);
    document.getElementById("descuento").value = descuento.toFixed(2);
    document.getElementById("total").value = total.toFixed(2);

    updateCambio();
}
  
function updateCambio() {
    const pago = parseFloat(document.getElementById("pago").value) || 0;
    const total = parseFloat(document.getElementById("total").value) || 0;
    document.getElementById("cambio").value = (pago - total).toFixed(2);
}
  
document.getElementById("porcentaje-descuento").addEventListener("input", totalVenta);
document.getElementById("pago").addEventListener("input", updateCambio);

function imprimirRecibo() {
    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return;
    }

    let idVenta = parseInt(document.getElementById('id-sale').value.trim());
    let metodo_pago = document.getElementById('payment-method').value;
    let forma_pago = document.getElementById('payment-form').value;
    let pago = parseFloat(document.getElementById("pago").value);

    if (!idVenta) {
        showToast("Falta poner el número de venta.", ICONOS.advertencia);
        return;
    }

    readVentas((err, data) => {
        if (err) {
            showToast(`Error al leer inventario: ${err}`, ICONOS.error);
            return;
        }
        
        if (data.some(venta => parseInt(venta.id_venta) === idVenta)) {
            showToast("Ya existe venta con el mismo número, intente con otro.", ICONOS.error);
            return;
        }
    });

    if (!metodo_pago) {
        showToast("Falta agregar un método de pago.", ICONOS.advertencia);
        return;
    }
    
    if (!forma_pago) {
        showToast("Falta agregar una forma de pago.", ICONOS.advertencia);
        return;
    }

    if (!pago) {
        showToast("Falta poner una cantidad en pago.", ICONOS.advertencia);
        return;
    } 

    revisarAlmacen();
    encapsularVenta();
    let id_ventaV = ventaData[0].idVenta;
    let fecha_ventaV = ventaData[0].fecha_venta;
    let horaV = ventaData[0].hora;
    let nombreV = ventaData[0].nombre || "---";
    let telefonoV = ventaData[0].telefono || "---";
    let correoV = ventaData[0].correo || "---";
    let domicilioV = ventaData[0].domicilio || "---";
    let fecha_entregaV = ventaData[0].fecha_entrega;
    let metodo_pagoV = ventaData[0].metodo_pago;
    let forma_pagoV = ventaData[0].forma_pago;
    let montoV = ventaData[0].monto;
    let pagoV = ventaData[0].pago;

    createVenta({id_ventaV, fecha_ventaV, horaV, nombreV, telefonoV, correoV, domicilioV, fecha_entregaV, metodo_pagoV, forma_pagoV, montoV, pagoV}, (err) => {
        if (err){
            showToast(`Error creación de venta: ${err}`, ICONOS.error);
            return;
        } else{
            //showToast(`Venta registrada con exito: ${id_ventaV}`, ICONOS.exito);
        }
    });

    const codigos = productos.map(item => item.code);
    carrito.forEach(prodcar => {
        const codigoProducto = parseInt(prodcar.codigo);
        const pedido = prodcar.pedido;

        if (codigos.includes(codigoProducto)) {
            readOneProduct({ codeOne: codigoProducto }, (err, data) => {
                if (err) {
                    showToast(`Error lectura: ${err}`, ICONOS.error);
                    return;
                }

                const producto = data[0];
                
                let nuevoDisponible = producto.stock_disponible;
                let nuevoApartado = producto.stock_apartado;
                let nuevoProceso = producto.stock_en_proceso;

                if (nuevoDisponible >= pedido) {
                    nuevoDisponible -= pedido;
                    nuevoApartado += pedido;
                } else {
                    const faltante = pedido - nuevoDisponible;
                    nuevoApartado += nuevoDisponible;
                    nuevoProceso += faltante;
                    nuevoDisponible = 0;
                }

                const updateData = {
                    codeE: codigoProducto,
                    stock_disponibleE: nuevoDisponible,
                    stock_apartadoE: nuevoApartado,
                    stock_en_procesoE: nuevoProceso,
                    stock_totalE: nuevoDisponible + nuevoApartado + nuevoProceso,

                    categoryE: producto.category,
                    modelE: producto.model,
                    sizeE: producto.size,
                    decorationE: producto.decoration,
                    colorE: producto.color,
                    priceE: producto.price,
                    stock_minE: producto.stock_min,
                    stock_maxE: producto.stock_max,
                    stock_criticoE: producto.stock_critico
                };

                const createDetalle = {
                    id_ventaVD: id_ventaV,
                    codeVD: codigoProducto,
                    priceVD: producto.price,
                    quantityVD: pedido,
                    importeVD: producto.price * pedido,
                }

                updateProducto(updateData, (err) => {
                    if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                    else console.log(`Stock actualizado: ${codigoProducto}`);
                });

                createVentaDETALLES(createDetalle, (err) => {
                    if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                    else console.log(`Stock actualizado: ${codigoProducto}`);
                });
            });

        } else {
            const newProduct = {
                codeA: codigoProducto,
                categoryA: prodcar.categoria,
                modelA: prodcar.modelo,
                sizeA: prodcar.size,
                decorationA: prodcar.decoracion,
                colorA: prodcar.color,
                priceA: prodcar.precio,
                stock_disponibleA: 0,
                stock_apartadoA: 0,
                stock_en_procesoA: pedido,
                stock_totalA: pedido,
                stock_minA: 0,
                stock_maxA: 0,
                stock_criticoA: 0
            };

            const createDetalle = {
                id_ventaVD: id_ventaV,
                codeVD: codigoProducto,
                priceVD: prodcar.precio,
                quantityVD: pedido,
                importeVD: prodcar.precio * pedido,
            }

            createProducto(newProduct, (err) => {
                if (err) console.error(`Error creación: ${codigoProducto}`, err);
                else {console.log(`Producto creado: ${codigoProducto}`); return};;
            });

            createVentaDETALLES(createDetalle, (err) => {
                if (err) console.error(`Error actualización: ${codigoProducto}`, err);
                else {console.log(`Stock actualizado: ${codigoProducto}`); return;};
            });
        }
    });
    let ruta = generarRecibo();
    /*try {
        showToast(`Se generó el recibo con éxito: ${ruta}`, ICONOS.exito);
    } catch (error) {
        showToast(`Ocurrió un problema: ${error}`, ICONOS.error);
    }*/
}