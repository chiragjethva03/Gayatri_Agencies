"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransportPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(true);

  const CORRECT_PASSWORD = "12345"; // temporary

  // ⏳ Show password modal after 3 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (!authorized) setShowModal(true);
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, [authorized]);

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthorized(true);
      setError("");
      setShowModal(false);

      // ✅ CORRECT REDIRECT (THIS IS THE KEY FIX)
      router.push(`/services/${slug}/memo`);
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className={`${showModal ? "blur-sm" : ""} p-8 transition`}>
        <h1 className="text-3xl font-bold text-gray-900">
          Transport: {slug.replace(/-/g, " ").toUpperCase()}
        </h1>

        <p className="mt-4 text-gray-600">
          This is protected transport detail page.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Transport details will be visible after authentication.
        </p>
      </div>

      {/* Password Modal */}
      {showModal && !authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border">
            <h2 className="text-xl font-bold text-center">
              Enter Password
            </h2>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full mt-5 px-4 py-3 border rounded-xl"
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
