const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function generarPDF(ticketData) {
  const downloadsPath = app.getPath('downloads');
  const pdfPath = path.join(downloadsPath, 'ticket.pdf');

  const doc = new PDFDocument();

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);
  doc.fontSize(18).text("Ticket", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text("Contenido del ticket...");
  
  if (ticketData) {
    doc.text(ticketData);
  }

  doc.end();

  stream.on('finish', () => {
    console.log('PDF generado en:', pdfPath);
  });
}

module.exports = { generarPDF };
