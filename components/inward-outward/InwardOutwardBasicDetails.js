"use client";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";

// --- SIMPLE 2-OPTION DROPDOWN (matches CityDropdown style) ---
const TypeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const options = ["Inward", "Outward"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { name: "type", value: opt } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
      <div
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white shadow-sm cursor-pointer flex justify-between items-center focus-within:border-blue-500 hover:border-blue-400 transition-colors select-none"
        onClick={() => setIsOpen(v => !v)}
      >
        <span className={value ? "text-gray-800 font-medium" : "text-gray-400"}>
          {value || "Select..."}
        </span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
          {options.map(opt => (
            <div
              key={opt}
              className={`px-3 py-1.5 text-sm cursor-pointer transition-colors ${value === opt ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-800"}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CUSTOM SEARCHABLE CITY DROPDOWN — fetches from DB, supports free-text + Add ---
const CityDropdown = ({ label, name, value, onChange, required }) => {
  const [isOpen,       setIsOpen]       = useState(false);
  const [searchTerm,   setSearchTerm]   = useState(value || "");
  const [cities,       setCities]       = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCityName,  setNewCityName]  = useState("");
  const [saving,       setSaving]       = useState(false);
  const dropdownRef = useRef(null);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data.map(c => c.city));
      }
    } catch {}
  };

  useEffect(() => { fetchCities(); }, []);

  useEffect(() => { setSearchTerm(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const debouncedSearch = useDebounce(searchTerm, 200);
  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSelect = (city) => {
    setSearchTerm(city);
    onChange({ target: { name, value: city } });
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const v = e.target.value.toUpperCase();
    setSearchTerm(v);
    setIsOpen(true);
    onChange({ target: { name, value: v } });
  };

  const handleAddCity = async () => {
    const trimmed = newCityName.trim().toUpperCase();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: trimmed }),
      });
      if (res.ok) {
        setNewCityName("");
        setShowAddModal(false);
        await fetchCities();
        handleSelect(trimmed);
      } else {
        const { error } = await res.json();
        alert(error || "Failed to add city");
      }
    } catch {
      alert("Failed to add city. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type="text"
          className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm uppercase
            ${required && !value ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-300 bg-white"}`}
          placeholder="Type or search city..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {required && !value && (
          <p className="mt-0.5 text-[10px] text-red-500 font-medium">Required</p>
        )}

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl flex flex-col">
            <ul className="max-h-48 overflow-y-auto flex-1 p-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city, idx) => (
                  <li
                    key={idx}
                    className={`px-3 py-1.5 text-sm cursor-pointer transition-colors rounded
                      ${city === value ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(city)}
                  >
                    {city}
                  </li>
                ))
              ) : (
                <li className="px-3 py-3 text-sm text-gray-400 text-center">
                  {searchTerm ? `"${searchTerm}" not in list — add it below` : "No cities found"}
                </li>
              )}
            </ul>

            <div className="bg-[#ebf0f7] p-1.5 border-t border-gray-200 flex gap-1.5 rounded-b-md">
              <button
                type="button"
                className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setShowAddModal(true); setNewCityName(searchTerm); setIsOpen(false); }}
              >
                <span className="text-sm leading-none">+</span> Add
              </button>
              <button
                type="button"
                className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={fetchCities}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add City Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
              <h2 className="font-bold text-sm">Add New City</h2>
              <button type="button" onClick={() => { setShowAddModal(false); setNewCityName(""); }} className="text-white/80 hover:text-white text-xl font-bold leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. AHMEDABAD"
                />
                <p className="text-[10px] text-gray-400 mt-1">City name will be saved in uppercase</p>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewCityName(""); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCity}
                  disabled={saving || !newCityName.trim()}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm disabled:opacity-50 transition"
                >
                  {saving ? "Saving…" : "Save City"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// --- MAIN BASIC DETAILS COMPONENT ---
export default function InwardOutwardBasicDetails({ form, setForm, existingLrNos = [], lrNoError, setLrNoError }) {
  const [fromCityTouched, setFromCityTouched] = useState(false);
  const fromCityError = fromCityTouched && !form.fromCity?.trim();

  // SET DEFAULTS ON LOAD: today's date + AMD-ASLALI as To City
  useEffect(() => {
    const updates = {};
    if (!form.date) updates.date = new Date().toISOString().split("T")[0];
    if (!form.toCity) updates.toCity = "AMD-ASLALI";
    if (Object.keys(updates).length > 0) setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "lrNo" && setLrNoError) {
      const trimmed = value.trim();
      if (trimmed && existingLrNos.includes(trimmed)) {
        setLrNoError(`LR No. "${trimmed}" already exists.`);
      } else {
        setLrNoError("");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      
      {/* Auto-populated Date Field */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
        <input 
          type="date" 
          name="date"
          value={form.date || ""} 
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white"
        />
      </div>

      <TypeDropdown value={form.type || "Inward"} onChange={handleChange} />

      {/* NEW CUSTOM DROPDOWNS */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          From City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fromCity"
          value={form.fromCity || ""}
          onChange={(e) => handleChange({ target: { name: "fromCity", value: e.target.value.toUpperCase() } })}
          onBlur={(e) => {
            setFromCityTouched(true);
            const trimmed = e.target.value.trim().toUpperCase();
            if (trimmed !== e.target.value) {
              handleChange({ target: { name: "fromCity", value: trimmed } });
            }
          }}
          placeholder="e.g. AHMEDABAD"
          className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none shadow-sm bg-white uppercase tracking-wide transition-colors
            ${fromCityError
              ? "border-red-400 focus:border-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-500"
            }`}
        />
        {fromCityError && (
          <p className="mt-0.5 text-[10px] text-red-500 font-semibold">From City is required</p>
        )}
      </div>

      <CityDropdown
        label="To City"
        name="toCity"
        value={form.toCity}
        onChange={handleChange}
      />

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">LR No.</label>
        <input
          type="text"
          name="lrNo"
          value={form.lrNo || ""}
          onChange={handleChange}
          placeholder="Enter LR no..."
          className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none shadow-sm bg-white transition-colors ${
            lrNoError
              ? "border-red-400 focus:border-red-400 bg-red-50"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
        {lrNoError && (
          <p className="mt-1 text-[11px] text-red-500 font-semibold">{lrNoError}</p>
        )}
      </div>

    </div>
  );
}