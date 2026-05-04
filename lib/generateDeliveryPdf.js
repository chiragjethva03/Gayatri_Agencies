import jsPDF from "jspdf";

export const generateDeliveryPdf = (lrData, transportData = null) => {
  const doc = new jsPDF({ format: "a5", orientation: "landscape", unit: "mm" });
  const PW = 210;
  const M = 8, W = PW - 2 * M; // 194mm usable width

  const b   = () => doc.setFont("helvetica", "bold");
  const n   = () => doc.setFont("helvetica", "normal");
  const sz  = (s) => doc.setFontSize(s);
  const hRule = (y, thick = false) => {
    doc.setLineWidth(thick ? 0.6 : 0.25);
    doc.setDrawColor(0, 0, 0);
    doc.line(M, y, M + W, y);
  };
  const vLine = (x, y1, y2) => {
    doc.setLineWidth(0.25);
    doc.setDrawColor(0, 0, 0);
    doc.line(x, y1, x, y2);
  };

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const tName    = (transportData?.name || "DELIVERY RECEIPT").toUpperCase();
  const tAddr    = transportData?.address || "";
  const tPhones  = (transportData?.mobileNumbers || []).join(" / ");
  const tGst     = transportData?.gstNo || "";

  const lrNo     = lrData.lrNo    || "-";
  const refNo    = lrData.refNo   || lrData.dNo || "";
  const date     = lrData.lrDate  || lrData.date || "";
  const from     = (lrData.fromCity  || "").toUpperCase();
  const to       = (lrData.toCity    || "").toUpperCase();
  const cnor     = (lrData.consignor || "").toUpperCase();
  const cnee     = (lrData.consignee || "").toUpperCase();
  const cnorMob  = lrData.consignorMobile || "";
  const cnorGst  = lrData.consignorGst   || "";
  const cneeMob  = lrData.consigneeMobile || "";
  const cneeGst  = lrData.consigneeGst   || "";

  const goods     = Array.isArray(lrData.goods) ? lrData.goods : [];
  const art       = goods.reduce((s, g) => s + (Number(g.article) || 0), 0);
  const wt        = goods.reduce((s, g) => s + (Number(g.weight)  || 0), 0);
  const desc      = goods.map(g => g.goodsContain).filter(Boolean).join(", ");
  const pack      = goods.map(g => g.packaging).filter(Boolean).join(", ");
  const rate      = lrData.rate || goods[0]?.rate || "";
  const valRs     = lrData.valueInRs || goods[0]?.valueInRs || "";

  const freight   = Number(lrData.freight)      || 0;
  const hamali    = Number(lrData.hamali)       || 0;
  const bc        = Number(lrData.bc)           || 0;
  const ddel      = Number(lrData.doorDelivery) || 0;
  const demurrage = Number(lrData.demurrage)    || 0;
  const total     = Number(lrData.subTotal)     || 0;
  const fBy       = (lrData.freightBy || lrData.delivery || "").toUpperCase();
  const gstAmt    = lrData.gstAmt || "";

  // Print timestamp (top-right)
  const now = new Date();
  const pDate = now.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const pTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const pStamp = `Print: ${pDate} ${pTime}`;

  let y = 6;

  // ── HEADER: Company name only + print stamp ───────────────────────────────────
  sz(6); n();
  doc.text(pStamp, M + W, y, { align: "right" });

  sz(15); b();
  doc.text(tName, PW / 2, y + 6, { align: "center" });
  y += 10;

  hRule(y, true); y += 4;

  // ── FROM / TO / LR NO / DATE ─────────────────────────────────────────────────
  const cW = W / 4;
  const c1 = M, c2 = M + cW, c3 = M + 2 * cW, c4 = M + 3 * cW;

  sz(7); n();
  doc.text("FROM",   c1, y);
  doc.text("TO",     c2, y);
  doc.text("LR No.", c3, y);
  doc.text("Date",   c4, y);
  y += 4;

  sz(10); b();
  doc.text(from || "-", c1, y, { maxWidth: cW - 3 });
  doc.text(to   || "-", c2, y, { maxWidth: cW - 3 });
  doc.text(lrNo,         c3, y, { maxWidth: cW - 3 });
  sz(8.5); n();
  doc.text(date || "-",  c4, y, { maxWidth: cW - 3 });
  y += 5;

  if (refNo) {
    sz(6.5); n();
    doc.text(refNo, c3, y, { maxWidth: cW - 3 });
    y += 3.5;
  }

  hRule(y); y += 3;

  // ── MAIN SECTION: Left (Consignor) | Right (Consignee + Charges) ─────────────
  const secY  = y;
  const midX  = M + W / 2;    // vertical divider x
  const LW    = W / 2 - 5;    // left usable width
  const RX    = midX + 4;     // right col x
  const RW    = W / 2 - 4;    // right col width
  const RE    = M + W;        // right edge

  // ── LEFT column ──────────────────────────────────────────────────────────────
  let ly = secY;

  sz(7); n();
  doc.text("CONSIGNOR", M, ly); ly += 4;

  sz(10); b();
  const cLines = doc.splitTextToSize(cnor || "-", LW);
  doc.text(cLines.slice(0, 2), M, ly);
  ly += cLines.slice(0, 2).length * 4 + 1;

  sz(7.5); n();
  if (cnorMob) { doc.text(`Ph: ${cnorMob}`, M, ly); ly += 4; }
  if (cnorGst) { doc.text(`GST: ${cnorGst}`, M, ly); ly += 4; }
  if (valRs)   { doc.text(`Value: Rs ${valRs}`, M, ly); ly += 4; }
  if (pack)    { doc.text(`Pack: ${pack}`, M, ly); ly += 4; }
  if (desc) {
    sz(7);
    const dLines = doc.splitTextToSize(`Goods: ${desc}`, LW);
    doc.text(dLines.slice(0, 2), M, ly);
    ly += dLines.slice(0, 2).length * 3.5 + 1;
  }

  ly += 3;
  sz(8); n();
  if (art > 0 || wt > 0) {
    b(); doc.text(`Articles: ${art > 0 ? art : "-"}`, M, ly);
    n(); doc.text(`Weight: ${wt > 0 ? wt + " Kg" : "-"}`, M + 42, ly);
    ly += 5;
  }
  if (rate) {
    doc.text(`Rate: ${rate}`, M, ly); ly += 5;
  }

  // ── RIGHT column ──────────────────────────────────────────────────────────────
  let ry = secY;

  sz(7); n();
  doc.text("CONSIGNEE", RX, ry); ry += 4;

  sz(10); b();
  const cnLines = doc.splitTextToSize(cnee || "-", RW);
  doc.text(cnLines.slice(0, 2), RX, ry);
  ry += cnLines.slice(0, 2).length * 4 + 1;

  sz(7.5); n();
  if (cneeMob) { doc.text(`Ph: ${cneeMob}`, RX, ry); ry += 4; }
  if (cneeGst) { doc.text(`GST: ${cneeGst}`, RX, ry); ry += 4; }
  ry += 3;

  // Charges — stacked vertically, label left, value right
  const charges = [
    { label: "FREIGHT",   val: freight,  show: true },
    { label: "BILTY",     val: hamali,   show: hamali > 0 },
    { label: "BRANCH",    val: bc,       show: bc > 0 },
    { label: "DELIVERY",  val: ddel,     show: true },
    { label: "DEMURRAGE", val: demurrage, show: true },  // always show, even if 0
  ].filter(c => c.show);

  const displayTotal = total + demurrage;

  sz(8.5); n();
  charges.forEach(c => {
    doc.text(c.label, RX, ry);
    doc.text(c.val > 0 ? String(c.val) : "0", RE, ry, { align: "right" });
    ry += 5;
  });

  // Thin rule then TOTAL
  doc.setLineWidth(0.25);
  doc.line(RX, ry, RE, ry);
  ry += 3;

  sz(10); b();
  doc.text("TOTAL", RX, ry);
  doc.text(String(displayTotal), RE, ry, { align: "right" });
  ry += 6;

  // Draw vertical divider for the full section height
  const secEndY = Math.max(ly, ry) + 2;
  vLine(midX, secY - 1, secEndY);

  y = secEndY;
  hRule(y, true); y += 4;

  // ── FOOTER: address + GST amt + payment mode ──────────────────────────────────
  sz(7); n();
  const fParts = [tAddr, tPhones ? `Ph: ${tPhones}` : "", tGst ? `GSTIN: ${tGst}` : ""].filter(Boolean);
  if (fParts.length) {
    const fLines = doc.splitTextToSize(fParts.join("  "), W * 0.55);
    doc.text(fLines, M, y + 3);
  }
  if (gstAmt) {
    sz(7.5); n();
    doc.text(`GST Amount: ${gstAmt}`, PW / 2, y + 3, { align: "center" });
  }
  if (fBy) {
    sz(11); b();
    doc.text(fBy, M + W, y + 3, { align: "right" });
  }

  window.open(doc.output("bloburl"), "_blank");
};
