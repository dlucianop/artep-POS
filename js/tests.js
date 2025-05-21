async function updateData(detalleV, detalleO, ordenData) {
    try {
        let orden = {
            id_fase: ordenData.id_fase,
            cantidad_buenos: document.getElementById("orden_cantidad_buenos").value,
            cantidad_rotos: document.getElementById("orden_cantidad_rotos").value,
            cantidad_deformes: document.getElementById("orden_cantidad_deformes").value,
            id_orden: ordenData.id_orden
        };

        //await updateOrden(orden)

        let newFase = window.fases.find(p => p.id_fase === ordenData.id_fase);

        if(newFase.tipo_fase === "Bizcocho") { //aqui digamos que cuando pasa de bizcho a producto pues si se hace la actulizacion osease stock apartado si, disponible no cambia, en proceso se quita

            let bizco = {
                stock_apartado,
                stock_disponible, 
                stock_en_proceso, 
                biz_category,
                biz_size,
            };
            
            //await updateBizcocho();

        } else{

            let producto = {
                category,
                model,
                size,
                decoration,
                color,
                price,
                stock_apartado,
                stock_disponible,
                stock_en_proceso,
                code
            }

            //await updateProducto();

        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        showToast(`ERROR: ${error.message}`, ICONOS.error);
    } 
}