import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Truncates text with '…' so it never exceeds maxWidth (mm) at the current font settings.
const clipText = (doc, text, maxWidth) => {
  if (!text || doc.getTextWidth(String(text)) <= maxWidth) return String(text ?? "");
  let t = String(text);
  while (t.length > 0 && doc.getTextWidth(t + "…") > maxWidth) t = t.slice(0, -1);
  return t + "…";
};

export const generateMemoPdf = (memoData, mode = "download") => {
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
  const fromCity = memoData.toCity || "AMD-ASLALI";
  const toCity = memoData.toBranch || "-";
  const agent = memoData.agent || memoData.owner || "-";
  const narration = memoData.narration || "-";

  // Resolve lrList early so derived totals can fall back to it
  const lrListEarly = memoData.lrList || memoData.lrs || [];

  // Financials — use pre-computed values from handlePrint if available, else derive
  const hireN      = Number(memoData.hire     || 0);
  const advancedN  = Number(memoData.advanced || 0);
  const toPayN     = Number(memoData.toPay    || 0);
  const paidN      = Number(memoData.paid     || 0);
  const hamaliN    = Number(memoData.hamali   || 0);

  const hire     = hireN.toFixed(2);
  const advanced = advancedN.toFixed(2);
  const toPay    = toPayN.toFixed(2);
  const paid     = paidN.toFixed(2);
  const hamali   = hamaliN.toFixed(2);

  // Derived totals — use pre-computed or fall back to live computation from lrListEarly
  const paidLrTotalN   = Number(memoData.paidLrTotal  ?? lrListEarly.filter(l => (l.freightBy||"").toLowerCase() === "paid" ).reduce((s,l) => s+(Number(l.freight)||0), 0));
  const toPayLrTotalN  = Number(memoData.toPayLrTotal ?? lrListEarly.filter(l => (l.freightBy||"").toLowerCase() === "to pay").reduce((s,l) => s+(Number(l.freight)||0), 0));
  const crossingN      = Number(memoData.crossingTotal ?? 0);
  const truckBalanceN  = memoData.truckBalance   != null ? Number(memoData.truckBalance)   : hireN - advancedN;
  const paidNetN       = memoData.paidNetSettled != null ? Number(memoData.paidNetSettled) : paidLrTotalN - advancedN - crossingN - hamaliN;
  const tbbN           = memoData.tbb            != null ? Number(memoData.tbb)            : lrListEarly.filter(l => (l.freightBy||"").toLowerCase() === "tbb").reduce((s,l) => s+(Number(l.freight)||0), 0);

  const truckBalance  = truckBalanceN.toFixed(2);
  const paidLrTotal   = paidLrTotalN.toFixed(2);
  const toPayLrTotal  = toPayLrTotalN.toFixed(2);
  const paidNet       = paidNetN.toFixed(2);
  const tbb           = tbbN.toFixed(2);

  // 2. OUTER BORDER
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277);

  // 3. TOP TITLE SECTION — compact to save vertical space for LR table
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 10, 190, 18, 'F');
  doc.rect(10, 10, 190, 18, 'S');

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(transportName.toUpperCase(), 15, 17);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("ASLALI", 15, 23);

  // 4. GOODS DISPATCH MEMO BANNER
  doc.line(10, 28, 200, 28);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Goods Dispatch Memo", 105, 33, { align: "center" });
  doc.line(10, 36, 200, 36);

  // 5. 4-COLUMN HEADER INFO — tighter spacing (5pt rows instead of 6)
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  let y = 41;

  // Col 1  (values start x=30, next col x=65 → 33mm available)
  doc.setFont("helvetica", "normal"); doc.text("Date :", 15, y);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, dateStr, 33), 30, y);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Vehicle :", 15, y + 5);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, vehicle, 33), 30, y + 5);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Driver :", 15, y + 10);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, driver, 33), 30, y + 10);

  // Col 2  (fromCity value starts x=78, next col x=115 → 35mm available)
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("From :", 65, y);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, fromCity, 35), 78, y);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Mobile :", 65, y + 5);
  doc.text("LIC :", 65, y + 10);

  // Col 3  (toCity x=126 → 32mm; agent x=130 → 28mm; hire is numeric, always short)
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("To :", 115, y);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, toCity, 32), 126, y);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Owner :", 115, y + 5);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, agent, 28), 130, y + 5);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Hire :", 115, y + 10);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(hire, 126, y + 10);

  // Col 4  (memoNo x=180 → 18mm; truckBalance numeric, always short)
  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Memo No :", 160, y);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(clipText(doc, memoNo.toString(), 18), 180, y);

  doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text("Silak :", 160, y + 5);

  doc.text("Balance :", 160, y + 10);
  doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text(truckBalance, 180, y + 10);

  // 6. LR TABLE MAPPING (With Smart Fallbacks)
  const lrList = lrListEarly;
  const tableRows = [];
  // Body row indices (0-based) whose freight cell belongs to a paid LR — used by didDrawCell
  const paidRowIndices = new Set();
  let totalArticles = 0;
  let totalPaidCol  = 0;
  let totalToPayCol = 0;

  if (lrList.length > 0) {
    lrList.forEach(lr => {
      const frt    = Number(lr.freight || lr.amount || 0);
      const isPaid = (lr.freightBy || "").trim().toLowerCase() === "paid";
      if (isPaid) totalPaidCol  += frt;
      else        totalToPayCol += frt;

      // Resolve goods rows — backward compatible with old single-row records
      const goodsRows = (lr.goods || []).filter(g => g.article || g.packaging || g.goodsContain);
      const rows = goodsRows.length > 0
        ? goodsRows
        : [{ article: lr.article || lr.articles || 0, packaging: lr.packaging, goodsContain: lr.description || lr.goodsContain }];

      // Detect if this LR has per-goods amounts stored (new records).
      // If none have amount > 0, fall back to showing total on first row (old records).
      const hasPerGoodsAmounts = rows.some(g => Number(g.amount) > 0);

      rows.forEach((g, gIdx) => {
        const gArt = Number(g.article) || 0;
        totalArticles += gArt;
        const desc = [g.packaging, g.goodsContain].filter(v => v && v !== "-").join(" / ") || "-";

        // Freight cell: per-goods amount when available, else total on first row only.
        // No text prefix — "(P)" for paid LRs is rendered bold via didDrawCell hook.
        let freightCell = "";
        if (hasPerGoodsAmounts) {
          const gAmt = Number(g.amount) || 0;
          if (gAmt > 0) {
            if (isPaid) paidRowIndices.add(tableRows.length);
            freightCell = gAmt.toFixed(2);
          }
        } else if (gIdx === 0) {
          if (isPaid) paidRowIndices.add(tableRows.length);
          freightCell = frt.toFixed(2);
        }

        if (gIdx === 0) {
          tableRows.push([
            lr.lrNo || "-",
            lr.consignor || "-",
            lr.consignee || "-",
            gArt.toString(),
            desc,
            freightCell,
            lr.remarks || ""
          ]);
        } else {
          tableRows.push(["", "", "", gArt.toString(), desc, freightCell, ""]);
        }
      });
    });
  } else {
    tableRows.push(["-", "-", "-", "0", "-", "0.00", ""]);
  }

  const totalFreight = totalPaidCol + totalToPayCol;

  autoTable(doc, {
    startY: 57,
    head: [["Lr No", "Consignor", "Consignee", "Art.", "Description", "Freight", "Remarks"]],
    body: tableRows,
    foot: [[`Lr: ${lrList.length}`, "", "", totalArticles.toString(), "", totalFreight.toFixed(2), ""]],
    theme: 'grid',
    headStyles: { fillColor: [240, 242, 245], textColor: [30, 30, 30], fontStyle: 'bold', fontSize: 7, cellPadding: 1.5 },
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],   fontStyle: 'bold', fontSize: 7, cellPadding: 1.5 },
    columnStyles: {
      3: { halign: 'center', cellWidth: 10 },
      5: { halign: 'right',  cellWidth: 18 },
      6: { cellWidth: 20 },
    },
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: [200, 200, 200], textColor: [50, 50, 50] },
    // For paid LRs, render "(P)" bold + freight amount normal in the freight cell.
    // autoTable can't mix bold/normal in one cell, so we overdraw after autoTable draws.
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 5) return;
      if (!paidRowIndices.has(data.row.index)) return;
      const raw = String(data.cell.raw || "");
      if (!raw) return;

      const { x, y, width, height } = data.cell;
      const pad = 1.5;

      // Erase autotable-drawn text with white fill, then redraw cell border
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, width, height, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(x, y, width, height, 'S');

      // Draw "(P) " bold + amount normal, right-aligned
      const textY = y + height / 2 + 1.2;
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);
      const pLabel = "(P) ";
      doc.setFont("helvetica", "bold");
      const pW = doc.getTextWidth(pLabel);
      doc.setFont("helvetica", "normal");
      const aW = doc.getTextWidth(raw);
      const startX = x + width - pad - pW - aW;
      doc.setFont("helvetica", "bold");
      doc.text(pLabel, startX, textY);
      doc.setFont("helvetica", "normal");
      doc.text(raw, startX + pW, textY);

      // Restore doc state for subsequent drawing
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);
    },
    // Redraw the outer border on every page so it appears correctly on multi-page tables
    didDrawPage: () => {
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, 10, 190, 277);
    },
    // Allow table to use most of each page; footer is placed after table, on a new page if needed
    margin: { left: 11, right: 11, bottom: 20 },
  });

  // 7. REMARKS SECTION
  let finalY = doc.lastAutoTable.finalY;

  // Footer needs ~58mm (remarks + financial cols + disclaimer).
  // Border bottom is at y=287. If it doesn't fit, push to a fresh page.
  if (finalY + 58 > 285) {
    doc.addPage();
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.rect(10, 10, 190, 277);
    finalY = 15;
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Remark :", 15, finalY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(narration, 35, finalY + 5);
  doc.setDrawColor(200,200,200);
  doc.line(10, finalY + 8, 200, finalY + 8);

  // 8. 3-COLUMN FINANCIAL FOOTER
  y = finalY + 14;
  doc.setFontSize(9);

  // Bottom Col 1
  doc.setFont("helvetica", "bold"); doc.text("Truck Rent :", 15, y);
  doc.setFont("helvetica", "normal"); doc.text(hire, 45, y);

  doc.setFont("helvetica", "bold"); doc.text("Advance :", 15, y + 6);
  doc.setFont("helvetica", "normal"); doc.text(advanced, 45, y + 6);

  doc.setFont("helvetica", "bold"); doc.text("Balance :", 15, y + 12);
  doc.setFont("helvetica", "normal"); doc.text(truckBalance, 45, y + 12);

  // Bottom Col 2 — To Pay freight summary
  doc.setFont("helvetica", "bold"); doc.text("Advance :", 85, y);
  doc.setFont("helvetica", "normal"); doc.text(advanced, 135, y, { align: 'right' });

  doc.setFont("helvetica", "bold"); doc.text("To Pay Amt :", 85, y + 6);
  doc.setFont("helvetica", "normal"); doc.text(toPayLrTotalN.toFixed(2), 135, y + 6, { align: 'right' });

  doc.line(85, y + 8, 138, y + 8);

  doc.setFont("helvetica", "bold"); doc.text("Total :", 85, y + 13);
  doc.setFont("helvetica", "bold"); doc.text(toPayLrTotalN.toFixed(2), 135, y + 13, { align: 'right' });

  // Bottom Col 3 — Paid / ToPay / TBB / Grand total
  doc.setFont("helvetica", "bold"); doc.text("To Pay :", 155, y);
  doc.setFont("helvetica", "normal"); doc.text(toPayLrTotalN.toFixed(2), 198, y, { align: 'right' });

  doc.setFont("helvetica", "bold"); doc.text("Paid :", 155, y + 6);
  doc.setFont("helvetica", "normal"); doc.text(paidLrTotalN.toFixed(2), 198, y + 6, { align: 'right' });

  doc.setFont("helvetica", "bold"); doc.text("TBB :", 155, y + 12);
  doc.setFont("helvetica", "normal"); doc.text(tbb, 198, y + 12, { align: 'right' });

  doc.line(155, y + 14, 200, y + 14);

  doc.setFont("helvetica", "bold"); doc.text("Total :", 155, y + 19);
  doc.setFont("helvetica", "bold"); doc.text(totalFreight.toFixed(2), 198, y + 19, { align: 'right' });

  // 9. DISCLAIMER — sits just below footer, never overflows the outer border
  const disclaimerY = Math.min(finalY + 40, 272);
  doc.setDrawColor(200,200,200);
  doc.line(10, disclaimerY, 200, disclaimerY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Note : Driver, Cleaner and Truck Owner is Responsible For Goods Found In Truck. Which is not there in our L.R. Or Memo.", 105, disclaimerY + 5, { align: "center" });

  // Output File
  if (mode === "print") {
    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  } else {
    doc.save(`Memo_${memoNo}_${dateStr}.pdf`);
  }
};