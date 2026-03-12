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
  lrList: Array

}, { timestamps: true });

export default mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema);