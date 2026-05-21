import mongoose from "mongoose";

// This defines what an individual LR looks like inside the Memo
const LrSchema = new mongoose.Schema({
  lrNo: String,
  crossDate: String,
  packaging: String,    // kept for backward compat (first goods item)
  description: String,  // kept for backward compat (first goods item)
  // Full goods array — enables multi-row rendering in PDF and form
  goods: [{
    article: Number,
    packaging: String,
    goodsContain: String,
    weight: Number,
    amount: Number,   // individual goods row freight (from LR goods.amount)
  }],
  article: Number,      // total articles (sum across all goods)
  freightBy: String,
  fromCity: String,
  toCity: String,
  consignor: String,
  consignee: String,
  centerName: String,
  weight: Number,       // total weight (sum across all goods)
  freight: Number,
  crossing: Number,
  hamali: Number,
});

// This defines the main Memo form fields
const MemoSchema = new mongoose.Schema({
  date: String,
  memoNo: String,
  toBranch: String,
  toCity: String,
  vehicle: String,
  driver: String,
  kMiter: Number,
  toWt: Number,
  agent: String,
  hire: Number,
  cashBank: String,
  advanced: Number,
  balance: Number,
  center: String,
  crossing: String,
  hamali: Number,
  toPay: Number,
  paid: Number,
  consignee: String,
  consignor: String,
  narration: String,
  memoFreight: Number,
  lrList: [LrSchema],   // The table data
  transportSlug: String
}, { timestamps: true });

// Delete cached model so Next.js hot-reload always picks up the latest schema.
// Without this, mongoose.models.Memo can hold the OLD schema (before `goods` was added
// to LrSchema), causing the field to be stripped on every save/load.
if (mongoose.models["Memo"]) delete mongoose.models["Memo"];
export default mongoose.model("Memo", MemoSchema);