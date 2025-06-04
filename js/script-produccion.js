const { Console } = require('console');
const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
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
    deleteBizcocho,
    updateStockBizcocho
} = require(crudJS = join(__dirname, '..', 'js', 'crud_bizcochos.js'));
const {
    readFases, updateFase, readCategorias, readSizes
} = require(join(__dirname, "..", "js", "crud-config.js"));
const {
    readOrdenes, createOrden, updateEstado
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));


window.addEventListener('DOMContentLoaded', initProduccion);

async function initProduccion() {
    try {
        const fases = await readFases();
        window.fases = fases;
;
        const categorias = await readCategorias();
        window.categorias = categorias;

        const sizes = await readSizes();
        window.sizes = sizes;

        window.today = new Date();
        window.meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril',
            'Mayo', 'Junio', 'Julio', 'Agosto',
            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const bizcochos = await readBizcochos();
        window.bizcochos = bizcochos;

        const productos = await readProductos();
        window.productos = productos;

        await cargarOrdenes();
        await fillColumnas(ordenes);
        console.warn('✅ Todos los datos fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error al cargar panel de Produccion:', error.message);
        showToast('Error al cargar panel de Produccion', ICONOS.error);
    }
}

async function cargarOrdenes() {
    try {
        const ordenes = await readOrdenes();
        window.ordenes = ordenes;
    } catch (err) {
        console.error('❌ Error al cargar ordenes:', err.message);
        showToast('Error al cargar ordenes', ICONOS.error);
    }
}

