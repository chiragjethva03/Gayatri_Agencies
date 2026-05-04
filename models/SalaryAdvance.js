import mongoose from "mongoose";

const SalaryAdvanceSchema = new mongoose.Schema({
  employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  transportSlug:{ type: String },
  year:         { type: Number, required: true },
  month:        { type: Number, required: true },
  amount:       { type: Number, required: true },
  note:         { type: String, default: "" },
  date:         { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.SalaryAdvance || mongoose.model("SalaryAdvance", SalaryAdvanceSchema);
