import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  transportSlug:{ type: String },
  year:         { type: Number, required: true },
  month:        { type: Number, required: true },
  records: [{
    day:    { type: Number, required: true },
    status: { type: String, enum: ["P", "A", "H"], required: true },
  }],
});

AttendanceSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
