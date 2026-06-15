import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InwardOutward from "@/models/InwardOutward";

// Returns current stock for a transport, optionally excluding one record (for edit re-checks).
async function calcStock(transportSlug, excludeId = null) {
  const query = excludeId
    ? { transportSlug, _id: { $ne: excludeId } }
    : { transportSlug };
  const records = await InwardOutward.find(query).lean();
  return records.reduce((stock, r) => {
    const arts = (r.goods || []).reduce((s, g) => s + (parseInt(g.article) || 0), 0);
    return r.type === "Inward" ? stock + arts : stock - arts;
  }, 0);
}

function countArticles(goods = []) {
  return goods.reduce((s, g) => s + (parseInt(g.article) || 0), 0);
}

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const transportSlug = url.searchParams.get("transport");
    const records = await InwardOutward.find(transportSlug ? { transportSlug } : {}).sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // ── Duplicate LR No check ─────────────────────────────────────────────────
    if (data.lrNo && data.lrNo.trim()) {
      const exists = await InwardOutward.findOne({
        transportSlug: data.transportSlug,
        lrNo: data.lrNo.trim(),
      });
      if (exists) {
        return NextResponse.json(
          { error: `LR No. "${data.lrNo}" already exists for this transport.` },
          { status: 409 }
        );
      }
    }

    // ── Stock guard: block Outward if not enough articles ─────────────────────
    if (data.type === "Outward") {
      const articlesToSend = countArticles(data.goods);
      const currentStock   = await calcStock(data.transportSlug);
      if (articlesToSend > currentStock) {
        return NextResponse.json(
          { error: `Not enough stock. Trying to dispatch ${articlesToSend} article${articlesToSend !== 1 ? "s" : ""} but only ${currentStock} available.` },
          { status: 400 }
        );
      }
    }

    // ── Auto-generate No. ─────────────────────────────────────────────────────
    if (!data.no) {
      const count = await InwardOutward.countDocuments({ transportSlug: data.transportSlug });
      data.no = `${data.type === "Inward" ? "INW" : "OUT"}-${1000 + count + 1}`;
    }

    const newRecord = await InwardOutward.create(data);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();

    // ── Duplicate LR No check (exclude self) ─────────────────────────────────
    if (data.lrNo && data.lrNo.trim()) {
      const exists = await InwardOutward.findOne({
        transportSlug: data.transportSlug,
        lrNo: data.lrNo.trim(),
        _id: { $ne: data._id },
      });
      if (exists) {
        return NextResponse.json(
          { error: `LR No. "${data.lrNo}" already exists for this transport.` },
          { status: 409 }
        );
      }
    }

    // ── Stock guard on edit ───────────────────────────────────────────────────
    const existing        = await InwardOutward.findById(data._id).lean();
    const currentArticles = countArticles(existing?.goods || []);
    const newArticles     = countArticles(data.goods);
    const stockWithoutThis = await calcStock(data.transportSlug, data._id);

    if (data.type === "Outward") {
      // Only block if the user is increasing articles beyond available stock.
      // Same or fewer articles must always be allowed — pre-existing bad data
      // should never prevent editing an already-saved record.
      const delta = newArticles - currentArticles;
      if (delta > 0 && delta > stockWithoutThis) {
        return NextResponse.json(
          { error: `Not enough stock to add ${delta} more article${delta !== 1 ? "s" : ""}. Only ${stockWithoutThis} available.` },
          { status: 400 }
        );
      }
    } else {
      // Inward: only block if REDUCING articles would push stock negative.
      // Same or more articles must always be allowed — editing delivery data
      // (demurrage rate, notes, etc.) without touching articles should never fail.
      const delta = newArticles - currentArticles;
      if (delta < 0 && (stockWithoutThis + newArticles) < 0) {
        return NextResponse.json(
          { error: `Cannot reduce articles to ${newArticles}. Existing Outward entries have already consumed more than this. Stock without this entry: ${stockWithoutThis}.` },
          { status: 400 }
        );
      }
    }

    const updatedRecord = await InwardOutward.findByIdAndUpdate(data._id, data, { new: true });
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { ids } = await req.json();

    // ── Stock guard on delete ─────────────────────────────────────────────────
    // Only Inward deletions reduce stock — check each one.
    for (const id of ids) {
      const record = await InwardOutward.findById(id).lean();
      if (!record) continue;

      if (record.type === "Inward") {
        const articles     = countArticles(record.goods);
        const currentStock = await calcStock(record.transportSlug);
        const stockAfter   = currentStock - articles;

        if (stockAfter < 0) {
          return NextResponse.json(
            {
              error: `Cannot delete Inward entry (LR No. ${record.lrNo || record.no}). ` +
                     `It has ${articles} article${articles !== 1 ? "s" : ""} and current stock is ${currentStock}. ` +
                     `Deleting it would make stock ${stockAfter}. ` +
                     `Please delete the corresponding Outward entries first.`,
            },
            { status: 400 }
          );
        }
      }
    }

    await InwardOutward.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
