"use client";
import { useState, useEffect, useRef } from "react";

// --- CUSTOM SEARCHABLE DROPDOWN WITH ACTION BUTTONS ---
const CityDropdown = ({ label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const dropdownRef = useRef(null);

  // In a real scenario, you can fetch these from your /api/cities database route!
  const [cities, setCities] = useState([
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

  const filteredCities = cities.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

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
              <span className="text-sm leading-none">+</span> (F2)
            </button>
            <button
              type="button"
              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition shadow-sm"
              onClick={(e) => { e.stopPropagation(); alert("Open Edit City Modal (F6)"); }}
            >
              ✎ (F6)
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
export default function InwardOutwardBasicDetails({ form, setForm }) {
  
  // 1. SET DEFAULT DATE TO TODAY ON LOAD
  useEffect(() => {
    if (!form.date) {
      const today = new Date().toISOString().split("T")[0]; // Generates YYYY-MM-DD
      setForm((prev) => ({ ...prev, date: today }));
    }
  }, [form.date, setForm]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
        <select 
          name="type"
          value={form.type || "Inward"} 
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white cursor-pointer"
        >
          <option value="Inward">Inward</option>
          <option value="Outward">Outward</option>
        </select>
      </div>

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

    </div>
  );
}