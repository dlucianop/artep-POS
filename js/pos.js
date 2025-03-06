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
    const form_productName = document.getElementById("productName");
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
        form_productName.value = `${producto.category} Modelo ${producto.model} [${producto.size}] Decoracion ${producto.decoration} | Color ${producto.color}`
        form_productPrice.value = `${producto.price}`;
        form_productStock.value = `${producto.stock}`;
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