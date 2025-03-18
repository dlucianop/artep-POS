const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud-productos.js');
const { createProducto, readProductos, updateProducto, deleteProducto } = require(crudJS);
const input = document.getElementById("product-by-search");
const pago = document.getElementById("pago");
const porcentaje_descuento = document.getElementById("porcentaje-descuento");

let productos = [];
let carrito = [];

function revisarAlmacen() {
    readProductos((err, data) => {
        if (err) {
            document.querySelector('#error-message').textContent = `Error al leer inventario: ${err}`;
        } else {
            productos = data;
        }
    });
}

function filtrarProductos(productos, texto) {
    const busqueda = texto.toLowerCase();
  
    return productos.filter(producto => {
      return (
        producto.category.toLowerCase().includes(busqueda) ||
        producto.model.toLowerCase().includes(busqueda)    ||
        producto.size.toLowerCase().includes(busqueda)     ||
        producto.decoration.toLowerCase().includes(busqueda)
      );
    });
}
  
input.addEventListener("input", function(e) {
    const texto = e.target.value;
    const productosFiltrados = filtrarProductos(productos, texto);
  });
  
const resultsContainer = document.getElementById("search-results");

function renderResults(filteredProducts) {
    resultsContainer.innerHTML = "";
    
    if (filteredProducts.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontraron coincidencias.</p>";
        resultsContainer.style.display = "block";
        return;
    }
    
    const ul = document.createElement("ul");
    const form_productCode = document.getElementById("productCode");
    /** */
    const form_productCategory = document.getElementById("productCategory");
    const form_productModel = document.getElementById("productModel");
    const form_productSize = document.getElementById("productSize");
    const form_productDecoration = document.getElementById("productDecoration");
    const form_productColor = document.getElementById("productColor");
    /** */
    const form_productPrice = document.getElementById("productPrice");
    const form_productStock = document.getElementById("productStock");
    const form_productQuantity = document.getElementById("productQuantity");
    

    filteredProducts.forEach(producto => {
      const li = document.createElement("li");
      li.textContent = `${producto.code} - ${producto.category} Modelo ${producto.model} [${producto.size}] Decoracion ${producto.decoration} | Color ${producto.color}`;
  
      li.addEventListener("click", () => {
        input.value = "";
        //input.value = `${producto.code} - ${producto.category} Modelo ${producto.model} [${producto.size}] Decoracion ${producto.decoration} | Color ${producto.color}`;
        resultsContainer.style.display = "none";
        form_productCode.value = `${producto.code}`

        form_productCategory.value = `${producto.category}`;
        form_productModel.value = `${producto.model}`;
        form_productSize.value = `${producto.size}`;
        form_productDecoration.value = `${producto.decoration}`;
        form_productColor.value = `${producto.color}`;

        form_productPrice.value = `${producto.price}`;
        form_productStock.value = `${producto.stock}`;
        form_productQuantity.value = 1;
      });
  
      ul.appendChild(li);
    });
    resultsContainer.appendChild(ul);
    resultsContainer.style.display = "block";
}

input.addEventListener("input", function(e) {
  const texto = e.target.value;
  const resultados = document.getElementById("search-results");
  
  if (!texto.trim()) {
      resultados.style.display = "none";
      resultados.innerHTML = "";
      return;
  }
  
  const productosFiltrados = filtrarProductos(productos, texto);
  renderResults(productosFiltrados);
});

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

function agregarProductoCarrito() {
  const form_productCode = document.getElementById("productCode");
  /** */
  const form_productCategory = document.getElementById("productCategory");
  const form_productModel = document.getElementById("productModel");
  const form_productSize = document.getElementById("productSize");
  const form_productDecoration = document.getElementById("productDecoration");
  const form_productColor = document.getElementById("productColor");
  /** */
  const form_productPrice = document.getElementById("productPrice");
  const form_productStock = document.getElementById("productStock");
  const form_productQuantity = document.getElementById("productQuantity");
  const tableBody = document.querySelector("#table-products tbody");

  const code = form_productCode.value;

  // Evitar duplicados
  const existingRow = Array.from(tableBody.rows).find(row => row.cells[0].textContent === code);
  if (existingRow) {
    alert("El producto ya ha sido agregado al carrito.");
    return;
  }

  // Validaciones
  if (!form_productCode.value || !form_productCategory.value || !form_productPrice.value || !form_productQuantity.value || !form_productModel.value || !form_productSize.value || !form_productDecoration.value || !form_productColor.value) {
      alert("Por favor, complete todos los campos antes de agregar el producto.");
      return;
  }

  const price = parseFloat(form_productPrice.value);
  const stock = parseInt(form_productStock.value);
  const quantity = parseInt(form_productQuantity.value);

  if (price <= 0 || quantity <= 0 || stock < 0){
    alert("Por favor, introduzca valores validos.");
    return;
  }

  const emptyRow = document.getElementById("rowvoid");
  if (emptyRow) {
      emptyRow.remove();
  }

  const newRow = document.createElement("tr");
  newRow.id = 'car-'+form_productCode.value;
  const codeDes = 'descr-'+form_productCode.value;
  const codePrice = 'price-'+form_productCode.value;
  const codequantity = 'qnt-'+form_productCode.value;
  const form_productName = `${form_productCategory.value} Modelo ${form_productModel.value} [${form_productSize.value}] Decoracion ${form_productDecoration.value} | Color ${form_productColor.value}`;
  newRow.innerHTML = `
      <td class='car-product'>${form_productCode.value}</td>
      <td id='${codeDes}'>${form_productName}</td>
      <td id='${codePrice}'>${price.toFixed(2)}</td>
      <td id=${codequantity}>${quantity}</td>
      <td class='importe'>${(price * quantity).toFixed(2)}</td>
  `;

  tableBody.appendChild(newRow);

  /* carrito codigo, categoria, modelo, size, decoracion, color, precio, stock, pedido*/
  agregarProducto(parseInt(form_productCode.value), form_productCategory.value, form_productModel.value, form_productSize.value, form_productDecoration.value, form_productColor.value, parseFloat(form_productPrice.value), parseInt(form_productStock.value), parseInt(form_productQuantity.value));
  closeModal('addProductModal');
  totalVenta();
  alert("Producto agregado al carrito.");
}

