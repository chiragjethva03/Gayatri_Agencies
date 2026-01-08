"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function TransportPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(true);

  const CORRECT_PASSWORD = "12345"; // temporary

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthorized(true);
      setError("");
      setShowModal(false);
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

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-center text-slate-900">
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
              className="
                w-full mt-5
                px-4 py-3
                rounded-xl
                border border-slate-300
                bg-white
                text-slate-900
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                outline-none
              "
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="
                w-full mt-6
                py-3
                rounded-xl
                bg-blue-600
                text-white
                font-medium
                hover:bg-blue-700
                transition
              "
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