async function fillColumnas() {
    const columnas = document.querySelectorAll('.kanban-column');

    columnas.forEach(col => {
        col.querySelector('.kanban-cards').innerHTML = '';
    });

    window.ordenes.forEach(orden => {
        const faseNombre = window.fases.find(f => f.id_fase === orden.fase_actual)?.name_fase || 'Desconocida';

        let tarjetaHTML = '';
        const cardId = `card-${orden.id_orden}`;

        if (orden.origen === 'VENTA') {
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card card-venta" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Venta #${orden.id_venta}</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        } else if (orden.origen === 'INVENTARIO') {
            const clase = orden.tipo_item === 'bizcocho' ? 'card-inventario-b' : 'card-inventario-p';
            const label = orden.tipo_item === 'bizcocho' ? 'Inventario de Bizcochos' : 'Inventario de Productos';
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card ${clase}" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / ${label}</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida}<br>
                    Fase: ${faseNombre}
                </div>
            `;
        } else if (orden.origen === 'REPOSICION') {
            tarjetaHTML = `
                <div id="${cardId}" class="kanban-card card-reposicion" draggable="true" ondragstart="drag(event)" onclick="verDetalle(${orden.id_orden})">
                    <strong>Orden #${orden.id_orden} / Reposición (Venta #${orden.id_venta})</strong><br>
                    ${orden.name_item}<br>
                    Cant: ${orden.cantidad_pedida} / ${orden.cantidad_buenos}<br>
                    Fase: ${faseNombre}<br>
                    Días restantes: ${diasRestantes(orden.fecha_entrega)}
                </div>
            `;
        }

        const columna = document.querySelector(`.kanban-column[data-estado="${orden.estado.toLowerCase()}"] .kanban-cards`);
        if (columna) {
            columna.insertAdjacentHTML('beforeend', tarjetaHTML);
        }
    });
}

function diasRestantes(fechaEntregaStr) {
    if (!fechaEntregaStr) return '—';
    const hoy = new Date();
    const fechaEntrega = new Date(fechaEntregaStr);
    const diffMs = fechaEntrega - hoy;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDias > 0 ? `${diffDias} días` : 'Vencido';
}

/*---------------------FUNCIONES VISUALES--------------------------------------------------------- */

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

async function drop(ev) {
    ev.preventDefault();
    const cardId = ev.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);
    
    if (!card) return;
    
    const targetColumn = ev.target.closest('.kanban-column');
    
    if (!targetColumn) return;

    let idOrden = parseInt(cardId.replace('card-', ''));
    let nuevoEstado = (targetColumn.dataset.estado).toUpperCase();
    let orden = window.ordenes.find(o => o.id_orden === idOrden);

    if (nuevoEstado === "TERMINADO") {
        const confirmed = await showConfirmDialog(
            `¿Está seguro de marcar esta orden como terminada? Esta acción trasladará la cantidad en proceso al inventario disponible o apartado, y generará los ajustes correspondientes.`,
            "Confirmación"
        );

        if (confirmed) {
            const cardsContainer = targetColumn.querySelector('.kanban-cards');
            cardsContainer.appendChild(card);
            
            const payload = {
                estado: nuevoEstado,
                id_orden: idOrden
            };
            await updateEstado(payload);
            
            const cantidad = orden.cantidad_pedida;

            if (orden.origen === 'INVENTARIO') {
                if (orden.tipo_item === 'bizcocho') {
                    const biz = parseNameItemBizcocho(orden.name_item);

                    const bizcocho = window.bizcochos.find(b =>
                        b.biz_category === biz.biz_category &&
                        b.biz_size === biz.biz_size &&
                        b.biz_model === biz.biz_model
                    );

                    if (!bizcocho) {
                        console.error("❌ Bizcocho no encontrado");
                        return;
                    }

                    bizcocho.stock_disponible += cantidad;
                    bizcocho.stock_en_proceso -= cantidad;
                    console.log(bizcocho);
                    await updateStockBizcocho(bizcocho);

                } else if (orden.tipo_item === 'producto') {
                    const prod = parseNameItemProducto(orden.name_item);

                    const producto = window.productos.find(p =>
                        p.category === prod.category &&
                        p.size === prod.size &&
                        p.model === prod.model &&
                        p.decoration === prod.decoration &&
                        p.color === prod.color
                    );

                    if (!producto) {
                        console.error("❌ Producto no encontrado");
                        return;
                    }

                    producto.stock_disponible += cantidad;
                    producto.stock_en_proceso -= cantidad;

                    console.log(producto);
                    await updateStockProducto(producto);
                }
            } else if (orden.origen === 'VENTA' || orden.origen === 'REPOSICION') {
                const prod = parseNameItemProducto(orden.name_item);

                const producto = window.productos.find(p =>
                    p.category === prod.category &&
                    p.size === prod.size &&
                    p.model === prod.model &&
                    p.decoration === prod.decoration &&
                    p.color === prod.color
                );

                if (!producto) {
                    console.error("❌ Producto no encontrado");
                    return;
                }

                producto.stock_apartado += cantidad;
                producto.stock_en_proceso -= cantidad;

                console.log(producto);
                await updateStockProducto(producto);
            }
        }

    } else{
        const confirmed = await showConfirmDialog(
            `¿Desea mover la Orden #${idOrden} de ${orden.estado} a ${nuevoEstado} y cambiar su estado?`,
            "Confirmación"
        );

        if (confirmed) {
            const cardsContainer = targetColumn.querySelector('.kanban-cards');
            cardsContainer.appendChild(card);
            
            const payload = {
                estado: nuevoEstado,
                id_orden: idOrden
            };
            await updateEstado(payload);
        }
    }
    
}

function parseNameItemProducto(nameItem) {
    const match = nameItem.match(/^(.+?) (.+?) Mod\.(.+?) Decor\.(.+?) Color (.+)$/);
    if (!match) throw new Error("Formato inválido para producto");

    return {
        category: match[1].trim(),
        size: match[2].trim(),
        model: match[3].trim(),
        decoration: match[4].trim(),
        color: match[5].trim()
    };
}

function parseNameItemBizcocho(nameItem) {
    const match = nameItem.match(/^(.+?) (.+?) Mod\.(.+)$/);
    if (!match) throw new Error("Formato inválido para bizcocho");

    return {
        biz_category: match[1].trim(),
        biz_size: match[2].trim(),
        biz_model: match[3].trim()
    };
}

/*-----------------------------funciones------------------------- */

async function verDetalle(id_orden) {
    document.getElementById('update-content').innerHTML = '';
    await fillOrden(id_orden);
    document.getElementById("update-dialog-s").showModal();
}

async function fillOrden(id_orden) {
    window.ordenCRUD = window.ordenes.find(o => o.id_orden === id_orden);

    let html = "";
    let contenedorId = "update-content";

    switch (ordenCRUD.origen) {
        case "VENTA":
            html = `
                <p><strong>Venta:</strong>
                    <input type="number" id="orden_id_venta" value="" readonly></p>
                <p><strong>Producto:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Cantidad Pedida:</strong>
                    <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" readonly></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas buenas"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        case "INVENTARIO":
            html = `
                <p><strong>Producto/Bizcocho:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Tipo:</strong>
                    <select id="orden_tipo_item">
                        <option value="" disabled selected>-- Elija un tipo --</option>
                        <option value="bizcocho">Bizcocho</option>
                        <option value="producto">Producto</option>
                    </select></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas en proceso"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        case "REPOSICION":
            html = `
                <p><strong>Orden que repondra:</strong>
                    <input type="number" id="orden_id_orden_origen" value="" readonly></p>
                <p><strong>Producto:</strong>
                    <input type="text" id="orden_name_item" value="" readonly></p>
                <p><strong>Fase:</strong>
                    <select id="orden_fase_actual"></select></p>
                <p><strong>Cantidad Restante:</strong>
                    <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" readonly></p>
                <p><strong>Piezas Buenas:</strong>
                    <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas buenas"></p>
                <p><strong>Piezas Rotas:</strong>
                    <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas rotas"></p>
                <p><strong>Piezas Deformes:</strong>
                    <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="" placeholder="Ingrese cantidad de piezas deformes"></p>
                <p><strong>Observaciones:</strong>
                    <textarea id="orden_observaciones" placeholder="Ingrese observaciones sobre esta orden"></textarea></p>
            `;
            document.getElementById(contenedorId).innerHTML = html;
            await cargarFases(contenedorId);
            await cargarData(ordenCRUD, ordenCRUD.origen);
            break;
        default:
            break;
    }

}

function cargarFases(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectFase = modal.querySelector("#orden_fase_actual");
        
        selectFase.innerHTML = `<option value="" disabled selected>-- Elija una fase --</option>`;

        window.fases.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_fase;
            option.textContent = c.name_fase;
            selectFase.appendChild(option);
        });

        resolve();
    });
}

