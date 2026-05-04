import mongoose from "mongoose";

const PayeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
}, { timestamps: true });

export default mongoose.models.Payee || mongoose.model("Payee", PayeeSchema);
