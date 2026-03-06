"use client";

import { useEffect, useState } from "react";
import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";

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

  // NEW: Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // 1. Always allow Escape to close the panel
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // 2. Block F3 and F4 if the user is in View Mode
      if (isViewMode) return;

      // 3. Handle Save Shortcuts
      if (e.key === "F3") {
        e.preventDefault(); // Stops the browser's default "search" box from opening
        await saveForm();
      } else if (e.key === "F4") {
        e.preventDefault();
        await saveAndClose();
      }
    };

    // Attach the listener to the whole window while this panel is open
    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the listener when the panel closes
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode]); // These dependencies ensure the latest form data is saved

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
          />
        ) : (
          <div className="bg-gray-200 p-3 border-t flex justify-end">
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