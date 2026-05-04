"use client";

import { useEffect, useState } from "react";
import InwardOutwardBasicDetails from "./InwardOutwardBasicDetails";
import LrConsignorConsignee from "@/components/lr-entry/LrConsignorConsignee";
import LrGoodsTable from "@/components/lr-entry/LrGoodsTable";

export default function InwardOutwardEntryPanel({ onClose, initialData, mode, transport, totalStock }) {
  const [form, setForm] = useState(initialData || { type: "Inward" });
  const [errorMessage, setErrorMessage] = useState("");

  // Outward details state
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: "", phone: "", licenseNumber: "" });
  const [isSavingDriver, setIsSavingDriver] = useState(false);
  const [driverFormError, setDriverFormError] = useState("");

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicleNo, setNewVehicleNo] = useState("");
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const [aadharError, setAadharError] = useState("");

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // Fetch drivers + vehicles whenever Outward is selected
  useEffect(() => {
    if (form.type === "Outward") fetchOutwardData();
  }, [form.type]);

  const fetchOutwardData = async () => {
    try {
      const [drRes, vhRes] = await Promise.all([
        fetch("/api/drivers"),
        fetch("/api/vehicles"),
      ]);
      const [drs, vhs] = await Promise.all([drRes.json(), vhRes.json()]);
      setDrivers(Array.isArray(drs) ? drs : []);
      setVehicles(Array.isArray(vhs) ? vhs : []);
    } catch (err) {
      console.error("Failed to fetch outward data", err);
    }
  };

  // ── Driver handlers ──────────────────────────────────────
  const handleDriverSelect = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") { setShowDriverModal(true); return; }
    setForm(prev => ({ ...prev, driverName: val }));
  };

  const handleAddDriver = async () => {
    if (!driverForm.name.trim() || !driverForm.phone.trim() || !driverForm.licenseNumber.trim()) {
      setDriverFormError("All fields are required.");
      return;
    }
    if (!/^\d{10}$/.test(driverForm.phone.trim())) {
      setDriverFormError("Phone must be exactly 10 digits.");
      return;
    }
    setDriverFormError("");
    setIsSavingDriver(true);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverForm),
      });
      if (res.ok) {
        const saved = await res.json();
        setDrivers(prev => [...prev, saved]);
        setForm(prev => ({ ...prev, driverName: saved.name }));
        setDriverForm({ name: "", phone: "", licenseNumber: "" });
        setShowDriverModal(false);
      } else {
        setDriverFormError("Failed to save. Driver may already exist.");
      }
    } catch {
      setDriverFormError("Network error. Please try again.");
    } finally {
      setIsSavingDriver(false);
    }
  };

  const closeDriverModal = () => {
    setShowDriverModal(false);
    setDriverForm({ name: "", phone: "", licenseNumber: "" });
    setDriverFormError("");
  };

  // ── Vehicle handlers ─────────────────────────────────────
  const handleVehicleSelect = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") { setShowVehicleModal(true); return; }
    setForm(prev => ({ ...prev, vehicleNo: val }));
  };

  const handleAddVehicle = async () => {
    if (!newVehicleNo.trim()) return;
    setIsSavingVehicle(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newVehicleNo.trim().toUpperCase() }),
      });
      if (res.ok) {
        const saved = await res.json();
        setVehicles(prev => [...prev, saved]);
        setForm(prev => ({ ...prev, vehicleNo: saved.number }));
        setNewVehicleNo("");
        setShowVehicleModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingVehicle(false);
    }
  };

  // ── Aadhar handler ───────────────────────────────────────
  const handleAadharChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    const parts = digits.match(/.{1,4}/g) || [];
    const formatted = parts.join(" ");
    setForm(prev => ({ ...prev, aadharCard: formatted }));
    if (digits.length > 0 && digits.length < 12) {
      setAadharError("Aadhar must be 12 digits.");
    } else {
      setAadharError("");
    }
  };

  // ── Save logic ───────────────────────────────────────────
  const saveForm = async () => {
    if (mode === "add" && form.type === "Outward") {
      const articlesToSend = (form.goods || []).reduce((sum, item) => sum + (parseInt(item.article) || 0), 0);
      if (totalStock <= 0) {
        setErrorMessage("You cannot create an Outward entry because the Total Stock is currently 0.");
        return false;
      }
      if (articlesToSend > totalStock) {
        setErrorMessage(`You are trying to dispatch ${articlesToSend} articles, but only ${totalStock} are in stock.`);
        return false;
      }
      if (form.aadharCard && form.aadharCard.replace(/\s/g, "").length !== 12) {
        setErrorMessage("Aadhar card must be exactly 12 digits.");
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
      if (e.key === "Escape") {
        e.preventDefault();
        if (errorMessage) { setErrorMessage(""); }
        else if (showDriverModal) { closeDriverModal(); }
        else if (showVehicleModal) { setShowVehicleModal(false); setNewVehicleNo(""); }
        else { onClose(); }
        return;
      }
      if (isViewMode || errorMessage || showDriverModal || showVehicleModal) return;
      if (e.key === "F4") { e.preventDefault(); await saveAndClose(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode, errorMessage, showDriverModal, showVehicleModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden relative">

        {/* Header */}
        <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-sm tracking-wide">
            {mode === "add" ? "+ Add" : mode === "edit" ? "Edit" : "View"} Inward / Outward Entry
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">No : {form.no || "Auto"}</span>
            <button onClick={onClose} className="hover:text-red-200 font-bold px-1 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          <fieldset disabled={isViewMode} className="space-y-5">
            <InwardOutwardBasicDetails form={form} setForm={setForm} />
            <LrConsignorConsignee form={form} setForm={setForm} />
            <LrGoodsTable form={form} setForm={setForm} />

            {/* ── OUTWARD DRIVER SECTION ── */}
            {form.type === "Outward" && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#2a64f6] rounded-full inline-block" />
                  Driver & Vehicle Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                  {/* Driver Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Driver Name</label>
                    <select
                      value={form.driverName || ""}
                      onChange={handleDriverSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white transition"
                    >
                      <option value="">Select driver...</option>
                      {drivers.map(d => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="__add_new__">+ Add New Driver</option>
                    </select>
                  </div>

                  {/* Vehicle No */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Vehicle No</label>
                    <select
                      value={form.vehicleNo || ""}
                      onChange={handleVehicleSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white transition"
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => (
                        <option key={v._id} value={v.number}>{v.number}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="__add_new__">+ Add New Vehicle</option>
                    </select>
                  </div>

                  {/* Aadhar Card */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Aadhar Card</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.aadharCard || ""}
                      onChange={(e) => handleAadharChange(e.target.value)}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none font-mono tracking-widest transition
                        ${aadharError
                          ? "border-red-400 bg-red-50 focus:border-red-400"
                          : "border-gray-300 focus:border-blue-500"
                        }`}
                    />
                    {aadharError && (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold">{aadharError}</p>
                    )}
                    {form.aadharCard && !aadharError && form.aadharCard.replace(/\s/g, "").length === 12 && (
                      <p className="mt-1 text-[11px] text-green-600 font-semibold">✓ Valid</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 border-t flex justify-between items-center shrink-0">
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

        {/* ── ERROR MODAL ── */}
        {errorMessage && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-red-100 overflow-hidden">
              <div className="bg-red-50 p-5 flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0 mt-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-lg">Action Blocked</h3>
                  <p className="text-red-600 mt-1 text-sm leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t flex justify-end">
                <button onClick={() => setErrorMessage("")} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium text-sm">
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD DRIVER MODAL ── */}
        {showDriverModal && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center">
                <span className="font-bold text-sm">+ Add New Driver</span>
                <button onClick={closeDriverModal} className="hover:text-red-200 font-bold text-lg leading-none">✕</button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Driver Name <span className="text-red-500">*</span></label>
                  <input
                    autoFocus
                    type="text"
                    value={driverForm.name}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone No. <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">License Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. GJ01 20210012345"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 uppercase"
                  />
                </div>
                {driverFormError && (
                  <p className="text-xs text-red-500 font-semibold">{driverFormError}</p>
                )}
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
                <button onClick={closeDriverModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
                <button
                  onClick={handleAddDriver}
                  disabled={isSavingDriver}
                  className="px-5 py-2 bg-[#2a64f6] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingDriver ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD VEHICLE MODAL ── */}
        {showVehicleModal && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs border border-gray-200 overflow-hidden">
              <div className="bg-[#2a64f6] text-white px-4 py-2.5 flex justify-between items-center">
                <span className="font-bold text-sm">+ Add New Vehicle</span>
                <button onClick={() => { setShowVehicleModal(false); setNewVehicleNo(""); }} className="hover:text-red-200 font-bold text-lg leading-none">✕</button>
              </div>
              <div className="p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Number <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={newVehicleNo}
                  onChange={(e) => setNewVehicleNo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddVehicle()}
                  placeholder="e.g. GJ01AB1234"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 uppercase"
                />
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
                <button onClick={() => { setShowVehicleModal(false); setNewVehicleNo(""); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
                <button
                  onClick={handleAddVehicle}
                  disabled={isSavingVehicle || !newVehicleNo.trim()}
                  className="px-5 py-2 bg-[#2a64f6] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingVehicle ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
