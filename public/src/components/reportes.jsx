import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarReportePDF = (grupos, mes, año) => {
  const doc = new jsPDF();
  const destinatariosUnicos = new Set();

  // 🔹 Extraemos todos los destinatarios únicos
  Object.keys(grupos).forEach((area) => {
    Object.keys(grupos[area]).forEach((destinatario) => {
      destinatariosUnicos.add(destinatario);
    });
  });

  const destinatarios = Array.from(destinatariosUnicos);

  destinatarios.forEach((destinatario, index) => {
    if (index > 0) doc.addPage(); // cada destinatario en nueva página

    doc.setFontSize(16);
    doc.text(`Reporte de Salidas - ${mes}/${año}`, 14, 20);

    doc.setFontSize(14);
    doc.text(`Destinatario: ${destinatario}`, 14, 30);

    let posY = 40;

    // 🔹 Recorremos las áreas donde este destinatario tiene datos
    Object.keys(grupos).forEach((area) => {
      if (grupos[area][destinatario]) {
        doc.setFontSize(12);
        doc.text(`Área: ${area}`, 14, posY);

        const rows = grupos[area][destinatario].map((s) => [
          s.fecha?.slice(0, 10).split("-").reverse().join("-"),
          s.articulo,
          s.cantidad,
        ]);

        autoTable(doc, {
          startY: posY + 5,
          head: [["Fecha", "Artículo", "Cantidad"]],
          body: rows,
        });

        posY = doc.lastAutoTable.finalY + 15; // mover cursor hacia abajo
      }
    });
  });

  doc.save(`reporte-salidas-${mes}-${año}.pdf`);
};