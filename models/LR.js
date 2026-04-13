import mongoose from "mongoose";

const LrSchema = new mongoose.Schema({
  transportSlug: String,
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

  // --- NEW: PAYMENT TRACKING FIELDS ---
  payerName: String,
  payeeName: String,
  paymentType: { type: String, default: "Cash" },    // Cash or GPay
  paymentStatus: { type: String, default: "Pending" }, // Paid or Pending
  paymentDate: String,
  // ------------------------------------

  goods: [{
    article: String,
    packaging: String,
    goodsContain: String,
    weight: String,
    rate: String,
    freightOn: String,
    amount: String,
    valueInRs: String,
    eWayBillNo: String,
    eWayBillDate: String,
    eWayBillExpiry: String
  }],

  freight: Number,
  bc: Number,
  hamali: Number,
  crossing: Number,
  doorDelivery: Number,
  subTotal: Number,
  rcm: String,
  rcm5: String

}, { timestamps: true });

export default mongoose.models.LR || mongoose.model("LR", LrSchema);