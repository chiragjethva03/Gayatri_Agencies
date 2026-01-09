import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
