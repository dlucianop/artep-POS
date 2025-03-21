const { group } = require('console');
const { join } = require('path');
const { text } = require('stream/consumers');
const crudP = join(__dirname, '..', 'js', 'crud-productos.js');
const crudV = join(__dirname, "..", "js", "crud-ventas.js");
const toast = join(__dirname, "..", "js", "toast.js");
const { createProducto, readProductos, updateProducto, deleteProducto } = require(crudP);
const { createVenta, readVentas, updateVenta, deleteVenta, createVentaDETALLES, readVentasDetalle, updateVentaDetalle, deleteVentaDetalle } = require(crudV);
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
                    document.getElementById("productStock").value = `${producto.stock}`;
                    document.getElementById("productQuantity").value = 1;
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

/*----------------------------------------------------------------------------------------------------------- */

function agregarProductoCarrito() {
    inputSearch.focus();
    let code = document.getElementById("productCode").value;
    const tableBody = document.querySelector("#table-products tbody");
    const existingRow = Array.from(tableBody.rows).find(row => row.cells[0].textContent === code);

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
    let form_productStock = document.getElementById("productStock").value;
    let form_productQuantity = document.getElementById("productQuantity").value;

    if (!code || !form_productCategory || !form_productPrice || !form_productQuantity || !form_productModel || !form_productSize || !form_productDecoration || !form_productColor) {
        showToast("Por favor, complete todos los campos antes de agregar el producto.", ICONOS.advertencia);
        return;
    } else{
        if(parseFloat(form_productPrice) <= 0 || parseInt(form_productStock) <= 0 || parseInt(form_productQuantity) < 0) {
            showToast("Por favor, introduzca valores validos.", ICONOS.advertencia);
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
        <td>${parseInt(form_productQuantity)}</td>
        <td>${(parseFloat(form_productPrice).toFixed(2) * parseInt(form_productQuantity)).toFixed(2)}</td>
    `;

    tableBody.appendChild(newRow);
    agregarProducto(parseInt(code), form_productCategory, form_productModel, form_productSize, form_productDecoration, form_productColor, parseFloat(form_productPrice), parseInt(form_productStock), parseInt(form_productQuantity));
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