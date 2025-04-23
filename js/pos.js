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
    createOrden, readOrdenByFase
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

async function imprimirRecibo() {

};