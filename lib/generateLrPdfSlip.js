import jsPDF from "jspdf";

// ══════════════════════════════════════════════════════════════════════════════
//  POSITION TUNING — adjust these coordinates to match your pre-printed form.
//  All values are in millimetres (mm).
//  Y is measured from the TOP edge of a single slip.
// ══════════════════════════════════════════════════════════════════════════════

const SLIP_H = 99; // A4 (297mm) / 3 copies

// Fixed single-value positions  [x, y, size, align, style]
const P = {
  transportName: [ 10,  5, 12, "left",  "bold"],
  transportGst:  [ 10,  9,  9, "left",  "normal"],
  lrNo:         [200,  5, 12, "right", "bold"],
  date:         [200,  9, 10, "right", "bold"],
  fromCity:     [ 38, 18,  9, "left",  "bold"],
  toCity:       [128, 18,  9, "left",  "bold"],
  consignor:    [ 38, 23,  9, "left",  "bold"],
  consignee:    [128, 23,  9, "left",  "bold"],
  cnorGst:      [ 38, 28,  9, "left",  "normal"],
  cnorMobile:   [ 78, 28,  9, "left",  "normal"],
  cneeGst:      [128, 28,  9, "left",  "normal"],
  cneeMobile:   [165, 28,  9, "left",  "normal"],

  // Goods table columns (X positions only — Y is computed dynamically)
  col_article:     14,   // center-aligned
  col_description: 38,   // left-aligned  (max ~65mm wide before weight col)
  col_weight:     107,   // center-aligned

  // Freight charges column (right side — fixed Y positions)
  freight:      [203, 32,  9, "right", "normal"],
  crossing:     [203, 38,  9, "right", "normal"],
  bc:           [203, 44,  9, "right", "normal"],
  doorDelivery: [203, 50,  9, "right", "normal"],
  rcm:          [203, 56,  9, "right", "normal"],
  subTotal:     [203, 62, 10, "right", "bold"],

  delivery:     [ 38, 62,  9, "left",  "normal"],
  eWayBill:     [ 83, 62,  9, "left",  "normal"],
  freightBy:    [148, 62,  9, "left",  "bold"],
};

// Goods table occupies this vertical band within each slip
const GOODS_TOP    = 34;   // y from slip top where first goods row starts
const GOODS_BOTTOM = 60;   // y from slip top — just above delivery/subTotal row
const GOODS_AVAIL  = GOODS_BOTTOM - GOODS_TOP;  // 26 mm usable

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(raw) {
  if (!raw) return "";
  // Already dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  // yyyy-mm-dd (ISO)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  // dd-mm-yyyy
  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) return `${dmy[1]}/${dmy[2]}/${dmy[3]}`;
  return raw;
}

function put(doc, pos, value, offsetY) {
  if (value === null || value === undefined || String(value).trim() === "") return;
  const [x, y, size, align, style] = pos;
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  doc.text(String(value), x, offsetY + y, { align });
}

