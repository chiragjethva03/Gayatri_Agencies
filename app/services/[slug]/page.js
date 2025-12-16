"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransportPage() {
  const { slug } = useParams();

  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const CORRECT_PASSWORD = "12345"; // temporary

  // ⏳ Show password modal after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authorized) {
        setShowModal(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [authorized]);

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthorized(true);
      setError("");
      setShowModal(false);
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* 🔹 Main Content */}
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

      {/* 🔐 Password Modal */}
      {showModal && !authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Card */}
          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Enter Password
            </h2>

            <p className="text-sm text-gray-500 text-center mt-2">
              This transport is protected
            </p>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="
                w-full mt-5 px-4 py-3
                rounded-xl
                bg-white
                border-2 border-gray-400
                text-gray-900
                placeholder-gray-500
                shadow-sm
                outline-none
                focus:border-blue-600
                focus:ring-4 focus:ring-blue-100
                transition
              "
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