function totalVenta() {
  const montoInput = document.getElementById("monto");
  const porcentajeDescuentoInput = document.getElementById("porcentaje-descuento");
  const descuentoAplicadoInput = document.getElementById("descuento");
  const totalInput = document.getElementById("total");

  const importes = document.querySelectorAll('.importe');

  let total = 0;
  importes.forEach(importe => {
    const valorLimpio = parseFloat(importe.textContent);
    total += parseFloat(valorLimpio) || 0;
  });
  montoInput.value = total;

  const porcentajeDescuento = parseFloat(porcentajeDescuentoInput.value) || 0;
  const descuentoAplicado = total * porcentajeDescuento / 100;
  const totalConDescuento = total - descuentoAplicado;
  descuentoAplicadoInput.value = descuentoAplicado.toFixed(2);
  totalInput.value = totalConDescuento.toFixed(2);

  updateCambio();
}

function updateCambio() {
  const pagoValue = parseFloat(document.getElementById("pago").value) || 0;
  const totalValue = parseFloat(document.getElementById("total").value) || 0;
  const cambioInput = document.getElementById("cambio");

  const cambio = pagoValue - totalValue;

  cambioInput.value = cambio.toFixed(2);
}

document.getElementById("porcentaje-descuento").addEventListener("input", function(e) {
  const productoPrice = parseFloat(document.getElementById("monto").value) || 0;
  totalVenta(productoPrice);
});

document.getElementById("pago").addEventListener("input", function(e) {
  updateCambio();
});

function imprimirRecibo(){
  revisarAlmacen();
  let codigos = productos.map(item => item.code);
  carrito.forEach(prodcar => {
    if (codigos.includes(prodcar.codigo)) {
      /*EXISTE EL PRODUCTO, MODIFICAR STOCK */
      let modelE = prodcar.modelo;
      let decorationE = prodcar.decoracion;
      let colorE = prodcar.color;
      let stockE = prodcar.stock - prodcar.pedido;
      let priceE = prodcar.precio;
      let codeE = prodcar.codigo;
      let categoryE = prodcar.categoria;
      let sizeE = prodcar.size;

      updateProducto({
        modelE, decorationE, colorE, stockE, priceE, codeE, categoryE, sizeE
      }, (err) => {
        if(err){
          console.log(`Error al actualizar producto: ${err}`);
        } else{
            console.log('¡Producto actualizado correctamente!');
        }
      });
    } else {
      /*NO EXISTE EL PRODUCTO, SE PONE STOCK EN 0 */
      let modelA = prodcar.modelo;
      let decorationA = prodcar.decoracion;
      let colorA = prodcar.color;
      let stockA = prodcar.stock - prodcar.pedido;
      let priceA = prodcar.precio;
      let codeA = prodcar.codigo;
      let categoryA = prodcar.categoria;
      let sizeA = prodcar.size;

      createProducto({ codeA, categoryA, sizeA, modelA, decorationA, colorA, priceA, stockA }, (err) => {
        if(err){
            console.log(`Error al agregar producto: ${err}`);
        } else{
            console.log('¡Producto agregado correctamente!');
        }
    });
    }
  });
  
};


  //
  /*



  
  const idVenta = document.getElementById('id-sale').value || 999999;
  const saleDate = document.getElementById('sale-date').value;
  const saleHour = document.getElementById('sale-hour').value;
  const clientName = document.getElementById('client-name').value || "-----";
  const clientPhone = document.getElementById('client-phone').value || "-----";
  const clientMail = document.getElementById('client-mail').value || "-----";
  const clientAddress = document.getElementById('client-address').value || "-----";
  const saleEntrega = document.getElementById('sale-entrega').value || "-----";
  const paymentMethod = document.getElementById('payment-method').value || "-----";
  const paymentForm = document.getElementById('payment-form').value || "-----";
  const empresa = "Cerámica Artep";

  const table = document.getElementById("table-products");
  const tbody = table.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr:not(#rowvoid)");
  const productos = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 5) {
      productos.push({
        codigo: cells[0].textContent.trim(),
        descripcion: cells[1].textContent.trim(),
        precioUnitario: cells[2].textContent.trim(),
        cantidad: cells[3].textContent.trim(),
        importe: cells[4].textContent.trim(),
        });
      }
  });

    const monto = document.getElementById("monto").value;
    const descuento = document.getElementById("descuento").value;
    const pago = document.getElementById("pago").value;
    const total = document.getElementById("total").value;
    const cambio = document.getElementById("cambio").value;


*/

/*
 * Primero debemos conectarlo a la base de datos
 * debemos verificar que existen los prodcutos en el inventario de productos
 * Si existe todo bien, pero en caso de que el stock no sea suficiente se encola bizochos para eso
 * si no existe se cerea el producto y se agrega a l inventario de productos tambien se encola
 * despues en la tabla de evntas yy la tabla de detalles llenarlas 
 *                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
 */

//generarRecibo();