import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  transportSlug: { type: String, required: true },
  date: { type: String, required: true },
  payerName: { type: String, required: true },
  payeeName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "To Pay" }, // "To Pay" or "Paid"
  narration: { type: String }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);