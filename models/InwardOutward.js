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
    // Delivery section fields
    deliveryData: { type: Object, default: {} },
    deliveryLrList: { type: Array, default: [] },
    deliveryReceiverDetails: { type: Object, default: null },
  },
  { timestamps: true }
);

if (mongoose.models["InwardOutward"]) delete mongoose.models["InwardOutward"];
export default mongoose.model("InwardOutward", InwardOutwardSchema);