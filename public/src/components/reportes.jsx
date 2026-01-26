import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarReportePDF = (salidas, mes, año) => {
  // Validar que existan datos
  if (!salidas || salidas.length === 0) {
    alert('No hay datos para generar el reporte');
    return;
  }

  if (!mes || !año) {
    alert('Debe seleccionar mes y año');
    return;
  }

  const doc = new jsPDF();

  // Formatear fecha a dd-mm-yyyy
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  };

  // Obtener nombre del mes
  const nombreMes = new Date(año, mes - 1, 1).toLocaleString('es', { month: 'long' });
  const tituloMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  // Agrupar salidas por destinatario
  const grupos = {};
  salidas.forEach(s => {
    const destinatario = s.destinatario || 'Sin destinatario';
    if (!grupos[destinatario]) grupos[destinatario] = [];
    grupos[destinatario].push(s);
  });

  const destinatarios = Object.keys(grupos);

  destinatarios.forEach((destinatario, index) => {
    if (index > 0) doc.addPage(); // Nueva página para cada destinatario

    // Título
    doc.setFontSize(16);
    doc.text(`${tituloMes} ${año}`, 14, 20);

    // Crear filas de la tabla para este destinatario
    // Destinatario, Artículo, Código, Cantidad, Área, Fecha
    const rows = grupos[destinatario].map((s) => [
      destinatario,
      s.articulo || '',
      s.codigo || '',
      s.cantidad || '',
      s.area || '',
      formatFecha(s.fecha)
    ]);

    // Generar tabla
    autoTable(doc, {
      startY: 30,
      head: [['Destinatario', 'Artículo', 'Código', 'Cantidad', 'Área', 'Fecha']],
      body: rows,
      theme: 'grid', // Usar tema grid para mostrar todas las líneas
      headStyles: {
        fillColor: [185, 183, 183],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Destinatario
        1: { cellWidth: 45 }, // Artículo
        2: { cellWidth: 25 }, // Código
        3: { cellWidth: 20, halign: 'right' }, // Cantidad
        4: { cellWidth: 30 }, // Área
        5: { cellWidth: 20, halign: 'center' } // Fecha
      },

    });
  });

  doc.save(`reporte-salidas-${mes}-${año}.pdf`);
};