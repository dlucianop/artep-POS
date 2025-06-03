const { join } = require('path');
const {
    createVenta, readVentas, searchVenta, updateVenta, createDetalle, readDetalles, deleteVentaConDetalles,
} = require(join(__dirname, "..", "js", "crud-ventas.js"));
const { 
    createProducto, readProductos, searchProduct, updateProducto, deleteProducto, updateStockProducto
} = require(join(__dirname, '..', 'js', 'crud-productos.js'));
const { 
    createBizcocho, readBizcochos, updateBizcocho, searchBizcocho, deleteBizcocho 
} = require(join(__dirname, "..", "js", "crud_bizcochos.js"));
const {
    createOrden, updateOrden, readOrdenByFase, readOrden, readOrdenesByVenta, updateCantidadInicial, searchReposicionOrden, updateRepo
} = require(join(__dirname, "..", "js", "crud-produccion.js"));
const { 
    showToast, showConfirmToast, ICONOS 
} = require(join(__dirname, "..", "js", "toast.js"));
const {
    readFases, updateFase
} = require(join(__dirname, '..', 'js', 'crud-config.js'));

window.addEventListener('DOMContentLoaded', initProduccion);

async function initProduccion() {
    try {
        const fases = await readFases();
        window.fases = fases;
        window.today = new Date();
        window.meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril',
            'Mayo', 'Junio', 'Julio', 'Agosto',
            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        fillEncabezados(fases);
        await cargarProductos();
        await cargarBizcochos();
        console.log('✅ Todos los datos fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error al cargar fases:', error.message);
        showToast('Error al cargar panel de Produccion', ICONOS.error);
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

function fillEncabezados(fases) {
    const container = document.querySelector('.kanban-container');
    container.innerHTML = '';

    fases.forEach(fase => {
        const column = document.createElement('div');
        column.classList.add('kanban-column');
        column.setAttribute('ondrop', 'drop(event)');
        column.setAttribute('ondragover', 'allowDrop(event)');

        const header = document.createElement('h3');
        header.textContent = fase.name_fase;

        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('kanban-cards');
        cardsContainer.dataset.faseId = fase.id_fase;

        fillColumna(cardsContainer, fase.id_fase);

        column.appendChild(header);
        column.appendChild(cardsContainer);
        container.appendChild(column);
    });
}

async function fillColumna(cardsContainer, fase_id) {
    try {
        const ordenes = await readOrdenByFase(fase_id);

        ordenes.forEach(orden => {
            const card = document.createElement('div');
            card.classList.add('kanban-card');
            card.setAttribute('draggable', 'true');
            card.setAttribute('ondragstart', 'drag(event)');
            card.id = `card-${orden.id_orden}`;

            card._ordenData = orden;
            card.addEventListener('click', () => showDetails(card));

            const entrega = new Date(orden.fecha_entrega);
            const diffDias = Math.ceil((entrega - window.today) / (1000 * 60 * 60 * 24));

            card.innerHTML = `
            <article role="button" tabindex="0">
                <header>
                    <h3>${orden.origen}</h3>
                    <h2>#${orden.id_venta}</h2>
                </header>
                <ul>
                    <li>${orden.categoria} ${orden.size}</li>
                    <li>${orden.cantidad_buenos} / <strong>${orden.cantidad_inicial}</strong></li>
                    <li>${diffDias} días restantes</li>
                </ul>
            </article>
            `;
            cardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error(`❌ Error al cargar órdenes de fase ${fase_id}:`, error);
        showToast('Error al cargar ordenes', ICONOS.error);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

async function drop(ev) {
    ev.preventDefault();

    const cardId = ev.dataTransfer.getData("text");
    const cardElem = document.getElementById(cardId);
    if (!cardElem) return;

    const ordenData = cardElem._ordenData;
    cardElem._estadoAnterior = {
        columna: cardElem.parentElement,
        faseId: ordenData.id_fase,
        faseNombre: ordenData.fase_actual
    };
    cardElem.classList.add('editando');

    const targetColumn = ev.target.closest('.kanban-column');
    if (!targetColumn) return;

    const targetFaseName = targetColumn.querySelector('h3').textContent;
    const targetFaseId = parseInt(targetColumn.querySelector('.kanban-cards').dataset.faseId, 10);

    const cardsContainer = targetColumn.querySelector('.kanban-cards');
    cardsContainer.appendChild(cardElem);

    const oldFaseId = parseInt(ordenData.id_fase, 10);
    if (targetFaseId !== oldFaseId) {
        const noOrden = `No. de Orden: ${ordenData.id_orden}`;
        const simbolo = oldFaseId < targetFaseId ? '>' : '<';
        const fromto = oldFaseId < targetFaseId ?
            `${ordenData.fase_actual} ${simbolo} ${targetFaseName}` :
            `${targetFaseName} ${simbolo} ${ordenData.fase_actual}`;

        ordenData.fase_actual = targetFaseName;
        ordenData.id_fase = targetFaseId;

        showEdit(cardElem, noOrden, fromto);
    } else {
        showToast('No se puede mover la tarjeta en la misma columna', ICONOS.error);
    }
}

function showEdit(cardElem, noOrden, fromto) {
    window.cardEditando = cardElem;
    document.getElementById('edit-content').innerHTML = '';
    fillData(cardElem._ordenData, noOrden, fromto);
    document.getElementById("edit-dialog").showModal();
}

function showDetails(cardElem) {
    document.getElementById('detail-content').innerHTML = '';
    fillDetails(cardElem._ordenData);
    document.getElementById("detail-dialog").showModal();
}

function fillDetails(orden) {
    if (!orden) return console.error('Orden no encontrada en el elemento');

    const entrega = new Date(orden.fecha_entrega);
    const diffDias = Math.ceil((entrega - window.today) / (1000 * 60 * 60 * 24));
    const [year, month, day] = orden.fecha_entrega.split('-');
    const formattedDate = `${day}-${window.meses[Number(month) - 1]}-${year}`;

    const html = `
        <p><strong>Tipo Orden:</strong> ${orden.origen}</p>
        <p><strong>No. de venta:</strong> ${orden.id_venta}</p>
        <p><strong>Producto:</strong> ${orden.categoria} TAM.${orden.size}</p>
        <p><strong>Cantidad inicial:</strong> ${orden.cantidad_inicial}</p>
        <p><strong>Cantidad buenos:</strong> ${orden.cantidad_buenos}</p>
        <p><strong>Cantidad rotos:</strong> ${orden.cantidad_rotos}</p>
        <p><strong>Cantidad deformes:</strong> ${orden.cantidad_deformes}</p>
        <p><strong>Fecha de entrega:</strong> ${formattedDate} (${diffDias} días restantes)</p>
    `;

    document.getElementById('detail-content').innerHTML = html;
}

function fillData(orden, noOrden, fromto) {
    if (!orden) return console.error('Orden no encontrada en el elemento');

    const entrega = new Date(orden.fecha_entrega);
    const diffDias = Math.ceil((entrega - window.today) / (1000 * 60 * 60 * 24));
    const [year, month, day] = orden.fecha_entrega.split('-');
    const formattedDate = `${day}-${window.meses[Number(month) - 1]}-${year}`;

    document.getElementById("noOrdenH").textContent = noOrden;
    document.getElementById("fases").textContent = fromto;
    const html = `
        <p><strong>Tipo Orden:</strong> ${orden.origen}</p>
        <p><strong>No. de venta:</strong> ${orden.id_venta}</p>
        <p><strong>Producto:</strong> ${orden.categoria} TAM.${orden.size}</p>
        <p><strong>Cantidad inicial:</strong> ${orden.cantidad_inicial}</p>
        <p><strong>Cantidad buenos:</strong></p>
            <input type="number" id="orden_cantidad_buenos" step="1" min="0" value="${orden.cantidad_buenos}">
        <p><strong>Cantidad rotos:</strong></p>
            <input type="number" id="orden_cantidad_rotos" step="1" min="0" value="${orden.cantidad_rotos}">
        <p><strong>Cantidad deformes:</strong></p>
            <input type="number" id="orden_cantidad_deformes" step="1" min="0" value="${orden.cantidad_deformes}">
        <p><strong>Fecha de entrega:</strong> ${formattedDate} (${diffDias} días restantes)</p>
    `;
    document.getElementById('edit-content').innerHTML = html;
}

document.getElementById('close-detail').addEventListener('click', () => {
    document.getElementById('detail-dialog').close();
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    const dialog = document.getElementById('edit-dialog');
    dialog.close();

    const cardElem = document.querySelector('.kanban-card.editando');
    if (!cardElem || !cardElem._estadoAnterior) return;

    const { columna, faseId, faseNombre } = cardElem._estadoAnterior;
    columna.appendChild(cardElem);

    cardElem._ordenData.id_fase = faseId;
    cardElem._ordenData.fase_actual = faseNombre;

    delete cardElem._estadoAnterior;
    cardElem.classList.remove('editando');
});

document.getElementById('update-edit').addEventListener('click', async () => {
    let cardElem = document.querySelector('.kanban-card.editando');
    if (!cardElem?._estadoAnterior) return;

    try {
        let ordenData = cardElem._ordenData;
        let detalles_orden = await readOrden(ordenData.id_orden);
        let detalleO = detalles_orden[0];

        const orden = {
            id_fase: ordenData.id_fase,
            cantidad_buenos: await getCantidadConDefault("orden_cantidad_buenos", detalleO.cantidad_buenos),
            cantidad_rotos: await getCantidadConDefault("orden_cantidad_rotos", detalleO.cantidad_rotos),
            cantidad_deformes: await getCantidadConDefault("orden_cantidad_deformes", detalleO.cantidad_deformes),
            id_orden: ordenData.id_orden
        };
        console.log("🔍 detalleO:", detalleO);
        console.log("🔄 ordenData:", ordenData);

        const newFase = window.fases.find(f => f.id_fase === orden.id_fase);
        const ultimaFase = window.fases.reduce((max, f) => f.id_fase > max.id_fase ? f : max, window.fases[0]);

        switch (detalleO.id_origen) {
            case 1: {
                let detalles_venta = await readDetalles(ordenData.id_venta);

                console.log("🔍 detalleV:", detalles_venta);
                for (const detalleV of detalles_venta) {
                    if (detalleV.id_detalle === detalleO.id_detalle) {
                        await updateOrdenVenta(orden, detalleO, detalleV, ordenData, newFase, ultimaFase);
                        showToast(`✅ Orden de venta actualizada`, ICONOS.info);
                        console.warn(`✅ Orden de venta actualizada`);
                        break;
                    }
                }
                break;
            }

            case 2:
                // Inventario
                await updateOrdenInventario(orden);
                showToast(`📦 Orden de inventario actualizada`, ICONOS.info);
                console.warn(`📦 Orden de inventario actualizada`);
                break;

            case 3:
                // Muestra
                showToast(`🧪 Orden de muestra actualizada`, ICONOS.info);
                console.warn(`🧪 Orden de muestra actualizada`);
                break;

            case 4:
                // Prueba
                showToast(`🔬 Orden de prueba actualizada`, ICONOS.info);
                console.warn(`🔬 Orden de prueba actualizada`);
                break;

            case 5:
            default:
                // Reposición 
                await updateOrdenReposicion(orden);
                showToast(`🛠 Orden de reposición actualizada`, ICONOS.info);
                console.warn(`🛠 Orden de reposición actualizad`);
                break;
        }

    } catch (error) {
        console.error('❌ Error al mover tarjeta:', error.message);
        showToast(`Error al mover tarjeta: ${error.message}`, ICONOS.error);
    } finally {
        delete cardElem._estadoAnterior;
        cardElem.classList.remove('editando');
    }
});

async function updateOrdenVenta(orden, detalleO, detalleV, ordenData, newFase, ultimaFase) {
    const cantidadProducida = orden.cantidad_buenos;
    const cantidadInicialActual = detalleO?.cantidad_inicial || ordenData?.cantidad_inicial || 0;
    const faltante = cantidadInicialActual - cantidadProducida;

    try {
        if (
            faltante > 0 &&
            orden.cantidad_rotos >= 1 &&
            orden.cantidad_deformes >= 1
        ) {
            const ordenRepo = await searchReposicionOrden(ordenData.id_venta);

            if (!ordenRepo) {
                await crearOrdenReposicion(
                    ordenData.id_venta,
                    ordenData.fecha_entrega,
                    {
                        categoria: detalleO.categoria,
                        size: detalleO.size,
                        id_detalle: detalleO.id_detalle
                    },
                    faltante
                );
            } else {
                const repoActualizado = {
                    cantidad_inicial: ordenRepo.cantidad_inicial + orden.cantidad_deformes + orden.cantidad_rotos,
                    id_orden: ordenRepo.id_orden,
                };

                await updateRepo(repoActualizado);
            }
        }
    } catch (error) {
        console.error("❌ Error al gestionar reposición:", error);
        showToast("Error en reposición", ICONOS.error);
    }

    try {
        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            await updateBizcocho({
                stock_apartado: bizcocho.stock_apartado,
                stock_disponible: faltante > 0
                    ? bizcocho.stock_disponible - faltante
                    : bizcocho.stock_disponible,
                stock_en_proceso: bizcocho.stock_en_proceso + cantidadProducida,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
            });

        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleV.codigo);
            const esUltimaFase = newFase.id_fase === ultimaFase.id_fase;

            await updateStockProducto({
                stock_apartado: esUltimaFase
                    ? producto.stock_apartado + cantidadProducida
                    : producto.stock_apartado,
                stock_disponible: producto.stock_disponible,
                stock_en_proceso: esUltimaFase
                    ? producto.stock_en_proceso
                    : producto.stock_en_proceso + cantidadProducida,
                code: producto.code
            });
        }
    } catch (error) {
        console.error("❌ Error al actualizar stock:", error);
        showToast("Error al actualizar stock", ICONOS.error);
    }

    try {
        await updateOrden(orden);
    } catch (error) {
        console.error("❌ Error al actualizar la orden:", error);
        showToast("Error al actualizar orden", ICONOS.error);
    }
}

async function crearOrdenReposicion(ventaId, fecha_entrega, item, faltanteRestante) {
    try {
        const orden = {
            id_venta: ventaId,
            id_origen: 5,
            fecha_entrega,
            categoria: item.categoria,
            size: item.size,
            cantidad_inicial: faltanteRestante,
            id_detalle: item.id_detalle
        };

        const newOrden = await createOrden(orden);
        return newOrden;
    } catch (error) {
        console.error('❌ ordenesActions ERROR:', error);
        showToast(`Error en ordenesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function updateOrdenInventario(orden) {
    try {
        const ordenData = await readOrdenById(orden.id_orden);
        const detalleO = await readDetalleOrden(orden.id_orden);
        const newFase = await getFaseById(orden.id_fase);

        const cantidadProducida = orden.cantidad_buenos;

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            await updateBizcocho({
                stock_apartado: bizcocho.stock_apartado,
                stock_disponible: bizcocho.stock_disponible + cantidadProducida,
                stock_en_proceso: bizcocho.stock_en_proceso,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
            });
        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleO.codigo);

            await updateStockProducto({
                stock_apartado: producto.stock_apartado,
                stock_disponible: producto.stock_disponible + cantidadProducida,
                stock_en_proceso: producto.stock_en_proceso,
                code: producto.code
            });
        }

        await updateOrden(orden);
    } catch (error) {
        console.error("❌ Error en updateOrdenInventario:", error);
        showToast("Error en orden de inventario", ICONOS.error);
    }
}

async function updateOrdenReposicion(orden) {
    try {
        const ordenData = await readOrdenById(orden.id_orden);
        const detalleO = await readDetalleOrden(orden.id_orden);
        const detalleV = await searchDetalleVenta(detalleO.id_detalle);

        const cantidadProducida = orden.cantidad_buenos;
        const cantidadInicialActual = detalleO?.cantidad_inicial || ordenData?.cantidad_inicial || 0;
        const faltante = cantidadInicialActual - cantidadProducida;

        const newFase = await getFaseById(orden.id_fase);
        const ultimaFase = await getUltimaFase();

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            await updateBizcocho({
                stock_apartado: bizcocho.stock_apartado,
                stock_disponible: faltante > 0
                    ? bizcocho.stock_disponible - faltante
                    : bizcocho.stock_disponible,
                stock_en_proceso: bizcocho.stock_en_proceso + cantidadProducida,
                biz_category: bizcocho.biz_category,
                biz_size: bizcocho.biz_size,
            });
        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleV.codigo);
            const esUltimaFase = newFase.id_fase === ultimaFase.id_fase;

            await updateStockProducto({
                stock_apartado: esUltimaFase
                    ? producto.stock_apartado + cantidadProducida
                    : producto.stock_apartado,
                stock_disponible: producto.stock_disponible,
                stock_en_proceso: esUltimaFase
                    ? producto.stock_en_proceso
                    : producto.stock_en_proceso + cantidadProducida,
                code: producto.code
            });
        }

        await updateOrden(orden);
    } catch (error) {
        console.error("❌ Error en updateOrdenReposicion:", error);
        showToast("Error en orden de reposición", ICONOS.error);
    }
}

async function getCantidadConDefault(idCampo, valorAnterior) {
    const valor = parseInt(document.getElementById(idCampo).value.trim(), 10);
    return isNaN(valor) ? valorAnterior : valor;
}

/*---------------------------------------------------------------------------------------------- */

function agregarNuevaOrden() {
    const form = document.getElementById('formOrden');
    form.dataset.mode = 'create';
    renderOrden();
}

function renderOrden() {
    const form = document.getElementById('formOrden');
    const ordenCodeField = document.getElementById("ordenCodeField");
    const tipoInventario = document.getElementById('tipoInventario');
    const itemSeleccionado = document.getElementById('itemSeleccionado');

    if (form.dataset.mode === 'create') {
        form.reset();  // limpia todo
        ordenCodeField.style.display = "none";
        tipoInventario.value = '';
        itemSeleccionado.innerHTML = '';
        itemSeleccionado.disabled = true;
        // Opción por defecto en itemSeleccionado
        const optionDefault = document.createElement('option');
        optionDefault.value = '';
        optionDefault.textContent = '-- Elija un ítem --';
        optionDefault.disabled = true;
        optionDefault.selected = true;
        itemSeleccionado.appendChild(optionDefault);

        console.log('Preparando formulario para nueva orden');
    }
    openModal('editOrdenModal');
}

function cargarOpcionesProducto() {
    const tipoInventario = document.getElementById('tipoInventario').value;
    const selectItem = document.getElementById('itemSeleccionado');

    selectItem.innerHTML = '';

    if (!tipoInventario) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Elija un ítem --';
        option.disabled = true;
        option.selected = true;
        selectItem.appendChild(option);
        selectItem.disabled = true;
        return;
    }

    selectItem.disabled = false;

    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = '-- Elija un ítem --';
    optionDefault.disabled = true;
    optionDefault.selected = true;
    selectItem.appendChild(optionDefault);

    let lista = [];
    if (tipoInventario === 'bizcocho') {
        lista = window.bizcochos || [];
    } else {
        lista = window.productos || [];
    }

    lista.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id_biz ?? item.code ?? '';

        if (tipoInventario === 'bizcocho') {
            option.textContent = `${item.biz_category} TAM.${item.biz_size}`;
        } else {
            const categoria = item.category || '';
            const tamaño = item.size || '';
            const modelo = item.model || '';
            const color = item.color || '';
            const decoracion = item.decoration || '';
            option.textContent = `${categoria} TAM.${tamaño} MOD.${modelo} COL.${color} DEC.${decoracion}`;
        }

        selectItem.appendChild(option);
    });
}
