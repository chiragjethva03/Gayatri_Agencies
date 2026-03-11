"use client";

import { useEffect, useState } from "react";
import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";
import { generateLrPdf } from "@/lib/generateLrPdf"; // NEW: Import the utility

export default function LrEntryPanel({ onClose, initialData, mode }) {
  
  const [form, setForm] = useState(initialData || {});
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const saveForm = async () => {
    try {
      const res = await fetch("/api/lr", {
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

  // NEW: Handler for printing
  const handlePrint = () => {
    generateLrPdf(form); // Sends the current form data to the PDF generator
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-xl overflow-hidden">
        
        <LrEntryHeader 
          onClose={onClose} 
          isViewMode={isViewMode}
          lrNo={form.lrNo} 
        />

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <fieldset disabled={isViewMode} className="space-y-6">
            <LrBasicDetails form={form} setForm={setForm} />
            <LrConsignorConsignee form={form} setForm={setForm} />
            <LrGoodsTable form={form} setForm={setForm} />
            <LrCharges form={form} setForm={setForm} />
          </fieldset>
        </div>

        {!isViewMode ? (
          <LrFooterActions
            onSave={saveForm}
            onSaveClose={saveAndClose}
            onCancel={onClose}
            onPrint={handlePrint} // NEW: Passed the print handler down
          />
        ) : (
          <div className="bg-gray-200 p-3 border-t flex justify-between items-center">
            {/* Added print button for View Mode as well */}
            <button 
              onClick={handlePrint} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              Print
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-medium"
            >
              Close (Esc)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}