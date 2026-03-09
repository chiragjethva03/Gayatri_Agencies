import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <-- CHANGED IMPORT HERE

export const generateLrPdf = (lrData) => {
  const doc = new jsPDF();
  
  const lrNo = lrData.lrNo || "Auto";
  const date = lrData.date || new Date().toLocaleDateString();
  const fromCity = lrData.fromCity || "-";
  const toCity = lrData.toCity || "-";
  const consignor = lrData.consignor || "-";
  const consignee = lrData.consignee || "-";

  // 1. Draw Outer Page Border
  doc.rect(10, 10, 190, 277);

  // 2. Document Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LORRY RECEIPT", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("SHREE JALARAM TRANSPORT", 105, 28, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(10, 32, 200, 32);

  // 3. Basic Details Section
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`LR No: `, 15, 40);
  doc.setFont("helvetica", "bold");
  doc.text(`${lrNo}`, 30, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${date}`, 150, 40);
  
  doc.text(`From: `, 15, 48);
  doc.setFont("helvetica", "bold");
  doc.text(`${fromCity}`, 30, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`To: `, 150, 48);
  doc.setFont("helvetica", "bold");
  doc.text(`${toCity}`, 160, 48);

  // 4. Consignor & Consignee Boxes
  doc.rect(10, 53, 95, 35);
  doc.rect(105, 53, 95, 35);
  
  doc.setFont("helvetica", "bold");
  doc.text("CONSIGNOR:", 15, 60);
  doc.text("CONSIGNEE:", 110, 60);
  doc.setFont("helvetica", "normal");
  doc.text(`${consignor}`, 15, 68);
  doc.text(`${consignee}`, 110, 68);

  // 5. Goods Table Grid
  const tableRows = [];
  if (lrData.goodsList && lrData.goodsList.length > 0) {
    lrData.goodsList.forEach(item => {
      tableRows.push([ item.article || "-", item.description || "-", item.weight || "-", item.freight || "-" ]);
    });
  } else {
    tableRows.push([ lrData.article || "-", lrData.description || "-", lrData.weight || "-", lrData.freight || "-" ]);
  }

  // <-- CHANGED HOW AUTOTABLE IS CALLED HERE -->
  autoTable(doc, {
    startY: 92,
    head: [["Articles", "Description", "Weight (Kg)", "Freight (Rs)"]],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 115, 190], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 10, right: 10 }
  });

  // 6. Footer & Totals Section
  const finalY = doc.lastAutoTable.finalY || 120;
  doc.rect(10, finalY + 5, 190, 40);
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total Freight:`, 140, finalY + 15);
  doc.text(`Rs. ${lrData.totalFreight || lrData.freight || 0}`, 175, finalY + 15);
  doc.text(`To Pay:`, 140, finalY + 25);
  doc.text(`Rs. ${lrData.toPay || 0}`, 175, finalY + 25);
  doc.text(`Paid:`, 140, finalY + 35);
  doc.text(`Rs. ${lrData.paid || 0}`, 175, finalY + 35);
  
  doc.setFont("helvetica", "normal");
  doc.text("Terms & Conditions:", 15, finalY + 15);
  doc.setFontSize(8);
  doc.text("1. All disputes are subject to local jurisdiction.", 15, finalY + 22);
  doc.text("2. Goods transported at owner's risk.", 15, finalY + 27);

  // Trigger file download
  doc.save(`LR_Receipt_${lrNo}.pdf`);
};