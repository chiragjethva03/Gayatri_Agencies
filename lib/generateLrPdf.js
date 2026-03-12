import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateLrPdf = (lrData) => {
  const doc = new jsPDF();
  
  // 1. DYNAMIC TRANSPORT NAME
  const transportName = lrData.transportSlug 
    ? lrData.transportSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : "SHREE JALARAM TRANSPORT";

  const lrNo = lrData.lrNo || "Auto";
  const date = lrData.lrDate || lrData.date || new Date().toLocaleDateString();
  const fromCity = lrData.fromCity || "-";
  const toCity = lrData.toCity || "-";
  const consignor = lrData.consignor || "-";
  const consignee = lrData.consignee || "-";

  // --- PAGE BORDER ---
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277);

  // --- HEADER SECTION ---
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 10, 190, 25, 'F'); 
  doc.rect(10, 10, 190, 25, 'S'); 

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("LORRY RECEIPT", 105, 18, { align: "center" });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(transportName.toUpperCase(), 105, 27, { align: "center" });

  // --- LR DETAILS SECTION ---
  let startY = 42;
  doc.setFontSize(10);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("LR No :", 15, startY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${lrNo}`, 30, startY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Date :", 150, startY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${date}`, 162, startY);

  startY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("From :", 15, startY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${fromCity}`, 30, startY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("To :", 150, startY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${toCity}`, 162, startY);

  doc.line(10, startY + 5, 200, startY + 5); 

  // --- CONSIGNOR / CONSIGNEE SECTION ---
  startY += 12;
  doc.rect(10, startY-7, 95, 28); 
  doc.rect(105, startY-7, 95, 28); 

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("CONSIGNOR", 15, startY-2);
  doc.text("CONSIGNEE", 110, startY-2);
  
  doc.line(10, startY, 105, startY); 
  doc.line(105, startY, 200, startY); 

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  
  const splitConsignor = doc.splitTextToSize(consignor, 85);
  const splitConsignee = doc.splitTextToSize(consignee, 85);
  doc.text(splitConsignor, 15, startY + 6);
  doc.text(splitConsignee, 110, startY + 6);

  // --- TABLE SECTION ---
  const tableRows = [];
  
  // Use lrData.goods from your state
  const goodsArray = lrData.goods && lrData.goods.length > 0 ? lrData.goods : [];

  if (goodsArray.length > 0) {
    goodsArray.forEach(item => {
      // Only push rows that actually have data inputted, skips blank default rows
      if (item.article || item.goodsContain || item.weight || item.amount || item.rate) {
        tableRows.push([ 
          item.article || "0", 
          item.goodsContain || "-", // Maps to your Goods Contain field
          item.weight || "0", 
          Number(item.amount || item.rate || 0).toFixed(2) // Maps to Amount or Rate
        ]);
      }
    });
  } 
  
  // Fallback if table is completely empty
  if (tableRows.length === 0) {
    tableRows.push(["0", "-", "0", "0.00"]);
  }

  autoTable(doc, {
    startY: startY + 23,
    head: [["Articles", "Description (Goods)", "Weight (Kg)", "Freight (Rs)"]],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
        fillColor: [240, 242, 245], 
        textColor: [30, 30, 30], 
        fontStyle: 'bold',
        halign: 'center' 
    },
    bodyStyles: {
        textColor: [50, 50, 50]
    },
    columnStyles: {
        0: { halign: 'center' }, 
        1: { halign: 'left' },   
        2: { halign: 'center' }, 
        3: { halign: 'right' }   
    },
    styles: { 
        fontSize: 10, 
        cellPadding: 6,
        lineColor: [200, 200, 200]
    },
    margin: { left: 10, right: 10 }
  });

  // --- FOOTER SECTION ---
  let finalY = doc.lastAutoTable.finalY + 5;
  
  const subTotal = Number(lrData.subTotal || lrData.freight || 0).toFixed(2);
  const totalFreight = Number(lrData.totalFreight || lrData.grandTotal || subTotal).toFixed(2);
  const toPay = Number(lrData.toPay || 0).toFixed(2);
  const paid = Number(lrData.paid || 0).toFixed(2);

  doc.setDrawColor(200, 200, 200);
  doc.rect(10, finalY, 190, 42);
  doc.line(130, finalY, 130, finalY + 42);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Terms & Conditions:", 15, finalY + 8);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("1. All disputes are subject to local jurisdiction.", 15, finalY + 14);
  doc.text("2. Goods transported at owner's risk.", 15, finalY + 19);

  // Totals
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  let totY = finalY + 9;
  const labelX = 135;
  const valueX = 195;

  doc.setFont("helvetica", "normal");
  doc.text("Sub Total:", labelX, totY);
  doc.text(`${subTotal}`, valueX, totY, { align: "right" });

  totY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total Freight:", labelX, totY);
  doc.text(`${totalFreight}`, valueX, totY, { align: "right" });

  totY += 8;
  doc.setFont("helvetica", "normal");
  doc.text("To Pay:", labelX, totY);
  doc.text(`${toPay}`, valueX, totY, { align: "right" });

  totY += 8;
  doc.text("Paid:", labelX, totY);
  doc.text(`${paid}`, valueX, totY, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by ERP System", 105, 282, { align: "center" });

  doc.save(`LR_Receipt_${lrNo}.pdf`);
};