"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

const blueScrollbar = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-[#1e73be] hover:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded-full";

export default function LrBasicDetails({ form, setForm, onLrNoStatusChange, isEditMode }) {
  const { slug } = useParams();
  const today = new Date().toISOString().split("T")[0];

  const [locations, setLocations] = useState([]);
  const [currentTransportId, setCurrentTransportId] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [lrNoStatus, setLrNoStatus] = useState("idle");

  useEffect(() => {
    if (!form.fromCity) handleChange("fromCity", "AMD-ASLALI");
  }, []);

  useEffect(() => {
    if (isEditMode || !form.lrNo?.trim()) {
      setLrNoStatus("idle");
      onLrNoStatusChange?.("idle");
      return;
    }
    setLrNoStatus("checking");
    onLrNoStatusChange?.("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lr?transport=${slug}&checkLrNo=${encodeURIComponent(form.lrNo.trim())}`);
        const data = await res.json();
        const status = data.exists ? "taken" : "available";
        setLrNoStatus(status);
        onLrNoStatusChange?.(status);
      } catch {
        setLrNoStatus("idle");
        onLrNoStatusChange?.("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.lrNo, isEditMode, slug]);

  const fetchLocations = async () => {
    if (!slug) return;
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const data = await res.json();
        const transport = data.find(t => t.name.toLowerCase().replace(/\s+/g, "-") === slug);
        if (transport) {
          setCurrentTransportId(transport._id);
          setLocations((transport.locations || []).map(l => typeof l === "string" ? l : (l?.name || "")));
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  useEffect(() => { fetchLocations(); }, [slug]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveNewCity = async (newCityName) => {
    if (!newCityName || !currentTransportId) return;
    try {
      const res = await fetch("/api/transports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transportId: currentTransportId, newLocation: newCityName }),
      });
      if (!res.ok) throw new Error("Failed to add city");
      await fetchLocations();
      setShowAddCityModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const lrNoBorder =
    lrNoStatus === "taken"     ? "border-red-400 bg-red-50 focus:outline-red-400" :
    lrNoStatus === "available" ? "border-green-400 bg-green-50 focus:outline-green-400" :
                                 "border-blue-300 bg-white focus:outline-blue-500";

  return (
    <div className="grid grid-cols-6 gap-4 relative">

      <Field label="Date" type="date" value={form.lrDate || today} onChange={(v) => handleChange("lrDate", v)} tabIndex={-1} />
      <Field label="Freight By" value={form.freightBy} onChange={(v) => handleChange("freightBy", v)} options={["Paid", "To Pay", "TBB"]} autoFocus />
      <Field label="Delivery" value={form.delivery} onChange={(v) => handleChange("delivery", v)} options={["Door", "Godown"]} />

      {/* From City — fixed, skip in tab order */}
      <CityDropdown
        label="From City"
        value={form.fromCity}
        locations={locations}
        onSelect={(val) => handleChange("fromCity", val)}
        onAdd={() => setShowAddCityModal(true)}
        tabIndex={-1}
      />

      {/* To City */}
      <CityDropdown
        label="To City"
        value={form.toCity}
        locations={locations}
        onSelect={(val) => handleChange("toCity", val)}
        onAdd={() => setShowAddCityModal(true)}
        tabIndex={0}
      />

      {/* LR No */}
      <div className="flex flex-col text-xs font-semibold text-gray-700">
        <label className="mb-1 text-gray-600 flex items-center gap-1">
          LR No
          {!isEditMode && <span className="font-normal text-gray-400 text-[10px]">(blank = auto)</span>}
        </label>
        <input
          type="text"
          placeholder={isEditMode ? "" : "Auto"}
          value={form.lrNo || ""}
          readOnly={isEditMode}
          onChange={(e) => handleChange("lrNo", e.target.value.toUpperCase())}
          className={`border rounded p-1.5 text-sm w-full h-[30px] uppercase transition-colors
            ${isEditMode ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" : lrNoBorder}`}
        />
        {!isEditMode && form.lrNo?.trim() && (
          <span className={`mt-0.5 text-[10px] font-semibold leading-none
            ${lrNoStatus === "checking" ? "text-gray-400" :
              lrNoStatus === "available" ? "text-green-600" :
              lrNoStatus === "taken"     ? "text-red-500"  : ""}`}
          >
            {lrNoStatus === "checking"  && "Checking..."}
            {lrNoStatus === "available" && "✓ Available"}
            {lrNoStatus === "taken"     && "✗ Already used"}
          </span>
        )}
      </div>

      <AddCityModal
        isOpen={showAddCityModal}
        onClose={() => setShowAddCityModal(false)}
        onSave={handleSaveNewCity}
      />
    </div>
  );
}

// ---------------------------------------------------------
// FIELD
// ---------------------------------------------------------
function Field({ label, type = "text", value, onChange, options, autoFocus, tabIndex }) {
  return (
    <div className="flex flex-col text-xs font-semibold text-gray-700">
      <label className="mb-1 text-gray-600">{label}</label>
      {options ? (
        <select
          className="border border-blue-300 rounded p-1.5 focus:outline-blue-500 bg-white w-full h-[30px]"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
        >
          <option value="">Select...</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          className="border border-blue-300 rounded p-1.5 focus:outline-blue-500 bg-white w-full h-[30px]"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={tabIndex}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// CITY DROPDOWN — full keyboard nav
// ---------------------------------------------------------
function CityDropdown({ value, locations, onSelect, onAdd, label, tabIndex = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when search changes
  useEffect(() => { setHighlightedIndex(0); }, [searchTerm]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (!listRef.current || !isOpen) return;
    const rows = listRef.current.querySelectorAll("[data-city-idx]");
    rows[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doSelect = (idx) => {
    const loc = filteredLocations[idx];
    if (loc) { onSelect(loc); setIsOpen(false); setSearchTerm(""); }
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredLocations.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      doSelect(Math.min(highlightedIndex, filteredLocations.length - 1));
    } else if (e.key === "F2") {
      e.preventDefault();
      setIsOpen(false); setSearchTerm(""); onAdd();
    } else if (e.key === "Tab" || e.key === "Escape") {
      setIsOpen(false); setSearchTerm("");
    }
  };

  return (
    <div className="flex flex-col text-xs font-semibold text-gray-700 relative" ref={dropdownRef}>
      <label className="mb-1 text-gray-600">{label}</label>
      <div
        tabIndex={tabIndex}
        className="border border-blue-300 rounded p-1.5 bg-white cursor-pointer flex justify-between items-center w-full h-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => { setIsOpen(!isOpen); setHighlightedIndex(0); }}
        onKeyDown={handleTriggerKeyDown}
        onBlur={() => {
          setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) {
              setIsOpen(false); setSearchTerm("");
            }
          }, 150);
        }}
      >
        <span className={value ? "text-gray-800" : "text-gray-400 font-normal"}>
          {value || "Select..."}
        </span>
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
              placeholder="Search city..."
              className="w-full p-1.5 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-400 outline-none"
              onKeyDown={handleSearchKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  if (!dropdownRef.current?.contains(document.activeElement)) {
                    setIsOpen(false); setSearchTerm("");
                  }
                }, 150);
              }}
            />
          </div>

          <div ref={listRef} className={`max-h-[180px] overflow-y-auto ${blueScrollbar}`}>
            <table className="w-full text-left whitespace-nowrap table-auto">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm text-gray-700 text-xs">
                <tr><th className="p-1.5 border-b border-gray-300 font-semibold">City Name</th></tr>
              </thead>
              <tbody className="text-xs font-normal">
                {filteredLocations.length === 0 ? (
                  <tr><td className="p-3 text-center text-gray-500">No cities found. Press F2 to add.</td></tr>
                ) : (
                  filteredLocations.map((loc, idx) => (
                    <tr
                      key={loc}
                      data-city-idx={idx}
                      onMouseDown={(e) => { e.preventDefault(); doSelect(idx); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`border-b border-gray-200 cursor-pointer transition-colors ${
                        idx === highlightedIndex ? "bg-blue-200 text-blue-900 font-semibold" : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="p-2 text-gray-800">{loc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
            <button
              tabIndex={-1}
              onMouseDown={(e) => { e.preventDefault(); setIsOpen(false); setSearchTerm(""); onAdd(); }}
              type="button"
              className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700"
            >
              + Add City (F2)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// ADD CITY MODAL
// ---------------------------------------------------------
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
          <button onClick={() => { if (cityName) onSave(cityName); }} className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-medium text-xs shadow-sm">Save (Enter)</button>
        </div>
      </div>
    </div>
  );
}
