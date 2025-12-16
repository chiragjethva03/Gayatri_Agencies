"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTransportForm() {
  const router = useRouter();

  const [transportName, setTransportName] = useState("");
  const [locations, setLocations] = useState([""]);
  const [loading, setLoading] = useState(false);

  // 🔴 Validation errors
  const [errors, setErrors] = useState({
    transportName: "",
    locations: "",
  });

  const addLocationField = () => {
    setLocations([...locations, ""]);
    setErrors((prev) => ({ ...prev, locations: "" }));
  };

  const updateLocation = (index, value) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);

    if (value.trim()) {
      setErrors((prev) => ({ ...prev, locations: "" }));
    }
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { transportName: "", locations: "" };

    if (!transportName.trim()) {
      newErrors.transportName = "Transport name is required";
      valid = false;
    }

    const filteredLocations = locations.filter((l) => l.trim() !== "");
    if (filteredLocations.length === 0) {
      newErrors.locations = "At least one location is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/transports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: transportName.trim(),
          locations: locations.filter((l) => l.trim() !== ""),
        }),
      });

      if (!res.ok) throw new Error();

      router.push("/dashboard");
    } catch {
      setErrors((prev) => ({
        ...prev,
        locations: "Something went wrong while saving data",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-10 shadow-xl border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Add New Transport
        </h1>

        <div className="space-y-6">
          {/* Transport Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Transport Name
            </label>
            <input
              type="text"
              placeholder="Enter transport name"
              value={transportName}
              onChange={(e) => {
                setTransportName(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, transportName: "" }));
                }
              }}
              className={`
                w-full mt-2 px-4 py-3
                rounded-xl bg-white
                border-2
                ${errors.transportName ? "border-red-500" : "border-gray-400"}
                text-gray-900 placeholder-gray-500
                shadow-sm outline-none
                focus:border-blue-600 focus:ring-4 focus:ring-blue-100
                transition
              `}
            />
            {errors.transportName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.transportName}
              </p>
            )}
          </div>

          {/* Locations */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Locations
            </label>

            <div className="space-y-3 mt-2">
              {locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={`Location ${i + 1}`}
                    value={loc}
                    onChange={(e) => updateLocation(i, e.target.value)}
                    className={`
                      flex-1 px-4 py-3
                      rounded-xl bg-white
                      border-2
                      ${errors.locations ? "border-red-400" : "border-gray-300"}
                      text-gray-900 placeholder-gray-500
                      shadow-sm outline-none
                      focus:border-blue-600 focus:ring-4 focus:ring-blue-100
                      transition
                    `}
                  />

                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(i)}
                      className="
                        h-11 w-11 flex items-center justify-center
                        rounded-xl border border-gray-300
                        text-gray-500 hover:text-red-600
                        hover:border-red-400 hover:bg-red-50
                        transition
                      "
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.locations && (
              <p className="mt-1 text-sm text-red-600">
                {errors.locations}
              </p>
            )}

            <button
              type="button"
              onClick={addLocationField}
              className="
                mt-4 px-5 py-2.5
                bg-blue-600 text-white
                rounded-xl font-semibold
                shadow-md hover:bg-blue-700
                transition
              "
            >
              + Add Location
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`
            w-full mt-10 py-4
            text-lg font-semibold rounded-xl
            shadow-lg transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          `}
        >
          {loading ? "Saving..." : "Save Transport"}
        </button>
      </div>
    </div>
  );
}
