"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import InwardOutwardBasicDetails from "./InwardOutwardBasicDetails";
import LrConsignorConsignee from "@/components/lr-entry/LrConsignorConsignee";
import LrGoodsTable from "@/components/lr-entry/LrGoodsTable";
import { calcDemurrage } from "@/utils/calcDemurrage";
import LrPickerModal from "@/components/delivery/LrPickerModal";
import { generateInwardOutwardPdf } from "@/lib/generateInwardOutwardPdf";

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

export default function InwardOutwardEntryPanel({ onClose, initialData, mode, transport, totalStock }) {
  const { slug } = useParams();
  const [form, setForm] = useState(initialData || { type: "Inward" });

  // ── Delivery section state ──────────────────────────────
  const [dlv, setDlv] = useState(() => {
    const base = initialData?.deliveryData ? { ...initialData.deliveryData } : { ...defaultDlv };
    if (!base.deliveryDate) base.deliveryDate = new Date().toISOString().split("T")[0];
    return base;
  });
  const [dlvLrList, setDlvLrList] = useState(initialData?.deliveryLrList || []);
  const [dlvReceiver, setDlvReceiver] = useState(
    initialData?.deliveryReceiverDetails || { mobileNo: "", vehicleNo: "", aadhaarNo: "" }
  );
  const [showDlvReceiver, setShowDlvReceiver] = useState(
    !!(initialData?.deliveryReceiverDetails?.mobileNo || initialData?.deliveryReceiverDetails?.vehicleNo)
  );
  const [dlvClients, setDlvClients] = useState([]);
  const [showDlvParty, setShowDlvParty] = useState(false);
  const dlvPartyRef = useRef(null);
  const [showDlvLabour, setShowDlvLabour] = useState(false);
  const dlvLabourRef = useRef(null);

  // Delivery modals
  const [showLrPicker, setShowLrPicker] = useState(false);
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

  // ── Delivery: fetch clients ────────────────────────────
  const fetchDlvClients = async () => {
    try {
      const res = await fetch("/api/client");
      if (res.ok) setDlvClients(await res.json());
    } catch {}
  };
  useEffect(() => { fetchDlvClients(); }, []);

  // ── Delivery: close dropdowns on outside click ─────────
  useEffect(() => {
    const handler = (e) => {
      if (dlvPartyRef.current && !dlvPartyRef.current.contains(e.target)) setShowDlvParty(false);
      if (dlvLabourRef.current && !dlvLabourRef.current.contains(e.target)) setShowDlvLabour(false);
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) setShowAccountDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Delivery: auto-sum article/weight/amount from LR list ──
  useEffect(() => {
    const sumArt = dlvLrList.reduce((s, lr) => s + Number(lr.article || 0), 0);
    const sumWt  = dlvLrList.reduce((s, lr) => s + Number(lr.weight  || 0), 0);
    const sumAmt = dlvLrList.reduce((s, lr) => s + Number(lr.amount  || 0), 0);
    setDlv(prev => ({ ...prev, article: sumArt || "", weight: sumWt || "", amount: sumAmt || "" }));
  }, [dlvLrList]);

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

  const handleGetLr = async () => {
    const lrInput = dlv.lrNoInput.trim();
    if (!lrInput) return;
    if (dlvLrList.some(lr => String(lr.lrNo).toLowerCase() === lrInput.toLowerCase())) {
      return alert(`LR No ${lrInput} is already added.`);
    }
    try {
      const res = await fetch(`/api/lr?transport=${slug}&all=true`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const found = data.find(lr => String(lr.lrNo).trim().toLowerCase() === lrInput.toLowerCase());
      if (!found) return alert(`LR No "${lrInput}" not found!`);
      const totalArt  = (found.goods || []).reduce((s, g) => s + (Number(g.article) || 0), 0);
      const totalWt   = (found.goods || []).reduce((s, g) => s + (Number(g.weight)  || 0), 0);
      const packNames = (found.goods || []).map(g => g.packaging).filter(Boolean).join(", ") || "-";
      const desc      = (found.goods || []).map(g => g.goodsContain).filter(Boolean).join(", ") || "-";
      const freightAmt = Number(found.subTotal) || Number(found.freight) || 0;
      setDlvLrList(prev => [...prev, {
        id: found._id, lrNo: found.lrNo, lrDate: found.lrDate || "-",
        from: found.fromCity || "-", to: found.toCity || "-",
        consignor: found.consignor || "-", consignorGst: "-",
        consignee: found.consignee || "-", consigneeGst: "-",
        pack: packNames, description: desc, freightBy: found.freightBy || "-",
        article: totalArt, weight: totalWt, amount: freightAmt,
      }]);
      setDlv(prev => ({ ...prev, lrNoInput: "" }));
    } catch {
      alert("Error fetching LR. Please try again.");
    }
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
      if (isViewMode || errorMessage || showDriverModal || showVehicleModal) return;
      if (e.key === "F4") { e.preventDefault(); await saveAndClose(); }
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
          <InwardOutwardBasicDetails form={form} setForm={setForm} />
            <LrConsignorConsignee form={form} setForm={setForm} />
            <LrGoodsTable form={form} setForm={setForm} />

            {/* ── DELIVERY DETAILS SECTION ── */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#2a64f6] rounded-full inline-block" />
                Delivery Details
              </h3>

              {/* Row 1: LR Search + Delivery Date + Delivery No */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex flex-col w-40">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">LR No.</label>
                  <input
                    type="text" name="lrNoInput" value={dlv.lrNoInput}
                    onChange={handleDlvChange}
                    onKeyDown={e => e.key === "Enter" && handleGetLr()}
                    disabled={isViewMode}
                    placeholder="Enter LR no..."
                    className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <button
                  type="button" onClick={handleGetLr} disabled={isViewMode}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#2a64f6] hover:bg-blue-700 disabled:opacity-50"
                >Go</button>
                <button
                  type="button" onClick={() => !isViewMode && setShowLrPicker(true)} disabled={isViewMode}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#1e73be] hover:bg-blue-700 disabled:opacity-50"
                >Get LR</button>

                <div className="flex flex-col w-40 ml-4">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery Date</label>
                  <input
                    type="date" name="deliveryDate" value={dlv.deliveryDate}
                    onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col w-32">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery No</label>
                  <input
                    type="text" name="deliveryNo" value={dlv.deliveryNo}
                    onChange={handleDlvChange} disabled={isViewMode}
                    placeholder="Auto"
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none text-right bg-gray-50"
                  />
                </div>
              </div>

              {/* Row 2: Party + Party Name + Party Address */}
              <div className="grid grid-cols-3 gap-3">
                <div className="relative" ref={dlvPartyRef}>
                  <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Party</label>
                  <div
                    className={`border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex justify-between items-center cursor-pointer bg-white ${isViewMode ? "cursor-not-allowed opacity-70" : ""}`}
                    onClick={() => !isViewMode && setShowDlvParty(v => !v)}
                  >
                    <span className={dlv.partyName ? "text-gray-800" : "text-gray-400"}>{dlv.partyName || "Select Party..."}</span>
                    <span className="text-gray-400 text-xs">▼</span>
                  </div>
                  {showDlvParty && (
                    <div className="absolute top-full left-0 w-[480px] bg-white border-2 border-blue-400 shadow-2xl z-[80] mt-1 rounded-lg overflow-hidden flex flex-col">
                      <div className="max-h-[220px] overflow-y-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 border-r border-gray-200 font-semibold w-1/2">Party Name</th>
                              <th className="px-3 py-2 border-r border-gray-200 font-semibold">City</th>
                              <th className="px-3 py-2 font-semibold">GST No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dlvClients.length === 0 ? (
                              <tr><td colSpan={3} className="px-3 py-4 text-center text-gray-500">No parties found.</td></tr>
                            ) : dlvClients.map(c => (
                              <tr key={c._id}
                                onClick={() => { setDlv(prev => ({ ...prev, party: c._id, partyName: c.name, partyAddress: c.address || c.city || "" })); setShowDlvParty(false); }}

                                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                              >
                                <td className="px-3 py-1.5 border-r border-gray-100 font-medium text-gray-800">{c.name}</td>
                                <td className="px-3 py-1.5 border-r border-gray-100 text-gray-500">{c.city || "-"}</td>
                                <td className="px-3 py-1.5 text-gray-500">{c.gstNo || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
                        <button type="button" onClick={() => { setShowDlvParty(false); setShowAddPartyModal(true); }} className="bg-[#1e73be] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
                        <button type="button" onClick={() => { fetchDlvClients(); setShowDlvParty(false); }} className="bg-[#1e73be] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-700">↻ Refresh</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Party Name</label>
                  <input readOnly value={dlv.partyName} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-700 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Party Address</label>
                  <input readOnly value={dlv.partyAddress} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-700 outline-none" />
                </div>
              </div>

              {/* LR List Table */}
              <div className="overflow-auto rounded-lg border border-gray-200 max-h-[200px]">
                <table className="min-w-[1000px] w-full text-xs whitespace-nowrap">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {["Lr No.", "LrDate", "From", "To", "Consignor", "Consignor GST", "Consignee", "Consignee GST", "Pack", "Description", "FreightBy"].map(h => (
                        <th key={h} className="px-2 py-2 border-r border-gray-200 font-semibold text-gray-600 text-left">{h}</th>
                      ))}
                      {!isViewMode && <th className="px-2 py-2 font-semibold text-gray-600 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {dlvLrList.length === 0 ? (
                      <tr><td colSpan={isViewMode ? 11 : 12} className="px-3 py-6 text-center text-gray-400">No LRs added. Enter LR No. above and click Go.</td></tr>
                    ) : dlvLrList.map(lr => (
                      <tr key={lr.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                        <td className="px-2 py-1.5 border-r border-gray-100 font-bold text-blue-600">{lr.lrNo}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.lrDate}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.from}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.to}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.consignor}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100 text-gray-400">{lr.consignorGst}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.consignee}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100 text-gray-400">{lr.consigneeGst}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.pack}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100 max-w-[140px] truncate">{lr.description}</td>
                        <td className="px-2 py-1.5 border-r border-gray-100">{lr.freightBy}</td>
                        {!isViewMode && (
                          <td className="px-2 py-1.5 text-center">
                            <button onClick={() => setDlvLrList(prev => prev.filter(x => x.id !== lr.id))} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Receiver Details (collapsible) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDlvReceiver(v => !v)}
                  disabled={isViewMode}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 w-full text-left transition-colors"
                >
                  <svg className={`h-3 w-3 transition-transform ${showDlvReceiver ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {showDlvReceiver ? "Hide Receiver Details" : "+ Add Receiver Details (Mobile / Vehicle / Aadhaar)"}
                </button>
                {showDlvReceiver && (
                  <div className="px-4 pb-3 pt-1 grid grid-cols-3 gap-4 bg-blue-50/30 border-t border-gray-200">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Receiver Mobile No.</label>
                      <input type="tel" maxLength={10} value={dlvReceiver.mobileNo} disabled={isViewMode}
                        onChange={e => setDlvReceiver(prev => ({ ...prev, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                        placeholder="10-digit mobile"
                        className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Vehicle No.</label>
                      <input type="text" value={dlvReceiver.vehicleNo} disabled={isViewMode}
                        onChange={e => setDlvReceiver(prev => ({ ...prev, vehicleNo: e.target.value.toUpperCase() }))}
                        placeholder="e.g. GJ01AB1234"
                        className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white uppercase" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Aadhaar Card No.</label>
                      <input type="text" maxLength={14} value={dlvReceiver.aadhaarNo} disabled={isViewMode}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                          const fmt = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                          setDlvReceiver(prev => ({ ...prev, aadhaarNo: fmt }));
                        }}
                        placeholder="XXXX XXXX XXXX"
                        className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white font-mono tracking-widest" />
                    </div>
                  </div>
                )}
              </div>

              {/* Demurrage */}
              {!isViewMode && (
                <div className="flex gap-4 items-end border-t border-orange-100 pt-3">
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1 shrink-0">⏱ Demurrage</span>
                  <div className="flex flex-col w-28">
                    <label className="text-[10px] text-gray-500 mb-0.5">Rate/Day (₹)</label>
                    <input type="text" name="demurrageRatePerDay" value={dlv.demurrageRatePerDay || ""} onChange={handleDlvChange}
                      placeholder="e.g. 50"
                      className="border border-orange-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-500 bg-orange-50" />
                  </div>
                  <div className="flex flex-col w-24">
                    <label className="text-[10px] text-gray-500 mb-0.5">Free Days</label>
                    <input type="text" name="demurrageFreeDays" value={dlv.demurrageFreeDays ?? 7} onChange={handleDlvChange}
                      className="border border-orange-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-500 bg-orange-50" />
                  </div>
                  <span className="text-xs text-gray-400 mb-1">Auto-filled from transport defaults • editable per delivery</span>
                </div>
              )}
              {(() => {
                const d = calcDemurrage({ date: dlv.deliveryDate, demurrageRatePerDay: Number(dlv.demurrageRatePerDay), demurrageFreeDays: Number(dlv.demurrageFreeDays) });
                if (!d) return null;
                return (
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border ${d.isOverdue ? "bg-red-50 border-red-300 text-red-700" : d.isWarning ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "bg-green-50 border-green-300 text-green-700"}`}>
                    <span>{d.isOverdue ? `Charging started! ${d.chargeDays} overdue day(s)` : d.isWarning ? `${d.daysUntilCharge} day(s) left in free period` : `${d.daysTotal} of ${dlv.demurrageFreeDays} free days used`}</span>
                    {d.isOverdue && <span className="font-bold text-red-800">₹{d.totalCharge.toLocaleString()} due</span>}
                  </div>
                );
              })()}

              {/* Article / Weight / Rate / FreightOn / Amount row */}
              <div className="flex gap-4 items-end flex-wrap border-t border-gray-200 pt-4">
                <div className="flex flex-col w-24">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Article</label>
                  <input type="text" name="article" value={dlv.article} onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm outline-none bg-blue-50 focus:border-blue-500" />
                </div>
                <div className="flex flex-col w-24">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Weight</label>
                  <input type="text" name="weight" value={dlv.weight} onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm outline-none bg-blue-50 focus:border-blue-500" />
                </div>
                <div className="flex flex-col w-24">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Rate</label>
                  <input type="text" name="rate" value={dlv.rate} onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="flex flex-col w-36">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">FreightOn</label>
                  <select name="freightOn" value={dlv.freightOn} onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                    <option value=""></option>
                    <option>Weight</option><option>Article</option><option>Quantity</option><option>Fix</option><option>KM</option>
                  </select>
                </div>
                <div className="flex flex-col w-32">
                  <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Amount</label>
                  <input type="text" name="amount" value={dlv.amount} onChange={handleDlvChange} disabled={isViewMode}
                    className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500 font-bold bg-white" />
                </div>
                <span className="text-xs text-gray-500 mb-2 font-medium">Pre. Rate :</span>
              </div>

              {/* 3-column financial section */}
              <div className="grid grid-cols-3 gap-5 border-t border-gray-200 pt-4">

                {/* Col 1: Delivery Type + Account */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery Type</label>
                    <select name="deliveryType" value={dlv.deliveryType} onChange={handleDlvChange} disabled={isViewMode}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                      <option>Cash</option><option>Bank</option><option>Online</option><option>Debit</option><option>T.B.B.</option>
                    </select>
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
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Delivery At</label>
                    <select name="deliveryAt" value={dlv.deliveryAt} onChange={handleDlvChange} disabled={isViewMode}
                      className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                      <option value=""></option>
                      <option value="Door">Door</option>
                      <option value="Delivery">Delivery</option>
                    </select>
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
                    <select name="gstType" value={dlv.gstType} onChange={handleDlvChange} disabled={isViewMode}
                      className="border border-gray-300 rounded-lg px-2 py-1 flex-1 outline-none focus:border-blue-500 bg-white text-sm">
                      <option value=""></option><option>CGST+SGST</option><option>IGST</option>
                    </select>
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
                  <span>Total Items : <span className="text-blue-600">{dlvLrList.length}</span></span>
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
          <button onClick={handlePrint} className="bg-white border border-gray-300 text-gray-700 px-6 py-1.5 rounded hover:bg-gray-50 text-sm font-medium shadow-sm flex items-center gap-2">
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

    {/* ── LR PICKER MODAL ── */}
    {showLrPicker && (
      <LrPickerModal
        isOpen={showLrPicker}
        onClose={() => setShowLrPicker(false)}
        alreadyAddedIds={dlvLrList.map(lr => lr.id)}
        onSelect={(selectedRows) => {
          const newRows = selectedRows.filter(row => !dlvLrList.some(ex => ex.id === row.id));
          setDlvLrList(prev => [...prev, ...newRows]);
        }}
      />
    )}

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