function cargarCategorias(contenedorId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(contenedorId);
        const selectCate = modal.querySelector("#orden_categoria");
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
        const selectSize = modal.querySelector("#orden_size");
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

function cargarData(ordenCRUD, origen) {
    return new Promise((resolve) => {
        const modal = document.querySelector("#update-content");

        switch (origen) {
            case "VENTA":
                modal.querySelector("#orden_id_venta").value = ordenCRUD.id_venta;
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_pedida").value = ordenCRUD.cantidad_pedida;
                modal.querySelector("#orden_cantidad_buenos").value = ordenCRUD.cantidad_buenos;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            case "INVENTARIO":
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_tipo_item").value = ordenCRUD.tipo_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_pedida").value = ordenCRUD.cantidad_pedida;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            case "REPOSICION":
                modal.querySelector("#orden_id_orden_origen").value = ordenCRUD.id_orden_origen;
                modal.querySelector("#orden_name_item").value = ordenCRUD.name_item;
                modal.querySelector("#orden_fase_actual").value = ordenCRUD.fase_actual;
                modal.querySelector("#orden_cantidad_pedida").value = ordenCRUD.cantidad_pedida;
                modal.querySelector("#orden_cantidad_buenos").value = ordenCRUD.cantidad_buenos;
                modal.querySelector("#orden_cantidad_rotos").value = ordenCRUD.cantidad_rotos;
                modal.querySelector("#orden_cantidad_deformes").value = ordenCRUD.cantidad_deformes;
                modal.querySelector("#orden_observaciones").value = ordenCRUD.observaciones;
                break;

            default:
                console.warn("Origen no reconocido:", origen);
                break;
        }

        resolve();
    });
}

