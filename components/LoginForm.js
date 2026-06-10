"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye, EyeOff, AlertCircle, Loader2,
  Building2, User, Lock, Shield, ChevronRight,
  CheckCircle2, WifiOff,
} from "lucide-react";

// ── Background word cloud data ─────────────────────────────────────────────────
const BG_WORDS = [
  { text: "TRANSPORT",  top: "8%",  left: "5%",  size: 13, op: 0.18 },
  { text: "SOFTWARE",   top: "6%",  left: "32%", size: 11, op: 0.13 },
  { text: "SECURE",     top: "5%",  left: "60%", size: 10, op: 0.14 },
  { text: "TECHNOLOGY", top: "9%",  left: "74%", size: 11, op: 0.12 },
  { text: "GPS",        top: "20%", left: "3%",  size: 12, op: 0.15 },
  { text: "AI",         top: "28%", left: "8%",  size: 14, op: 0.12 },
  { text: "PRODUCTION", top: "14%", left: "44%", size: 10, op: 0.11 },
  { text: "BRANCH",     top: "18%", left: "82%", size: 11, op: 0.14 },
  { text: "HR",         top: "24%", left: "90%", size: 13, op: 0.13 },
  { text: "CRM",        top: "40%", left: "2%",  size: 12, op: 0.16 },
  { text: "E-INVOICE",  top: "55%", left: "4%",  size: 11, op: 0.14 },
  { text: "API",        top: "62%", left: "10%", size: 12, op: 0.13 },
  { text: "LOGISTICS",  top: "72%", left: "3%",  size: 11, op: 0.15 },
  { text: "FREIGHT",    top: "80%", left: "12%", size: 12, op: 0.14 },
  { text: "JOBWORK",    top: "36%", left: "86%", size: 11, op: 0.13 },
  { text: "INVENTORY",  top: "52%", left: "84%", size: 12, op: 0.15 },
  { text: "MARKETING",  top: "65%", left: "78%", size: 10, op: 0.12 },
  { text: "BUSINESS",   top: "74%", left: "60%", size: 12, op: 0.13 },
  { text: "FINANCE",    top: "78%", left: "35%", size: 13, op: 0.16 },
  { text: "ACCOUNTING", top: "82%", left: "55%", size: 11, op: 0.14 },
  { text: "E-INVOICE",  top: "88%", left: "40%", size: 10, op: 0.12 },
  { text: "BILLING",    top: "85%", left: "70%", size: 11, op: 0.13 },
  { text: "CARGO",      top: "92%", left: "20%", size: 10, op: 0.12 },
  { text: "CONSIGNOR",  top: "15%", left: "20%", size: 9,  op: 0.10 },
  { text: "LR ENTRY",   top: "46%", left: "90%", size: 11, op: 0.14 },
  { text: "MEMO",       top: "92%", left: "84%", size: 10, op: 0.12 },
];

// ── Network dots ───────────────────────────────────────────────────────────────
const DOTS = [
  [6, 12], [15, 30], [8, 55], [5, 75], [12, 90],
  [22, 8], [28, 45], [20, 70], [25, 88],
  [35, 18], [38, 62], [33, 80],
  [48, 10], [50, 40], [45, 75],
  [60, 22], [62, 55], [58, 85],
  [72, 8],  [75, 35], [70, 68], [78, 88],
  [85, 18], [88, 50], [82, 78],
  [93, 10], [95, 40], [92, 65], [96, 85],
];

const LINES = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[1,9],[6,10],[2,7],
  [9,12],[12,13],[13,14],[10,13],[14,11],
  [12,15],[15,16],[16,17],[13,16],[14,17],
  [15,18],[18,19],[19,20],[20,21],[16,19],[17,20],
  [18,22],[22,23],[23,24],[24,25],[19,23],[20,24],
  [22,26],[26,27],[27,28],[25,28],[23,27],
];

