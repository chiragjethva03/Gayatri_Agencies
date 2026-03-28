import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, "City Name is required"],
    trim: true,
    unique: true, // Prevents duplicate city names
  },
  district: { type: String, trim: true },
  state: { type: String, trim: true },
  stdCode: { type: String, trim: true },
  zone: { type: String, trim: true },
  cityCode: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  extraDetail: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.models.City || mongoose.model("City", CitySchema);