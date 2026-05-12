"use client";
import { useState, useMemo } from "react";
import { calcDemurrage } from "@/utils/calcDemurrage";

const STATUS_CONFIG = {
  none:    { label: "None",    color: "text-gray-500",  bg: "bg-gray-100",   ring: "ring-gray-300",   active: "bg-gray-600 text-white"   },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50",   ring: "ring-amber-300",  active: "bg-amber-500 text-white"  },
  paid:    { label: "Paid",    color: "text-green-600", bg: "bg-green-50",   ring: "ring-green-300",  active: "bg-green-600 text-white"  },
  waived:  { label: "Waived", color: "text-purple-600",bg: "bg-purple-50",  ring: "ring-purple-300", active: "bg-purple-600 text-white" },
};

export default function DemurrageManageModal({ delivery, onClose, onSaveSuccess }) {
  const [status,   setStatus]   = useState(delivery.demurrageStatus   || "none");
  const [paidAmt,  setPaidAmt]  = useState(delivery.demurragePaidAmt  || "");
  const [note,     setNote]     = useState(delivery.demurrageNote     || "");
  const [rate,     setRate]     = useState(delivery.demurrageRatePerDay || "");
  const [freeDays, setFreeDays] = useState(delivery.demurrageFreeDays ?? 7);
  const [loading,  setLoading]  = useState(false);

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

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.none;

  const summaryBg    = status === "paid"   ? "bg-green-50 border-green-200"
                     : status === "waived" ? "bg-purple-50 border-purple-200"
                     : d?.isOverdue        ? "bg-red-50 border-red-200"
                     : d?.isWarning        ? "bg-amber-50 border-amber-200"
                     :                       "bg-slate-50 border-slate-200";

  const summaryText  = status === "paid"   ? "text-green-700"
                     : status === "waived" ? "text-purple-700"
                     : d?.isOverdue        ? "text-red-700"
                     : d?.isWarning        ? "text-amber-700"
                     :                       "text-slate-600";

  const summaryLabel = status === "paid"
    ? `Settled — ₹${Number(paidAmt || d?.totalCharge || 0).toLocaleString()} collected`
    : status === "waived"
    ? `Waived${d?.totalCharge ? ` — ₹${d.totalCharge.toLocaleString()} forgiven` : ""}`
    : d?.isOverdue
    ? `${d.chargeDays} ${d.chargeDays === 1 ? "day" : "days"} overdue — ₹${d.totalCharge.toLocaleString()} due`
    : d?.isWarning
    ? `${d.daysUntilCharge} ${d.daysUntilCharge === 1 ? "day" : "days"} remaining in free period`
    : d
    ? `${d.daysTotal} ${d.daysTotal === 1 ? "day" : "days"} in warehouse — within free period`
    : "Set a rate below to begin tracking";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Demurrage</p>
            <h2 className="text-base font-bold text-gray-800 leading-tight">D.No {delivery.dNo}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{delivery.consignee || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto">

          {/* Summary strip */}
          <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${summaryBg}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              status === "paid"   ? "bg-green-500"
              : status === "waived" ? "bg-purple-500"
              : d?.isOverdue     ? "bg-red-500"
              : d?.isWarning     ? "bg-amber-500"
              : "bg-slate-400"
            }`} />
            <span className={`text-xs font-semibold ${summaryText}`}>{summaryLabel}</span>
          </div>

          {/* Calculation stats — shown only when rate is set */}
          {d && Number(rate) > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Days in WH",    value: d.daysTotal },
                { label: "Free Days",      value: d.freeDays },
                { label: "Chargeable",     value: d.chargeDays > 0 ? d.chargeDays : "—" },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl border border-gray-100 px-3 py-2.5 text-center">
                  <p className="text-[17px] font-bold text-gray-800 leading-none">{item.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rate & Free Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Rate / Day (₹)</label>
              <input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="e.g. 50"
                className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition placeholder:text-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Free Days</label>
              <input
                type="number"
                value={freeDays}
                onChange={e => setFreeDays(e.target.value)}
                className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-xl">
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    if (s === "paid" && !paidAmt && d?.totalCharge) {
                      setPaidAmt(String(d.totalCharge));
                    }
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    status === s
                      ? cfg.active + " shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount collected — only when paid */}
          {status === "paid" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Amount Collected (₹)</label>
              <input
                type="number"
                value={paidAmt}
                onChange={e => setPaidAmt(e.target.value)}
                placeholder="Enter amount received"
                className="border border-green-200 bg-green-50 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-green-400 focus:bg-white transition placeholder:text-green-300"
              />
            </div>
          )}

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Note <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. waived on request, partial payment..."
              className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:bg-white resize-none transition placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
