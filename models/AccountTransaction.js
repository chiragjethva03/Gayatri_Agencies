import mongoose from "mongoose";

const schema = new mongoose.Schema({
  accountName: { type: String, required: true },   // e.g. "Sarthak", "Mehul", "Gaytri Agency"
  amount:      { type: Number, required: true, min: 0.01 },
  description: { type: String, default: "" },
  date:        { type: String, required: true },   // YYYY-MM-DD
}, { timestamps: true });

schema.index({ accountName: 1, createdAt: -1 });

export default mongoose.models.AccountTransaction
  || mongoose.model("AccountTransaction", schema);
