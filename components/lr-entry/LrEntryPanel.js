"use client";

import { useEffect, useState } from "react";
import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";

// NEW: Added initialData prop
export default function LrEntryPanel({ onClose, initialData }) {
  
  // Initialize form with existing data (View Mode) or empty object (Add Mode)
  const [form, setForm] = useState(initialData || {});

  // Helper boolean to know if we are viewing/editing
  const isViewMode = !!initialData;

  const saveForm = async () => {
    // NOTE: If you want to support UPDATING existing records later, 
    // you will need a PUT request here. For now, this POST will create a copy.
    console.log("Saving...", form);
    
    // Logic for save...
    const res = await fetch("/api/lr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    // ...
  };

  const saveAndClose = async () => {
    await saveForm();
    onClose();
  };

  // (Keep your useEffect keyboard shortcuts here...)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-xl overflow-hidden">
        
        {/* Pass mode and existing LR Number to header */}
        <LrEntryHeader 
          onClose={onClose} 
          isViewMode={isViewMode}
          lrNo={form.lrNo} 
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          <LrBasicDetails form={form} setForm={setForm} />
          <LrConsignorConsignee form={form} setForm={setForm} />
          <LrGoodsTable form={form} setForm={setForm} />
          <LrCharges form={form} setForm={setForm} />
        </div>

        <LrFooterActions
          onSave={saveForm}
          onSaveClose={saveAndClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}