function drawSlip(doc, lrData, consignorData, consigneeData, transportData, offsetY) {

  // ── Consignor / Consignee resolution ──────────────────────────────────
  const isCnorCash = lrData.consignor === "Cash Parti";
  const isCneeCash = lrData.consignee === "Cash Parti";
  const consignor  = isCnorCash ? (lrData.cashConsigner || "") : (lrData.consignor || "");
  const consignee  = isCneeCash ? (lrData.cashConsignee || "") : (lrData.consignee || "");
  const cnorGst    = isCnorCash ? "" : (consignorData?.gstNo || "");
  const cnorMobile = isCnorCash
    ? (lrData.consignorMobile || "")
    : (consignorData?.mobile || consignorData?.phoneO || lrData.consignorMobile || "");
  const cneeGst    = isCneeCash ? "" : (consigneeData?.gstNo || "");
  const cneeMobile = isCneeCash
    ? (lrData.consigneeMobile || "")
    : (consigneeData?.mobile || consigneeData?.phoneO || lrData.consigneeMobile || "");

  // ── Transport name + GST (top-left, aligned with lrNo/date) ─────────
  if (transportData?.name) {
    put(doc, P.transportName, transportData.name, offsetY);
  }
  if (transportData?.gstNo) {
    put(doc, P.transportGst, transportData.gstNo, offsetY);
  }

  // ── Header fields ─────────────────────────────────────────────────────
  put(doc, P.lrNo,       lrData.lrNo || "",                    offsetY);
  put(doc, P.date,       formatDate(lrData.lrDate || lrData.date || ""), offsetY);
  put(doc, P.fromCity,   lrData.fromCity  || "",               offsetY);
  put(doc, P.toCity,     lrData.toCity    || "",               offsetY);
  put(doc, P.consignor,  consignor,                            offsetY);
  put(doc, P.consignee,  consignee,                            offsetY);
  put(doc, P.cnorGst,    cnorGst,                                        offsetY);
  put(doc, P.cnorMobile, cnorMobile ? `Mo. ${cnorMobile}` : "",          offsetY);
  put(doc, P.cneeGst,    cneeGst,                                        offsetY);
  put(doc, P.cneeMobile, cneeMobile ? `Mo. ${cneeMobile}` : "",          offsetY);

  // ── Freight totals (right column — fixed positions) ───────────────────
  const freight      = Number(lrData.freight      || 0);
  const crossing     = Number(lrData.crossing     || 0);
  const bc           = Number(lrData.bc           || 0);
  const doorDelivery = Number(lrData.doorDelivery || 0);
  const subTotal     = Number(lrData.subTotal     || lrData.freight || 0);
  const rcm          = lrData.rcm || "";

  if (freight      > 0) put(doc, P.freight,      freight.toFixed(2),      offsetY);
  if (crossing     > 0) put(doc, P.crossing,     crossing.toFixed(2),     offsetY);
  if (bc           > 0) put(doc, P.bc,           bc.toFixed(2),           offsetY);
  if (doorDelivery > 0) put(doc, P.doorDelivery, doorDelivery.toFixed(2), offsetY);
  if (rcm)              put(doc, P.rcm,          String(rcm),             offsetY);
  if (subTotal     > 0) put(doc, P.subTotal,     subTotal.toFixed(2),     offsetY);

  // ── Delivery, E-Way Bill & Freight-By status ──────────────────────────
  const eWayBill = (lrData.goods || []).map(g => g.eWayBillNo).filter(Boolean)[0] || "";
  if (lrData.delivery)  put(doc, P.delivery,  lrData.delivery,  offsetY);
  if (eWayBill)         put(doc, P.eWayBill,  eWayBill,         offsetY);
  if (lrData.freightBy) put(doc, P.freightBy, `(${lrData.freightBy})`, offsetY);

  // ── toCity address + phone (below delivery row) ───────────────────────
  const toCity    = (lrData.toCity || "").toLowerCase().trim();
  const locations = transportData?.locations || [];
  const cityLoc   = locations.find(l => {
    const n = typeof l === "string" ? l : (l?.name || "");
    return n.toLowerCase().trim() === toCity;
  });
  const cityAddress = typeof cityLoc === "object" ? (cityLoc?.address || "") : "";
  const phones      = (transportData?.mobileNumbers || []).filter(Boolean);

  if (cityAddress || phones.length > 0) {
    const cityX  = 38;
    const maxW   = 155; // mm — avoids right edge
    let   lineY  = offsetY + P.delivery[1] + 8; // 8mm below delivery baseline

    doc.setFont("helvetica", "normal");

    if (cityAddress) {
      const fs    = cityAddress.length > 55 ? 8 : 9;
      const lines = doc.splitTextToSize(cityAddress, maxW).slice(0, 2);
      doc.setFontSize(fs);
      lines.forEach(line => {
        doc.text(line, cityX, lineY, { align: "left" });
        lineY += fs * 0.42;
      });
      lineY += 1;
    }

    if (phones.length > 0) {
      doc.setFontSize(9);
      const phoneStr  = `Ph: ${phones.join("  /  ")}`;
      const truncated = doc.splitTextToSize(phoneStr, maxW)[0];
      doc.text(truncated, cityX, lineY, { align: "left" });
    }
  }

  // ── Goods table — one row per product ────────────────────────────────
  const goods = Array.isArray(lrData.goods) && lrData.goods.length > 0
    ? lrData.goods
    : [];

  if (goods.length === 0) return;

  // Dynamic row height: shrink to fit, but never below 3.5mm
  const rawRowH   = GOODS_AVAIL / goods.length;
  const rowH      = Math.max(3.5, Math.min(5, rawRowH));

  // Max rows we can actually draw without overflowing the slip
  const maxDrawable = Math.floor(GOODS_AVAIL / rowH);
  const drawCount   = Math.min(goods.length, maxDrawable);

  // Font size scales with row height
  const fs = rowH >= 6 ? 10 : rowH >= 5 ? 9 : rowH >= 4 ? 8.5 : 8;

  // Description max width (mm) before weight column
  const descMaxW = P.col_weight - P.col_description - 4;

  goods.slice(0, drawCount).forEach((g, idx) => {
    const rowY = offsetY + GOODS_TOP + idx * rowH + rowH * 0.75; // baseline inside row

    const art  = g.article ? String(Number(g.article) || g.article) : "";
    const desc = [g.packaging, g.goodsContain].filter(Boolean).join(" ") || "";
    const wt   = g.weight && Number(g.weight) !== 0
      ? Number(g.weight).toFixed(2)
      : "";

    doc.setFontSize(fs);
    doc.setFont("helvetica", "normal");

    if (art) {
      doc.text(art, P.col_article, rowY, { align: "center" });
    }
    if (desc) {
      // Truncate description to one line that fits the column width
      const truncated = doc.splitTextToSize(desc, descMaxW)[0] || "";
      doc.text(truncated, P.col_description, rowY, { align: "left" });
    }
    if (wt) {
      doc.text(wt, P.col_weight, rowY, { align: "center" });
    }
  });

  // Overflow indicator — if goods were clipped
  if (goods.length > drawCount) {
    const indicatorY = offsetY + GOODS_TOP + drawCount * rowH;
    if (indicatorY < offsetY + GOODS_BOTTOM - 1) {
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 80, 80);
      doc.text(
        `+${goods.length - drawCount} more item${goods.length - drawCount > 1 ? "s" : ""}`,
        P.col_description,
        indicatorY,
        { align: "left" }
      );
      doc.setTextColor(0, 0, 0);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public: print 3 value-only copies on a single A4 page
// ─────────────────────────────────────────────────────────────────────────────
export const generateLrPdfSlip = (
  lrData,
  transportData = null,
  consignorData = null,
  consigneeData = null,
  mode = "print",
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setTextColor(0, 0, 0);

  for (let i = 0; i < 3; i++) {
    drawSlip(doc, lrData, consignorData, consigneeData, transportData, i * SLIP_H);
  }

  if (mode === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`LR_Slip_${lrData.lrNo || "draft"}.pdf`);
  }
};
