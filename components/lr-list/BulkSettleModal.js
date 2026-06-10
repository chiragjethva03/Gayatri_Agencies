"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, ChevronRight, CheckCircle2, Loader2, ChevronDown, UserCircle2 } from "lucide-react";

function PayeeDropdown({ value, onChange, payees }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current  && !listRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const listHeight = Math.min(payees.length * 48 + 8, 240); // approx panel height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < listHeight && rect.top > listHeight;
    setDropPos({
      top:    openUp ? rect.top - listHeight - 4 : rect.bottom + 4,
      left:   rect.left,
      width:  rect.width,
      openUp,
    });
    setOpen(v => !v);
  };

  return (
    <div>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all
          ${open ? "border-blue-500 ring-2 ring-blue-100 bg-white" : "border-gray-300 bg-white hover:border-blue-400"}
          ${!value ? "text-gray-400" : "text-gray-800 font-medium"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {value ? (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 text-[10px] font-bold">{value[0]?.toUpperCase()}</span>
            </div>
          ) : (
            <UserCircle2 size={16} className="text-gray-300 shrink-0" />
          )}
          <span className="truncate">{value || "— Select payee —"}</span>
        </div>
        <ChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Panel — rendered fixed so modal overflow never clips it */}
      {open && (
        <div
          ref={listRef}
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="overflow-y-auto py-1" style={{ maxHeight: 240 }}>
            {payees.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors
                  ${value === p ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold
                  ${value === p ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                  {p[0]?.toUpperCase()}
                </div>
                <span className="font-medium">{p}</span>
                {value === p && <CheckCircle2 size={14} className="ml-auto text-blue-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BulkSettleModal({ isOpen, onClose, transportSlug, onSuccess }) {
  const [allLrs, setAllLrs]               = useState([]);
  const [fetching, setFetching]           = useState(false);
  const [step, setStep]                   = useState(1);
  const [selected, setSelected]           = useState(null); // { name, lrs, total }
  const [payees, setPayees]               = useState([]);
  const [form, setForm]                   = useState({
    payeeName:   "",
    paymentType: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting]       = useState(false);
  const [settled, setSettled]             = useState(false);

  // Accumulates settled data during this modal session (survives "Back to Settle")
  // Map: id (string) → { paymentStatus, isLocked, payeeName, paymentDate, paymentType }
  const sessionSettledData = useRef(new Map());

  // ── Fetch all LRs (ignores date filter) when modal opens ────────────────────
  useEffect(() => {
    if (!isOpen) {
      sessionSettledData.current = new Map(); // reset for next open
      setStep(1);
      setSelected(null);
      setSettled(false);
      setSearch("");
      setForm({ payeeName: "", paymentType: "Cash", paymentDate: new Date().toISOString().split("T")[0] });
      return;
    }
    setFetching(true);
    Promise.all([
      fetch(`/api/lr?transport=${transportSlug}&all=true`).then(r => r.json()),
      fetch("/api/payees").then(r => r.json()).catch(() => [{ name: "Sarthak" }, { name: "Mehul" }]),
    ]).then(([lrs, payeeData]) => {
      setAllLrs(Array.isArray(lrs) ? lrs : []);
      setPayees(payeeData.map(p => p.name));
    }).finally(() => setFetching(false));
  }, [isOpen, transportSlug]);

  // ── Pending paid LRs grouped by consignor ───────────────────────────────────
  const consigneeGroups = useMemo(() => {
    const pending = allLrs.filter(
      lr => lr.freightBy?.toLowerCase() === "paid" && lr.paymentStatus !== "Paid"
    );
    const map = {};
    pending.forEach(lr => {
      const key = lr.consignor || "Unknown";
      if (!map[key]) map[key] = { name: key, lrs: [], total: 0 };
      map[key].lrs.push(lr);
      map[key].total += Number(lr.subTotal || lr.freight || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [allLrs]);

  const totalPendingCount  = consigneeGroups.reduce((s, g) => s + g.lrs.length, 0);
  const totalPendingAmount = consigneeGroups.reduce((s, g) => s + g.total, 0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 600);
  };

  const filteredGroups = debouncedSearch.trim()
    ? consigneeGroups.filter(g => g.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : consigneeGroups;

  // ── Close — syncs parent state locally, no API re-fetch ─────────────────────
  const handleClose = () => {
    if (sessionSettledData.current.size) {
      const updates = [...sessionSettledData.current.entries()].map(([id, data]) => ({ id, ...data }));
      onSuccess(updates);
    }
    onClose();
  };

  // ── Back to settle from success screen ───────────────────────────────────────
  const handleBackToSettle = () => {
    setSettled(false);
    setStep(1);
    setSelected(null);
    setSearch("");
    setDebouncedSearch("");
    setForm({ payeeName: "", paymentType: "Cash", paymentDate: new Date().toISOString().split("T")[0] });
  };

  // ── Settle handler ───────────────────────────────────────────────────────────
  const handleSettle = async () => {
    if (!form.payeeName) return alert("Please select a payee.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/lr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids:           selected.lrs.map(lr => lr._id),
          paymentStatus: "Paid",
          paymentDate:   form.paymentDate,
          payeeName:     form.payeeName,
          payerName:     selected.name,
          paymentType:   form.paymentType,
        }),
      });
      if (res.ok) {
        const updateData = {
          paymentStatus: "Paid",
          isLocked:      true,
          payeeName:     form.payeeName,
          paymentDate:   form.paymentDate,
          paymentType:   form.paymentType,
        };
        const ids = selected.lrs.map(lr => String(lr._id));
        const idSet = new Set(ids);
        // Update local allLrs so "Back to Settle" shows correct data — no fetch needed
        setAllLrs(prev => prev.map(lr =>
          idSet.has(String(lr._id)) ? { ...lr, ...updateData } : lr
        ));
        // Accumulate full update data for parent sync on close
        ids.forEach(id => sessionSettledData.current.set(id, updateData));
        setSettled(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[600px] max-h-[600px]">

        {/* Header */}
        <div className="bg-[#1e40af] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && !settled && (
              <button onClick={() => setStep(1)} className="text-blue-200 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-base">
                {settled ? "Settlement Complete" : step === 1 ? "Settle Pending Payments" : `Settle — ${selected?.name}`}
              </h2>
              {step === 1 && !settled && (
                <p className="text-blue-200 text-xs mt-0.5">
                  {fetching ? "Loading…" : `${totalPendingCount} pending LR${totalPendingCount !== 1 ? "s" : ""} across ${consigneeGroups.length} consignor${consigneeGroups.length !== 1 ? "s" : ""}`}
                </p>
              )}
              {step === 2 && !settled && (
                <p className="text-blue-200 text-xs mt-0.5">
                  {selected?.lrs.length} LR{selected?.lrs.length !== 1 ? "s" : ""} · ₹{selected?.total.toFixed(2)} total
                </p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="text-blue-200 hover:text-white transition-colors text-lg font-bold leading-none px-1">✕</button>
        </div>

        {/* Body — step 2 uses flex-col so table scrolls independently from the form */}
        <div className={`flex-1 min-h-0 ${step === 2 && !fetching && !settled ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>

          {/* ── Loading ─────────────────────────────────────────── */}
          {fetching && (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 size={20} className="animate-spin" /> Loading LRs…
            </div>
          )}

          {/* ── Success state ───────────────────────────────────── */}
          {settled && (
            <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
              <CheckCircle2 size={52} className="text-emerald-500" />
              <p className="text-gray-800 font-bold text-lg">
                {selected?.lrs.length} LR{selected?.lrs.length !== 1 ? "s" : ""} settled
              </p>
              <p className="text-gray-500 text-sm">Payment recorded for {selected?.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleBackToSettle}
                  className="px-5 py-2 text-sm font-semibold rounded-lg border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
                >
                  ← Back to Settle
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Consignee list ───────────────────────────── */}
          {!fetching && !settled && step === 1 && (
            <>
              {consigneeGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <CheckCircle2 size={48} className="text-emerald-400" />
                  <p className="font-bold text-gray-700 text-base">All caught up!</p>
                  <p className="text-sm text-gray-400">No pending paid LRs found.</p>
                </div>
              ) : (
                <>
                  {/* Stats bar */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50 shrink-0">
                    {[
                      { label: "Consignors", value: consigneeGroups.length },
                      { label: "Pending LRs", value: totalPendingCount },
                      { label: "Total Amount", value: `₹${totalPendingAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, green: true },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center py-3 px-2">
                        <span className={`text-base font-extrabold ${s.green ? "text-emerald-600" : "text-gray-800"}`}>{s.value}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search consignor…"
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <ul className="divide-y divide-gray-50 min-h-[160px] sm:min-h-[320px]">
                    {filteredGroups.length === 0 ? (
                      <li className="py-10 text-center text-sm text-gray-400">No consignor matches "{debouncedSearch}"</li>
                    ) : filteredGroups.map((group, idx) => {
                      const colors = [
                        "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
                        "bg-emerald-100 text-emerald-700", "bg-orange-100 text-orange-700",
                        "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700",
                        "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700",
                      ];
                      const avatarCls = colors[group.name.charCodeAt(0) % colors.length];
                      const avg = Math.round(group.total / group.lrs.length);
                      return (
                        <li key={group.name}>
                          <button
                            onClick={() => { setSelected(group); setStep(2); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/70 active:bg-blue-100/60 transition-colors text-left group"
                          >
                            {/* Rank */}
                            <span className="w-5 text-center text-[11px] font-bold text-gray-300 shrink-0">{idx + 1}</span>

                            {/* Avatar */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${avatarCls}`}>
                              {group.name[0]?.toUpperCase()}
                            </div>

                            {/* Name + meta */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{group.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <span className="bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px]">{group.lrs.length} LR{group.lrs.length !== 1 ? "s" : ""}</span>
                                  <span>· avg ₹{avg.toLocaleString("en-IN")}</span>
                                </span>
                              </p>
                            </div>

                            {/* Amount */}
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-extrabold text-emerald-700">₹{group.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                            </div>

                            <ChevronRight size={14} className="shrink-0 text-gray-200 group-hover:text-blue-400 transition-colors" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )}

          {/* ── Step 2: LR table (scrolls) + form (always visible) ── */}
          {!fetching && !settled && step === 2 && selected && (
            <>
              {/* LR table — max 4 rows visible, then vertical scroll; header stays sticky */}
              <div className="px-5 pt-5 pb-2 shrink-0">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* max-h shows thead (~33px) + 4 tbody rows (~34px each) = ~169px */}
                  <div className="overflow-y-auto max-h-[169px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-500 font-semibold">LR No.</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-semibold">Date</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-semibold">Route</th>
                          <th className="text-right px-3 py-2 text-gray-500 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selected.lrs.map(lr => (
                          <tr key={lr._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-semibold text-gray-800">{lr.lrNo || "-"}</td>
                            <td className="px-3 py-2 text-gray-500">{lr.lrDate || "-"}</td>
                            <td className="px-3 py-2 text-gray-500">{lr.fromCity || "-"} → {lr.toCity || "-"}</td>
                            <td className="px-3 py-2 text-right font-medium text-gray-800">
                              ₹{Number(lr.subTotal || lr.freight || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Total row — always visible below table */}
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border-t border-blue-100">
                    <span className="text-xs font-bold text-gray-700">Total ({selected.lrs.length} LRs)</span>
                    <span className="text-xs font-bold text-blue-700">₹{selected.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment form — shrink-0 so it never gets pushed out of view */}
              <div className="shrink-0 px-5 pb-4 pt-3 space-y-3 border-t border-gray-100 bg-white">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Details</h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Received By (Payee)</label>
                  <PayeeDropdown
                    value={form.payeeName}
                    onChange={v => setForm(f => ({ ...f, payeeName: v }))}
                    payees={payees}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Type</label>
                    <select
                      value={form.paymentType}
                      onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option>Cash</option>
                      <option>GPay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={form.paymentDate}
                      onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!fetching && !settled && step === 2 && selected && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <div className="text-sm text-gray-500">
              Settling <span className="font-bold text-gray-800">{selected.lrs.length}</span> LRs for{" "}
              <span className="font-bold text-gray-800">₹{selected.total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSettle}
              disabled={submitting || !form.payeeName}
              className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {submitting ? "Settling…" : `Settle All ${selected.lrs.length} LRs`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
