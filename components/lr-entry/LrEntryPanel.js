"use client";

import { useEffect, useState } from "react";
import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";

export default function LrEntryPanel({ onClose, initialData }) {
  
  const [form, setForm] = useState(initialData || {});
  const isViewMode = !!initialData?._id; // Check if it has an ID to know if it's existing data

  const saveForm = async () => {
    try {
      const res = await fetch("/api/lr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // This 'form' now includes the transportSlug!
        body: JSON.stringify(form), 
      });
      
      if (res.ok) {
        const savedData = await res.json();
        setForm(savedData); // Update form with new LR No from database
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-xl overflow-hidden">
        
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