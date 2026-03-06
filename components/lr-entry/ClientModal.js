"use client";

import { useState, useEffect } from "react";

export default function ClientModal({ isOpen, onClose, onSuccess, initialName = "", editData = null }) {
  const initialState = {
    name: "", alias: "", mobile1: "", mobile2: "", gstNo: "",
    transporter: "", city: "", state: "GUJARAT", address: "",
    pincode: "", email: "", acGroup: "Sundry Debtors",
    panNo: "", regType: "Regular", aadharNo: "", message: "", 
  };

  const [formData, setFormData] = useState(initialState);
  // NEW: State to hold all our field errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({}); // Clear errors when modal opens
      if (editData) {
        setFormData({ 
          ...initialState, 
          ...editData,
          mobile1: editData.mobile || "", 
        });
      } else {
        setFormData({ 
          ...initialState, 
          name: initialName || "" 
        });
      }
    }
  }, [isOpen, initialName, editData]);

  // --- VALIDATION ENGINE ---
  
  // Validates a single field (used when user clicks away from an input)
  const validateField = (name, value) => {
    let errorMsg = "";
    if (value) {
      if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Invalid email format";
      if ((name === "mobile1" || name === "mobile2") && value.length !== 10) errorMsg = "Must be exactly 10 digits";
      if (name === "gstNo" && value.length !== 15) errorMsg = "Must be exactly 15 characters";
      if (name === "panNo" && value.length !== 10) errorMsg = "Must be exactly 10 characters";
      if (name === "aadharNo" && value.length !== 12) errorMsg = "Must be exactly 12 digits";
      if (name === "pincode" && value.length !== 6) errorMsg = "Must be exactly 6 digits";
    }
    if (name === "name" && !value.trim()) errorMsg = "Name is mandatory";

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  // Validates ALL fields (used when hitting Save or F2)
  const validateAll = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is mandatory";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.mobile1 && formData.mobile1.length !== 10) newErrors.mobile1 = "Must be exactly 10 digits";
    if (formData.mobile2 && formData.mobile2.length !== 10) newErrors.mobile2 = "Must be exactly 10 digits";
    if (formData.gstNo && formData.gstNo.length !== 15) newErrors.gstNo = "Must be exactly 15 chars";
    if (formData.panNo && formData.panNo.length !== 10) newErrors.panNo = "Must be exactly 10 chars";
    if (formData.aadharNo && formData.aadharNo.length !== 12) newErrors.aadharNo = "Must be exactly 12 digits";
    if (formData.pincode && formData.pincode.length !== 6) newErrors.pincode = "Must be exactly 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if 0 errors
  };

  const performSave = async () => {
    // BLOCKS THE SAVE IF VALIDATION FAILS
    if (!validateAll()) {
      return; 
    }

    setLoading(true);
    try {
      const dbPayload = {
        ...(editData && { _id: editData._id }), 
        name: formData.name,
        mobile: formData.mobile1,
        address: formData.address,
        city: formData.city,
        gstNo: formData.gstNo,
        type: "Both" 
      };

      const method = editData ? "PUT" : "POST";
      const res = await fetch("/api/client", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      onSuccess(data);
      onClose();
    } catch (err) {
      alert(err.message); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSave();
  };

  useEffect(() => {
    if (!isOpen) return; 

    let isReady = false;
    const timer = setTimeout(() => { isReady = true; }, 150);

    const handleKeyDown = (e) => {
      if (!isReady) return; 
      if (e.key === "F2") {
        e.preventDefault(); 
        if (!loading) performSave(); 
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, loading, formData, editData]);


  // --- INPUT HANDLERS WITH REAL-TIME ERROR CLEARING ---
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value); // Clears error instantly as they fix it
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/[^0-9]/g, "");
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (errors[name]) validateField(name, cleanValue);
  };

  const handleUppercaseChange = (e) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, [name]: upperValue }));
    if (errors[name]) validateField(name, upperValue);
  };


  if (!isOpen) return null;

  // --- DYNAMIC UI CLASSES ---
  // Changed to items-start so labels stay at the top when error messages expand the row
  const rowClass = "flex items-start mb-[4px]"; 
  const labelClass = "w-[90px] text-right pr-2 shrink-0 text-[11px] font-bold text-gray-700 leading-[24px]";
  
  // Helper to dynamically color inputs red if they have an error
  const getInputClass = (fieldName) => {
    const base = "w-full h-[24px] text-[12px] border px-1 focus:outline-none font-medium rounded-none ";
    return base + (errors[fieldName] ? "border-red-500 bg-red-50 focus:border-red-600" : "border-gray-400 bg-white focus:border-blue-600");
  };

  // Helper component to render the small red text
  const ErrorMsg = ({ msg }) => {
    if (!msg) return null;
    return <span className="text-red-600 text-[10px] font-semibold leading-tight mt-[2px] block">{msg}</span>;
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="w-[650px] shadow-2xl border-[3px] border-[#8ab6d6] bg-[#f0f2f5] pointer-events-auto">
        
        <div className="bg-gradient-to-r from-[#8ab6d6] to-[#5c9ec7] h-[28px] flex justify-between items-center px-2">
          <h2 className="font-bold text-[13px] text-white tracking-wide">
            Account Master - [{editData ? "Edit" : "Add"}]
          </h2>
          <button onClick={onClose} type="button" className="text-white hover:text-red-200 font-bold text-sm leading-none focus:outline-none">X</button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 text-gray-800">
          
          <div className="flex gap-4 mb-[4px]">
            <div className="flex-1 flex items-start">
               <label className={labelClass}>Name <span className="text-red-500">*</span></label>
               <div className="flex-1 flex flex-col">
                 <input name="name" value={formData.name || ""} onChange={handleChange} onBlur={(e) => validateField("name", e.target.value)} className={getInputClass("name")} autoFocus />
                 <ErrorMsg msg={errors.name} />
               </div>
            </div>
            <div className="flex-1 flex items-start">
               <label className={labelClass}>Alias</label>
               <div className="flex-1 flex flex-col">
                 <input name="alias" value={formData.alias || ""} onChange={handleChange} className={getInputClass("alias")} />
               </div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-[4px]">
            <div className="flex-1 flex items-start">
               <label className={labelClass}>Mobile</label>
               <div className="flex-1 flex flex-col">
                 <input name="mobile1" value={formData.mobile1 || ""} onChange={handleNumberChange} onBlur={(e) => validateField("mobile1", e.target.value)} maxLength={10} inputMode="numeric" className={getInputClass("mobile1")} />
                 <ErrorMsg msg={errors.mobile1} />
               </div>
            </div>
            <div className="flex-1 flex items-start">
               <label className={labelClass}>Mobile 2</label>
               <div className="flex-1 flex flex-col">
                 <input name="mobile2" value={formData.mobile2 || ""} onChange={handleNumberChange} onBlur={(e) => validateField("mobile2", e.target.value)} maxLength={10} inputMode="numeric" className={getInputClass("mobile2")} />
                 <ErrorMsg msg={errors.mobile2} />
               </div>
            </div>
          </div>

          <div className="h-px bg-gray-300 my-2"></div>

          <div className="flex gap-4 mb-[4px]">
            <div className="flex-1 flex items-start">
               <label className={labelClass}>GSTNO</label>
               <div className="flex-1 flex flex-col">
                 <div className="flex flex-1 relative items-center w-full">
                   <input name="gstNo" value={formData.gstNo || ""} onChange={handleUppercaseChange} onBlur={(e) => validateField("gstNo", e.target.value)} maxLength={15} className={`${getInputClass("gstNo")} pr-7`} />
                   <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                   </button>
                 </div>
                 <ErrorMsg msg={errors.gstNo} />
               </div>
            </div>
            <div className="flex-1"></div>
          </div>

          <div className="h-px bg-gray-300 my-2"></div>

           <div className={rowClass}>
             <label className={labelClass}>Transporter</label>
             <select name="transporter" value={formData.transporter || ""} onChange={handleChange} className={`${getInputClass("transporter")} mr-2`}><option value="">Select...</option></select>

             <label className="w-[40px] text-right pr-2 shrink-0 text-[11px] font-bold leading-[24px]">City</label>
             <select name="city" value={formData.city || ""} onChange={handleChange} className={`${getInputClass("city")} mr-2`}>
                 <option value="">Select City</option><option value="SURAT">SURAT</option><option value="MUMBAI">MUMBAI</option>
             </select>

             <label className="w-[50px] text-right pr-2 shrink-0 text-[11px] font-bold leading-[24px]">State</label>
             <select name="state" value={formData.state || ""} onChange={handleChange} className={getInputClass("state")}>
                 <option value="GUJARAT">GUJARAT</option><option value="MAHARASHTRA">MAHARASHTRA</option>
             </select>
          </div>

          <div className={rowClass}>
             <label className={labelClass}>Address</label>
             <textarea name="address" value={formData.address || ""} onChange={handleChange} rows={2} className="flex-1 border border-gray-400 px-1 py-0.5 text-[12px] focus:outline-none focus:border-blue-600 bg-white resize-none rounded-none font-medium leading-tight h-[50px]"></textarea>
          </div>

           <div className={rowClass}>
             <label className={labelClass}>Pin Code</label>
             <div className="flex flex-col mr-4 w-[120px]">
               <input name="pincode" value={formData.pincode || ""} onChange={handleNumberChange} onBlur={(e) => validateField("pincode", e.target.value)} maxLength={6} inputMode="numeric" className={getInputClass("pincode")} />
               <ErrorMsg msg={errors.pincode} />
             </div>
             
             <label className="w-[50px] text-right pr-2 shrink-0 text-[11px] font-bold leading-[24px]">Email</label>
             <div className="flex-1 flex flex-col">
               <input type="text" name="email" value={formData.email || ""} onChange={handleChange} onBlur={(e) => validateField("email", e.target.value)} className={getInputClass("email")} />
               <ErrorMsg msg={errors.email} />
             </div>
          </div>

           <div className="h-px bg-gray-300 my-2"></div>

          <div className="flex gap-2 mb-[4px]">
             <div className="flex-1 flex flex-col gap-[4px]">
                <div className={rowClass}>
                  <label className={labelClass}>A/C Group</label>
                   <select name="acGroup" value={formData.acGroup || ""} onChange={handleChange} className={getInputClass("acGroup")}>
                     <option>Sundry Debtors</option><option>Sundry Creditors</option>
                   </select>
                </div>
                <div className={rowClass}>
                  <label className={labelClass}>PAN</label>
                  <div className="flex-1 flex flex-col">
                    <input name="panNo" value={formData.panNo || ""} onChange={handleUppercaseChange} onBlur={(e) => validateField("panNo", e.target.value)} maxLength={10} className={getInputClass("panNo")} />
                    <ErrorMsg msg={errors.panNo} />
                  </div>
                </div>
             </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <div className={rowClass}>
                  <label className={labelClass}>Reg Type</label>
                   <select name="regType" value={formData.regType || ""} onChange={handleChange} className={getInputClass("regType")}>
                     <option>Regular</option><option>Unregistered</option>
                   </select>
                </div>
                <div className={rowClass}>
                  <label className={labelClass}>ADHAR NO</label>
                  <div className="flex-1 flex flex-col">
                    <input name="aadharNo" value={formData.aadharNo || ""} onChange={handleNumberChange} onBlur={(e) => validateField("aadharNo", e.target.value)} maxLength={12} inputMode="numeric" className={getInputClass("aadharNo")} />
                    <ErrorMsg msg={errors.aadharNo} />
                  </div>
                </div>
             </div>
          </div>

          <div className={rowClass}>
             <label className={labelClass}>Message</label>
             <input name="message" value={formData.message || ""} onChange={handleChange} className={getInputClass("message")} />
          </div>

          <div className="mt-2">
            <div className="flex justify-end gap-2 border-t border-gray-300 pt-2">
              <button type="submit" disabled={loading} className="bg-[#5c9ec7] hover:bg-[#4a8ab3] text-white border border-[#4a8ab3] px-6 py-0.5 rounded-none font-bold text-xs disabled:opacity-50 shadow-sm focus:outline-none">
                {loading ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-0.5 rounded-none font-bold text-xs shadow-sm focus:outline-none">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}