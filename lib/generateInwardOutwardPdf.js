import jsPDF from "jspdf";

export const generateInwardOutwardPdf = (record, transportData = null, mode = "print") => {
  const doc = new jsPDF({ format: "a4", orientation: "portrait", unit: "mm" });
  const PW = 210, PH = 297;
  const M = 10, W = PW - 2 * M;
  const RE = M + W;

  const b  = () => doc.setFont("helvetica", "bold");
  const n  = () => doc.setFont("helvetica", "normal");
  const sz = (s) => doc.setFontSize(s);
  const hRule = (y, thick = false) => {
    doc.setLineWidth(thick ? 0.6 : 0.25);
    doc.setDrawColor(0, 0, 0);
    doc.line(M, y, RE, y);
  };
  const vLine = (x, y1, y2) => {
    doc.setLineWidth(0.25);
    doc.setDrawColor(0, 0, 0);
    doc.line(x, y1, x, y2);
  };

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const tName   = (transportData?.name || "DELIVERY RECEIPT").toUpperCase();
  const tAddr   = transportData?.address || "";
  const tPhones = (transportData?.mobileNumbers || []).filter(Boolean).join(" / ");
  const tGst    = transportData?.gstNo || "";

  const entryNo      = record.no || "-";
  const date         = record.date || "-";
  const type         = (record.type || "Inward").toUpperCase();
  const fromCity     = (record.fromCity  || "").toUpperCase();
  const toCity       = (record.toCity    || "").toUpperCase();
  const consignor    = (record.consignor || "").toUpperCase();
  const consignee    = (record.consignee || "").toUpperCase();
  const goods        = Array.isArray(record.goods) ? record.goods : [];

  const dlv          = record.deliveryData || {};
  const dlvLrList    = Array.isArray(record.deliveryLrList) ? record.deliveryLrList : [];
  const receiver     = record.deliveryReceiverDetails || {};

  const deliveryDate    = dlv.deliveryDate || "-";
  const deliveryNo      = dlv.deliveryNo   || "-";
  const partyName       = dlv.partyName    || "";
  const partyAddress    = dlv.partyAddress || "";
  const deliveryAt      = dlv.deliveryAt   || "";
  const deliveryType    = dlv.deliveryType || "";
  const account         = dlv.account      || "";
  const labour          = dlv.labour       || "";
  const note            = dlv.note         || "";

  const totalFreight    = Number(dlv.totalFreight    || dlv.amount) || 0;
  const hamali          = Number(dlv.hamali)         || 0;
  const serviceCharge   = Number(dlv.serviceCharge)  || 0;
  const discount        = Number(dlv.discount)       || 0;
  const deliveryFreight = Number(dlv.deliveryFreight) || 0;

  const now = new Date();
  const pStamp = `Print: ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;

  let y = 8;

  // ── Header ────────────────────────────────────────────────────────────────────
  sz(6); n();
  doc.text(pStamp, RE, y, { align: "right" });

  sz(16); b();
  doc.text(tName, PW / 2, y + 5, { align: "center" });
  y += 12;

  sz(9); b();
  doc.text(`[ ${type} ]`, PW / 2, y, { align: "center" });
  y += 5;

  hRule(y, true); y += 4;

  // ── Entry No / Date / Delivery Date / Delivery No ─────────────────────────────
  const cW = W / 4;
  sz(7); n();
  doc.text("Entry No.",     M,          y);
  doc.text("Date",          M + cW,     y);
  doc.text("Delivery Date", M + 2 * cW, y);
  doc.text("Delivery No.",  M + 3 * cW, y);
  y += 4;

  sz(10); b();
  doc.text(entryNo,      M,          y);
  sz(8.5); n();
  doc.text(date,         M + cW,     y);
  doc.text(deliveryDate, M + 2 * cW, y);
  doc.text(deliveryNo,   M + 3 * cW, y);
  y += 6;

  hRule(y); y += 4;

  // ── Two-column section ────────────────────────────────────────────────────────
  const secY = y;
  const midX = M + W / 2;
  const LW   = W / 2 - 5;
  const RX   = midX + 4;
  const RW   = W / 2 - 4;

  let ly = secY;
  let ry = secY;

  // ─ Left: From + Consignor + Goods ─
  sz(7); n(); doc.text("FROM", M, ly); ly += 4;
  sz(10); b(); doc.text(fromCity || "-", M, ly); ly += 5;

  sz(7); n(); doc.text("CONSIGNOR", M, ly); ly += 4;
  sz(10); b();
  const cnorLines = doc.splitTextToSize(consignor || "-", LW);
  doc.text(cnorLines.slice(0, 2), M, ly);
  ly += cnorLines.slice(0, 2).length * 4 + 2;

  const goodsPack = goods.map(g => g.packaging).filter(Boolean).join(", ");
  const goodsDesc = goods.map(g => g.goodsContain).filter(Boolean).join(", ");
  const totalArt  = goods.reduce((s, g) => s + (Number(g.article) || 0), 0);
  const totalWt   = goods.reduce((s, g) => s + (Number(g.weight)  || 0), 0);

  sz(7.5); n();
  if (goodsPack) {
    doc.text(`Pack: ${goodsPack}`, M, ly); ly += 4;
  }
  if (goodsDesc) {
    const gLines = doc.splitTextToSize(`Goods: ${goodsDesc}`, LW);
    doc.text(gLines.slice(0, 2), M, ly);
    ly += gLines.slice(0, 2).length * 3.5 + 1;
  }
  if (totalArt > 0 || totalWt > 0) {
    ly += 1;
    sz(8); b();
    doc.text(`Articles: ${totalArt || "-"}`, M, ly);
    n(); doc.text(`Weight: ${totalWt > 0 ? totalWt + " Kg" : "-"}`, M + 45, ly);
    ly += 5;
  }

  // ─ Right: To + Consignee + Charges ─
  sz(7); n(); doc.text("TO", RX, ry); ry += 4;
  sz(10); b(); doc.text(toCity || "-", RX, ry); ry += 5;

  sz(7); n(); doc.text("CONSIGNEE", RX, ry); ry += 4;
  sz(10); b();
  const cneeLines = doc.splitTextToSize(consignee || "-", RW);
  doc.text(cneeLines.slice(0, 2), RX, ry);
  ry += cneeLines.slice(0, 2).length * 4 + 4;

  const charges = [
    { label: "TOTAL FREIGHT",  val: totalFreight },
    { label: "HAMALI",         val: hamali,         show: hamali > 0 },
    { label: "SERVICE CHARGE", val: serviceCharge,  show: serviceCharge > 0 },
    { label: "DISCOUNT",       val: discount,       show: discount > 0 },
  ].filter(c => c.show !== false);

  sz(8.5); n();
  charges.forEach(c => {
    doc.text(c.label, RX, ry);
    doc.text(c.val > 0 ? String(c.val) : "0", RE, ry, { align: "right" });
    ry += 5;
  });

  doc.setLineWidth(0.25);
  doc.line(RX, ry, RE, ry); ry += 3;

  sz(10); b();
  doc.text("DELIVERY FREIGHT", RX, ry);
  doc.text(String(deliveryFreight || 0), RE, ry, { align: "right" });
  ry += 6;

  sz(8.5); n();
  if (deliveryType) { doc.text(`Payment: ${deliveryType}`, RX, ry); ry += 4; }
  if (account)      { doc.text(`Account: ${account}`,      RX, ry); ry += 4; }

  const secEndY = Math.max(ly, ry) + 3;
  vLine(midX, secY - 1, secEndY);

  y = secEndY;
  hRule(y, true); y += 4;

  // ── Delivery details row ──────────────────────────────────────────────────────
  sz(7); n();
  if (partyName) {
    doc.text("Party:", M, y);
    sz(8.5); b(); doc.text(partyName, M + 14, y);
    if (partyAddress) { sz(7); n(); doc.text(partyAddress, M + 14, y + 4); }
  }
  if (deliveryAt) {
    sz(7); n(); doc.text("Delivery At:", M + 100, y);
    sz(8.5); b(); doc.text(deliveryAt, M + 125, y);
  }
  y += (partyAddress ? 10 : 6);

  if (labour || note) {
    sz(7); n();
    if (labour) doc.text(`Labour: ${labour}`, M, y);
    if (note)   doc.text(`Note: ${note}`,     M + 80, y);
    y += 5;
  }

  // ── LR List table ─────────────────────────────────────────────────────────────
  if (dlvLrList.length > 0) {
    hRule(y); y += 4;

    sz(7); b(); doc.text("LR LIST", M, y); y += 4;

    const cx = { lrNo: M, dt: M + 18, from: M + 36, to: M + 60, cnor: M + 85, pack: M + 125, art: M + 152, wt: M + 163, amt: M + 175 };

    sz(6.5); n();
    doc.text("LR No",     cx.lrNo, y);
    doc.text("Date",      cx.dt,   y);
    doc.text("From",      cx.from, y);
    doc.text("To",        cx.to,   y);
    doc.text("Consignor", cx.cnor, y);
    doc.text("Pack",      cx.pack, y);
    doc.text("Art",       cx.art,  y);
    doc.text("Wt",        cx.wt,   y);
    doc.text("Amt",       cx.amt,  y);
    y += 1; hRule(y); y += 3;

    dlvLrList.forEach(lr => {
      if (y > PH - 35) { doc.addPage(); y = 15; }
      sz(7); n();
      doc.text(String(lr.lrNo     || "-"), cx.lrNo, y, { maxWidth: 17 });
      doc.text(String(lr.lrDate   || "-"), cx.dt,   y, { maxWidth: 17 });
      doc.text(String(lr.from     || "-"), cx.from, y, { maxWidth: 23 });
      doc.text(String(lr.to       || "-"), cx.to,   y, { maxWidth: 24 });
      doc.text(String(lr.consignor|| "-"), cx.cnor, y, { maxWidth: 39 });
      doc.text(String(lr.pack     || "-"), cx.pack, y, { maxWidth: 26 });
      doc.text(String(lr.article  ||  0), cx.art,  y);
      doc.text(String(lr.weight   ||  0), cx.wt,   y);
      doc.text(String(lr.amount   ||  0), cx.amt,  y);
      y += 5;
    });

    const totArt = dlvLrList.reduce((s, lr) => s + (Number(lr.article) || 0), 0);
    const totWt  = dlvLrList.reduce((s, lr) => s + (Number(lr.weight)  || 0), 0);
    const totAmt = dlvLrList.reduce((s, lr) => s + (Number(lr.amount)  || 0), 0);

    hRule(y); y += 3;
    sz(7.5); b();
    doc.text("TOTAL", cx.cnor, y);
    doc.text(String(totArt),           cx.art, y);
    doc.text(String(totWt.toFixed(2)), cx.wt,  y);
    doc.text(String(totAmt),           cx.amt, y);
    y += 5;
  }

  // ── Receiver details ──────────────────────────────────────────────────────────
  if (receiver?.mobileNo || receiver?.vehicleNo || receiver?.aadhaarNo) {
    hRule(y); y += 4;
    sz(7); n();
    if (receiver.mobileNo)  doc.text(`Receiver Ph: ${receiver.mobileNo}`, M,        y);
    if (receiver.vehicleNo) doc.text(`Vehicle: ${receiver.vehicleNo}`,    M + 65,   y);
    if (receiver.aadhaarNo) doc.text(`Aadhaar: ${receiver.aadhaarNo}`,    M + 130,  y);
    y += 5;
  }

  // ── Signature area ────────────────────────────────────────────────────────────
  const sigY = Math.max(y + 10, PH - 45);
  hRule(sigY, true);
  const sigW = W / 3;
  sz(7); n();
  doc.text("Received By",           M,            sigY + 12);
  doc.text("Authorised Signatory",  M + sigW,     sigY + 12);
  doc.text("Transport Seal & Sign", RE,            sigY + 12, { align: "right" });

  // ── Footer ────────────────────────────────────────────────────────────────────
  hRule(PH - 12);
  sz(6.5); n();
  const fParts = [tAddr, tPhones ? `Ph: ${tPhones}` : "", tGst ? `GSTIN: ${tGst}` : ""].filter(Boolean);
  if (fParts.length) {
    doc.text(doc.splitTextToSize(fParts.join("  |  "), W)[0] || "", PW / 2, PH - 8, { align: "center" });
  }

  if (mode === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`Delivery_${record.no || "draft"}.pdf`);
  }
};
