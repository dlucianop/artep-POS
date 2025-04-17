const { constants } = require('buffer');
const { group } = require('console');
const { join } = require('path');
const { text } = require('stream/consumers');
const { parseArgs } = require('util');
const crudP = join(__dirname, '..', 'js', 'crud-productos.js');
const crudV = join(__dirname, "..", "js", "crud-ventas.js");
const crudB = join(__dirname, "..", "js", "crud_bizcochos.js");
const toast = join(__dirname, "..", "js", "toast.js");
const { createBizcocho, readBizcochos, updateBizcocho, searchBizcocho } = require(crudB);
const { createProducto, readProductos, updateProducto, readOneProduct } = require(crudP);
const { createVenta, readVentas, createVentaDETALLES } = require(crudV);
const { showToast, ICONOS } = require(toast);

let productos = [];
let bizcochos = [];
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

function revisarAlmacenBiz() {
    readBizcochos((err, data) => {
        if (err){
            console.log(`Error al leer el inventario de Bizcochos: ${err}`);
        } else {
            bizcochos = data
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
    const get = (id, def = "") => document.getElementById(id).value.trim() || def;
    const getNum = (id, def = 0) => parseFloat(get(id, def)) || def;

    const venta = {
        idVenta: parseInt(get('id-sale', "999999999")) || 999999999,
        fecha_venta: get('sale-date'),
        hora: get('sale-hour'),
        nombre: get('client-name', "-----"),
        telefono: get('client-phone', "-----"),
        correo: get('client-mail', "-----"),
        domicilio: get('client-address', "-----"),
        fecha_entrega: get('sale-entrega', "-----"),
        metodo_pago: get('payment-method', "-----"),
        forma_pago: get('payment-form', "-----"),
        monto: getNum("monto"),
        descuento: getNum("monto"),
        pago: getNum("pago"),
        total: getNum("total"),
        cambio: getNum("cambio")
    };

    createVenta({
        id_ventaV: venta.idVenta,
        fecha_ventaV: venta.fecha_venta,
        horaV: venta.hora,
        nombreV: venta.nombre,
        telefonoV: venta.telefono,
        correoV: venta.correo,
        domicilioV: venta.domicilio,
        fecha_entregaV: venta.fecha_entrega,
        metodo_pagoV: venta.metodo_pago,
        forma_pagoV: venta.forma_pago,
        montoV: venta.monto,
        pagoV: venta.pago
    }, (err) => {
        if (err) {
           // showToast(`Error creación de venta: ${err}`, ICONOS.error);
        } else {
            ventaData.length = 0;
            console.log(`Venta creada con éxito: ${venta.idVenta}`);
            ventaData.push(venta);
        }
    });

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

function validacionesVenta() {
    return new Promise((resolve, reject) => {
        let idVenta = parseInt(document.getElementById('id-sale').value.trim());
        let metodo_pago = document.getElementById('payment-method').value;
        let forma_pago = document.getElementById('payment-form').value;
        let pago = parseFloat(document.getElementById("pago").value);
        let fechaEntrega = document.getElementById('sale-entrega').value;

        if (!idVenta) {
            showToast("Falta poner el número de venta.", ICONOS.advertencia);
            return reject();
        }

        readVentas((err, data) => {
            if (err) {
                showToast(`Error al leer inventario: ${err}`, ICONOS.error);
                return reject();
            }

            if (data.some(venta => parseInt(venta.id_venta) === idVenta)) {
                showToast("Ya existe venta con el mismo número, intente con otro.", ICONOS.error);
                return reject();
            }

            if (!metodo_pago) {
                showToast("Falta agregar un método de pago.", ICONOS.advertencia);
                return reject();
            }

            if (!forma_pago) {
                showToast("Falta agregar una forma de pago.", ICONOS.advertencia);
                return reject();
            }

            if (!pago) {
                showToast("Falta poner una cantidad en pago.", ICONOS.advertencia);
                return reject();
            }

            if (!fechaEntrega) {
                showToast("Falta poner una fecha de entrega.", ICONOS.advertencia);
                return reject();
            }

            resolve();
        });
    });
}


async function imprimirRecibo() {
    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return;
    }

    try {
        //await validacionesVenta();
        revisarAlmacen();
        revisarAlmacenBiz();
        
        const codigos = productos.map(item => item.code);
        carrito.forEach(prodcar => {
            const codigoProducto = parseInt(prodcar.codigo);
            const pedido = prodcar.pedido;
            const categoriaProducto = prodcar.categoria;
            const tamañoProducto = prodcar.size;
            if (codigos.includes(codigoProducto)) {
                readOneProduct({ codeOne: codigoProducto }, (err, data) => {
                    if (err) {
                        showToast(`Error lectura: ${err}`, ICONOS.error);
                        return;
                    }

                    let productoFound = data[0];
                    if ( productoFound.stock_disponible < pedido){
                        /*bizcochos.forEach(bizco => {
                            console.log(`${bizco.biz_category} y ${categoriaProducto}: `,bizco.biz_category === categoriaProducto);
                            console.log(`${bizco.biz_size} y ${tamañoProducto}:`, bizco.biz_size === tamañoProducto);
                        });*/
                        
                        const yaExiste = bizcochos.some(bizco =>
                            bizco.biz_category === categoriaProducto &&
                            bizco.biz_size === tamañoProducto
                        );
                      
                        if (yaExiste) {
                            //EXISTE PRODUCTO existe BIZCOCHO
                        } else {
                            //EXISTE PRODUCTO no existe BIZCOCHO
                        }
                          
                    } else{
                        //EXISTE PRODUCTO Y HAY STOCK
                    }
                });
            } else {
                const yaExiste = bizcochos.some(item => 
                    item.category === categoriaProducto && item.size === tamañoProducto
                );
                  
                if (yaExiste) {
                    //No existe producto existe BIZCOCHO
                } else {
                    //NO EXISTE PRODUCTO no existe BIZCOCHO
                }
            }
        });

    } catch {
        console.log("Cancelado por validaciones.");
    }
}
