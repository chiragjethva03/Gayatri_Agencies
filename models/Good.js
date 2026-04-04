import mongoose from "mongoose";

const GoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rs: { type: Number },
  no_of_parcel: { type: Number }
}, { timestamps: true });

export default mongoose.models.Good || mongoose.model("Good", GoodSchema);