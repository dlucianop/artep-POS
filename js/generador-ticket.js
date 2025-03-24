const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const os = require("os");

function truncateText(doc, text, maxWidth) {
    if (doc.getTextWidth(text) <= maxWidth) {
        return text;
    }
    while (doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
        text = text.slice(0, -1);
    }
    return text + '...';
}

function generarRecibo() {
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

    // Crear documento PDF aqui-------------------------------------------------------

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight()*0.8;

    // (membrete)
    try {
        const logoPath = path.join(__dirname, "..", "img", "logo-artep.jpeg");
        const logoData = fs.readFileSync(logoPath).toString("base64");
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.addImage(logoData, "JPEG", 0, 0, pageWidth, pageHeight);
        doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (error) {
        console.error("Error al cargar el logo:", error);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NOTA DE VENTA", 80, 20);
    doc.setFontSize(16);
    doc.text(`${empresa}`, 88, 30);
    doc.setLineWidth(0.5);
    doc.line(20, 33, 200, 33);

    doc.setFont("helvetica", "light");
    doc.setFontSize(12);
    let y = 40;
    doc.text(`No. de Venta: ${idVenta}`, 20, y);
    y += 8;
    doc.text(`Fecha: ${saleDate}`, 20, y);
    doc.text(`Hora: ${saleHour}`, 130, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(20, y, 200, y);
    y += 8;
    doc.text(`Nombre del Cliente: ${clientName}`, 20, y);
    y += 8;
    doc.text(`Teléfono: ${clientPhone}`, 20, y);
    doc.text(`Correo: ${clientMail}`, 100, y);
    y += 8;
    doc.text(`Domicilio: ${clientAddress}`, 20, y);
    y += 8;
    doc.text(`Fecha de entrega: ${saleEntrega}`, 20, y);
    y += 8;
    doc.text(`Metodo de pago: ${paymentMethod}`, 20, y);
    doc.text(`Forma de pago: ${paymentForm}`, 120, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(20, y, 200, y);

    // Sección de productos
    y = 120;
    doc.setFont("helvetica", "bold");
    doc.text("Productos:", 20, y);
    y += 10;
  
    // Encabezado de la tabla de productos
    doc.setFontSize(10);
    doc.text("Código", 20, y);
    doc.text("Descripción", 50, y);
    doc.text("Precio Unitario", 100, y);
    doc.text("Cantidad", 140, y);
    doc.text("Importe", 170, y);
    y += 6;
    doc.setLineWidth(0.5);
    doc.line(20, y, 200, y);
    y += 4;
  
    const colWidths = {
        codigo: 25,
        descripcion: 45,
        precioUnitario: 20,
        cantidad: 20,
        importe: 20
    };

    doc.setFont("helvetica", "normal");
    productos.forEach(prod => {
        const codigo = truncateText(doc, prod.codigo, colWidths.codigo);
        const descripcion = truncateText(doc, prod.descripcion, colWidths.descripcion);
        const precioUnitario = truncateText(doc, prod.precioUnitario, colWidths.precioUnitario);
        const cantidad = truncateText(doc, prod.cantidad, colWidths.cantidad);
        const importe = truncateText(doc, prod.importe, colWidths.importe);

        doc.text(codigo, 20, y);
        doc.text(descripcion, 50, y);
        doc.text(precioUnitario, 100, y);
        doc.text(cantidad, 140, y);
        doc.text(importe, 170, y);
        y += 8;
    });

    // Sección de totales
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de la Venta:", 150, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Monto: $${monto}`, 150, y);
    y += 8;
    doc.text(`Descuento: $${descuento}`, 150, y);
    y += 8;
    doc.text(`Pago: $${pago}`, 150, y);
    y += 20;
    doc.text(`TOTAL: $${total}`, 150, y);
    y += 8;
    doc.text(`Cambio: $${cambio}`, 150, y);

    // firma
    y += 20;
    doc.line(20, y, 100, y);
    doc.text("Firma del cliente", 20, y + 10);

    const pdfBytes = doc.output("arraybuffer");
    const currentDate = new Date().toLocaleDateString().replace(/\//g, "-");
    const nombre = `VentaNo${idVenta}_${currentDate}.pdf`;
    const rutaGuardado = path.join(os.homedir(), "Downloads", nombre);

    fs.writeFile(rutaGuardado, Buffer.from(pdfBytes), (err) => {
        if (err) {
            showToast(`No se pudo guardar el recibo: ${err}`, ICONOS.error);
        } else {
            showToast(`Recibo guardado en: ${rutaGuardado}`, ICONOS.exito);
        }
    });
}

module.exports = generarRecibo;
