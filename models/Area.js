import mongoose from "mongoose";

const AreaSchema = new mongoose.Schema({
  areaName: { type: String, required: true, trim: true, unique: true },
  city: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.models.Area || mongoose.model("Area", AreaSchema);