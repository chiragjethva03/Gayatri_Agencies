"use client";

import { useEffect, useState } from "react";
import InwardOutwardBasicDetails from "./InwardOutwardBasicDetails";

// We reuse your exact LR components for the rest!
import LrConsignorConsignee from "@/components/lr-entry/LrConsignorConsignee";
import LrGoodsTable from "@/components/lr-entry/LrGoodsTable";

export default function InwardOutwardEntryPanel({ onClose, initialData, mode, transport }) {
  const [form, setForm] = useState(initialData || { type: "Inward" });
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const saveForm = async () => {
    try {
      const res = await fetch("/api/inward-outward", {
        method: isEditMode ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), 
      });
      
      if (res.ok) {
        const savedData = await res.json();
        setForm(savedData);
        return true;
      }
    } catch (error) {
      console.error("Failed to save:", error);
      return false;
    }
  };

  const saveAndClose = async () => {
    const success = await saveForm();
    if (success) onClose();
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (isViewMode) return;
      if (e.key === "F3") {
        e.preventDefault(); 
        await saveForm();
      } else if (e.key === "F4") {
        e.preventDefault();
        await saveAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode]); 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden">
        
        {/* CUSTOM HEADER */}
        <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center">
          <h2 className="font-bold text-sm tracking-wide">
            {mode === "add" ? "+ Add" : mode === "edit" ? "Edit" : "View"} Inward / Outward Entry
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">No : {form.no || "Auto"}</span>
            <button onClick={onClose} className="hover:text-red-200 font-bold px-1 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          <fieldset disabled={isViewMode} className="space-y-6">
            
            <InwardOutwardBasicDetails form={form} setForm={setForm} />
            
            {/* REUSING YOUR LR COMPONENTS DIRECTLY! */}
            <LrConsignorConsignee form={form} setForm={setForm} />
            
            <div>
              <LrGoodsTable form={form} setForm={setForm} />
            </div>

            {/* Note: LrCharges is intentionally excluded here to remove the pricing table! */}
            
          </fieldset>
        </div>

        {/* CUSTOM FOOTER */}
        <div className="bg-gray-100 p-3 border-t flex justify-between items-center">
          <button className="bg-white border border-gray-300 text-gray-700 px-6 py-1.5 rounded hover:bg-gray-50 text-sm font-medium shadow-sm flex items-center gap-2">
             🖨 Print
          </button>
          
          <div className="flex gap-2">
            {!isViewMode && (
              <button onClick={saveAndClose} className="bg-[#2a64f6] text-white px-6 py-1.5 rounded hover:bg-blue-700 text-sm font-bold shadow-sm">
                Save & Close (F4)
              </button>
            )}
            <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-6 py-1.5 rounded hover:bg-gray-50 text-sm font-medium shadow-sm">
              Cancel (Esc)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}