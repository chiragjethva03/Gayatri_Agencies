import mongoose from "mongoose";

const TransportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
     transportCode: {        // ADD THIS
      type: String,
      trim: true,
    },
    gstNo: {
      type: String,
      trim: true,
    },
    mobileNumbers: {
      type: [String], 
    },
    locations: {
      type: [String],
      required: true,
    },
    // --- NEW: Added Jurisdiction City ---
    jurisdictionCity: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transport ||
  mongoose.model("Transport", TransportSchema);