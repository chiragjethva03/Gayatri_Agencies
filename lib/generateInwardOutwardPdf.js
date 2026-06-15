import jsPDF from "jspdf";

// ── Layout constants ──────────────────────────────────────────────────────────
const M      = 8;    // left / right margin
const PW     = 210;
const RE     = PW - M;
const W      = PW - 2 * M;

// ── Draw one copy, all Y coords relative to offsetY ──────────────────────────
function drawIOSlip(doc, record, transportData, offsetY) {
  const O = offsetY;

  const b     = () => doc.setFont("helvetica", "bold");
  const n     = () => doc.setFont("helvetica", "normal");
  const sz    = (s) => doc.setFontSize(s);
  const hLine = (y, thick = false) => {
    doc.setLineWidth(thick ? 0.5 : 0.2);
    doc.setDrawColor(0, 0, 0);
    doc.line(M, O + y, RE, O + y);
  };
  const vLine = (x, y1, y2) => {
    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 0, 0);
    doc.line(x, O + y1, x, O + y2);
  };

  doc.setTextColor(0, 0, 0);

  // ── Data extraction ───────────────────────────────────────────────────────
  const tName         = (transportData?.name || "DELIVERY RECEIPT").toUpperCase();
  const gstNo         = transportData?.gstNo || "";
  const type          = (record.type || "Inward").toUpperCase();
  const date          = record.type === "Outward"
    ? (record.deliveryData?.deliveryDate || record.date || "-")
    : (record.date || "-");
  const fromCity      = (record.fromCity  || "").toUpperCase();
  const toCity        = (record.toCity    || "").toUpperCase();
  const consignor     = (record.consignor || "").toUpperCase();
  const consignee     = (record.consignee || "").toUpperCase();
  const goods         = Array.isArray(record.goods) ? record.goods : [];
  const driver        = (record.driverName || "").toUpperCase();
  const vehicleNo     = (record.vehicleNo  || "").toUpperCase();

  const dlv           = record.deliveryData || {};
  const deliveryDate  = dlv.deliveryDate || "-";
  const deliveryAt    = dlv.deliveryAt   || "";
  const labour        = dlv.labour       || "";
  const note          = dlv.note         || "";
  const deliveryType  = dlv.deliveryType || "";
  const account       = dlv.account      || "";
  const deliveryBy    = dlv.deliveryBy   || "";

  const totalFreight    = Number(dlv.totalFreight   || dlv.amount) || 0;
  const hamali          = Number(dlv.hamali)        || 0;
  const serviceCharge   = Number(dlv.serviceCharge) || 0;
  const demurrageAmt    = Number(dlv.demurrageAmt)  || 0;
  const discount        = Number(dlv.discount)      || 0;
  const deliveryFreight = totalFreight + hamali + serviceCharge + demurrageAmt - discount;

  let y = 5;

  // ── Header ────────────────────────────────────────────────────────────────
  sz(11); b();
  doc.text(tName, M, O + y);
  if (gstNo) {
    sz(7); n();
    doc.text(`GST: ${gstNo}`, RE, O + y, { align: "right" });
  }
  y += 5;

  sz(7.5); n();
  doc.text(`[ ${type} ]`, M, O + y);
  y += 4;

  hLine(y, true); y += 3.5;

  // ── Info row: LR No | Date | Delivery Date | Entry No ────────────────────
  const cW = W / 4;
  sz(6.5); n();
  doc.text("LR No.",        M,          O + y);
  doc.text("Date",          M + cW,     O + y);
  doc.text("Delivery Date", M + 2 * cW, O + y);
  doc.text("Entry No.",     M + 3 * cW, O + y);
  y += 3.5;

  sz(8.5); b();
  doc.text(record.lrNo || "-",  M,          O + y);
  sz(7.5); n();
  doc.text(date,                M + cW,     O + y);
  doc.text(deliveryDate,        M + 2 * cW, O + y);
  doc.text(record.no || "-",    M + 3 * cW, O + y);
  y += 4.5;

  hLine(y); y += 3.5;

  // ── Two-column section ───────────────────────────────────────────────────
  const secY = y;
  const midX = M + W / 2;
  const LW   = W / 2 - 5;
  const RX   = midX + 3;
  const RW   = W / 2 - 3;

  let ly = secY;
  let ry = secY;

  // ── Left: FROM + CONSIGNOR + goods + driver/vehicle ──────────────────────
  sz(6.5); n(); doc.text("FROM", M, O + ly); ly += 3.5;
  sz(8.5); b(); doc.text(fromCity || "-", M, O + ly); ly += 4.5;

  sz(6.5); n(); doc.text("CONSIGNOR", M, O + ly); ly += 3.5;
  sz(8.5); b();
  const cnorLines = doc.splitTextToSize(consignor || "-", LW);
  doc.text(cnorLines.slice(0, 2), M, O + ly);
  ly += cnorLines.slice(0, 2).length * 3.8 + 2;

  const goodsPack = goods.map(g => g.packaging).filter(Boolean).join(", ");
  const goodsDesc = goods.map(g => g.goodsContain).filter(Boolean).join(", ");
  const totalArt  = goods.reduce((s, g) => s + (Number(g.article) || 0), 0);
  const totalWt   = goods.reduce((s, g) => s + (Number(g.weight)  || 0), 0);

  sz(7.5); n();
  if (goodsPack || goodsDesc) {
    const packLabel = goodsPack ? `Pack: ${goodsPack}` : "";
    if (packLabel) doc.text(packLabel, M, O + ly);
    if (goodsDesc) {
      const xOffset = packLabel ? M + doc.getTextWidth(packLabel) + 4 : M;
      const availW  = LW - (packLabel ? doc.getTextWidth(packLabel) + 4 : 0);
      const gLines  = doc.splitTextToSize(goodsDesc, availW);
      doc.text(gLines.slice(0, 1), xOffset, O + ly);
    }
    ly += 5.5;
  }
  if (totalArt > 0 || totalWt > 0) {
    sz(8); b();
    doc.text(`Articles: ${totalArt || "-"}`, M, O + ly);
    sz(7.5); n();
    doc.text(`Wt: ${totalWt > 0 ? totalWt + " Kg" : "-"}`, M + 42, O + ly);
    ly += 4.5;
  }

  if (driver || vehicleNo) {
    sz(7); n();
    if (driver) {
      doc.text("Received & check by:", M, O + ly);
      
      b(); doc.text(driver, M + 40, O + ly); n();
    }
    if (vehicleNo) {
      doc.text("Veh:", M + 62, O + ly);
      b(); doc.text(vehicleNo, M + 71, O + ly); n();
    }
    ly += 4.5;
  }

  // ── Right: TO + CONSIGNEE + charges ──────────────────────────────────────
  sz(6.5); n(); doc.text("TO", RX, O + ry); ry += 3.5;
  sz(8.5); b(); doc.text(toCity || "-", RX, O + ry); ry += 4.5;

  sz(6.5); n(); doc.text("CONSIGNEE", RX, O + ry); ry += 3.5;
  sz(8.5); b();
  const cneeLines = doc.splitTextToSize(consignee || "-", RW);
  doc.text(cneeLines.slice(0, 2), RX, O + ry);
  ry += cneeLines.slice(0, 2).length * 3.8 + 4.5;

  sz(7.5); n();
  doc.text("TOTAL FREIGHT", RX, O + ry);
  doc.text(String(totalFreight || 0), RE, O + ry, { align: "right" });
  ry += 4;

  if (hamali > 0) {
    doc.text("HAMALI", RX, O + ry);
    doc.text(String(hamali), RE, O + ry, { align: "right" });
    ry += 4;
  }
  if (serviceCharge > 0) {
    doc.text("SERVICE CHARGE", RX, O + ry);
    doc.text(String(serviceCharge), RE, O + ry, { align: "right" });
    ry += 4;
  }
  if (demurrageAmt > 0) {
    doc.text("DEMURRAGE", RX, O + ry);
    doc.text(String(demurrageAmt), RE, O + ry, { align: "right" });
    ry += 4;
  }
  if (discount > 0) {
    doc.text("DISCOUNT", RX, O + ry);
    doc.text(`-${discount}`, RE, O + ry, { align: "right" });
    ry += 4;
  }

  doc.setLineWidth(0.2); doc.setDrawColor(0, 0, 0);
  doc.line(RX, O + ry, RE, O + ry); ry += 3;

  sz(9); b();
  doc.text("DELIVERY FREIGHT", RX, O + ry);
  doc.text(String(deliveryFreight || 0), RE, O + ry, { align: "right" });
  ry += 5.5;

  sz(7); n();
  if (deliveryType) { doc.text(`Payment: ${deliveryType}`, RX, O + ry); ry += 4; }
  if (account)      { doc.text(`Acct: ${account}`,         RX, O + ry); ry += 4; }
  if (deliveryBy)   { doc.text(`Verified & Delivery By: ${deliveryBy}`,        RX, O + ry); ry += 4; }

  // ── Close two-column section ──────────────────────────────────────────────
  const secEndY = Math.max(ly, ry) + 3;
  vLine(midX, secY - 1, secEndY);
  y = secEndY;

  hLine(y, true); y += 4;

  // ── Delivery row (Labour + Delivery At) ───────────────────────────────────
  if (labour) {
    sz(7); n(); doc.text(`Labour: ${labour}`, M, O + y);
  }
  if (deliveryAt) {
    sz(7); n(); doc.text("Delivery At:", RX, O + y);
    sz(8); b(); doc.text(deliveryAt, RE, O + y, { align: "right" });
  }
  y += 5;

  if (note) {
    sz(7); n(); doc.text(`Note: ${note}`, M, O + y);
  }

}

// ── Public export ─────────────────────────────────────────────────────────────
export const generateInwardOutwardPdf = (record, transportData = null, mode = "print") => {
  const doc = new jsPDF({ format: "a4", orientation: "portrait", unit: "mm" });
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  drawIOSlip(doc, record, transportData, 0);

  if (mode === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`Delivery_${record.no || "draft"}.pdf`);
  }
};
