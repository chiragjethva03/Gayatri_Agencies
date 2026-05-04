import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  transportSlug: { type: String },
  date: { type: String, required: true },
  payerName: { type: String, required: true },
  payeeName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, default: "Cash" },
  narration: { type: String }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);