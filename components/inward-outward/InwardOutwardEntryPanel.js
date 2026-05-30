"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import InwardOutwardBasicDetails from "./InwardOutwardBasicDetails";
import LrConsignorConsignee from "@/components/lr-entry/LrConsignorConsignee";
import LrGoodsTable from "@/components/lr-entry/LrGoodsTable";
import { calcDemurrage } from "@/utils/calcDemurrage";
import { generateInwardOutwardPdf } from "@/lib/generateInwardOutwardPdf";
import ComboBox from "@/components/ui/ComboBox";

const defaultDlv = {
  lrNoInput: "", deliveryNo: "", deliveryDate: "",
  party: "", partyName: "", partyAddress: "",
  article: "", weight: "", rate: "", freightOn: "", amount: "",
  deliveryType: "Cash", account: "CASH ACCOUNT", labour: "",
  deliveryAt: "", note: "",
  totalFreight: "", hamali: "", serviceCharge: "",
  deliverySubTotal: "", gstType: "", gstAmt: "", discount: "", deliveryFreight: "",
  demurrageRatePerDay: "", demurrageFreeDays: 7,
};

export default function InwardOutwardEntryPanel({ onClose, initialData, mode, transport, totalStock, existingLrNos = [] }) {
  const [form, setForm] = useState(initialData || { type: "Inward" });

  // ── Delivery section state ──────────────────────────────
  const [dlv, setDlv] = useState(() => {
    const base = initialData?.deliveryData ? { ...initialData.deliveryData } : { ...defaultDlv };
    if (!base.deliveryDate) base.deliveryDate = new Date().toISOString().split("T")[0];
    return base;
  });
  const [dlvLrList] = useState(initialData?.deliveryLrList || []);
  const [dlvReceiver]     = useState(initialData?.deliveryReceiverDetails || { mobileNo: "", vehicleNo: "", aadhaarNo: "" });
  const [showDlvReceiver] = useState(!!(initialData?.deliveryReceiverDetails?.mobileNo || initialData?.deliveryReceiverDetails?.vehicleNo));
  const dlvPartyRef = useRef(null);
  const [showDlvLabour, setShowDlvLabour] = useState(false);
  const dlvLabourRef = useRef(null);

  // Delivery modals
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [newParty, setNewParty] = useState({ name: "", city: "", gstNo: "" });
  const [labourers, setLabourers] = useState([
    { _id: "1", name: "Raju Hamali", accountGroup: "CASH ACCOUNT" },
    { _id: "2", name: "Sunil Labour", accountGroup: "CASH - ON - HAND" },
  ]);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [newLabour, setNewLabour] = useState({ name: "", accountGroup: "" });
  const [accounts, setAccounts] = useState([
    { _id: "1", name: "CASH - ON - HAND" },
    { _id: "2", name: "CASH ACCOUNT" },
  ]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const accountDropdownRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [lrNoError, setLrNoError] = useState("");
  const [isSaved, setIsSaved] = useState(mode === "edit");
  const savedFormRef = useRef(mode === "edit" ? { ...(initialData || {}) } : null);

  // Reset to "Save" when form changes after the last save
  useEffect(() => {
    if (!savedFormRef.current) return;
    if (JSON.stringify(form) !== JSON.stringify(savedFormRef.current)) {
      setIsSaved(false);
    }
  }, [form]);

  // Outward details state
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [vehicleSearch, setVehicleSearch] = useState(initialData?.vehicleNo || "");
  const [vehicleDebouncedSearch, setVehicleDebouncedSearch] = useState(initialData?.vehicleNo || "");
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleHighlight, setVehicleHighlight] = useState(-1);
  const vehicleDropRef = useRef(null);

  const [showDeliveryType, setShowDeliveryType] = useState(false);
  const [showDeliveryAt, setShowDeliveryAt] = useState(false);
  const [showGstType, setShowGstType] = useState(false);
  const deliveryTypeRef = useRef(null);
  const deliveryAtRef = useRef(null);
  const gstTypeRef = useRef(null);

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


  // ── Close dropdowns on outside click ─────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dlvPartyRef.current && !dlvPartyRef.current.contains(e.target)) setShowDlvParty(false);
      if (dlvLabourRef.current && !dlvLabourRef.current.contains(e.target)) setShowDlvLabour(false);
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) setShowAccountDropdown(false);
      if (vehicleDropRef.current && !vehicleDropRef.current.contains(e.target)) setVehicleOpen(false);
      if (deliveryTypeRef.current && !deliveryTypeRef.current.contains(e.target)) setShowDeliveryType(false);
      if (deliveryAtRef.current && !deliveryAtRef.current.contains(e.target)) setShowDeliveryAt(false);
      if (gstTypeRef.current && !gstTypeRef.current.contains(e.target)) setShowGstType(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Vehicle search debounce (200ms) ──────────────────────
  useEffect(() => {
    const t = setTimeout(() => setVehicleDebouncedSearch(vehicleSearch), 200);
    return () => clearTimeout(t);
  }, [vehicleSearch]);

  // ── Delivery: auto-sum article/weight/amount from goods table ──
  useEffect(() => {
    const goods  = Array.isArray(form.goods) ? form.goods : [];
    const sumArt = goods.reduce((s, g) => s + (Number(g.article) || 0), 0);
    const sumWt  = goods.reduce((s, g) => s + (Number(g.weight)  || 0), 0);
    const sumAmt = goods.reduce((s, g) => s + (Number(g.amount)  || 0), 0);
    setDlv(prev => ({ ...prev, article: sumArt || "", weight: sumWt || "", amount: sumAmt || "" }));
  }, [form.goods]);

  // ── Delivery: auto-calc subtotal / delivery freight ────
  useEffect(() => {
    const tf  = Number(dlv.amount)        || 0;
    const h   = Number(dlv.hamali)        || 0;
    const sc  = Number(dlv.serviceCharge) || 0;
    const d   = Number(dlv.discount)      || 0;
    const sub = tf + h + sc;
    const fin = sub - d;
    setDlv(prev => ({
      ...prev,
      totalFreight:     String(tf  || ""),
      deliverySubTotal: String(sub || ""),
      deliveryFreight:  String(fin || ""),
    }));
  }, [dlv.amount, dlv.hamali, dlv.serviceCharge, dlv.discount]);

  // ── Delivery: save new party ───────────────────────────
  const handleSaveNewParty = async () => {
    if (!newParty.name.trim()) return alert("Party Name is required");
    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create party");
      await fetchDlvClients();
      setDlv(prev => ({ ...prev, party: data._id, partyName: data.name, partyAddress: data.address || data.city || "" }));
      setShowAddPartyModal(false);
      setNewParty({ name: "", city: "", gstNo: "" });
    } catch (err) { alert(err.message); }
  };

  const handleDlvChange = (e) => {
    const { name, value } = e.target;
    const numFields = ["weight", "rate", "amount", "hamali", "serviceCharge", "discount", "demurrageRatePerDay", "demurrageFreeDays"];
    setDlv(prev => ({ ...prev, [name]: numFields.includes(name) ? value.replace(/[^0-9.]/g, "") : value }));
  };


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
        const err = await res.json().catch(() => ({}));
        setDriverFormError(err.error || "Failed to save driver.");
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
        setVehicleSearch(saved.number);
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
    if (lrNoError) return false;

    // Mandatory fields
    if (!form.consignor || !form.consignor.trim()) {
      setErrorMessage("Consignor is required.");
      return false;
    }
    if (!form.consignee || !form.consignee.trim()) {
      setErrorMessage("Consignee is required.");
      return false;
    }

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
      const payload = {
        ...form,
        deliveryData: dlv,
        deliveryLrList: dlvLrList,
        deliveryReceiverDetails: showDlvReceiver ? dlvReceiver : null,
      };
      const res = await fetch("/api/inward-outward", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const savedData = await res.json();
        savedFormRef.current = { ...savedData };
        setForm(savedData);
        setIsSaved(true);
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setLrNoError(err.error || "LR No. already exists.");
        }
        return false;
      }
    } catch (error) {
      console.error("Failed to save:", error);
      return false;
    }
  };

  const saveOnly = async () => {
    await saveForm();
  };

  const handleSaveAndPrint = async () => {
    const success = await saveForm();
    if (success) handlePrint();
  };

  const handlePrint = async () => {
    let transportData = null;
    try {
      const res = await fetch(`/api/transports/${transport}`);
      if (res.ok) transportData = await res.json();
    } catch {}
    const record = {
      ...form,
      deliveryData: dlv,
      deliveryLrList: dlvLrList,
      deliveryReceiverDetails: showDlvReceiver ? dlvReceiver : null,
    };
    generateInwardOutwardPdf(record, transportData, "print");
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
      if (e.key === "F3") {
        e.preventDefault();
        if (!errorMessage && !showDriverModal && !showVehicleModal)
          isViewMode ? handlePrint() : await handleSaveAndPrint();
        return;
      }
      if (isViewMode || errorMessage || showDriverModal || showVehicleModal || isSaved) return;
      if (e.key === "F4") { e.preventDefault(); await saveOnly(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode, errorMessage, showDriverModal, showVehicleModal]);

  return (
    <>
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
          <InwardOutwardBasicDetails form={form} setForm={setForm} existingLrNos={existingLrNos} lrNoError={lrNoError} setLrNoError={setLrNoError} />
            <LrConsignorConsignee form={form} setForm={setForm} />
            <LrGoodsTable form={form} setForm={setForm} />

            {/* ── DELIVERY DETAILS SECTION ── */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#2a64f6] rounded-full inline-block" />
                Delivery Details
              </h3>


              {/* Demurrage */}
              {!isViewMode && form.type === "Inward" && (
                <div className="flex gap-4 items-end flex-wrap border-t border-gray-200 pt-4">
                  <div className="flex flex-col w-36">
                    <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Demurrage Rate/Day (₹)</label>
                    <input type="text" name="demurrageRatePerDay" value={dlv.demurrageRatePerDay || ""} onChange={handleDlvChange}
                      placeholder="e.g. 50"
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div className="flex flex-col w-36">
                    <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Free Days</label>
                    <input type="text" name="demurrageFreeDays" value={dlv.demurrageFreeDays ?? 7} onChange={handleDlvChange}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <span className="text-xs text-gray-400 pb-2">Auto-filled from transport defaults · editable per delivery</span>
                </div>
              )}
              {form.type === "Inward" && (() => {
                const d = calcDemurrage({ date: form.date, demurrageRatePerDay: Number(dlv.demurrageRatePerDay), demurrageFreeDays: Number(dlv.demurrageFreeDays) });
                if (!d) return null;
                const freeDays = Number(dlv.demurrageFreeDays) || 7;
                const pct = d.isOverdue ? 100 : Math.min(100, Math.round((d.daysTotal / freeDays) * 100));
                const cfg = d.isOverdue
                  ? { bg: "bg-red-50", border: "border-red-200", barBg: "bg-red-100", bar: "bg-red-500", icon: <AlertCircle size={14} className="text-red-500 shrink-0" />, title: "Demurrage Charging", titleC: "text-red-700", meta: `${d.chargeDays} day${d.chargeDays !== 1 ? "s" : ""} overdue`, metaC: "text-red-500", sub: `${freeDays} of ${freeDays} free days used` }
                  : d.isWarning
                  ? { bg: "bg-amber-50", border: "border-amber-200", barBg: "bg-amber-100", bar: "bg-amber-400", icon: <AlertTriangle size={14} className="text-amber-500 shrink-0" />, title: "Free Period Ending Soon", titleC: "text-amber-700", meta: `${d.daysUntilCharge} day${d.daysUntilCharge !== 1 ? "s" : ""} left`, metaC: "text-amber-600", sub: `${d.daysTotal} of ${freeDays} free days used` }
                  : { bg: "bg-green-50", border: "border-green-200", barBg: "bg-green-100", bar: "bg-green-500", icon: <CheckCircle2 size={14} className="text-green-500 shrink-0" />, title: "Free Period Active", titleC: "text-green-700", meta: `${freeDays - d.daysTotal} day${(freeDays - d.daysTotal) !== 1 ? "s" : ""} remaining`, metaC: "text-green-600", sub: `${d.daysTotal} of ${freeDays} free days used` };
                return (
                  <div className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 space-y-2.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cfg.icon}
                        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.titleC}`}>{cfg.title}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {d.isOverdue && (
                          <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                            ₹{d.totalCharge.toLocaleString()} due
                          </span>
                        )}
                        <span className={`text-xs font-semibold ${cfg.metaC}`}>{cfg.meta}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className={`w-full h-1.5 rounded-full ${cfg.barBg} overflow-hidden`}>
                        <div className={`h-full rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={`flex justify-between text-[10px] font-medium ${cfg.metaC}`}>
                        <span>{cfg.sub}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3-column financial section */}
              <div className="grid grid-cols-3 gap-5 border-t border-gray-200 pt-4">

                {/* Col 1: Delivery Type + Account */}
                <div className="space-y-3">
                  <div className="relative" ref={deliveryTypeRef}>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery Type</label>
                    <div
                      className={`border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex justify-between items-center bg-white transition ${isViewMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}
                      onClick={() => !isViewMode && setShowDeliveryType(v => !v)}
                    >
                      <span className={dlv.deliveryType ? "text-gray-800" : "text-gray-400"}>{dlv.deliveryType || "Select..."}</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {showDeliveryType && (
                      <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                        {["Cash", "Bank", "Online", "Debit", "T.B.B."].map(opt => (
                          <div key={opt}
                            className={`px-3 py-1.5 text-sm cursor-pointer transition ${dlv.deliveryType === opt ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-800"}`}
                            onClick={() => { setDlv(prev => ({ ...prev, deliveryType: opt })); setShowDeliveryType(false); }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Account dropdown with Add */}
                  <div className="relative" ref={accountDropdownRef}>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Account</label>
                    <div
                      className={`border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex justify-between items-center bg-white ${isViewMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => !isViewMode && setShowAccountDropdown(v => !v)}
                    >
                      <span className={dlv.account ? "text-gray-800" : "text-gray-400"}>{dlv.account || "Select Account..."}</span>
                      <span className="text-gray-400 text-xs">▼</span>
                    </div>
                    {showAccountDropdown && (
                      <div className="absolute top-full left-0 w-72 bg-white border-2 border-blue-400 shadow-2xl z-[80] mt-1 rounded-lg overflow-hidden flex flex-col">
                        <div className="max-h-[180px] overflow-y-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-2 py-1.5 border-r border-gray-200 font-semibold">Account Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {accounts.map(acc => (
                                <tr key={acc._id}
                                  onClick={() => { setDlv(prev => ({ ...prev, account: acc.name })); setShowAccountDropdown(false); }}
                                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
                                  <td className="px-2 py-1.5 font-medium text-gray-800">{acc.name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
                          <button type="button" onClick={() => { setShowAccountDropdown(false); setAccounts(prev => [...prev, { _id: Date.now().toString(), name: prompt("Account Name:") || "" }].filter(a => a.name)); }} className="bg-[#1e73be] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-700">+ Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 2: Labour + Delivery At + Note */}
                <div className="space-y-3">
                  <div ref={dlvLabourRef} className="relative">
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Labour</label>
                    <div
                      className={`border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex justify-between items-center bg-white ${isViewMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => !isViewMode && setShowDlvLabour(v => !v)}
                    >
                      <span className={dlv.labour ? "text-gray-800" : "text-gray-400"}>{dlv.labour || "Select Labour..."}</span>
                      <span className="text-gray-400 text-xs">▼</span>
                    </div>
                    {showDlvLabour && (
                      <div className="absolute top-full left-0 w-72 bg-white border-2 border-blue-400 shadow-2xl z-[80] mt-1 rounded-lg overflow-hidden flex flex-col">
                        <div className="max-h-[180px] overflow-y-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-2 py-1.5 border-r border-gray-200 font-semibold w-1/2">Labour Name</th>
                                <th className="px-2 py-1.5 font-semibold">Account Group</th>
                              </tr>
                            </thead>
                            <tbody>
                              {labourers.map(lab => (
                                <tr key={lab._id}
                                  onClick={() => { setDlv(prev => ({ ...prev, labour: lab.name })); setShowDlvLabour(false); }}
                                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
                                  <td className="px-2 py-1.5 border-r border-gray-100 font-medium text-gray-800">{lab.name}</td>
                                  <td className="px-2 py-1.5 text-gray-500">{lab.accountGroup || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
                          <button type="button" onClick={() => { setShowDlvLabour(false); setShowLabourModal(true); }} className="bg-[#1e73be] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={deliveryAtRef}>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery At</label>
                    <div
                      className={`border border-blue-300 rounded-lg px-3 py-1.5 text-sm flex justify-between items-center bg-white transition ${isViewMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:border-blue-500"}`}
                      onClick={() => !isViewMode && setShowDeliveryAt(v => !v)}
                    >
                      <span className={dlv.deliveryAt ? "text-gray-800" : "text-gray-400"}>{dlv.deliveryAt || "Select..."}</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {showDeliveryAt && (
                      <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                        {["", "Door", "Godown"].map((opt, i) => (
                          <div key={i}
                            className={`px-3 py-1.5 text-sm cursor-pointer transition ${dlv.deliveryAt === opt ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-800"}`}
                            onClick={() => { setDlv(prev => ({ ...prev, deliveryAt: opt })); setShowDeliveryAt(false); }}>
                            {opt || <span className="text-gray-400">—</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Note</label>
                    <textarea rows={2} name="note" value={dlv.note} onChange={handleDlvChange} disabled={isViewMode}
                      className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white resize-none" />
                  </div>
                </div>

                {/* Col 3: Financial totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Freight :</span>
                    <input readOnly value={dlv.totalFreight} className="border border-blue-200 rounded-lg px-2 py-1 w-28 text-right bg-gray-50 font-bold text-gray-500 outline-none" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Hamali :</span>
                    <input type="text" name="hamali" value={dlv.hamali} onChange={handleDlvChange} disabled={isViewMode}
                      className="border border-blue-300 rounded-lg px-2 py-1 w-28 text-right outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Service Charge :</span>
                    <input type="text" name="serviceCharge" value={dlv.serviceCharge} onChange={handleDlvChange} disabled={isViewMode}
                      className="border border-blue-300 rounded-lg px-2 py-1 w-28 text-right outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Delivery SubTotal :</span>
                    <input readOnly value={dlv.deliverySubTotal} className="border border-blue-200 rounded-lg px-2 py-1 w-28 text-right bg-blue-50 font-bold text-gray-500 outline-none" />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 font-medium shrink-0">GST Type :</span>
                    <div className="relative flex-1" ref={gstTypeRef}>
                      <div
                        className={`border border-gray-300 rounded-lg px-2 py-1 text-sm flex justify-between items-center bg-white transition ${isViewMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}
                        onClick={() => !isViewMode && setShowGstType(v => !v)}
                      >
                        <span className={dlv.gstType ? "text-gray-800" : "text-gray-400 text-xs"}>{dlv.gstType || "Select..."}</span>
                        <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      {showGstType && (
                        <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                          {["", "CGST+SGST", "IGST"].map((opt, i) => (
                            <div key={i}
                              className={`px-2 py-1.5 text-sm cursor-pointer transition ${dlv.gstType === opt ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-800"}`}
                              onClick={() => { setDlv(prev => ({ ...prev, gstType: opt })); setShowGstType(false); }}>
                              {opt || <span className="text-gray-400 text-xs">—</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 font-medium shrink-0">GST Amt :</span>
                    <input readOnly name="gstAmt" value={dlv.gstAmt}
                      className="border border-gray-200 rounded-lg px-2 py-1 w-16 text-right bg-gray-50 text-gray-500 outline-none" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Discount (Kasar) :</span>
                    <input type="text" name="discount" value={dlv.discount} onChange={handleDlvChange} disabled={isViewMode}
                      className="border border-blue-300 rounded-lg px-2 py-1 w-28 text-right outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Delivery Footer Totals */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-3 text-sm font-bold text-gray-700">
                <div className="flex gap-8">
                  <span>Total Items : <span className="text-blue-600">{(form.goods || []).filter(g => Number(g.article) > 0).length}</span></span>
                  <span>Total Article : <span className="text-blue-600">{dlv.article || 0}</span></span>
                  <span>Total Weight : <span className="text-blue-600">{dlv.weight || 0}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>DeliveryFreight :</span>
                  <input readOnly value={dlv.deliveryFreight}
                    className="border border-blue-400 rounded-lg px-3 py-1 w-32 text-right bg-white font-bold text-blue-700 outline-none" />
                </div>
              </div>
            </div>

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
                    <ComboBox
                      label="Driver Name"
                      labelClassName="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide"
                      triggerClassName="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition-colors"
                      value={form.driverName || ""}
                      options={drivers}
                      displayKey="name"
                      onChange={(val) => setForm(prev => ({ ...prev, driverName: val }))}
                      onAdd={() => setShowDriverModal(true)}
                      onRefresh={fetchOutwardData}
                      dropUp
                    />
                  </div>

                  {/* Vehicle No */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Vehicle No</label>
                    <div className="relative" ref={vehicleDropRef}>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white transition uppercase"
                        placeholder="Search vehicle..."
                        value={vehicleSearch}
                        onChange={(e) => { setVehicleSearch(e.target.value.toUpperCase()); setVehicleOpen(true); setVehicleHighlight(-1); }}
                        onFocus={() => setVehicleOpen(true)}
                        disabled={isViewMode}
                        onKeyDown={(e) => {
                          const filtered = vehicles.filter(v => v.number.toLowerCase().includes(vehicleDebouncedSearch.toLowerCase()));
                          if (e.key === "ArrowDown") { e.preventDefault(); setVehicleHighlight(h => Math.min(h + 1, filtered.length - 1)); setVehicleOpen(true); }
                          else if (e.key === "ArrowUp") { e.preventDefault(); setVehicleHighlight(h => Math.max(h - 1, 0)); }
                          else if (e.key === "Enter") { if (vehicleHighlight >= 0 && filtered[vehicleHighlight]) { const v = filtered[vehicleHighlight]; setForm(prev => ({ ...prev, vehicleNo: v.number })); setVehicleSearch(v.number); setVehicleOpen(false); setVehicleHighlight(-1); } }
                          else if (e.key === "Escape") { setVehicleOpen(false); setVehicleHighlight(-1); }
                          else if (e.key === "Tab") { if (vehicleHighlight >= 0 && filtered[vehicleHighlight]) { const v = filtered[vehicleHighlight]; setForm(prev => ({ ...prev, vehicleNo: v.number })); setVehicleSearch(v.number); setVehicleHighlight(-1); } setVehicleOpen(false); }
                        }}
                      />
                      {vehicleOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
                          <div className="bg-[#ebf0f7] p-1.5 border-b border-gray-200 flex gap-1.5 rounded-t-lg">
                            <button type="button"
                              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 shadow-sm"
                              onClick={(e) => { e.stopPropagation(); setVehicleOpen(false); setShowVehicleModal(true); }}>
                              <span className="text-sm leading-none">+</span> Add
                            </button>
                            <button type="button"
                              className="bg-[#1e5ee6] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 shadow-sm"
                              onClick={(e) => { e.stopPropagation(); fetchOutwardData(); }}>
                              ↻ Refresh
                            </button>
                          </div>
                          <ul className="max-h-44 overflow-y-auto flex-1 p-1">
                            {vehicles.filter(v => v.number.toLowerCase().includes(vehicleDebouncedSearch.toLowerCase())).length > 0
                              ? vehicles.filter(v => v.number.toLowerCase().includes(vehicleDebouncedSearch.toLowerCase())).map((v, idx) => (
                                  <li key={v._id}
                                    className={`px-3 py-1.5 text-sm cursor-pointer rounded uppercase tracking-wide ${idx === vehicleHighlight ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50 font-medium text-gray-800"}`}
                                    onMouseEnter={() => setVehicleHighlight(idx)}
                                    onClick={() => { setForm(prev => ({ ...prev, vehicleNo: v.number })); setVehicleSearch(v.number); setVehicleOpen(false); setVehicleHighlight(-1); }}>
                                    {v.number}
                                  </li>
                                ))
                              : <li className="px-3 py-3 text-sm text-gray-400 text-center">No vehicles found</li>
                            }
                          </ul>
                        </div>
                      )}
                    </div>
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
          <div className="flex gap-2 ml-auto">
            {!isViewMode && (
              <>
                <button
                  onClick={handleSaveAndPrint}
                  className="bg-[#2a64f6] text-white px-6 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  Save & Print (F3)
                </button>
                <button onClick={saveOnly} disabled={isSaved} className="bg-[#2a64f6] text-white px-6 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                  {isSaved ? "Saved" : "Save (F4)"}
                </button>
              </>
            )}
            <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-5 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-all active:scale-95">
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

    {/* ── ADD PARTY MODAL ── */}
    {showAddPartyModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl w-[400px] border border-gray-300 overflow-hidden">
          <div className="bg-[#1e73be] text-white px-4 py-2.5 flex justify-between items-center">
            <span className="font-bold text-sm">+ Add Party</span>
            <button onClick={() => setShowAddPartyModal(false)} className="hover:text-red-300 font-bold">✕</button>
          </div>
          <div className="p-4 flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">Party Name <span className="text-red-500">*</span></label>
              <input autoFocus type="text" value={newParty.name}
                onChange={e => setNewParty(p => ({ ...p, name: e.target.value }))}
                className="border border-blue-300 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter party name..." />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">City</label>
              <input type="text" value={newParty.city}
                onChange={e => setNewParty(p => ({ ...p, city: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-400"
                placeholder="Enter city..." />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">GST No.</label>
              <input type="text" value={newParty.gstNo}
                onChange={e => setNewParty(p => ({ ...p, gstNo: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-400"
                placeholder="Enter GST number..." />
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
            <button onClick={() => { setShowAddPartyModal(false); setNewParty({ name: "", city: "", gstNo: "" }); }}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">Cancel</button>
            <button onClick={handleSaveNewParty}
              className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 text-sm font-medium shadow-sm">Save</button>
          </div>
        </div>
      </div>
    )}

    {/* ── ADD LABOUR MODAL ── */}
    {showLabourModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl w-[380px] border border-gray-300 overflow-hidden">
          <div className="bg-[#1e73be] text-white px-4 py-2.5 flex justify-between items-center">
            <span className="font-bold text-sm">+ Add Labour</span>
            <button onClick={() => setShowLabourModal(false)} className="hover:text-red-300 font-bold">✕</button>
          </div>
          <div className="p-4 flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">Labour Name <span className="text-red-500">*</span></label>
              <input autoFocus type="text" value={newLabour.name}
                onChange={e => setNewLabour(p => ({ ...p, name: e.target.value }))}
                className="border border-blue-300 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter labour name..." />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold">Account Group</label>
              <select value={newLabour.accountGroup}
                onChange={e => setNewLabour(p => ({ ...p, accountGroup: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-400 bg-white">
                <option value="">Select...</option>
                {accounts.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
            <button onClick={() => { setShowLabourModal(false); setNewLabour({ name: "", accountGroup: "" }); }}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">Cancel</button>
            <button onClick={() => {
              if (!newLabour.name.trim()) return alert("Labour name is required");
              setLabourers(prev => [...prev, { _id: Date.now().toString(), name: newLabour.name, accountGroup: newLabour.accountGroup }]);
              setDlv(prev => ({ ...prev, labour: newLabour.name }));
              setShowLabourModal(false);
              setNewLabour({ name: "", accountGroup: "" });
            }} className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 text-sm font-medium shadow-sm">Save</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
