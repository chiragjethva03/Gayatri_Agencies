"use client";
import { useState, useEffect } from "react";
import { Wallet, Plus, Trash2 } from "lucide-react";

const MONTH_NAMES = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

const todayStr = () => new Date().toISOString().split("T")[0];

export default function AdvanceModal({ employee, month, year, onClose, onSaved }) {
  const [advances, setAdvances]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [amount, setAmount]       = useState("");
  const [note, setNote]           = useState("");
  const [date, setDate]           = useState(todayStr());
  const [adding, setAdding]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salary-advance?employeeId=${employee._id}&month=${month}&year=${year}`);
      if (res.ok) setAdvances(await res.json());
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdvances(); }, []);

  const handleAdd = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount.");
    if (!date) return alert("Select a date.");
    setAdding(true);
    try {
      const res = await fetch("/api/salary-advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee._id, month, year, amount: Number(amount), note, date }),
      });
      if (res.ok) {
        setAmount(""); setNote(""); setDate(todayStr());
        await fetchAdvances();
        onSaved();
      } else alert("Failed to add advance.");
    } catch { alert("Network error."); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this advance entry?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/salary-advance?id=${id}`, { method: "DELETE" });
      await fetchAdvances();
      onSaved();
    } catch { alert("Network error."); }
    finally { setDeleting(null); }
  };

  const totalAdvance = advances.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="bg-[#2a64f6] text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <span className="font-bold text-sm">Salary Advance — {employee.name}</span>
          </div>
          <button onClick={onClose} className="hover:text-red-200 font-bold text-lg leading-none">✕</button>
        </div>

        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <p className="text-xs text-blue-600 font-semibold">{MONTH_NAMES[month]} {year}</p>
        </div>

        {/* Add new advance form */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Add New Advance</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason / Note</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g., Festival advance"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-full py-2 bg-[#2a64f6] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus size={15} /> {adding ? "Adding..." : "Add Advance"}
          </button>
        </div>

        {/* List of existing advances */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Previous Advances ({advances.length})
          </p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : advances.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No advances this month.</p>
          ) : (
            advances.map(adv => (
              <div key={adv._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-800">₹ {adv.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-500">{adv.date}{adv.note ? ` — ${adv.note}` : ""}</p>
                </div>
                <button
                  onClick={() => handleDelete(adv._id)}
                  disabled={deleting === adv._id}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-gray-600">Total Advance This Month</span>
          <span className="text-base font-bold text-red-600">₹ {totalAdvance.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
