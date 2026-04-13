"use client";
import { useEffect, useState } from "react";

export default function ExpenseEntryPanel({ onClose, initialData, mode, transport }) {
  // FIXED: We now properly initialize ALL fields so React knows they exist from the start!
  const [form, setForm] = useState({
    transportSlug: transport,
    date: new Date().toISOString().split("T")[0],
    status: "To Pay",
    payerName: "",
    payeeName: "",
    amount: "",
    narration: "",
    ...(initialData || {}) // This safely merges any existing data if you click "Edit"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveForm = async () => {
    // Basic validation before saving to DB
    if (!form.payerName || !form.payeeName || !form.amount) {
      alert("Please fill in Payer, Payee, and Amount.");
      return false;
    }
    
    setIsSaving(true);
    try {
      // THIS is what saves it to your MongoDB database!
      const res = await fetch("/api/expense", {
        method: isEditMode ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), 
      });
      
      if (res.ok) {
        return true; // Success!
      } else {
        console.error("Failed to save to database");
        return false;
      }
    } catch (error) {
      console.error("Failed to save:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndClose = async () => {
    const success = await saveForm();
    // If it successfully saved to the database, close the panel and refresh the table
    if (success) onClose();
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (isViewMode) return;
      if (e.key === "F4") { e.preventDefault(); await saveAndClose(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode]); 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl flex flex-col rounded-lg border shadow-2xl overflow-hidden relative">
        
        <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center">
          <h2 className="font-bold text-sm tracking-wide">
            {mode === "add" ? "+ Add" : mode === "edit" ? "Edit" : "View"} Daily Expense
          </h2>
          <button onClick={onClose} className="hover:text-red-200 font-bold px-1 text-lg leading-none">✕</button>
        </div>

        <div className="p-6 bg-white flex-1">
          <fieldset disabled={isViewMode} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="To Pay">To Pay</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payer Name (Who is paying) *</label>
                <input type="text" name="payerName" value={form.payerName} onChange={handleChange} placeholder="e.g., Office Cash" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payee Name (To whom) *</label>
                <input type="text" name="payeeName" value={form.payeeName} onChange={handleChange} placeholder="e.g., Tea Vendor" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹) *</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Narration / Note</label>
              <textarea name="narration" value={form.narration} onChange={handleChange} rows="2" placeholder="Enter any extra details here..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"></textarea>
            </div>

          </fieldset>
        </div>

        <div className="bg-gray-100 p-3 border-t flex justify-end items-center gap-2">
          {!isViewMode && (
            <button onClick={saveAndClose} disabled={isSaving} className="bg-[#2a64f6] text-white px-6 py-1.5 rounded hover:bg-blue-700 text-sm font-bold shadow-sm">
              {isSaving ? "Saving..." : "Save & Close (F4)"}
            </button>
          )}
          <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-6 py-1.5 rounded hover:bg-gray-50 text-sm font-medium shadow-sm">
            Cancel (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}