async function agregarNuevaOrden() {
    document.getElementById('create-content').innerHTML = '';
    document.getElementById("create-dialog-s").showModal();

    let contenedorId = "create-content";
    let html = `
        <p><strong>Inventario:</strong>
            <select id="orden_tipo_item">
                <option value="" disabled selected>-- Elija un inventario --</option>
                <option value="bizcocho">Bizcocho</option>
                <option value="producto">Producto</option>
            </select>
        </p>

        <p><strong>Categoria:</strong>
            <select id="orden_categoria"></select></p>
        <p><strong>Modelo:</strong>
            <input type="text" id="orden_modelo" value="" placeholder="Ingrese modelo"></p>
        <p><strong>Tamaño:</strong>
            <select id="orden_size"></select></p>

        <div id="grupo-producto">
            <p><strong>Decoración:</strong>
                <input type="text" id="orden_decoracion" value="" placeholder="Ingrese decoracion"></p>
            <p><strong>Color:</strong>
                <input type="text" id="orden_color" value="" placeholder="Ingrese color"></p>
        </div>

        <p><strong>Piezas a Producir:</strong>
            <input type="number" id="orden_cantidad_pedida" step="1" min="0" value="" placeholder="Ingrese el numero de piezas a producir"></p>
    `;

    document.getElementById(contenedorId).innerHTML = html;
    //await cargarFases(contenedorId);
    await cargarCategorias(contenedorId);
    await cargarTamanos(contenedorId);

    document.getElementById('grupo-producto').style.display = 'none';

    document.getElementById('orden_tipo_item').addEventListener('change', function () {
        const tipo = this.value;
        const grupoProducto = document.getElementById('grupo-producto');
        const searchBar = document.getElementById("search-bar");
        let htmlS;

        if (tipo === 'producto') {
            grupoProducto.style.display = 'block';
            htmlS = `
                <p><strong>Buscar un producto:</strong>
                <input type="text" value="" id="search-input" placeholder="Ingrese algún dato del producto de inventario"></p>
                <button id="search-product" type="button" class="dialog-btn" onclick="searchProducto()">Buscar</button>
            `;
        } else {
            grupoProducto.style.display = 'none';
            document.getElementById('orden_decoracion').value = '';
            document.getElementById('orden_color').value = '';
            htmlS = `
                <p><strong>Buscar un bizcocho:</strong>
                <input type="text" value="" id="search-input" placeholder="Ingrese algún dato del bizcocho de inventario"></p>
                <button id="search-product" type="button" class="dialog-btn" onclick="searchBiz()">Buscar</button>
            `;
        }

        searchBar.innerHTML = htmlS;
    });

}

async function searchProducto(){
    const searchInput = document.getElementById("search-input").value.trim();

    if (!searchInput) {
        showToast("Campo de búsqueda vacío", ICONOS.info);
        return;
    }

    document.getElementById('results-content').innerHTML = '';
    const titleRES = document.getElementById('results-title');
    titleRES.textContent = `Coincidencias para "${searchInput}":`;

    const resultados = await coincidenciasProducto(searchInput);
    if (!resultados || resultados.length === 0) {
        mostrarSinCoincidencias();
    } else {
        mostrarListaResultados(resultados);
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
        const palabrasClave = input.split(/\s+/).filter(p => p.length > 0);

        console.log("🔍 Palabras clave:", palabrasClave);

        const coincidencias = window.productos.filter(producto => {
            const campos = [
                producto.category?.toLowerCase() || "",
                producto.size?.toLowerCase() || "",
                producto.model?.toLowerCase() || "",
                producto.decoration?.toLowerCase() || "",
                producto.color?.toLowerCase() || ""
            ];

            // Compara solo con palabras completas
            return palabrasClave.every(palabra =>
                campos.some(campo => campo.split(/\s+/).includes(palabra))
            );
        });

        return coincidencias;

    } catch (error) {
        console.error('❌ Error al buscar coincidencias del producto:', error.message);
        showToast(`[ERROR] Al buscar coincidencias del producto: ${error.message}`, ICONOS.error);
        return [];
    }
}


