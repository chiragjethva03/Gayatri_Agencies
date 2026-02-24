import mongoose from "mongoose";

const MemoSchema = new mongoose.Schema({
  transportSlug: String, // NEW: This links the Memo to a specific Transport card!
  memoNo: String,
  date: String,
  toBranch: String,
  toCity: String,
  vehicle: String,
  driver: String,
  hire: String,
  advanced: String,
  lrList: Array, 
}, { timestamps: true });

export default mongoose.models.Memo || mongoose.model("Memo", MemoSchema);