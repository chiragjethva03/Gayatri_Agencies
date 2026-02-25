import mongoose from "mongoose";

const LrSchema = new mongoose.Schema({
  transportSlug: String,   // NEW: This links the LR to a specific Transport card!
  lrNo: String,            
  lrDate: String,
  center: String,
  freightBy: String,
  delivery: String,
  fromCity: String,
  toCity: String,
  
  consignor: String,       
  consignorMobile: String, 
  consignorAddress: String,
  
  consignee: String,
  consigneeMobile: String, 
  consigneeAddress: String,
  
  cashConsigner: String,
  cashConsignee: String,
}, { timestamps: true });

export default mongoose.models.LR || mongoose.model("LR", LrSchema);