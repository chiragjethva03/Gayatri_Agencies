import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Client Name is required"],
    trim: true,
    unique: true, // Prevents saving two clients with the exact same name
  },
  mobile: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  gstNo: {
    type: String,
    trim: true,
  },
  type: { 
    type: String,
    default: 'Both' // Can be 'Consignor', 'Consignee', or 'Both'
  }
}, { timestamps: true }); 

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);