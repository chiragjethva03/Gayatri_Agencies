"use client";
import { useState } from "react";

export default function LockPasswordModal({ isOpen, title, description, onUnlock, onCancel }) {
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!password.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/expense/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setPassword("");
        setError("");
        onUnlock();
      } else {
        setError(data.error || "Incorrect password. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-amber-100 overflow-hidden">

        {/* Header */}
        <div className="bg-amber-500 text-white px-5 py-3 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="font-bold text-sm tracking-wide">{title}</span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Admin Password
            </label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="Enter password..."
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition
                ${error
                  ? "border-red-400 bg-red-50 focus:border-red-400"
                  : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleVerify}
            disabled={verifying || !password.trim()}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {verifying && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {verifying ? "Verifying..." : "Unlock"}
          </button>
        </div>

      </div>
    </div>
  );
}
