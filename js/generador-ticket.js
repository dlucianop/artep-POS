const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const os = require("os");

function truncateText(doc, text, maxWidth) {
    let str = text != null ? String(text) : '';
    let truncated = str;
    while (doc.getTextWidth(truncated) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    return truncated;
}

function generarRecibos(venta) {
  return new Promise((resolve, reject) => {
    try {
        const datos = venta.venta_datos[0];
        const empresa = "Cerámica Artep";
        const productos = venta.venta_datos.map(item => ({
            codigo: item.codigo,
            descripcion: item.nombre,
            precioUnitario: item.precioUnit,
            cantidad: item.cantidad,
            importe: item.importe
        }));
        const { monto, pago, cambio } = datos;

        const MARGIN = 20;
        const SPACING = 4;
        const LINE_HEIGHT = 6;
        const pageWidth = new jsPDF().internal.pageSize.getWidth();
        const bottomMargin = 30;
        const colX = {
            codigo: MARGIN,
            descripcion: MARGIN + 25,
            precio: MARGIN + 110,
            cantidad: MARGIN + 130,
            importe: MARGIN + 150
          };

        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.getHeight();

        try {
            const logoPath = path.join(__dirname, '..', 'img', 'logo-artep.jpeg');
            const logoData = fs.readFileSync(logoPath).toString('base64');
            doc.setGState(new doc.GState({ opacity: 0.1 }));
            doc.addImage(logoData, 'JPEG', 0, 0, pageWidth, pageHeight * 0.8);
            doc.setGState(new doc.GState({ opacity: 1 }));
        } catch (err) {
            console.error('Error cargando logo:', err);
        }

        // Encabezado
        let y = 20;
        doc.setFont('helvetica', 'bold').setFontSize(20)
            .text('NOTA DE VENTA', pageWidth / 2, y, { align: 'center' });
        y += LINE_HEIGHT + SPACING;
        doc.setFontSize(16)
            .text(empresa, pageWidth / 2, y, { align: 'center' });
        y += LINE_HEIGHT;
        doc.setLineWidth(0.5)
            .line(MARGIN, y, pageWidth - MARGIN, y);
        y += SPACING * 2;

        // Datos de venta
        doc.setFont('helvetica', 'normal').setFontSize(12);
        const ven = datos;
        const pair = (label, value, xPos) => {
            const txt = String(value);
            doc.text(`${label}: ${txt}`, xPos, y);
        };
        pair('No. Venta', ven.noDeVenta, MARGIN);
        pair('Fecha', ven.fecha_venta, pageWidth / 2);
        y += LINE_HEIGHT;
        pair('Hora', ven.hora_venta, pageWidth / 2);
        y += LINE_HEIGHT;
        doc.line(MARGIN, y, pageWidth - MARGIN, y);
        y += SPACING;
        pair('Cliente', ven.cliente_name, MARGIN);
        y += LINE_HEIGHT;
        pair('Teléfono', ven.telefono, MARGIN);
        pair('Correo', ven.correo, pageWidth / 2);
        y += LINE_HEIGHT;
        pair('Domicilio', ven.domicilio, MARGIN);
        y += LINE_HEIGHT;
        pair('Entrega', ven.fecha_entrega, MARGIN);
        y += LINE_HEIGHT;
        pair('Método pago', ven.metodo_pago, MARGIN);
        pair('Forma pago', ven.forma_pago, pageWidth / 2);
        y += LINE_HEIGHT;
        doc.line(MARGIN, y, pageWidth - MARGIN, y);

        // Tabla de productos
        y += SPACING * 2;
        doc.setFont('helvetica', 'bold').setFontSize(12)
            .text('>> P R O D U C T O S <<', MARGIN, y);
        y += LINE_HEIGHT;
        doc.setFontSize(10);
        doc.text('Código', colX.codigo, y);
        doc.text('Descripción', colX.descripcion, y);
        doc.text('P.Unit($)', colX.precio, y);
        doc.text('Cant.', colX.cantidad, y);
        doc.text('Importe($)', colX.importe, y);
        y += SPACING;
        doc.line(MARGIN, y, pageWidth - MARGIN, y);
        y += SPACING;
        doc.setFont('helvetica', 'normal');

        productos.forEach(item => {
            // Recortar campos
            const codeTxt = truncateText(doc, item.codigo, colX.descripcion - colX.codigo - SPACING);
            const priceTxt = truncateText(doc, item.precioUnitario, colX.cantidad - colX.precio - SPACING);
            const qtyTxt = truncateText(doc, item.cantidad, colX.importe - colX.cantidad - SPACING);
            const impTxt = truncateText(doc, item.importe, pageWidth - MARGIN - colX.importe);

            const descLines = doc.splitTextToSize(String(item.descripcion), colX.precio - colX.descripcion - SPACING);
            const blockHeight = descLines.length * LINE_HEIGHT;

            // Salto PENDIENTEEEEE
            if (y + blockHeight > pageHeight - bottomMargin) {
            doc.addPage();
            y = MARGIN;
            }

            // Texto en fila
            doc.text(codeTxt, colX.codigo, y);
            doc.text(descLines, colX.descripcion, y);
            doc.text(priceTxt, colX.precio, y);
            doc.text(qtyTxt, colX.cantidad, y);
            doc.text(impTxt, colX.importe, y);
            y += blockHeight;
        });

        // TOTLALES
        y = pageHeight - bottomMargin + SPACING;
        doc.setFont('helvetica', 'bold')
            .text('Resumen de Venta', pageWidth - MARGIN, y, { align: 'right' });
        y += LINE_HEIGHT;
        doc.setFont('helvetica', 'normal');
        doc.text(`Monto: $${monto}`, pageWidth - MARGIN, y, { align: 'right' });
        y += LINE_HEIGHT;
        doc.text(`Pago:  $${pago}`, pageWidth - MARGIN, y, { align: 'right' });
        y += LINE_HEIGHT;
        doc.text(`Cambio: $${cambio}`, pageWidth - MARGIN, y, { align: 'right' });

        const buffer = doc.output('arraybuffer');
        //const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `CerArtep_Nota-${ven.noDeVenta}.pdf`;
        const savePath = path.join(os.homedir(), 'Downloads', fileName);
        fs.writeFileSync(savePath, Buffer.from(buffer));
        console.log(`Recibo guardado en: ${savePath}`);

        resolve();
    } catch (err) {
        reject(err);
    }
    });
}

module.exports = { generarRecibos };
