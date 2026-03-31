"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [companyCode, setCompanyCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkCookie = async () => {
      try {
        const res = await fetch("/api/check-auth");
        const data = await res.json();

        if (data.auth === true) {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Auth check failed");
      }
    };

    checkCookie();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!companyCode.trim() || !username.trim() || !password.trim()) {
      setError("Please enter all credentials.");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, username, password }),
    });

    const data = await res.json();

    if (res.status === 200) {
      router.push("/dashboard");
    } else {
      setError(data.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200 bg-white"
      >
        {/* Left Banner */}
        <div
          className="relative hidden md:flex flex-col justify-center p-10 lg:p-12 text-white"
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)",
          }}
        >
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-5">
             {/* Make sure the logo file is in your public folder */}
<div className="flex items-center gap-2 mb-8">
  <img 
    src="/android-chrome-192x192.png" 
    alt="Gayatri Logo" 
    className="w-10 h-10 rounded shadow-md" 
  />
  <span className="text-white font-semibold opacity-90">Gayatri Agency</span>
</div>
              
            </div>

            <h1 className="text-4xl font-semibold leading-tight">
              Simplified ERP
            </h1>

            <p className="mt-3 text-white/85">
              Streamline Accounting, Inventory, and operations with clarity and control.
            </p>

            <div className="mt-6 h-px bg-white/20" />

            <p className="mt-4 text-xs text-white/70">
              Version 1.0.0 • © 2026 ERP Solutions Pvt. Ltd.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-6 sm:p-8 lg:p-12">
          <h3 className="text-2xl font-semibold text-slate-900">Sign in</h3>
          <p className="mt-1 text-sm text-slate-500">
            Access your workspace with your credentials.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Company code"
              className="
                w-full rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-slate-900
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                outline-none
              "
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
            />

            <input
              type="text"
              placeholder="Username"
              className="
                w-full rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-slate-900
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                outline-none
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="
                w-full rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-slate-900
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                outline-none
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          
          </form>
        </div>
      </div>
    </div>
  );
}
