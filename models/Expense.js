import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  transportSlug: { type: String },
  date: { type: String, required: true },
  payerName: { type: String, required: true },
  payeeName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, default: "Cash" },
  narration: { type: String },
  status: { type: String, default: "Pending" },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);