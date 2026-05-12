import mongoose from "mongoose";

const DailySnapshotSchema = new mongoose.Schema({
  transportSlug: { type: String, required: true },
  transportName: { type: String, default: "" },
  date:          { type: String, required: true }, // "YYYY-MM-DD"

  // Income
  deliveryGross:   { type: Number, default: 0 },
  kasarTotal:      { type: Number, default: 0 },
  deliveryIncome:  { type: Number, default: 0 },
  paidLrIncome:    { type: Number, default: 0 },
  demurrageIncome: { type: Number, default: 0 },
  totalIncome:     { type: Number, default: 0 },

  // Expenses
  dailyExpenses:   { type: Number, default: 0 },
  salaryAdvances:  { type: Number, default: 0 },
  hamaliExpense:   { type: Number, default: 0 },
  crossingExpense: { type: Number, default: 0 },
  memoAdvance:     { type: Number, default: 0 },
  vehicleHire:     { type: Number, default: 0 },
  totalExpenses:   { type: Number, default: 0 },

  // P&L
  netPL:           { type: Number, default: 0 },
  openingBalance:  { type: Number, default: 0 },
  closingBalance:  { type: Number, default: 0 },
}, { timestamps: true });

DailySnapshotSchema.index({ transportSlug: 1, date: 1 }, { unique: true });

export default mongoose.models.DailySnapshot ||
  mongoose.model("DailySnapshot", DailySnapshotSchema);
