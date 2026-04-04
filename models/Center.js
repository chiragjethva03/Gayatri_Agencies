import mongoose from "mongoose";

const CenterSchema = new mongoose.Schema(
  {
    centerName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Center || mongoose.model("Center", CenterSchema);