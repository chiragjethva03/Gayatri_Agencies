"use client";
import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

const empty = {
  name: "", role: "", phone: "", joinDate: "",
  monthlySalary: "", workingDaysPerMonth: 26, note: "",
};

export default function AddEmployeeModal({ isOpen, onClose, onSaved, editData }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(editData ? { ...editData, monthlySalary: editData.monthlySalary ?? "" } : empty);
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Employee name is required.");
    if (!form.monthlySalary || Number(form.monthlySalary) <= 0) return alert("Monthly salary is required.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlySalary: Number(form.monthlySalary),
        workingDaysPerMonth: Number(form.workingDaysPerMonth) || 26,
      };
      const res = await fetch("/api/employees", {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData ? { ...payload, _id: editData._id } : payload),
      });
      if (res.ok) { onSaved(); onClose(); }
      else alert("Failed to save employee.");
    } catch { alert("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">

        <div className="bg-[#2a64f6] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} />
            <span className="font-bold text-sm">{editData ? "Edit Employee" : "Add New Employee"}</span>
          </div>
          <button onClick={onClose} className="hover:text-red-200 font-bold text-lg leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Ramesh Patel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Role / Designation</label>
              <input name="role" value={form.role} onChange={handleChange} placeholder="e.g., Driver"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Join Date</label>
              <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Salary (₹) *</label>
              <input type="number" name="monthlySalary" value={form.monthlySalary} onChange={handleChange} placeholder="e.g., 15000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Working Days / Month</label>
              <input type="number" name="workingDaysPerMonth" value={form.workingDaysPerMonth} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Note</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Optional note..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-[#2a64f6] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? "Saving..." : (editData ? "Update Employee" : "Save Employee")}
          </button>
        </div>
      </div>
    </div>
  );
}
