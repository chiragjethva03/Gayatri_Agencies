import mongoose from "mongoose";

const TransportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    locations: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transport ||
  mongoose.model("Transport", TransportSchema);
