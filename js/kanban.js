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
    createOrden, updateOrden, readOrdenByFase, readOrden, readOrdenesByVenta
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
        console.log('✅ Todos los datos fueron cargados correctamente.');
    } catch (error) {
        console.error('❌ Error al cargar fases:', error.message);
        showToast('Error al cargar panel de Produccion', ICONOS.error);
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
        let detalles_venta = await readDetalles(ordenData.id_venta);

        for (const detalleV of detalles_venta) {
            if (detalleV.id_detalle === detalles_orden[0].id_detalle){
                await updateData(detalleV, detalles_orden[0], ordenData);
                break;

            }
        }
    } catch (error) {
        console.error('❌ Error al mover tarjeta:', error.message);
        showToast(`Error al mover tarjeta: ${error.message}`, ICONOS.error);
    } finally {
        delete cardElem._estadoAnterior;
        cardElem.classList.remove('editando');
    }
});

async function updateData(detalleV, detalleO, ordenData) {
    try {
        const orden = {
            id_fase: ordenData.id_fase,
            cantidad_buenos: parseInt(document.getElementById("orden_cantidad_buenos").value, 10),
            cantidad_rotos: parseInt(document.getElementById("orden_cantidad_rotos").value, 10),
            cantidad_deformes: parseInt(document.getElementById("orden_cantidad_deformes").value, 10),
            id_orden: ordenData.id_orden
        };

        const cantidadProducida = orden.cantidad_buenos;

        await updateOrden(orden);

        const newFase = window.fases.find(f => f.id_fase === orden.id_fase);
        const ultimaFase = window.fases.reduce((max, f) => f.id_fase > max.id_fase ? f : max, window.fases[0]);

        if (newFase.tipo_fase === "Bizcocho") {
            const bizcocho = await searchBizcocho({
                biz_category: detalleO.categoria,
                biz_size: detalleO.size
            });

            if (bizcocho && bizcocho.id_biz) {
                bizcocho.stock_en_proceso = Math.max(0, bizcocho.stock_en_proceso - cantidadProducida);

                if (orden.id_fase === ultimaFase.id_fase) {
                    bizcocho.stock_apartado += cantidadProducida;
                } else {
                    bizcocho.stock_en_proceso += cantidadProducida;
                }

                await updateBizcocho(bizcocho);
            } else {
                showToast("❌ No se encontró el bizcocho para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el bizcocho para actualizar');
            }

        } else if (newFase.tipo_fase === "Producto") {
            const producto = await searchProduct(detalleV.codigo);

            if (producto && producto.code) {
                producto.stock_en_proceso = Math.max(0, producto.stock_en_proceso - cantidadProducida);

                if (orden.id_fase === ultimaFase.id_fase) {
                    producto.stock_apartado += cantidadProducida;
                } else {
                    producto.stock_en_proceso += cantidadProducida;
                }

                await updateProducto(producto);
            } else {
                showToast("❌ No se encontró el producto para actualizar.", ICONOS.error);
                console.error('❌ No se encontró el producto para actualizar');
            }
        }

        if (cantidadProducida < detalleO.cantidad_inicial) {
            const faltante = detalleO.cantidad_inicial - cantidadProducida;

            const ordenes = await readOrdenesByVenta(ordenData.id_venta);
            const ordenReposicion = ordenes.find(o =>
                o.id_origen === 5 &&
                o.categoria === detalleO.categoria &&
                o.size === detalleO.size
            );

            if (!ordenReposicion) {
                await ordenesActions(
                    ordenData.id_venta,
                    ordenData.fecha_entrega,
                    {
                        categoria: detalleO.categoria,
                        size: detalleO.size
                    },
                    faltante
                );

                showToast(`🛠 Se creó una orden de reposición por ${faltante} piezas.`, ICONOS.info);
                setTimeout(() => window.location.reload(), 1000);
                return;

            } else {
                const nuevaCantidad = ordenReposicion.cantidad_inicial + faltante;

                const ordenActualizada = {
                    id_orden: ordenReposicion.id_orden,
                    cantidad_inicial: nuevaCantidad,
                };

                await updateOrden(ordenActualizada);

                showToast(`🔄 Se actualizó la orden de reposición con ${faltante} piezas adicionales.`, ICONOS.info);
                setTimeout(() => window.location.reload(), 1000);
                return;
            }
        }

        showToast("✅ Orden y stock actualizados correctamente.", ICONOS.exito);
        initProduccion();

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        showToast(`ERROR: ${error.message}`, ICONOS.error);
    }
}

async function ordenesActions(ventaId, fecha_entrega, item, faltanteRestante) {
    try {
        const orden = {
            id_venta: ventaId,
            id_origen: 5,
            fecha_entrega,
            categoria: item.categoria,
            size: item.size,
            cantidad_inicial: faltanteRestante
        };
        const newOrden = await createOrden(orden);
        return newOrden;
    } catch (error) {
        console.error('❌ ordenesActions ERROR:', error);
        showToast(`Error en ordenesActions: ${error.message}`, ICONOS.error);
        throw error;
    }
}

async function yaExisteReposicion(id_venta, categoria, size) {
    try {
        const ordenes = await readOrdenesByVenta(id_venta);
        return ordenes.some(o => 
            o.id_origen === 5 &&
            o.categoria === categoria &&
            o.size === size
        );
    } catch (error) {
        console.error("❌ Error buscando reposición existente:", error);
        return false;
    }
}