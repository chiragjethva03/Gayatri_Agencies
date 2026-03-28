import mongoose from "mongoose";

const CashBankSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true }, // The Cash/Bank name
  city: { type: String, trim: true },
  gstNo: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.models.CashBank || mongoose.model("CashBank", CashBankSchema);