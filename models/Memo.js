import mongoose from "mongoose";

const MemoSchema = new mongoose.Schema({
  transportSlug: String, 
  memoNo: String,
  date: String,
  toBranch: String,
  toCity: String,
  vehicle: String,
  driver: String,
  
  // NEW FIELDS ADDED
  kMiter: String,
  toWt: String,
  agent: String,
  hire: String,
  cashBank: String,
  advanced: String,
  balance: String,
  center: String,
  
  toPay: String,
  paid: String,
  consignee: String,
  consignor: String,
  narration: String,
  memoFreight: String,
  
  lrList: Array, // Note: When adding LRs, ensure the payload matches the new table columns
}, { timestamps: true });

export default mongoose.models.Memo || mongoose.model("Memo", MemoSchema);