const inputStyle = (isFocused, hasError) => ({
  background:  isFocused ? "#ffffff" : "#f5f7fa",
  borderColor: hasError ? "#f87171" : isFocused ? "#1a3c47" : "#e5e7eb",
  boxShadow:   hasError
    ? "0 0 0 3px rgba(248,113,113,0.15)"
    : isFocused ? "0 0 0 3px rgba(26,60,71,0.10)" : "none",
  transition:  "background 0.15s, border-color 0.15s, box-shadow 0.15s",
});

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [companyCode, setCompanyCode] = useState("");
  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [error,       setError]       = useState(null);   // { type, message }
  const [fieldErr,    setFieldErr]    = useState({});     // { companyCode, username, password }
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);
  const [focused,     setFocused]     = useState(null);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Per-field validation
    const errs = {
      companyCode: !companyCode.trim(),
      username:    !username.trim(),
      password:    !password.trim(),
    };
    setFieldErr(errs);
    if (errs.companyCode || errs.username || errs.password) {
      triggerShake();
      setError({ type: "validation", message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ companyCode, username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        const from = searchParams.get("from") || "/dashboard";
        setTimeout(() => router.replace(from), 800);
      } else {
        triggerShake();
        setError({
          type:    "auth",
          message: res.status === 401
            ? "Incorrect company code, username, or password."
            : (data.message || "Login failed. Please try again."),
        });
      }
    } catch {
      triggerShake();
      setError({ type: "network", message: "Unable to connect. Check your internet connection." });
    } finally {
      setLoading(false);
    }
  };

  const clearFieldErr = (field) => setFieldErr(prev => ({ ...prev, [field]: false }));

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(145deg, #eef4ff 0%, #f0f6fb 50%, #e8f0fe 100%)" }}
    >
      {/* ── Decorative background (unchanged) ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {LINES.map(([a, b], i) => (
            <line key={i}
              x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`}
              x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
              stroke="rgba(59,130,246,0.12)" strokeWidth="0.8"
            />
          ))}
          {DOTS.map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r="2.5" fill="rgba(59,130,246,0.22)" />
          ))}
        </svg>

        {BG_WORDS.map((w, i) => (
          <span
            key={i}
            className="absolute font-bold tracking-widest"
            style={{ top: w.top, left: w.left, fontSize: w.size, color: `rgba(37,99,235,${w.op})`, letterSpacing: "0.12em" }}
          >
            {w.text}
          </span>
        ))}

        <span
          className="absolute font-black select-none"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(80px, 14vw, 180px)",
            color: "rgba(37,99,235,0.04)",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          ERP
        </span>
      </div>

      {/* ── Login Card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className={`bg-white rounded-2xl px-8 py-8${shaking ? " animate-shake" : ""}`}
          style={{ boxShadow: "0 8px 40px rgba(26,60,71,0.13), 0 2px 8px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.9)" }}
        >
          {/* ── Logo + Brand ── */}
          <div className="flex items-center gap-3.5 mb-4">
            <img src="/android-chrome-192x192.png" alt="Logo" className="w-13 h-13 rounded-xl flex-shrink-0" style={{ width: 52, height: 52 }} />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">Gayatri Agency</h1>
              <span className="text-[11px] font-semibold text-black tracking-wide">
                Logistics & Transport Management
              </span>
            </div>
          </div>

          {/* ── Welcome line ── */}
          <div className="mb-4">
            <p className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-snug">Welcome back</p>
            <p className="text-[13px] text-gray-400 mt-0.5">Sign in to your enterprise account</p>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-gray-100 mb-5" />

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Company Code */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Company Code
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: focused === "company" ? "#1a3c47" : "#c0c9d0", transition: "color 0.15s" }}
                >
                  <Building2 size={15} />
                </span>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Enter company code"
                  value={companyCode}
                  onFocus={() => setFocused("company")}
                  onBlur={() => setFocused(null)}
                  onChange={e => { setCompanyCode(e.target.value); setError(null); clearFieldErr("companyCode"); }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 rounded-xl border outline-none placeholder:text-gray-300"
                  style={inputStyle(focused === "company", fieldErr.companyCode)}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: focused === "username" ? "#1a3c47" : "#c0c9d0", transition: "color 0.15s" }}
                >
                  <User size={15} />
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onFocus={() => setFocused("username")}
                  onBlur={() => setFocused(null)}
                  onChange={e => { setUsername(e.target.value); setError(null); clearFieldErr("username"); }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 rounded-xl border outline-none placeholder:text-gray-300"
                  style={inputStyle(focused === "username", fieldErr.username)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: focused === "password" ? "#1a3c47" : "#c0c9d0", transition: "color 0.15s" }}
                >
                  <Lock size={15} />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  onChange={e => { setPassword(e.target.value); setError(null); clearFieldErr("password"); }}
                  className="w-full pl-10 pr-11 py-2.5 text-sm text-gray-800 rounded-xl border outline-none placeholder:text-gray-300"
                  style={inputStyle(focused === "password", fieldErr.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9ca3af" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#4b5563")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={
                  error.type === "network"
                    ? { background: "#fffbeb", border: "1px solid #fcd34d" }
                    : { background: "#fff5f5", border: "1px solid #fecaca" }
                }
              >
                {error.type === "network"
                  ? <WifiOff size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  : <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                }
                <p className={`text-xs font-medium ${error.type === "network" ? "text-amber-600" : "text-red-500"}`}>
                  {error.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 mt-1 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: success
                  ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                  : "linear-gradient(135deg, #e67e22 0%, #c0621a 100%)",
                boxShadow: success
                  ? "0 4px 18px rgba(22,163,74,0.35)"
                  : "0 4px 18px rgba(230,126,34,0.38)",
                transition: "background 0.25s, box-shadow 0.25s, transform 0.15s",
              }}
              onMouseEnter={e => { if (!loading && !success) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              {/* shimmer sweep while loading */}
              {loading && (
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    animation: "shimmer 1.2s infinite",
                  }}
                />
              )}

              {success ? (
                <><CheckCircle2 size={15} /><span>Signed in!</span></>
              ) : loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <><span>Sign In</span><ChevronRight size={14} /></>
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <Shield size={10} style={{ color: "#c0c9d0" }} />
            <p className="text-[10px] text-gray-300 tracking-wide uppercase">
              Secured · Enterprise Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
