import mongoose from "mongoose";

// This defines what an individual LR looks like inside the Memo
const LrSchema = new mongoose.Schema({
  lrNo: String,
  crossDate: String,
  packaging: String,
  description: String,
  article: Number,
  freightBy: String,
  fromCity: String,
  toCity: String,
  consignor: String,
  centerName: String,
  weight: Number,
  freight: Number,
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
  advanced: Number,     // <-- Added
  balance: Number,      // <-- Added
  center: String,
  toPay: Number,        // <-- Added
  paid: Number,         // <-- Added
  consignee: String,
  consignor: String,
  narration: String,    // <-- Added
  memoFreight: Number,  // <-- Added
  lrList: [LrSchema],   // The table data
  transportSlug: String
}, { timestamps: true });

export default mongoose.models.Memo || mongoose.model("Memo", MemoSchema);