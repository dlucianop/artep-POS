/*
let productos = [];
let bizcochos = [];
//let ventaData = [];
let carrito = [];
const resultsContainer = document.getElementById("search-results");
const inputSearch = document.getElementById("product-by-search");
*/

/*
function revisarAlmacen() {
    return new Promise((resolve, reject) => {
        readProductos((err, data) => {
            if (err) {
                console.log(`Error al leer el inventario de Productos: ${err}`);
                reject(err);
            } else {
                productos = data;
                resolve();
            }
        });
    });
}

function revisarAlmacenBiz() {
    return new Promise((resolve, reject) => {
        readBizcochos((err, data) => {
            if (err) {
                console.log(`Error al leer el inventario de Bizcochos: ${err}`);
                reject(err);
            } else {
                bizcochos = data;
                resolve();
            }
        });
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
*/
/*-----------------------------ARREGLOS------------------------------------------------------------------------ */
/*
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
*/
/*----------------------------------------------------------------------------------------------------------- */
/*
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
        <td>
            <input id="cantidad_${code}" class="cantidad-venta-input" type="number" min="1" value="${parseInt(form_pedido)}"
                onchange="actualizarTotal('${code}', ${parseFloat(form_productPrice).toFixed(2)})">
        </td>
        <td id="total_${code}">${(parseFloat(form_productPrice).toFixed(2) * parseInt(form_pedido)).toFixed(2)}</td>
        <td class="col-btn">
            <button type="button" onclick="eliminarProdCarrito(${code})">🗑️ Eliminar</button>
        </td>
    `;

    tableBody.appendChild(newRow);
    agregarProducto(parseInt(code), form_productCategory, form_productModel, form_productSize, form_productDecoration, form_productColor, parseFloat(form_productPrice), parseInt(form_stockDisponible), parseInt(form_pedido));
    closeModal('addProductModal');
    showToast("Producto agregado a la venta.", ICONOS.exito);
    totalVenta();
}

function eliminarProdCarrito(id) {
    showConfirmToast(`¿Eliminar producto #${id} del carrito?`, (confirmed) => {
        if (!confirmed) return;

        const row = Array.from(document.querySelectorAll('#table-products tr')).find(tr => {
            return tr.children[0].textContent == id;
        });
        if (row) row.remove();

        const index = carrito.findIndex(p => p.codigo === parseInt(id));
        if (index !== -1) carrito.splice(index, 1);

        totalVenta();
        showToast("Producto eliminado del carrito.", ICONOS.info);
    });
}


function actualizarTotal(code, precio) {
    const input = document.getElementById(`cantidad_${code}`);
    const cantidad = parseInt(input.value) || 0;

    const totalCell = document.getElementById(`total_${code}`);
    totalCell.textContent = (precio * cantidad).toFixed(2);

    const productoEnCarrito = carrito.find(p => p.codigo === parseInt(code));
    if (productoEnCarrito) {
        productoEnCarrito.pedido = cantidad;
    }

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

function cancelarVenta() {
    showConfirmToast("¿Desea limpiar la pantalla de venta?", (confirmed) => {
        if (!confirmed) return;

        showToast("Venta limpiada 😄", ICONOS.info);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}


async function imprimirRecibo() {
    const emptyRow = document.getElementById("rowvoid");
    if (emptyRow) {
        showToast("No hay productos en el carrito.", ICONOS.advertencia);
        return;
    }

    try {
        await validacionesVenta();
        await revisarAlmacen();
        await revisarAlmacenBiz();

        const codigos = productos.map(item => item.code);
        const get     = (id, def = "") => document.getElementById(id).value.trim() || def;
        const getNum  = (id, def = 0) => parseFloat(get(id, def)) || def;

        const ventaActual = {
            idVenta:       parseInt(get('id-sale', "999999999"), 10) || 999999999,
            fecha_venta:   get('sale-date'),
            hora:          get('sale-hour'),
            nombre:        get('client-name', "-----"),
            telefono:      get('client-phone', "-----"),
            correo:        get('client-mail', "-----"),
            domicilio:     get('client-address', "-----"),
            fecha_entrega: get('sale-entrega', "-----"),
            metodo_pago:   get('payment-method', "-----"),
            forma_pago:    get('payment-form', "-----"),
            monto:         getNum('monto'),
            pago:          getNum('pago')
        };

        await new Promise((res, rej) =>
            createVenta({
                id_ventaV:      ventaActual.idVenta,
                fecha_ventaV:   ventaActual.fecha_venta,
                horaV:          ventaActual.hora,
                nombreV:        ventaActual.nombre,
                telefonoV:      ventaActual.telefono,
                correoV:        ventaActual.correo,
                domicilioV:     ventaActual.domicilio,
                fecha_entregaV: ventaActual.fecha_entrega,
                metodo_pagoV:   ventaActual.metodo_pago,
                forma_pagoV:    ventaActual.forma_pago,
                montoV:         ventaActual.monto,
                pagoV:          ventaActual.pago
            }, (err, data) => err ? rej(err) : res(data))
        );

        for (const prodcar of carrito) {
            const codigo    = parseInt(prodcar.codigo, 10);
            const pedido    = parseInt(prodcar.pedido, 10);
            const precio    = parseFloat(prodcar.precio);
            const categoria = prodcar.categoria;
            const size      = prodcar.size;

            await new Promise((res, rej) =>
                createVentaDETALLES({
                    id_ventaVD:   ventaActual.idVenta,
                    codeVD:       codigo,
                    priceVD:      precio,
                    quantityVD:   pedido,
                    importeVD:    precio * pedido
                }, (err) => err ? rej(err) : res())
            );

            if (codigos.includes(codigo)) {
                const producto = await new Promise((res, rej) =>
                    readOneProduct(codigo, (err, data) => {
                        if (err) return rej(err);
                        if (!data) return rej(new Error("Producto no encontrado"));
                        res(data);
                    })
                );

                let dispoP = parseInt(producto.stock_disponible, 10);
                let apartP = parseInt(producto.stock_apartado, 10);
                let procP  = parseInt(producto.stock_en_proceso, 10);

                const usadoP      = Math.min(dispoP, pedido);
                const faltaProd   = pedido - usadoP;
                dispoP -= usadoP;
                apartP += usadoP;
                procP  += faltaProd;

                await new Promise((res, rej) =>
                    updateProducto({
                        price:              producto.price,
                        stock_apartado:     apartP,
                        stock_disponible:   dispoP,
                        stock_en_proceso:   procP,
                        code:               producto.code
                    }, (err) => err ? rej(err) : res())
                );

                if (faltaProd > 0) {
                    const bizEntry = bizcochos.find(b => b.biz_category === categoria && b.biz_size === size);
                    if (bizEntry) {
                        const bizco = await new Promise((res, rej) => {
                            searchBizcocho(
                                categoria,
                                size,
                                (err, data) => {
                                    if (err) return rej(err);
                                    res(data || null);
                                }
                            );
                        });

                        let dispoB = parseInt(bizco.stock_disponible, 10);
                        let apartB = parseInt(bizco.stock_apartado, 10);
                        let procB  = parseInt(bizco.stock_en_proceso, 10);

                        const usadoB    = Math.min(dispoB, faltaProd);
                        const faltaBiz  = faltaProd - usadoB;
                        dispoB -= usadoB;
                        apartB += usadoB;
                        procB  += faltaBiz;

                        await new Promise((res, rej) =>
                            updateBizcocho({
                                stock_apartado: apartB,
                                stock_disponible: dispoB, 
                                stock_en_proceso: procB, 
                                biz_category: bizco.biz_category,
                                biz_size: bizco.biz_size,
                            }, (err) => err ? rej(err) : res())
                        );

                        if (faltaBiz > 0) {
                            await new Promise((res, rej) =>
                                createOrden({
                                    id_ventaO:         ventaActual.idVenta,
                                    id_origenO:        1, // ID correcto para 'Venta'
                                    fecha_entregaO:    ventaActual.fecha_entrega,
                                    categoriaO:        categoria,
                                    sizeO:             size,
                                    cantidad_inicialO: faltaBiz
                                }, (err) => err ? rej(err) : res())
                            );
                        }

                    } else {
                        await new Promise((res, rej) =>
                            createBizcocho({
                                biz_category:       categoria,
                                biz_size:           size,
                                stock_apartado: 0,
                                stock_disponible:0,
                                stock_en_proceso:faltaProd,
                            }, (err) => err ? rej(err) : res())
                        );
                        await new Promise((res, rej) =>
                            createOrden({
                                id_ventaO:         ventaActual.idVenta,
                                id_origenO:        1, // ID correcto
                                fecha_entregaO:    ventaActual.fecha_entrega,
                                categoriaO:        categoria,
                                sizeO:             size,
                                cantidad_inicialO: faltaProd
                            }, (err) => err ? rej(err) : res())
                        );
                    }
                }

            } else {
                await new Promise((res, rej) =>
                    createProducto({
                        code:               codigo,
                        category:           prodcar.categoria,
                        model:              prodcar.modelo,
                        size:               prodcar.size,
                        decoration:         prodcar.decoracion,
                        color:              prodcar.color,
                        price:              precio,
                        stock_apartado:     0,
                        stock_disponible:   0,
                        stock_en_proceso:   pedido
                    }, (err) => err ? rej(err) : res())
                );

                const bizEntry = bizcochos.find(b => b.biz_category === categoria && b.biz_size === size);
                if (bizEntry) {
                    const bizco = await new Promise((res, rej) => {
                        searchBizcocho(
                            categoria,
                            size,
                            (err, data) => {
                                if (err) return rej(err);
                                res(data || null);
                            }
                        );
                    });
                    let dispoB = parseInt(bizco.stock_disponible, 10);
                    let apartB = parseInt(bizco.stock_apartado, 10);
                    let procB  = parseInt(bizco.stock_en_proceso, 10);

                    if (dispoB >= pedido) {
                        dispoB -= pedido;
                        apartB += pedido;
                    } else {
                        const faltaBiz = pedido - dispoB;
                        apartB += dispoB;
                        procB  += faltaBiz;
                        dispoB = 0;
                    }

                    await new Promise((res, rej) =>
                        updateBizcocho({
                            stock_apartado: apartB,
                            stock_disponible: dispoB, 
                            stock_en_proceso: procB, 
                            biz_category: bizco.biz_category,
                            biz_size: bizco.biz_size,
                        }, (err) => err ? rej(err) : res())
                    );

                    if (procB > 0) {
                        await new Promise((res, rej) =>
                            createOrden({
                                id_ventaO:         ventaActual.idVenta,
                                id_origenO:        1,
                                fecha_entregaO:    ventaActual.fecha_entrega,
                                categoriaO:        categoria,
                                sizeO:             size,
                                cantidad_inicialO: procB
                            }, (err) => err ? rej(err) : res())
                        );
                    }

                } else {
                    await new Promise((res, rej) =>
                        createBizcocho({
                            biz_category:      categoria,
                            biz_size:          size,
                            stock_apartado: 0,
                            stock_disponible: 0,
                            stock_en_proceso: pedido
                        }, (err) => err ? rej(err) : res())
                    );
                    await new Promise((res, rej) =>
                        createOrden({
                            id_ventaO:         ventaActual.idVenta,
                            id_origenO:        1,
                            fecha_entregaO:    ventaActual.fecha_entrega,
                            categoriaO:        categoria,
                            sizeO:             size,
                            cantidad_inicialO: pedido
                        }, (err) => err ? rej(err) : res())
                    );
                }
            }
        }

        try {
            const detalles_venta = await new Promise((res, rej) =>
                readVentasDetalle({ id_ventaVD: ventaActual.idVenta }, (err, data) => err ? rej(err) : res(data))
            );
            await generarRecibos({ venta_datos: detalles_venta });
            showToast("Venta y recibo procesados exitosamente.", ICONOS.exito);
            if (typeof window !== "undefined") {
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            showToast("Hubo un error al generar el recibo.", ICONOS.error);
            console.error("Error al generar recibo:", error);
        }
        

    } catch (error) {
        console.log(`Error: ${error}`);
    }
}*/