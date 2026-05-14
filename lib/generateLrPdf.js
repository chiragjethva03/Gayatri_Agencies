import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateLrPdf = (lrData, transportData = null, consignorData = null, consigneeData = null, mode = "download") => {
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
  // Find branch address for the destination city, fall back to main address
  const matchedLoc = (transportData?.locations || []).find(loc => {
    const locName = typeof loc === "string" ? loc : (loc?.name || "");
    return locName.trim().toLowerCase() === (lrData.toCity || "").trim().toLowerCase();
  });
  const branchAddress = (typeof matchedLoc === "object" && matchedLoc?.address) ? matchedLoc.address : null;
  const transportAddress = branchAddress || transportData?.address || lrData.address || "";

  const isCashPartiConsignor = lrData.consignor === "Cash Parti";
  const isCashPartiConsignee = lrData.consignee === "Cash Parti";

  const consignor = isCashPartiConsignor
    ? (lrData.cashConsigner || "Cash Parti")
    : (lrData.consignor || "-");
  const consignee = isCashPartiConsignee
    ? (lrData.cashConsignee || "Cash Parti")
    : (lrData.consignee || "-");

  const consignorGst   = isCashPartiConsignor ? "" : (consignorData?.gstNo   || "");
  const consignorPhone = isCashPartiConsignor
    ? (lrData.consignorMobile || "")
    : (consignorData?.mobile || consignorData?.phoneO || "");
  const consigneeGst   = isCashPartiConsignee ? "" : (consigneeData?.gstNo   || "");
  const consigneePhone = isCashPartiConsignee
    ? (lrData.consigneeMobile || "")
    : (consigneeData?.mobile || consigneeData?.phoneO || "");
  const delivery = lrData.delivery || "";

  let jurisdiction = "local";
  if (lrData.toCity && lrData.toCity.trim() !== "" && lrData.toCity !== "-") {
    jurisdiction = lrData.toCity;
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);

  // E-Way Bill No — collect from all goods rows
  const eWayBills = (lrData.goods || []).map(g => g.eWayBillNo).filter(Boolean);
  const eWayBillDisplay = eWayBills.length > 0 ? eWayBills.join(", ") : "-";

  // --- HEADER SECTION ---
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 10, 190, 20, 'FD');
  doc.setTextColor(0, 0, 0);

  // LEFT: Transport Name + GST
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(transportName.toUpperCase(), 15, 19);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`GST No: ${transportGst}`, 15, 26);


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

  // Delivery line (left) + E-Way Bill No (right)
  doc.setFont("helvetica", "normal");
  doc.text("Delivery :", 15, 47);
  doc.setFont("helvetica", "bold");
  doc.text(delivery ? delivery : "-", 35, 47);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const ewLabel = "E-Way Bill No :";
  doc.text(ewLabel, 150, 47);
  const ewLabelW = doc.getTextWidth(ewLabel + " ");
  doc.setFont("helvetica", "bold");
  const ewValueX = 150 + ewLabelW;
  const ewMaxWidth = 195 - ewValueX;
  const ewText = doc.splitTextToSize(eWayBillDisplay, ewMaxWidth)[0] || "-";
  doc.text(ewText, ewValueX, 47);

  // --- CONSIGNOR / CONSIGNEE SECTION ---
  doc.rect(10, 48, 95, 35, 'S');
  doc.rect(105, 48, 95, 35, 'S');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CONSIGNOR" + (isCashPartiConsignor ? "  (Cash Parti)" : ""), 15, 53);
  doc.text("CONSIGNEE" + (isCashPartiConsignee ? "  (Cash Parti)" : ""), 110, 53);

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
      if (item.article || item.packaging || item.goodsContain || item.weight || item.amount || item.rate) {
        tableRows.push([
          item.article   || "0",
          item.packaging || "-",
          item.goodsContain || "-",
          item.weight    || "0",
          Number(item.amount || item.rate || 0).toFixed(2)
        ]);
      }
    });
  }

  if (tableRows.length === 0) tableRows.push(["0", "-", "-", "0", "0.00"]);

  autoTable(doc, {
    startY: 83,
    head: [["Articles", "Packaging", "Description (Goods)", "Weight (Kg)", "Freight (Rs)"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [240, 242, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: { textColor: [0, 0, 0] },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { halign: "center", cellWidth: 28 },
      2: { halign: "left" },               // flexible — takes remaining width
      3: { halign: "center", cellWidth: 28 },
      4: { halign: "right",  cellWidth: 30 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    margin: { left: 10, right: 10 },
  });

  // --- FOOTER SECTION ---
  let finalY = doc.lastAutoTable.finalY;

  const freightBy = (lrData.freightBy || "").trim().toLowerCase();
  const subTotal   = Number(lrData.subTotal || lrData.freight || 0);
  const freight    = Number(lrData.freight    || 0);
  const crossing   = Number(lrData.crossing   || 0);
  const doorDelivery = Number(lrData.doorDelivery || 0);
  const hamali     = Number(lrData.hamali     || 0);

  // Paid / To Pay logic driven entirely by freightBy
  const isPaid     = freightBy === "paid";
  const paidAmt    = isPaid ? subTotal : 0;
  const toPayAmt   = isPaid ? 0 : subTotal;
  const subTotalLabel = isPaid ? "Sub Paid Total:" : "Sub To Pay Total:";

  // Formatted strings for display
  const fSubTotal    = subTotal.toFixed(2);
  const fFreight     = freight.toFixed(2);
  const fCrossing    = crossing.toFixed(2);
  const fDoorDelivery = doorDelivery.toFixed(2);
  const fHamali      = hamali.toFixed(2);
  const fPaid        = paidAmt.toFixed(2);
  const fToPay       = toPayAmt.toFixed(2);

  doc.setDrawColor(0, 0, 0);
  const addressLines = doc.splitTextToSize(transportAddress || "-", 100);
  const addressHeight = addressLines.length * 4.5;
  const extraRows = [hamali, crossing, doorDelivery].filter(v => v > 0).length;
  const boxHeight = 42 + (extraRows * 7) + addressHeight;
  doc.rect(10, finalY, 120, boxHeight, 'S');
  doc.rect(130, finalY, 70, boxHeight, 'S');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 15, finalY + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`All disputes are subject to ${jurisdiction} jurisdiction.`, 15, finalY + 14);
  doc.text("Goods transported at owner's risk.", 15, finalY + 19);

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
  doc.text(fFreight, valueX, totY, { align: "right" });

  if (hamali > 0) {
    totY += 7;
    doc.text("Hamali:", labelX, totY);
    doc.text(fHamali, valueX, totY, { align: "right" });
  }

  if (crossing > 0) {
    totY += 7;
    doc.text("Crossing:", labelX, totY);
    doc.text(fCrossing, valueX, totY, { align: "right" });
  }

  if (doorDelivery > 0) {
    totY += 7;
    doc.text("Door Delivery:", labelX, totY);
    doc.text(fDoorDelivery, valueX, totY, { align: "right" });
  }

  totY += 7;
  doc.text("To Pay:", labelX, totY);
  doc.text(fToPay, valueX, totY, { align: "right" });

  totY += 7;
  doc.text("Paid:", labelX, totY);
  doc.text(fPaid, valueX, totY, { align: "right" });

  totY += 7;
  doc.setFont("helvetica", "bold");
  doc.text(subTotalLabel, labelX, totY);
  doc.text(fSubTotal, valueX, totY, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by ERP System", 105, 282, { align: "center" });

  if (mode === "print") {
    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  } else {
    doc.save(`LR_Receipt_${lrNo}.pdf`);
  }
};