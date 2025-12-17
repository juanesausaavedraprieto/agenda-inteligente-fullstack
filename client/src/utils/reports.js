import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateAcademicReport = (courses, userName) => {
  const doc = new jsPDF();

  // 1. ENCABEZADO
  doc.setFontSize(20);
  doc.text("Reporte Académico", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Estudiante: ${userName}`, 14, 32);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 38);

  // 2. PREPARAR DATOS PARA LA TABLA
  const tableRows = [];
  let totalCredits = 0;
  let weightedSum = 0;

  courses.forEach(course => {
    const status = course.average >= 13 ? "Aprobado" : "En Riesgo";
    const statusColor = course.average >= 13 ? [46, 204, 113] : [231, 76, 60]; // Verde o Rojo (RGB)
    
    // Calcular para el promedio ponderado final
    totalCredits += Number(course.credits);
    weightedSum += Number(course.average) * Number(course.credits);

    const rowData = [
      course.name,
      course.cycle,
      course.credits,
      course.average,
      status
    ];
    tableRows.push(rowData);
  });

  const finalAverage = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";

  // 3. GENERAR TABLA
  autoTable(doc, {
    head: [['Curso', 'Ciclo', 'Créditos', 'Promedio', 'Estado']],
    body: tableRows,
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181] }, // Color Índigo
    styles: { fontSize: 10 },
    // Colorear la columna de estado
    didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4) {
            const score = parseFloat(data.row.raw[3]); // Leemos el promedio de la fila
            if (score < 13) {
                data.cell.styles.textColor = [231, 76, 60]; // Rojo
                data.cell.styles.fontStyle = 'bold';
            } else {
                data.cell.styles.textColor = [46, 204, 113]; // Verde
                data.cell.styles.fontStyle = 'bold';
            }
        }
    }
  });

  // 4. PIE DE PÁGINA CON PROMEDIO FINAL
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Promedio Ponderado General: ${finalAverage}`, 14, finalY);

  if(finalAverage >= 13) {
      doc.setTextColor(46, 204, 113);
      doc.text("¡Buen trabajo! Estás aprobando el ciclo.", 14, finalY + 7);
  } else {
      doc.setTextColor(231, 76, 60);
      doc.text("¡Cuidado! Necesitas mejorar tu promedio.", 14, finalY + 7);
  }

  // 5. DESCARGAR
  doc.save(`Reporte_Notas_${new Date().toISOString().split('T')[0]}.pdf`);
};