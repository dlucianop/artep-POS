const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const { dialog } = require("electron"); // Agregar esto

function generarRecibo() {
  const doc = new jsPDF();

  const cliente = "Juan Pérez";
  const fecha = new Date().toLocaleDateString();
  const concepto = "Pago de servicio de cerámica";
  const monto = "$150.00 USD";
  const empresa = "Taller Artep";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RECIBO DE PAGO", 80, 20);

  doc.setFontSize(12);
  doc.text(`Empresa: ${empresa}`, 20, 40);
  doc.text(`Fecha: ${fecha}`, 20, 50);
  doc.text(`Cliente: ${cliente}`, 20, 60);
  doc.text(`Concepto: ${concepto}`, 20, 70);
  doc.text(`Monto: ${monto}`, 20, 80);

  doc.line(20, 100, 100, 100);
  doc.text("Firma", 20, 110);

  // Obtener el PDF como Uint8Array
  const pdfBytes = doc.output("arraybuffer");

  // Ruta donde se guardará el PDF
  const rutaGuardado = path.join(__dirname, "recibo_pago.pdf");

  // Guardar el archivo usando fs
  fs.writeFile(rutaGuardado, Buffer.from(pdfBytes), (err) => {
    if (err) {
      dialog.showErrorBox("Error", "No se pudo guardar el recibo: " + err.message);
    } else {
      dialog.showMessageBoxSync({
        type: "info",
        title: "Éxito",
        message: `Recibo guardado en: ${rutaGuardado}`
      });
    }
  });
}