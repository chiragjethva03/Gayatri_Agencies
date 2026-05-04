import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  transportSlug: { type: String, index: true },
  name:          { type: String, required: true, trim: true },
  role:          { type: String, trim: true, default: "" },
  phone:         { type: String, trim: true, default: "" },
  joinDate:      { type: String, default: "" },
  monthlySalary: { type: Number, required: true },
  workingDaysPerMonth: { type: Number, default: 26 },
  note:          { type: String, default: "" },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