function llenarFormularioDesdeProducto(producto) {
    document.getElementById('orden_categoria').value   = producto.category || '';
    document.getElementById('orden_modelo').value      = producto.model || '';
    document.getElementById('orden_size').value        = producto.size || '';
    document.getElementById('orden_decoracion').value  = producto.decoration || '';
    document.getElementById('orden_color').value       = producto.color || '';
    document.getElementById('orden_cantidad_pedida').value = '';
    document.getElementById('search-input').value = '';
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
                ${producto.category} ${producto.size} Mod.${producto.model} Decor.${producto.decoration} Color ${producto.color}
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

async function searchBiz() {
    const searchInput = document.getElementById("search-input").value.trim();

    if (!searchInput) {
        showToast("Campo de búsqueda vacío", ICONOS.info);
        return;
    }

    document.getElementById('results-content').innerHTML = '';
    const titleRES = document.getElementById('results-title');
    titleRES.textContent = `Coincidencias para "${searchInput}":`;

    const resultados = await coincidenciasBizcocho(searchInput);

    if (!resultados|| resultados.length === 0) {
        mostrarSinCoincidencias();
    } else {
        mostrarListaResultadosBiz(resultados);
    }

    document.getElementById("results-dialog-s").showModal();
}


async function coincidenciasBizcocho(searchInput) {
    try {
        const input = searchInput.toLowerCase().trim();
        const palabrasClave = input.split(/\s+/);

        const coincidencias = window.bizcochos.filter(biz => {
            const campos = [
                biz.biz_category?.toLowerCase() || "",
                biz.biz_size?.toLowerCase() || "",
                biz.biz_model?.toLowerCase() || ""
            ];

            return palabrasClave.every(palabra =>
                campos.some(campo =>
                    campo.split(/\s+/).includes(palabra)
                )
            );
        });

        return coincidencias;

    } catch (error) {
        console.error('❌ Error al buscar coincidencias del bizcocho:', error.message);
        showToast(`[ERROR] Al buscar coincidencias del bizcocho: ${error.message}`, ICONOS.error);
    }
}


function mostrarListaResultadosBiz(bizcochos) {
    const menu = document.getElementById("menu-results");
    menu.innerHTML = '';
    const content = document.getElementById('results-content');
    content.innerHTML = '';

    const lista = document.createElement('ul');
    lista.style.listStyle = 'none';
    lista.style.padding = '0';

    bizcochos.forEach(biz => {
        const item = document.createElement('li');
        item.classList.add('resultado-item');

        item.innerHTML = `
            <div style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #ccc;">
                ${biz.biz_category} ${biz.biz_size} Mod.${biz.biz_model}
            </div>
        `;

        item.addEventListener('click', () => {
            llenarFormularioDesdeBizcocho(biz);
            document.getElementById("results-dialog-s").close();
        });

        lista.appendChild(item);
    });

    content.appendChild(lista);
}

function llenarFormularioDesdeBizcocho(bizcocho) {
    document.getElementById('orden_categoria').value   = bizcocho.biz_category || '';
    document.getElementById('orden_modelo').value      = bizcocho.biz_model || '';
    document.getElementById('orden_size').value        = bizcocho.biz_size || '';
    document.getElementById('orden_decoracion').value  = '';
    document.getElementById('orden_color').value       = '';
    document.getElementById('orden_cantidad_pedida').value = '';
    document.getElementById('search-input').value = '';
}

async function limpiarFormularioOrden() {
    document.getElementById('orden_tipo_item').value = '';
    document.getElementById('orden_categoria').value = '';
    document.getElementById('orden_modelo').value = '';
    document.getElementById('orden_size').value = '';
    document.getElementById('orden_decoracion').value = '';
    document.getElementById('orden_color').value = '';
    document.getElementById('orden_cantidad_pedida').value = '';
    document.getElementById('search-input').value = '';
}

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

document.getElementById("close-dialog-delete").addEventListener("click", () =>
    cerrarDialogo("delete-dialog-s", "delete-content", "Eliminación cancelada"));

document.getElementById("close-dialog-create").addEventListener("click", () =>
    cerrarDialogo("create-dialog-s", "create-content", "Creación cancelada"));

document.getElementById("close-dialog-update").addEventListener("click", () =>
    cerrarDialogo("update-dialog-s", "update-content", "Modificación cancelada"));

document.getElementById("clean-create").addEventListener("click", async () => {
    await limpiarFormularioOrden();
});

/*---------------------------------------------------CREAR ORDENES PARA INVENTARIO-------------------------------------------------------------------------------------- */
document.getElementById("save-create").addEventListener("click", async () => {
    await crearOrdenInv();
});

async function crearOrdenInv() {
    const payload = await validacionesOrden();
    const cantidad = payload.cantidad_pedida;

    // Buscar producto o bizcocho
    let item = null;
    if (payload.tipo_item === "producto") {
        item = window.productos.find(p =>
            p.category === payload.categoria &&
            p.size === payload.tamano &&
            p.model === payload.modelo &&
            p.decoration === payload.decoracion &&
            p.color === payload.color
        );
    } else if (payload.tipo_item === "bizcocho") {
        item = window.bizcochos.find(b =>
            b.biz_category === payload.categoria &&
            b.biz_size === payload.tamano &&
            b.biz_model === payload.modelo
        );
    }

    const confirmed = await showConfirmDialog(
        `¿Desea actualizar el stock en proceso sumando ${cantidad} unidades? Si no lo hace, podría haber inconsistencias en el stock al terminar la orden.`,
        "Actualizar stock en proceso"
    );

    if (confirmed) {
        if (!item) {
            // Crear item con stock_en_proceso inicial
            if (payload.tipo_item === "producto") {
                const nuevoProducto = {
                    code: Date.now(),
                    category: payload.categoria,
                    model: payload.modelo,
                    size: payload.tamano,
                    decoration: payload.decoracion,
                    color: payload.color,
                    price: 0,
                    stock_disponible: 0,
                    stock_apartado: 0,
                    stock_en_proceso: cantidad,
                    stock_min: 0,
                    stock_critico: 0
                };
                await createProducto(nuevoProducto);
                showToast("Producto base creado con stock en proceso.", ICONOS.info);
            } else {
                const nuevoBizcocho = {
                    biz_category: payload.categoria,
                    biz_size: payload.tamano,
                    biz_model: payload.modelo,
                    stock_disponible: 0,
                    stock_apartado: 0,
                    stock_en_proceso: cantidad,
                    stock_min: 0,
                    stock_critico: 0
                };
                await createBizcocho(nuevoBizcocho);
                showToast("Bizcocho base creado con stock en proceso.", ICONOS.info);
            }
        } else {
            // Actualizar stock_en_proceso sumando
            item.stock_en_proceso += cantidad;
            if (payload.tipo_item === "producto") {
                await updateStockProducto(item);
            } else {
                await updateStockBizcocho(item);
            }
            showToast("Stock en proceso actualizado correctamente.", ICONOS.success);
        }
    } else {
        await showToast("Advertencia: No se actualizó el stock en proceso. Esto puede generar inconsistencias al finalizar la orden.", ICONOS.warning);
    }

    await createOrden(payload, "INVENTARIO");
    console.log(`📝 Orden INVENTARIO ${payload.tipo_item} creada para "${payload.name_item}" de ${cantidad} unidad(es).`);
    cerrarDialogo("create-dialog-s", "create-content", "Creación de orden exitosa");
    await cargarOrdenes();
    await fillColumnas(ordenes);
}

async function validacionesOrden() {
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

    const tipo_item = getValue("#orden_tipo_item");
    if (!tipo_item) {
        showToast("Debe seleccionar una inventario.", ICONOS.advertencia);
        throw new Error("Inventario no seleccionado.");
    }

    const categoria = getValue("#orden_categoria");
    if (!categoria) {
        showToast("Debe seleccionar una categoría.", ICONOS.advertencia);
        throw new Error("Categoría vacía.");
    }

    const modelo = getValue("#orden_modelo");
    if (!modelo) {
        showToast("Falta llenar el campo de modelo.", ICONOS.advertencia);
        throw new Error("Modelo vacío.");
    }

    const tamano = getValue("#orden_size");
    if (!tamano) {
        showToast("Debe seleccionar un tamaño.", ICONOS.advertencia);
        throw new Error("Tamaño vacío.");
    }

    let decoracion = null;
    let color = null;
    if (tipo_item === 'producto'){
        
        decoracion = getValue("#orden_decoracion");
        if (!decoracion) {
            showToast("Falta llenar el campo de decoración.", ICONOS.advertencia);
            throw new Error("Decoración vacía.");
        }

        color = getValue("#orden_color");
        if (!color) {
            showToast("Falta llenar el campo de color.", ICONOS.advertencia);
            throw new Error("Color vacío.");
        }

    }

    const cantidad_pedida = getNumber("#orden_cantidad_pedida");
    if (isNaN(cantidad_pedida) || cantidad_pedida <= 0) {
        showToast("Debe ingresar una cantidad válida para la orden.", ICONOS.advertencia);
        return Promise.reject(new Error("Cantidad para la orden inválido."));
    }
    
    let name_item = null;
    let observaciones = null;
    if (tipo_item === 'producto'){
        name_item = `${categoria} ${tamano} Mod.${modelo} Decor.${decoracion} Color ${color}`; 
        observaciones = `Se creo una orden para INVENTARIO DE PRODUCTOS para el PRODUCTO ${categoria} ${tamano} Mod.${modelo} Decor.${decoracion} Color ${color}`; 
    } else{
        name_item = `${categoria} ${tamano} Mod.${modelo}`; 
        observaciones = `Se creo una orden para INVENTARIO DE BIZCOCHOS para el BIZCOCHO ${categoria} ${tamano} Mod.${modelo}`;  
    }

    return {
        tipo_item,
        name_item,
        cantidad_pedida,
        observaciones,
        categoria,
        tamano,
        modelo,
        decoracion,
        color
    }
}