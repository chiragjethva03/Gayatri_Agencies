import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Account Name is required"], trim: true, unique: true },
  codeAlias: { type: String, trim: true },
  acGroup: { type: String, trim: true },
  regType: { type: String, trim: true },
  transport: { type: String, trim: true },
  acType: { type: String, trim: true },
  gstByTrans: { type: String, trim: true },
  address1: { type: String, trim: true },
  address2: { type: String, trim: true },
  address3: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  area: { type: String, trim: true },
  pin: { type: String, trim: true },
  phoneO: { type: String, trim: true },
  mobile: { type: String, trim: true },
  email: { type: String, trim: true },
  gstNo: { type: String, trim: true },
  panNo: { type: String, trim: true },
  adharNo: { type: String, trim: true },
  acNo: { type: String, trim: true },
  msmeNo: { type: String, trim: true },
  msmeType: { type: String, trim: true },
  creditLimit: { type: Number, default: 0 },
  creditDays: { type: Number, default: 0 },
  balanceMethod: { type: String, trim: true },
  openingBalance: { type: Number, default: 0 },
  crDb: { type: String, default: "Cr" },
  type: { type: String, default: 'Both' } 
}, { timestamps: true }); 
 
export default mongoose.models.Client || mongoose.model("Client", ClientSchema);