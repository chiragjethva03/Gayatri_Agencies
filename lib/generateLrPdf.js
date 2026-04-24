import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateLrPdf = (lrData, transportData = null, consignorData = null, consigneeData = null) => {
  const doc = new jsPDF();

  // 1. EXTRACT DATA SAFELY
  const transportName = lrData.transportSlug
    ? lrData.transportSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : "SHREE JALARAM TRANSPORT";

  const transportGst = transportData?.gstNo || lrData.gstNo || lrData.transportGst || "-";

  const phoneNumbers = transportData?.mobileNumbers?.length
    ? transportData.mobileNumbers.join(", ")
    : (lrData.mobileNumbers ? lrData.mobileNumbers.join(", ") : "-");

  const lrNo = lrData.lrNo || "Auto";
  const date = lrData.lrDate || lrData.date || new Date().toLocaleDateString();
  const fromCity = lrData.fromCity || "-";
  const toCity = lrData.toCity || "-";
  const consignor = lrData.consignor || "-";
  const consignee = lrData.consignee || "-";
  const transportAddress = transportData?.address || lrData.address || "";
  const consignorGst = consignorData?.gstNo || "";
  const consignorPhone = consignorData?.mobile || consignorData?.phoneO || "";
  const consigneeGst = consigneeData?.gstNo || "";
  const consigneePhone = consigneeData?.mobile || consigneeData?.phoneO || "";
  const delivery = lrData.delivery || "";

  let jurisdiction = "local";
  if (lrData.toCity && lrData.toCity.trim() !== "" && lrData.toCity !== "-") {
    jurisdiction = lrData.toCity;
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);

  // --- HEADER SECTION ---
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 10, 190, 20, 'FD');

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("LORRY RECEIPT", 105, 15, { align: "center" });

  doc.setFontSize(16);
  doc.text(transportName.toUpperCase(), 105, 22, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`GST No: ${transportGst}`, 105, 27, { align: "center" });

  // --- LR DETAILS SECTION ---
  doc.rect(10, 30, 190, 18, 'S');

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LR No :", 15, 36);
  doc.setFont("helvetica", "bold");
  doc.text(`${lrNo}`, 30, 36);

  doc.setFont("helvetica", "normal");
  doc.text("Date :", 150, 36);
  doc.setFont("helvetica", "bold");
  doc.text(`${date}`, 162, 36);

  doc.setFont("helvetica", "normal");
  doc.text("From :", 15, 42);
  doc.setFont("helvetica", "bold");
  doc.text(`${fromCity}`, 30, 42);

  doc.setFont("helvetica", "normal");
  doc.text("To :", 150, 42);
  doc.setFont("helvetica", "bold");
  doc.text(`${toCity}`, 162, 42);

  // Delivery line
  doc.setFont("helvetica", "normal");
  doc.text("Delivery :", 15, 47);
  doc.setFont("helvetica", "bold");
  doc.text(delivery ? delivery : "-", 35, 47);

  // --- CONSIGNOR / CONSIGNEE SECTION ---
  doc.rect(10, 48, 95, 35, 'S');
  doc.rect(105, 48, 95, 35, 'S');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CONSIGNOR", 15, 53);
  doc.text("CONSIGNEE", 110, 53);

  doc.line(10, 55, 105, 55);
  doc.line(105, 55, 200, 55);

  // Consignor name + GST + Phone
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(doc.splitTextToSize(consignor, 85), 15, 60);

  doc.setFontSize(8);
  if (consignorGst) {
    doc.setFont("helvetica", "bold");
    doc.text("GST No: ", 15, 67);
    doc.setFont("helvetica", "normal");
    doc.text(consignorGst, 30, 67);
  }
  if (consignorPhone) {
    doc.setFont("helvetica", "bold");
    doc.text("Phone: ", 15, 72);
    doc.setFont("helvetica", "normal");
    doc.text(consignorPhone, 28, 72);
  }

  // Consignee name + GST + Phone
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(doc.splitTextToSize(consignee, 85), 110, 60);

  doc.setFontSize(8);
  if (consigneeGst) {
    doc.setFont("helvetica", "bold");
    doc.text("GST No: ", 110, 67);
    doc.setFont("helvetica", "normal");
    doc.text(consigneeGst, 125, 67);
  }
  if (consigneePhone) {
    doc.setFont("helvetica", "bold");
    doc.text("Phone: ", 110, 72);
    doc.setFont("helvetica", "normal");
    doc.text(consigneePhone, 123, 72);
  }

  // --- TABLE SECTION ---
  const tableRows = [];
  const goodsArray = lrData.goods && lrData.goods.length > 0 ? lrData.goods : [];

  if (goodsArray.length > 0) {
    goodsArray.forEach(item => {
      if (item.article || item.goodsContain || item.weight || item.amount || item.rate) {
        tableRows.push([
          item.article || "0",
          item.goodsContain || "-",
          item.weight || "0",
          Number(item.amount || item.rate || 0).toFixed(2)
        ]);
      }
    });
  }

  if (tableRows.length === 0) tableRows.push(["0", "-", "0", "0.00"]);

  autoTable(doc, {
    startY: 83,
    head: [["Articles", "Description (Goods)", "Weight (Kg)", "Freight (Rs)"]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 242, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { textColor: [0, 0, 0] },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'right' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineColor: [0, 0, 0],
      lineWidth: 0.3
    },
    margin: { left: 10, right: 10 }
  });

  // --- FOOTER SECTION ---
  let finalY = doc.lastAutoTable.finalY;

  const subTotal = Number(lrData.subTotal || lrData.freight || 0).toFixed(2);
  const totalFreight = Number(lrData.totalFreight || lrData.grandTotal || subTotal).toFixed(2);
  const toPay = Number(lrData.toPay || 0).toFixed(2);
  const paid = Number(lrData.paid || 0).toFixed(2);
  const freight = Number(lrData.freight || 0).toFixed(2);
  const crossing = Number(lrData.crossing || 0).toFixed(2);
  const doorDelivery = Number(lrData.doorDelivery || 0).toFixed(2);
  const hamali = Number(lrData.hamali || 0).toFixed(2);

  doc.setDrawColor(0, 0, 0);
  const addressLines = doc.splitTextToSize(transportAddress || "-", 100);
  const addressHeight = addressLines.length * 4.5;
  const extraRows = [hamali, crossing, doorDelivery].filter(v => Number(v) > 0).length;
  const boxHeight = 42 + (extraRows * 7) + addressHeight;
  doc.rect(10, finalY, 120, boxHeight, 'S');
  doc.rect(130, finalY, 70, boxHeight, 'S');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 15, finalY + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`1. All disputes are subject to ${jurisdiction} jurisdiction.`, 15, finalY + 14);
  doc.text("2. Goods transported at owner's risk.", 15, finalY + 19);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Address:", 15, finalY + 24);

  doc.setFont("helvetica", "normal");
  const lineHeight = 4.5;
  let addrY = finalY + 29;
  addressLines.forEach((line) => {
    doc.text(line, 15, addrY);
    addrY += lineHeight;
  });

  const contactY = addrY + 2;
  doc.setFont("helvetica", "bold");
  doc.text(`Contact: ${phoneNumbers}`, 15, contactY);

  // Totals
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let totY = finalY + 9;
  const labelX = 135;
  const valueX = 195;

  doc.text("Freight:", labelX, totY);
  doc.text(`${freight}`, valueX, totY, { align: "right" });

  if (Number(hamali) > 0) {
    totY += 7;
    doc.text("Hamali:", labelX, totY);
    doc.text(`${hamali}`, valueX, totY, { align: "right" });
  }

  if (Number(crossing) > 0) {
    totY += 7;
    doc.text("Crossing:", labelX, totY);
    doc.text(`${crossing}`, valueX, totY, { align: "right" });
  }

  if (Number(doorDelivery) > 0) {
    totY += 7;
    doc.text("Door Delivery:", labelX, totY);
    doc.text(`${doorDelivery}`, valueX, totY, { align: "right" });
  }

  totY += 7;
  doc.setFont("helvetica", "normal");
  doc.text("To Pay:", labelX, totY);
  doc.text(`${toPay}`, valueX, totY, { align: "right" });

  totY += 7;
  doc.text("Paid:", labelX, totY);
  doc.text(`${paid}`, valueX, totY, { align: "right" });

  totY += 7;
  doc.setFont("helvetica", "bold");
  doc.text("SubTotal:", labelX, totY);
  doc.text(`${totalFreight}`, valueX, totY, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by ERP System", 105, 282, { align: "center" });

  doc.save(`LR_Receipt_${lrNo}.pdf`);
};