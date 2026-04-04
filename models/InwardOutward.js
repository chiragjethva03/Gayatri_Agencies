import mongoose from "mongoose";

const InwardOutwardSchema = new mongoose.Schema(
  {
    transportSlug: { type: String, required: true },
    date: { type: String },
    no: { type: String },
    type: { type: String, enum: ["Inward", "Outward"], default: "Inward" },
    fromCity: { type: String },
    toCity: { type: String },
    center: { type: String },
    consignor: { type: String },
    consignee: { type: String },
    goods: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.InwardOutward || mongoose.model("InwardOutward", InwardOutwardSchema);