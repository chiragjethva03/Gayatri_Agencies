"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

// Reusable scrollbar style
const blueScrollbar = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-[#1e73be] hover:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded-full";

export default function LrBasicDetails({ form, setForm }) {
  const { slug } = useParams();
  const today = new Date().toISOString().split("T")[0];
  
  // --- STATE FOR LOCATIONS ---
  const [locations, setLocations] = useState([]);
  const [currentTransportId, setCurrentTransportId] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);

  // Set default "From City" on mount if it's empty
  useEffect(() => {
    if (!form.fromCity) {
      handleChange("fromCity", "AMD-ASLALI");
    }
  }, []);

  const fetchLocations = async () => {
    if (!slug) return;
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const data = await res.json();
        // Find transport matching URL slug
        const transport = data.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === slug);
        if (transport) {
          setCurrentTransportId(transport._id);
          setLocations(transport.locations || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [slug]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveNewCity = async (newCityName) => {
    if (!newCityName || !currentTransportId) return;

    try {
      const res = await fetch("/api/transports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transportId: currentTransportId, 
          newLocation: newCityName 
        })
      });

      if (!res.ok) throw new Error("Failed to add city");

      // Refetch to get updated list
      await fetchLocations();
      // Auto-select the new city
      handleChange("fromCity", newCityName);
      setShowAddCityModal(false);
      
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 relative">
      <Field
        label="Date"
        type="date"
        value={form.lrDate || today}
        onChange={(v) => handleChange("lrDate", v)}
      />
      
      <Field
        label="Center"
        value={form.center}
        onChange={(v) => handleChange("center", v.replace(/[0-9]/g, ""))}
      />
      
      <Field
        label="Freight By"
        value={form.freightBy}
        onChange={(v) => handleChange("freightBy", v)}
        options={["Paid", "To Pay", "TBB"]} 
      />
      
      <Field
        label="Delivery"
        value={form.delivery}
        onChange={(v) => handleChange("delivery", v.replace(/[0-9]/g, ""))}
      />
      
      {/* --- CUSTOM FROM CITY DROPDOWN --- */}
      <CityDropdown 
        label="From City"
        value={form.fromCity}
        locations={locations}
        onSelect={(val) => handleChange("fromCity", val)}
        onAdd={() => setShowAddCityModal(true)}
      />
      
      <Field
        label="To City"
        value={form.toCity}
        onChange={(v) => handleChange("toCity", v.replace(/[0-9]/g, ""))}
      />

      {/* --- ADD CITY MODAL --- */}
      <AddCityModal 
        isOpen={showAddCityModal} 
        onClose={() => setShowAddCityModal(false)} 
        onSave={handleSaveNewCity} 
      />
    </div>
  );
}

// ---------------------------------------------------------
// CUSTOM COMPONENTS BELOW
// ---------------------------------------------------------

function Field({ label, type = "text", value, onChange, options }) {
  return (
    <div className="flex flex-col text-xs font-semibold text-gray-700">
      <label className="mb-1 text-gray-600">{label}</label>
      {options ? (
        <select
          className="border border-blue-300 rounded p-1.5 focus:outline-blue-500 bg-white w-full h-[30px]"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="border border-blue-300 rounded p-1.5 focus:outline-blue-500 bg-white w-full h-[30px]"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// THE SEARCHABLE CITY DROPDOWN
function CityDropdown({ value, locations, onSelect, onAdd, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations.filter(loc => 
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col text-xs font-semibold text-gray-700 relative" ref={dropdownRef}>
      <label className="mb-1 text-gray-600">{label}</label>
      <div 
        className="border border-blue-300 rounded p-1.5 bg-white cursor-pointer flex justify-between items-center w-full h-[30px] focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-800" : "text-gray-400 font-normal"}>{value || `Select...`}</span>
        <span className="text-gray-400 text-[10px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full min-w-[250px] bg-white border-2 border-blue-400 shadow-2xl z-[999] mt-1 rounded flex flex-col overflow-hidden">
          <div className="p-1.5 bg-gray-50 border-b border-gray-200">
             <input 
               type="text" 
               autoFocus 
               value={searchTerm} 
               onChange={(e) => setSearchTerm(e.target.value)} 
               placeholder="Search Name (F2 Add / F6 Edit)..." 
               className="w-full p-1.5 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-400 outline-none" 
             />
          </div>
          
          <div className={`max-h-[180px] overflow-y-auto ${blueScrollbar}`}>
            <table className="w-full text-left whitespace-nowrap table-auto">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm text-gray-700 text-xs">
                <tr><th className="p-1.5 border-b border-gray-300 font-semibold">City Name</th></tr>
              </thead>
              <tbody className="text-xs font-normal">
                {filteredLocations.length === 0 ? (
                  <tr><td className="p-3 text-center text-gray-500">No cities found.</td></tr>
                ) : (
                  filteredLocations.map(loc => (
                    <tr key={loc} onClick={() => { onSelect(loc); setIsOpen(false); }} className="border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition-colors">
                      <td className="p-2 border-r border-gray-200 text-gray-800">{loc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
             <button onClick={() => { setIsOpen(false); onAdd(); }} type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
             <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">✏️ (F6)</button>
             <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">🔄 (F5)</button>
          </div>
        </div>
      )}
    </div>
  );
}

// THE ADD CITY MODAL
function AddCityModal({ isOpen, onClose, onSave }) {
  const [cityName, setCityName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-[320px] border border-gray-400 overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-2 font-semibold text-sm flex justify-between items-center">
          <span>+ Add City Master</span>
          <button onClick={onClose} className="hover:text-red-300 font-bold">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700">City Name <span className="text-red-500">*</span></label>
          <input 
            autoFocus 
            type="text" 
            value={cityName} 
            onChange={(e) => setCityName(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && cityName && onSave(cityName)}
            className="w-full border border-blue-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter city..." 
          />
        </div>
        <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-xs shadow-sm">Cancel</button>
          <button onClick={() => { if(cityName) onSave(cityName); }} className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-medium text-xs shadow-sm">Save (F3)</button>
        </div>
      </div>
    </div>
  );
}