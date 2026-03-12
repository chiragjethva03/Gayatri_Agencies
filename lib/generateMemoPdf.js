import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateMemoPdf = (memoData) => {
  const doc = new jsPDF();

  // 1. DYNAMIC DATA MAPPING
  // Automatically format the transport name (e.g. "demo-transport" -> "Demo Transport")
  const transportName = memoData.transportSlug 
    ? memoData.transportSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : "SHREE JALARAM TRANSPORT";

  const memoNo = memoData.memoNo || "-";
  const rawDate = memoData.date || memoData.memoDate || new Date().toISOString();
  const dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
  
  const vehicle = memoData.vehicle || memoData.truckNo || "-";
  const driver = memoData.driver || "-";
  const fromCity = memoData.fromCity || memoData.toBranch || "AMD-ASLALI"; 
  const toCity = memoData.toCity || "-";
  const agent = memoData.agent || memoData.owner || "-";
  const narration = memoData.narration || "-";

  // Financials
  const hire = Number(memoData.hire || 0).toFixed(2);
  const advanced = Number(memoData.advanced || 0).toFixed(2);
  const toPay = Number(memoData.toPay || 0).toFixed(2);
  const paid = Number(memoData.paid || 0).toFixed(2);
  const balance = Number(memoData.balance || 0).toFixed(2);

  // 2. OUTER BORDER
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277);

  // 3. TOP TITLE SECTION (Polished)
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 10, 190, 25, 'F'); // Light background for header
  doc.rect(10, 10, 190, 25, 'S'); // Border for header

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(transportName.toUpperCase(), 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("ASLALI", 15, 26);

  // 4. GOODS DISPATCH MEMO BANNER
  doc.line(10, 35, 200, 35);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Goods Dispatch Memo", 105, 41, { align: "center" });
  doc.line(10, 44, 200, 44);

  // 5. 4-COLUMN HEADER INFO
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  let y = 50;
  
  // Col 1
  doc.setFont("helvetica", "normal"); doc.text("Date :", 15, y); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(dateStr, 32, y);
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Vehicle :", 15, y + 6); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(vehicle, 32, y + 6);
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Driver :", 15, y + 12); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(driver, 32, y + 12);

  // Col 2
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("From :", 65, y); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(fromCity, 80, y); 
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Mobile :", 65, y + 6);
  doc.text("LIC :", 65, y + 12);

  // Col 3
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("To :", 115, y); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(toCity, 130, y); 
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Owner :", 115, y + 6); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(agent, 130, y + 6);
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Hire :", 115, y + 12); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(hire, 130, y + 12);

  // Col 4
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Memo No :", 160, y); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(memoNo.toString(), 180, y); 
  
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Silak :", 160, y + 6);
  
  doc.text("Balance :", 160, y + 12); 
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(balance, 180, y + 12);

  // 6. LR TABLE MAPPING (With Smart Fallbacks)
  const lrList = memoData.lrList || memoData.lrs || [];
  const tableRows = [];
  let totalArticles = 0;
  let totalFreight = 0;

  if (lrList.length > 0) {
    lrList.forEach(lr => {
      const art = Number(lr.article || lr.articles || 0);
      const frt = Number(lr.freight || lr.amount || 0);
      totalArticles += art;
      totalFreight += frt;

      tableRows.push([
        lr.lrNo || "-",
        lr.consignor || "-",
        lr.consignee || "-",
        art.toString(),
        lr.description || lr.goodsContain || "-",
        frt.toFixed(2),
        lr.remarks || ""
      ]);
    });
  } else {
    tableRows.push(["-", "-", "-", "0", "-", "0.00", ""]);
  }

  // Draw strict grid table matching the polished UI
  autoTable(doc, {
    startY: 66,
    head: [["Lr No", "Consignor", "Consignee", "Art.", "Description", "Freight", "Remarks"]],
    body: tableRows,
    foot: [[`Lr: ${lrList.length}`, "", "", totalArticles.toString(), "", totalFreight.toFixed(2), ""]],
    theme: 'grid',
    headStyles: { 
        fillColor: [240, 242, 245], 
        textColor: [30, 30, 30], 
        fontStyle: 'bold' 
    },
    footStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold' 
    },
    columnStyles: {
        3: { halign: 'center' }, // Art centered
        5: { halign: 'right' }   // Freight right aligned
    },
    styles: { 
        fontSize: 9, 
        cellPadding: 3, 
        lineColor: [200, 200, 200],
        textColor: [50, 50, 50]
    },
    margin: { left: 10, right: 10 }
  });

  // 7. REMARKS SECTION
  let finalY = doc.lastAutoTable.finalY;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Remark :", 15, finalY + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(narration, 35, finalY + 6);
  doc.setDrawColor(200,200,200);
  doc.line(10, finalY + 10, 200, finalY + 10); 

  // 8. 3-COLUMN FINANCIAL FOOTER
  y = finalY + 16;
  doc.setFontSize(10);
  
  // Bottom Col 1
  doc.setFont("helvetica", "bold"); doc.text("Truck Rent :", 15, y); 
  doc.setFont("helvetica", "normal"); doc.text(hire, 45, y);
  
  doc.setFont("helvetica", "bold"); doc.text("Advance :", 15, y + 6); 
  doc.setFont("helvetica", "normal"); doc.text(advanced, 45, y + 6);
  
  doc.setFont("helvetica", "bold"); doc.text("Balance :", 15, y + 12); 
  doc.setFont("helvetica", "normal"); doc.text(balance, 45, y + 12);

  // Bottom Col 2
  doc.setFont("helvetica", "bold"); doc.text("Advance :", 85, y); 
  doc.setFont("helvetica", "normal"); doc.text(advanced, 115, y);
  
  doc.setFont("helvetica", "bold"); doc.text("To Pay Amt :", 85, y + 6); 
  doc.setFont("helvetica", "normal"); doc.text(toPay, 115, y + 6);
  
  doc.line(85, y + 8, 135, y + 8); // Math line
  
  doc.setFont("helvetica", "bold"); doc.text("Total :", 85, y + 13); 
  doc.text(toPay, 115, y + 13); 

  // Bottom Col 3
  doc.setFont("helvetica", "bold"); doc.text("To Pay :", 155, y); 
  doc.setFont("helvetica", "normal"); doc.text(toPay, 195, y, { align: 'right' });
  
  doc.setFont("helvetica", "bold"); doc.text("Paid :", 155, y + 6); 
  doc.setFont("helvetica", "normal"); doc.text(paid, 195, y + 6, { align: 'right' });
  
  doc.setFont("helvetica", "bold"); doc.text("TBB :", 155, y + 12); 
  doc.setFont("helvetica", "normal"); doc.text("0.00", 195, y + 12, { align: 'right' });
  
  doc.line(155, y + 14, 195, y + 14); // Math Line
  
  doc.setFont("helvetica", "bold"); doc.text("Total :", 155, y + 19); 
  doc.text(totalFreight.toFixed(2), 195, y + 19, { align: 'right' });

  // 9. DISCLAIMER BOX AT BOTTOM
  doc.setDrawColor(200,200,200);
  doc.line(10, 267, 200, 267); 
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Note : Driver, Cleaner and Truck Owner is Responsible For Goods Found In Truck. Which is not there in our L.R. Or Memo.", 105, 273, { align: "center" });

  // Output File
  doc.save(`Memo_${memoNo}_${dateStr}.pdf`);
};