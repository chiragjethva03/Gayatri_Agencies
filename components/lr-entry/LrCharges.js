"use client";

import { useEffect } from "react";

export default function LrCharges({ form, setForm }) {
  
  // The Auto-Calculator: Runs whenever these 5 specific fields change
  useEffect(() => {
    const f = Number(form.freight) || 0;
    const b = Number(form.bc) || 0;
    const h = Number(form.hamali) || 0;
    const c = Number(form.crossing) || 0;
    const d = Number(form.doorDelivery) || 0;
    
    const calculatedTotal = f + b + h + c + d;

    if (form.subTotal !== calculatedTotal) {
      setForm((prev) => ({ ...prev, subTotal: calculatedTotal }));
    }
  }, [form.freight, form.bc, form.hamali, form.crossing, form.doorDelivery, form.subTotal, setForm]);

  const handleChargeChange = (field, value) => {
    // FILTER: Removes letters, keeps only numbers and decimals
    const filteredValue = value.replace(/[^0-9.]/g, "");
    setForm({ ...form, [field]: filteredValue });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded border">

      {/* Left Column */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-24">RCM</label>
          <select 
            value={form.rcm || "N/A"} 
            onChange={(e) => setForm({ ...form, rcm: e.target.value })}
            className="border rounded p-1 flex-1 bg-white"
          >
            <option value="N/A">N/A</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="flex justify-between items-center gap-2">
          <label className="text-sm font-medium text-gray-700 w-24">RCM 5%</label>
          <input 
            inputMode="decimal"
            value={form.rcm5 || ""} 
            // FILTER: Removes letters, keeps numbers
            onChange={(e) => setForm({ ...form, rcm5: e.target.value.replace(/[^0-9.]/g, "") })}
            className="border rounded p-1 flex-1" 
          />
        </div>
      </div>

      {/* Right Column: The Math Section */}
      <div className="space-y-2">
        {[
          { label: "Freight", key: "freight" },
          { label: "B.C", key: "bc" },
          { label: "Hamali", key: "hamali" },
          { label: "Crossing", key: "crossing" },
          { label: "Door Delivery", key: "doorDelivery" },
        ].map((field) => (
          <div key={field.key} className="flex justify-between items-center gap-2">
            <label className="text-sm font-medium text-gray-700 w-28">{field.label}</label>
            <input 
              inputMode="decimal"
              value={form[field.key] || ""} 
              onChange={(e) => handleChargeChange(field.key, e.target.value)}
              className="border rounded p-1 flex-1 text-right" 
            />
          </div>
        ))}
        
        <hr className="my-2" />
        
        <div className="flex justify-between items-center gap-2 font-bold text-lg text-blue-800">
          <label className="w-28">SubTotal</label>
          <input 
            readOnly 
            value={form.subTotal || 0} 
            className="border-none bg-transparent p-1 flex-1 text-right font-bold outline-none" 
          />
        </div>
      </div>

    </div>
  );
}