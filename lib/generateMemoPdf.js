import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateMemoPdf = (memoData) => {
  const doc = new jsPDF();

  // 1. DYNAMIC DATA MAPPING
  // This ensures it pulls the exact details from the row you checked
  const memoNo = memoData.memoNo || "";
  const rawDate = memoData.date || memoData.memoDate || new Date().toISOString();
  const dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
  
  const vehicle = memoData.vehicle || memoData.truckNo || "";
  const driver = memoData.driver || "";
  const fromCity = memoData.fromCity || memoData.fromBranch || "AMD-ASLALI"; 
  const toCity = memoData.toCity || "";
  const agent = memoData.agent || memoData.owner || "";
  const hire = Number(memoData.hire) || 0;
  const advanced = Number(memoData.advanced) || 0;
  const toPay = Number(memoData.toPay) || 0;
  const paid = Number(memoData.paid) || 0;
  const balance = Number(memoData.balance) || 0;
  const narration = memoData.narration || "";
  const lrList = memoData.lrList || [];

  // 2. OUTER BORDER
  doc.rect(10, 10, 190, 267); // Fits A4 perfectly

  // 3. TOP TITLE SECTION
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("JALARAM TRANSPORT", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ASLALI", 15, 23);

  // 4. GOODS DISPATCH MEMO BANNER
  doc.line(10, 26, 200, 26);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Goods Dispatch Memo", 105, 31, { align: "center" });
  doc.line(10, 34, 200, 34);

  // 5. 4-COLUMN HEADER INFO
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let y = 40;
  
  // Col 1
  doc.text("Date :", 15, y); doc.text(dateStr, 35, y);
  doc.text("Vehicle :", 15, y + 6); doc.text(vehicle, 35, y + 6);
  doc.text("Driver :", 15, y + 12); doc.text(driver, 35, y + 12);

  // Col 2
  doc.text("From :", 65, y); doc.setFont("helvetica", "bold"); doc.text(fromCity, 80, y); doc.setFont("helvetica", "normal");
  doc.text("Mobile :", 65, y + 6);
  doc.text("LIC :", 65, y + 12);

  // Col 3
  doc.text("To :", 120, y); doc.setFont("helvetica", "bold"); doc.text(toCity, 135, y); doc.setFont("helvetica", "normal");
  doc.text("Owner :", 120, y + 6); doc.text(agent, 135, y + 6);
  doc.text("Hire :", 120, y + 12); doc.text(hire.toString(), 135, y + 12);

  // Col 4
  doc.text("Memo No :", 165, y); doc.setFont("helvetica", "bold"); doc.text(memoNo.toString(), 185, y); doc.setFont("helvetica", "normal");
  doc.text("Silak :", 165, y + 6);
  doc.text("Balance :", 165, y + 12); doc.text(balance.toString(), 185, y + 12);

  // 6. LR TABLE MAPPING
  const tableRows = lrList.map(lr => [
    lr.lrNo || "",
    lr.consignor || "",
    lr.consignee || "",
    lr.article || "0",
    lr.description || "",
    lr.freight || "0",
    "" // Remarks
  ]);

  const totalArticles = lrList.reduce((sum, lr) => sum + (Number(lr.article) || 0), 0);
  const totalFreight = lrList.reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);

  // Draw strict grid table matching the image
  autoTable(doc, {
    startY: 56,
    head: [["Lr No", "Consigner", "Consignee", "Art.", "Description", "Freight", "Remarks"]],
    body: tableRows,
    foot: [[`Lr: ${lrList.length}`, "", "", totalArticles.toString(), "", totalFreight.toString(), ""]],
    theme: 'grid',
    styles: { lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 10, right: 10 }
  });

  // 7. REMARKS SECTION
  let finalY = doc.lastAutoTable.finalY;
  doc.setFont("helvetica", "bold");
  doc.text("Remark :", 15, finalY + 6);
  doc.setFont("helvetica", "normal");
  doc.text(narration, 35, finalY + 6);
  doc.line(10, finalY + 10, 200, finalY + 10); // Line below remark

  // 8. 3-COLUMN FINANCIAL FOOTER
  y = finalY + 16;
  
  // Bottom Col 1
  doc.setFont("helvetica", "bold");
  doc.text("Truck Rent :", 15, y); doc.setFont("helvetica", "normal"); doc.text(hire.toString(), 45, y);
  doc.setFont("helvetica", "bold");
  doc.text("Advance :", 15, y + 6); doc.setFont("helvetica", "normal"); doc.text(advanced.toString(), 45, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text("Balance :", 15, y + 12); doc.setFont("helvetica", "normal"); doc.text(balance.toString(), 45, y + 12);

  // Bottom Col 2
  doc.setFont("helvetica", "bold");
  doc.text("Advance :", 85, y); doc.setFont("helvetica", "normal"); doc.text(advanced.toString(), 115, y);
  doc.setFont("helvetica", "bold");
  doc.text("To Pay Amt :", 85, y + 6); doc.setFont("helvetica", "normal"); doc.text(toPay.toString(), 115, y + 6);
  doc.line(85, y + 8, 130, y + 8); // Math line
  doc.setFont("helvetica", "bold");
  doc.text("Total :", 85, y + 12); doc.text(toPay.toString(), 115, y + 12); 

  // Bottom Col 3
  doc.setFont("helvetica", "bold");
  doc.text("To Pay :", 155, y); doc.setFont("helvetica", "normal"); doc.text(toPay.toString(), 195, y, { align: 'right' });
  doc.setFont("helvetica", "bold");
  doc.text("Paid :", 155, y + 6); doc.setFont("helvetica", "normal"); doc.text(paid.toString(), 195, y + 6, { align: 'right' });
  doc.setFont("helvetica", "bold");
  doc.text("TBB :", 155, y + 12); doc.setFont("helvetica", "normal"); doc.text("", 195, y + 12, { align: 'right' });
  doc.line(155, y + 14, 195, y + 14); // Math Line
  doc.setFont("helvetica", "bold");
  doc.text("Total :", 155, y + 18); doc.text(totalFreight.toString(), 195, y + 18, { align: 'right' });

  // 9. DISCLAIMER BOX AT BOTTOM
  doc.line(10, 267, 200, 267); // Top line of disclaimer box
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Note : Driver, Cleaner and Truck Owner is Responsible For Goods Found In Truck. Which is not there in our L.R. Or Memo.", 105, 273, { align: "center" });

  // Output File
  doc.save(`Memo_${memoNo}_${dateStr}.pdf`);
};