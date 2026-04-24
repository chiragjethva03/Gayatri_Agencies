"use client";
import { useState, useMemo } from "react";
import { calcDemurrage } from "@/utils/calcDemurrage";

export default function DemurrageManageModal({ delivery, onClose, onSaveSuccess }) {

  const [status,   setStatus]   = useState(delivery.demurrageStatus   || "none");
  const [paidAmt,  setPaidAmt]  = useState(delivery.demurragePaidAmt  || "");
  const [note,     setNote]     = useState(delivery.demurrageNote     || "");
  const [rate,     setRate]     = useState(delivery.demurrageRatePerDay || "");
  const [freeDays, setFreeDays] = useState(delivery.demurrageFreeDays ?? 7);
  const [loading,  setLoading]  = useState(false);

  // ✅ Live recalc as user changes rate/freeDays
  const d = useMemo(() => calcDemurrage({
    ...delivery,
    demurrageRatePerDay: Number(rate),
    demurrageFreeDays:   Number(freeDays),
  }), [delivery.date, rate, freeDays]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id:                 delivery._id,
          demurrageRatePerDay: Number(rate)     || 0,
          demurrageFreeDays:   Number(freeDays) || 7,
          demurrageStatus:     status,
          demurragePaidAmt:    Number(paidAmt)  || 0,
          demurrageNote:       note,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaveSuccess();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="bg-orange-500 text-white px-5 py-3 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-sm">⏱ Demurrage Manager</h2>
            <p className="text-orange-100 text-[11px] mt-0.5">
              D.No {delivery.dNo} • {delivery.consignee || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-orange-600 px-2 py-0.5 rounded font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs">

          {/* ✅ Live Status Badge — updates as user types rate/freeDays */}
          {d ? (
            <div className={`rounded-lg p-3 text-center font-bold text-sm border ${
              d.isOverdue
                ? "bg-red-50 text-red-700 border-red-200"
                : d.isWarning
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {d.isOverdue
                ? `⚠️ ${d.chargeDays} overdue ${d.chargeDays === 1 ? "day" : "days"} • ₹${d.totalCharge.toLocaleString()} due`
                : d.isWarning
                ? `⏳ ${d.daysUntilCharge} ${d.daysUntilCharge === 1 ? "day" : "days"} left in free period`
                : `✅ ${d.daysTotal} ${d.daysTotal === 1 ? "day" : "days"} in warehouse — within free period`
              }
            </div>
          ) : (
            <div className="rounded-lg p-3 text-center text-gray-400 bg-gray-50 border border-gray-200">
              Set a Rate/Day below to start tracking demurrage
            </div>
          )}

          {/* Rate & Free Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Rate Per Day (₹)</label>
              <input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="e.g. 50"
                className="border-2 border-orange-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Free Days</label>
              <input
                type="number"
                value={freeDays}
                onChange={e => setFreeDays(e.target.value)}
                className="border-2 border-orange-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Status — full control */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700">Status</label>
            <div className="flex gap-2">
              {["none", "pending", "paid", "waived"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold capitalize border-2 transition text-xs ${
                    status === s
                      ? s === "paid"    ? "bg-green-500  text-white border-green-500"
                      : s === "waived"  ? "bg-purple-500 text-white border-purple-500"
                      : s === "pending" ? "bg-red-500    text-white border-red-500"
                      :                   "bg-gray-500   text-white border-gray-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Amount collected — only when paid */}
          {status === "paid" && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">
                Amount Collected (₹)
              </label>
              <input
                type="number"
                value={paidAmt}
                onChange={e => setPaidAmt(e.target.value)}
                placeholder="Enter amount received"
                className="border-2 border-green-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 transition"
              />
            </div>
          )}

          {/* Note */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. waived on request, partial payment..."
              className="border-2 border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-400 resize-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition text-xs flex items-center justify-center gap-2 ${
              loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}