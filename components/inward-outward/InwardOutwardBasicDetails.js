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

// --- CUSTOM SEARCHABLE DROPDOWN WITH ACTION BUTTONS ---
const CityDropdown = ({ label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const dropdownRef = useRef(null);

  // In a real scenario, you can fetch these from your /api/cities database route!
  const [cities] = useState([
    "AMD-ASLALI", "SURAT", "RAJKOT", "BARODA", "VAPI", "MUMBAI", "DELHI", "PUNE"
  ]);

  // Keep search input synced if the parent form state changes
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Close the dropdown if the user clicks anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedSearch = useDebounce(searchTerm, 200);
  const filteredCities = cities.filter(c => c.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const handleSelect = (city) => {
    setSearchTerm(city);
    onChange({ target: { name, value: city } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
        placeholder="Search Name (F2 Add / F6 Edit)..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange({ target: { name, value: e.target.value } }); 
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl flex flex-col">
          <ul className="max-h-48 overflow-y-auto flex-1 p-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1.5 text-sm hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors"
                  onClick={() => handleSelect(city)}
                >
                  {city}
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-gray-400 text-center font-medium">No results found</li>
            )}
          </ul>
          
          {/* THE 3 ACTION BUTTONS AT THE BOTTOM OF THE DROPDOWN */}
          <div className="bg-[#ebf0f7] p-1.5 border-t border-gray-200 flex gap-1.5 rounded-b-md">
            <button
              type="button"
              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
              onClick={(e) => { e.stopPropagation(); alert("Open Add City Modal (F2)"); }}
            >
              <span className="text-sm leading-none">+</span> Add
            </button>
            <button
              type="button"
              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
              onClick={(e) => { e.stopPropagation(); alert("Open Edit City Modal (F6)"); }}
            >
              ✎ Edit
            </button>
            <button
              type="button"
              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
              onClick={(e) => { e.stopPropagation(); alert("Refreshing City List..."); }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// --- MAIN BASIC DETAILS COMPONENT ---
export default function InwardOutwardBasicDetails({ form, setForm, existingLrNos = [], lrNoError, setLrNoError }) {
  
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
      <CityDropdown 
        label="From City" 
        name="fromCity" 
        value={form.fromCity} 
        onChange={handleChange} 
      />

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