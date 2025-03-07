const { join } = require('path');
const crudJS = join(__dirname, '..', 'js', 'crud-productos.js');
const { createProducto, readProductos, updateProducto, deleteProducto } = require(crudJS);
const input = document.getElementById("product-by-search");

let productos = [];

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
    
    console.log(productosFiltrados);
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
  const form_productName = `${form_productCategory.value} Modelo ${form_productModel.value} [${form_productSize.value}] Decoracion ${form_productDecoration.value} | Color ${form_productColor.value}`;
  newRow.innerHTML = `
      <td>${form_productCode.value}</td>
      <td>${form_productName}</td>
      <td>$${price.toFixed(2)}</td>
      <td>${quantity}</td>
      <td>$${(price * quantity).toFixed(2)}</td>
  `;

  tableBody.appendChild(newRow);

  closeModal('addProductModal')
  alert("Producto agregado al carrito.");
}
