import mongoose from "mongoose";

const LrSchema = new mongoose.Schema({
  lrNo: String,            // Added this
  lrDate: String,
  center: String,
  freightBy: String,
  delivery: String,
  fromCity: String,
  toCity: String,
  
  // Consignor Details (Fixed spelling to 'or' to match frontend)
  consignor: String,       
  consignorMobile: String, // Added this
  consignorAddress: String,// Added this
  
  // Consignee Details
  consignee: String,
  consigneeMobile: String, // Added this
  consigneeAddress: String,// Added this
  
  cashConsigner: String,
  cashConsignee: String,
}, { timestamps: true });

export default mongoose.models.LR || mongoose.model("LR", LrSchema);