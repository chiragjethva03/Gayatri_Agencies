import mongoose from "mongoose";

const DeliverySchema = new mongoose.Schema({
  transportSlug: String,

  // Table Summary Fields (Used to display data in the main list)
  date: String,
  dNo: String,
  type: String,
  lrNo: String,
  consignee: String,
  fromBranch: String,
  art: String,
  labourName: String,
  packName: String,
  delSubTotal: Number,
  freightBy: String,
  kasar: Number,

  // Full Raw Data (Used for editing and printing)
  formData: Object,
  lrList: Array,

  receiverDetails: {
    mobileNo: { type: String, default: "" },
    vehicleNo: { type: String, default: "" },
    aadhaarNo: { type: String, default: "" }, // stored as raw 12 digits
  },

  demurrageRatePerDay: { type: Number, default: 0 },
  demurrageFreeDays: { type: Number, default: 7 },
  demurrageStatus: { type: String, enum: ["none", "pending", "paid", "waived"], default: "none" },
  demurragePaidAmt: { type: Number, default: 0 },
  demurrageNote: { type: String, default: "" },

}, { timestamps: true });

export default mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema);