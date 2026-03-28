import mongoose from "mongoose";

const AccountGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, trim: true, unique: true },
  groupUnder: { type: String, trim: true },
  orderNo: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.models.AccountGroup || mongoose.model("AccountGroup", AccountGroupSchema);