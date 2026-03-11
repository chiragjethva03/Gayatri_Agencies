"use client";
import React, { useState } from "react";

export default function CenterMasterModal({ isOpen, onClose, onSave }) {
  const [centerName, setCenterName] = useState("");

  if (!isOpen) return null;

  // Helper component for the Toggle Switches to match your image
  const ToggleRow = ({ label }) => (
    <div className="flex items-center gap-3 py-1">
      <span className="text-gray-700 text-xs w-44">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" />
        <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
      </label>
    </div>
  );

  // Helper component for the Select Dropdowns
  const SelectRow = ({ label }) => (
    <div className="flex flex-col py-1.5 relative">
      <label className="text-gray-500 text-[11px] absolute -top-1 left-2 bg-white px-1 z-10">{label}</label>
      <select className="border border-blue-300 rounded p-1.5 w-full text-xs outline-none focus:border-blue-500 bg-white relative mt-1 appearance-none">
        <option></option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 mt-1">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-[400px] flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-sm">+ Add Center Master</h2>
          <div className="flex gap-1.5">
            <button className="bg-white text-blue-600 px-1 rounded font-bold text-[10px]">+</button>
            <button className="bg-white text-blue-600 px-1 rounded font-bold text-[10px]">🔍</button>
            <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-1.5 rounded font-bold text-[10px]">✕</button>
          </div>
        </div>

        {/* BODY CONTENT SCROLL AREA */}
        <div className="flex-1 p-4 bg-white overflow-y-auto">
          <div className="flex flex-col gap-2">
            
            {/* Center Name Input */}
            <div className="flex flex-col relative py-1.5 mb-2">
              <label className="text-gray-500 text-[11px] absolute -top-1 left-2 bg-white px-1 z-10">Center Name</label>
              <input 
                type="text" 
                value={centerName} 
                onChange={e => setCenterName(e.target.value)} 
                autoFocus 
                className="border border-blue-400 rounded p-1.5 w-full text-xs outline-none focus:border-blue-600 bg-[#e8f0fe] mt-1" 
              />
            </div>

            {/* Toggle Switches */}
            <ToggleRow label="Manual Lr No?" />
            <ToggleRow label="Duplicate Lr No Allowed?" />
            <ToggleRow label="Non-Editable Lr No ?" />
            <ToggleRow label="Is Crossing Lr ?" />
            <ToggleRow label="Book Issue ?" />
            <ToggleRow label="Crossing Reference No ?" />
            <ToggleRow label="Allow Alphabet in LrNo ?" />
            <ToggleRow label="Deactivated" />

            <div className="mt-2 flex flex-col gap-2">
               {/* Select Dropdowns */}
               <SelectRow label="Screen Name" />
               <SelectRow label="Book Code" />
               <SelectRow label="Consignor Account" />
               <SelectRow label="From City" />
               <SelectRow label="Bill Account" />
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#e2e8f0] p-2 flex justify-center gap-2 border-t shrink-0">
          <button 
            onClick={() => { if(centerName) onSave(centerName); }} 
            className="bg-[#1e73be] text-white px-4 py-1 rounded font-medium shadow-sm hover:bg-blue-700"
          >
            Save
          </button>
          <button 
            onClick={() => { if(centerName) onSave(centerName); }} 
            className="bg-[#1e73be] text-white px-4 py-1 rounded font-medium shadow-sm hover:bg-blue-700"
          >
            Save & Close
          </button>
          <button 
            onClick={onClose} 
            className="bg-[#1e73be] text-white px-4 py-1 rounded font-medium shadow-sm hover:bg-blue-700"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}