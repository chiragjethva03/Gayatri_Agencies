"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Lock, Unlock, Wallet, RefreshCw,
  CreditCard, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const ACCOUNTS = ["Sarthak", "Mehul", "Gaytri Agency"];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ─── Lock Screen ──────────────────────────────────────────────────────────────
function LockScreen({ onUnlock }) {
  const [pwd, setPwd]   = useState("");
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(false);
  const ref             = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!pwd.trim()) return;
    setBusy(true); setErr("");
    const data = await fetch("/api/accounts/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    }).then(r => r.json());
    setBusy(false);
    if (data.success) { onUnlock(); }
    else { setErr(data.error || "Incorrect password."); setPwd(""); ref.current?.focus(); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="bg-[#1e3a5f] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">Accounts & Balances</h2>
          <p className="text-blue-200 text-[11px]">Cash collected · Daily expenses · GPay ledger</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-14 px-6 gap-5">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
          <Lock size={26} className="text-slate-500" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800 text-base">Protected Section</p>
          <p className="text-gray-400 text-sm mt-1">Enter the accounts password to view balances</p>
        </div>
        <form onSubmit={submit} className="w-full max-w-xs flex flex-col gap-3">
          <input
            ref={ref}
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(""); }}
            placeholder="Enter password…"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-center tracking-widest outline-none transition-all
              ${err ? "border-red-400 ring-2 ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
          />
          {err && <p className="text-red-500 text-xs text-center">{err}</p>}
          <button
            type="submit"
            disabled={busy || !pwd.trim()}
            className="w-full py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#16304f] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Unlock size={15} />}
            {busy ? "Verifying…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────
function AccountCard({ name, colorCls, totalCredits, totalDebits, balance, lrCredits, expenseDebits }) {
  const [open, setOpen] = useState(false);

  const allTxns = useMemo(() => {
    const credits = lrCredits.map(lr => ({
      _id:  lr._id,
      type: "credit",
      date: lr.lrDate || lr.paymentDate || "-",
      amount: Number(lr.subTotal || lr.freight || 0),
      description: `LR ${lr.lrNo || ""}${lr.consignee ? " · " + lr.consignee : ""}`,
    }));
    const debits = expenseDebits.map(e => ({
      _id:  e._id,
      type: "debit",
      date: e.date || "-",
      amount: Number(e.amount || 0),
      description: e.narration || (e.payeeName ? "To " + e.payeeName : "Daily expense"),
    }));
    return [...credits, ...debits].sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [lrCredits, expenseDebits]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${colorCls}`}>
          {name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{name}</p>
          <p className={`text-xs font-semibold mt-0.5 ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            Balance: {fmt(balance)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col items-center py-2.5 px-2 gap-0.5">
          <span className="text-[11px] text-gray-400 font-medium">Collected</span>
          <span className="text-xs font-bold text-emerald-700">{fmt(totalCredits)}</span>
        </div>
        <div className="flex flex-col items-center py-2.5 px-2 gap-0.5">
          <span className="text-[11px] text-gray-400 font-medium">Expenses</span>
          <span className="text-xs font-bold text-red-600">{fmt(totalDebits)}</span>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span>{allTxns.length} transaction{allTxns.length !== 1 ? "s" : ""}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* History */}
      {open && (
        <div className="border-t border-gray-100 overflow-y-auto max-h-52">
          {allTxns.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">No transactions yet</p>
          ) : allTxns.map((t, i) => (
            <div key={t._id || i} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50/60 border-b border-gray-50 last:border-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === "credit" ? "bg-emerald-400" : "bg-red-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-700 font-medium truncate">{t.description}</p>
                <p className="text-[10px] text-gray-400">{t.date}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${t.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                {t.type === "credit" ? "+" : "-"}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GPay Section ─────────────────────────────────────────────────────────────
function GPaySection({ gPayByTransport }) {
  if (gPayByTransport.length === 0) return null;
  const total = gPayByTransport.reduce((s, t) => s + t.total, 0);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-violet-500" />
          <h3 className="text-sm font-bold text-gray-700">GPay to Owner — Transport Expenses</h3>
        </div>
        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
          Total {fmt(total)}
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {gPayByTransport.map(t => (
          <div key={t.transportSlug} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
            <div>
              <p className="text-sm font-semibold text-gray-800 capitalize">{t.transportSlug.replace(/-/g, " ")}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{t.count} LR{t.count !== 1 ? "s" : ""} via GPay</p>
            </div>
            <span className="text-sm font-bold text-violet-700">{fmt(t.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function AccountsPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [lrs,      setLrs]      = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lrRes, expRes] = await Promise.all([
        fetch("/api/lr?all=true"),
        fetch("/api/expense"),
      ]);
      const [lrData, expData] = await Promise.all([lrRes.json(), expRes.json()]);
      setLrs(Array.isArray(lrData)  ? lrData  : []);
      setExpenses(Array.isArray(expData) ? expData : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleUnlock = () => { setUnlocked(true); fetchData(); };

  // ── Compute ─────────────────────────────────────────────────────────────────

  const accountData = useMemo(() => ACCOUNTS.map((name, idx) => {
    const lrCredits = lrs.filter(lr =>
      lr.payeeName?.toLowerCase() === name.toLowerCase() &&
      (lr.paymentType || "").toLowerCase() === "cash" &&
      lr.paymentStatus === "Paid"
    );
    const totalCredits = lrCredits.reduce((s, lr) => s + Number(lr.subTotal || lr.freight || 0), 0);

    const expenseDebits = expenses.filter(e => e.payerName?.toLowerCase() === name.toLowerCase());
    const totalDebits   = expenseDebits.reduce((s, e) => s + Number(e.amount || 0), 0);

    return { name, colorCls: AVATAR_COLORS[idx], lrCredits, expenseDebits, totalCredits, totalDebits, balance: totalCredits - totalDebits };
  }), [lrs, expenses]);

  const gPayByTransport = useMemo(() => {
    const map = {};
    lrs.filter(lr => (lr.paymentType || "").toLowerCase() === "gpay" && lr.paymentStatus === "Paid")
      .forEach(lr => {
        const k = lr.transportSlug || "unknown";
        if (!map[k]) map[k] = { transportSlug: k, total: 0, count: 0 };
        map[k].total += Number(lr.subTotal || lr.freight || 0);
        map[k].count++;
      });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [lrs]);

  const totalIn    = accountData.reduce((s, a) => s + a.totalCredits, 0);
  const totalOut   = accountData.reduce((s, a) => s + a.totalDebits,  0);
  const netBalance = totalIn - totalOut;

  // ── Lock state ──────────────────────────────────────────────────────────────
  if (!unlocked) return <LockScreen onUnlock={handleUnlock} />;

  // ── Unlocked ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Top bar: title + controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Accounts & Balances</h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time cash tracking across all accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => { setUnlocked(false); setLrs([]); setExpenses([]); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e3a5f] text-white text-xs font-semibold rounded-xl hover:bg-[#16304f] transition-all shadow-sm"
          >
            <Lock size={13} /> Lock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm font-medium">Loading data…</span>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Collected", value: totalIn,    color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Total Expenses",  value: totalOut,   color: "text-red-600",     bg: "bg-red-50 border-red-100"         },
              { label: "Net Balance",     value: netBalance, color: netBalance >= 0 ? "text-blue-700" : "text-red-600", bg: "bg-blue-50 border-blue-100" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{s.label}</p>
                <p className={`text-lg font-extrabold mt-0.5 ${s.color}`}>{fmt(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Account cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {accountData.map(acc => (
              <AccountCard key={acc.name} {...acc} />
            ))}
          </div>

          {/* GPay breakdown */}
          <GPaySection gPayByTransport={gPayByTransport} />
        </>
      )}
    </div>
  );
}
