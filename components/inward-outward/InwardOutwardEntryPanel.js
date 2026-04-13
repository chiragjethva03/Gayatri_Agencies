"use client";

import { useEffect, useState } from "react";
import InwardOutwardBasicDetails from "./InwardOutwardBasicDetails";
import LrConsignorConsignee from "@/components/lr-entry/LrConsignorConsignee";
import LrGoodsTable from "@/components/lr-entry/LrGoodsTable";

export default function InwardOutwardEntryPanel({ onClose, initialData, mode, transport, totalStock }) {
  const [form, setForm] = useState(initialData || { type: "Inward" });
  
  // --- NEW: STATE FOR PROFESSIONAL ERROR MODAL ---
  const [errorMessage, setErrorMessage] = useState("");
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const saveForm = async () => {
    // --- STOCK VALIDATION ---
    if (mode === "add" && form.type === "Outward") {
      const articlesToSend = (form.goods || []).reduce((sum, item) => sum + (parseInt(item.article) || 0), 0);
      
      if (totalStock <= 0) {
        // FIXED: Using our new custom modal instead of the ugly browser alert
        setErrorMessage("You cannot create an Outward entry because the Total Stock is currently 0.");
        return false;
      }
      
      if (articlesToSend > totalStock) {
        // FIXED: Using our new custom modal instead of the ugly browser alert
        setErrorMessage(`You are trying to dispatch ${articlesToSend} articles, but you only have ${totalStock} in stock.`);
        return false;
      }
    }

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
      // If error modal is open, let Escape close the error modal first
      if (e.key === "Escape") {
        e.preventDefault();
        if (errorMessage) {
          setErrorMessage("");
        } else {
          onClose();
        }
        return;
      }
      if (isViewMode || errorMessage) return; // Prevent saving if error is showing
      
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
  }, [form, isViewMode, isEditMode, errorMessage]); // Added errorMessage to dependency array

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      
      {/* THE MAIN ENTRY FORM MODAL */}
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden relative">
        
        <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center">
          <h2 className="font-bold text-sm tracking-wide">
            {mode === "add" ? "+ Add" : mode === "edit" ? "Edit" : "View"} Inward / Outward Entry
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">No : {form.no || "Auto"}</span>
            <button onClick={onClose} className="hover:text-red-200 font-bold px-1 text-lg leading-none">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-white">
          <fieldset disabled={isViewMode} className="space-y-6">
            <InwardOutwardBasicDetails form={form} setForm={setForm} />
            <LrConsignorConsignee form={form} setForm={setForm} />
            <div>
              <LrGoodsTable form={form} setForm={setForm} />
            </div>
          </fieldset>
        </div>

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

        {/* --- PROFESSIONAL ERROR MODAL OVERLAY --- */}
        {errorMessage && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="bg-red-50 p-5 flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0 mt-1">
                  {/* Warning SVG Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-lg">Action Blocked</h3>
                  <p className="text-red-600 mt-1 text-sm leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setErrorMessage("")} 
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium text-sm transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-1 outline-none"
                >
                  Understood
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}