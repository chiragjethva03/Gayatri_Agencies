"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { calcDemurrage } from "@/utils/calcDemurrage"
import LrPickerModal from "./LrPickerModal";


const blueScrollbar = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-[#1e73be] hover:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded-full";

const defaultFormData = {
  lrNoInput: "", deliveryDate: "", deliveryNo: "", party: "", partyName: "", partyAddress: "",
  article: "", weight: "", rate: "", freightOn: "", amount: "", deliveryType: "Cash",
  account: "CASH ACCOUNT", labour: "", deliveryAt: "", note: "", totalFreight: "",
  hamali: "", serviceCharge: "", deliverySubTotal: "", gstType: "", gstAmt: "", discount: "", deliveryFreight: "",
  demurrageRatePerDay: "", demurrageFreeDays: 7,
  demurrageStatus: "none", demurragePaidAmt: "", demurrageNote: "",
};

export default function DeliveryForm({ isOpen, onClose, onSaveSuccess, initialData, isViewMode = false }) {
  const { slug } = useParams();

  const [formData, setFormData] = useState(defaultFormData);
  const [receiverDetails, setReceiverDetails] = useState({
    mobileNo: "", vehicleNo: "", aadhaarNo: ""
  });
  const [showReceiverSection, setShowReceiverSection] = useState(false);
  const [lrList, setLrList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showLrPicker, setShowLrPicker] = useState(false);
  const [clients, setClients] = useState([]);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const partyDropdownRef = useRef(null);
  const [newParty, setNewParty] = useState({ name: "", city: "", gstNo: "" });
  const [searchLrNo, setSearchLrNo] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [debouncedLrNo, setDebouncedLrNo] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accounts, setAccounts] = useState([
    { _id: "1", name: "CASH - ON - HAND", city: "-", gstNo: "-" },
    { _id: "2", name: "CASH ACCOUNT", city: "-", gstNo: "-" }
  ]);

  const [labourers, setLabourers] = useState([
    { _id: "1", name: "Raju Hamali", accountGroup: "CASH ACCOUNT" },
    { _id: "2", name: "Sunil Labour", accountGroup: "CASH - ON - HAND" }
  ]);
  const [showLabourDropdown, setShowLabourDropdown] = useState(false);
  const [showAddLabourModal, setShowAddLabourModal] = useState(false);
  const labourDropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLrNo(searchLrNo);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchLrNo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(searchCity);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCity]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/client");
      if (res.ok) setClients(await res.json());
    } catch (error) { console.error("Failed to fetch clients"); }
  };

  const fetchLocationsAndDefaults = async (isNewDelivery = false) => {
    if (!slug) return;
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const data = await res.json();
        const currentTransport = data.find(
          t => t.name.toLowerCase().replace(/\s+/g, '-') === slug
        );
        if (currentTransport) {
          // Always set locations
          if (currentTransport.locations) {
            setLocations(currentTransport.locations);
          }
          // Auto-fill demurrage defaults ONLY for new delivery
          if (isNewDelivery) {
            setFormData(prev => ({
              ...prev,
              demurrageRatePerDay: currentTransport.defaultDemurrageRate || "",
              demurrageFreeDays: currentTransport.defaultDemurrageFreeDays || 7,
            }));
          }
        }
      }
    } catch (error) { console.error("Failed to fetch transport data"); }
  };

  const fetchLatestDeliveryNo = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/delivery?transport=${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lastNo = parseInt(data[0].dNo);
          if (!isNaN(lastNo)) setFormData(prev => ({ ...prev, deliveryNo: (lastNo + 1).toString() }));
          else setFormData(prev => ({ ...prev, deliveryNo: "1" }));
        } else {
          setFormData(prev => ({ ...prev, deliveryNo: "1" }));
        }
      }
    } catch (error) { setFormData(prev => ({ ...prev, deliveryNo: "1" })); }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      if (initialData && initialData.formData) {
        fetchLocationsAndDefaults(false);
        setFormData(initialData.formData);
        setLrList(initialData.lrList || []);
        setReceiverDetails(initialData.receiverDetails || { mobileNo: "", vehicleNo: "", aadhaarNo: "" });
        setShowReceiverSection(!!(initialData.receiverDetails?.mobileNo || initialData.receiverDetails?.vehicleNo))
      } else {
        fetchLocationsAndDefaults(true);
        setFormData({ ...defaultFormData, deliveryDate: new Date().toISOString().split("T")[0] });
        setLrList([]);
        fetchLatestDeliveryNo();
        setReceiverDetails({ mobileNo: "", vehicleNo: "", aadhaarNo: "" });
        setShowReceiverSection(false);
      }
    }
  }, [isOpen, initialData, slug]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyDropdownRef.current && !partyDropdownRef.current.contains(event.target)) setShowPartyDropdown(false);
      if (labourDropdownRef.current && !labourDropdownRef.current.contains(event.target)) setShowLabourDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const sumArt = lrList.reduce((sum, lr) => sum + Number(lr.article || 0), 0);
    const sumWt = lrList.reduce((sum, lr) => sum + Number(lr.weight || 0), 0);
    const sumAmt = lrList.reduce((sum, lr) => sum + Number(lr.amount || 0), 0);
    setFormData(prev => ({ ...prev, article: sumArt || "", weight: sumWt || "", amount: sumAmt || "" }));
  }, [lrList]);

  useEffect(() => {
    const tf = Number(formData.amount) || 0;
    const h = Number(formData.hamali) || 0;
    const sc = Number(formData.serviceCharge) || 0;
    const d = Number(formData.discount) || 0;
    const subTotal = tf + h + sc;
    const finalFreight = subTotal - d;
    setFormData(prev => {
      if (prev.totalFreight !== formData.amount || prev.deliverySubTotal !== subTotal || prev.deliveryFreight !== finalFreight) {
        return { ...prev, totalFreight: formData.amount, deliverySubTotal: subTotal || "", deliveryFreight: finalFreight || "" };
      }
      return prev;
    });
  }, [formData.amount, formData.hamali, formData.serviceCharge, formData.discount]);

  // ✅ KEYBOARD SHORTCUTS — F4: Save & Close | F8: Print | ESC: Cancel/Close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // ESC → Close (works in both view and edit mode)
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // F4 → Save & Close (only in add/edit mode)
      if (e.key === "F4" && !isViewMode) {
        e.preventDefault();
        handleSave(true);
      }
      // F8 → Print
      if (e.key === "F8") {
        e.preventDefault();
        alert("Print feature coming soon!");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isViewMode, formData, lrList]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "article") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
    } else if (name === "lrNoInput") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (["weight", "rate", "amount", "hamali", "serviceCharge", "discount"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9.]/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveNewParty = async () => {
    if (!newParty.name) return alert("Party Name is required");
    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create party");
      await fetchClients();
      setFormData(prev => ({ ...prev, party: data._id, partyName: data.name, partyAddress: data.address || data.city || "" }));
      setShowAddPartyModal(false);
      setNewParty({ name: "", city: "", gstNo: "" });
    } catch (error) { alert(error.message); }
  };

  const handleSaveNewAccountMaster = (newAccData) => {
    if (!newAccData || !newAccData.name) return;
    const newAcc = { _id: Date.now().toString(), name: newAccData.name, city: newAccData.city || "-", gstNo: newAccData.gstNo || "-" };
    setAccounts(prev => [...prev, newAcc]);
    setShowAddAccountModal(false);
  };

  const handleSaveNewLabour = (newLabourData) => {
    if (!newLabourData || !newLabourData.name) return;
    const newLab = { _id: Date.now().toString(), name: newLabourData.name, accountGroup: newLabourData.accountGroup || "-" };
    setLabourers(prev => [...prev, newLab]);
    setFormData(prev => ({ ...prev, labour: newLabourData.name }));
    setShowAddLabourModal(false);
  };

  const handleGetLr = async () => {
    const lrInput = formData.lrNoInput.trim();
    if (!lrInput) return alert("Please enter an LR number.");
    if (lrList.some(lr => String(lr.lrNo).trim().toLowerCase() === lrInput.toLowerCase())) {
      return alert(`LR No ${lrInput} is already in the table.`);
    }
    try {
      const res = await fetch(`/api/lr?transport=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const foundLr = data.find(lr => String(lr.lrNo).trim().toLowerCase() === lrInput.toLowerCase());
      if (!foundLr) return alert(`LR No "${lrInput}" not found!`);
      const totalArt = foundLr.goods?.reduce((sum, g) => sum + (Number(g.article) || 0), 0) || 0;
      const totalWt = foundLr.goods?.reduce((sum, g) => sum + (Number(g.weight) || 0), 0) || 0;
      const packNames = foundLr.goods?.map(g => g.packaging).filter(Boolean).join(", ") || "-";
      const desc = foundLr.goods?.map(g => g.goodsContain).filter(Boolean).join(", ") || "-";
      const freightAmount = Number(foundLr.subTotal) || Number(foundLr.freight) || 0;
      const newRow = {
        id: foundLr._id, lrNo: foundLr.lrNo, lrDate: foundLr.lrDate || "-",
        from: foundLr.fromCity || "-", to: foundLr.toCity || "-",
        consignor: foundLr.consignor || "-", consignorGst: "-",
        consignee: foundLr.consignee || "-", consigneeGst: "-",
        pack: packNames, description: desc, freightBy: foundLr.freightBy || "-",
        article: totalArt, weight: totalWt, amount: freightAmount,
      };
      setLrList(prev => [...prev, newRow]);
      setFormData(prev => ({ ...prev, lrNoInput: "" }));
    } catch (err) {
      alert("Error fetching LR details: " + err.message);
    }
  };

  const handleSave = async (closeAfterSave = true) => {
    if (lrList.length === 0) {
      return alert("Please add at least one LR to the delivery list before saving.");
    }
    const payload = {
      transportSlug: slug,
      date: formData.deliveryDate,
      dNo: formData.deliveryNo,
      type: formData.deliveryType,
      labourName: formData.labour,
      art: formData.article,
      delSubTotal: Number(formData.deliverySubTotal) || 0,
      kasar: Number(formData.discount) || 0,
      lrNo: lrList.map(lr => lr.lrNo).join(', '),
      consignee: lrList.map(lr => lr.consignee).join(', '),
      fromBranch: lrList.map(lr => lr.from).join(', '),
      packName: lrList.map(lr => lr.pack).join(', '),
      freightBy: lrList.map(lr => lr.freightBy).join(', '),
      formData: formData,
      lrList: lrList,
      receiverDetails: showReceiverSection ? {
        mobileNo: receiverDetails.mobileNo,
        vehicleNo: receiverDetails.vehicleNo,
        aadhaarNo: receiverDetails.aadhaarNo.replace(/\s/g, ""),
      } : null,
      demurrageRatePerDay: Number(formData.demurrageRatePerDay) || 0,
      demurrageFreeDays: Number(formData.demurrageFreeDays) || 7,
      demurrageStatus: formData.demurrageStatus || "none",
      demurragePaidAmt: Number(formData.demurragePaidAmt) || 0,
      demurrageNote: formData.demurrageNote || "",
    };
    try {
      let method = "POST";
      if (initialData && initialData._id) {
        method = "PUT";
        payload._id = initialData._id;
      }
      const res = await fetch("/api/delivery", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to save delivery");
      if (onSaveSuccess) onSaveSuccess();
      if (closeAfterSave) onClose();
    } catch (err) { alert("Error: " + err.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[95vw] h-[95vh] flex flex-col shadow-xl border border-gray-400 text-xs rounded-sm overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-sm">
            {isViewMode ? "View Delivery Of L.R." : initialData ? "Edit Delivery Of L.R." : "+Add Delivery Of L.R."}
          </h2>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black font-bold transition-colors">✕</button>
        </div>

        {/* BODY */}
        <div className={`flex flex-col flex-1 overflow-y-auto bg-white ${blueScrollbar}`}>

          {/* TOP FORM SECTION */}
          <div className="p-3 bg-[#f8fafc] border-b border-gray-300 shrink-0">
            <div className="flex items-end gap-3 mb-3">
              <div className="flex flex-col w-48">
                <label className="text-[10px] text-gray-500 mb-0.5">Lr no.</label>
                <input disabled={isViewMode} type="text" name="lrNoInput" value={formData.lrNoInput} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleGetLr()} autoComplete="off" className={`border border-blue-300 rounded p-1.5 text-xs focus:outline-blue-500 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#eef2ff]'}`} />
              </div>
              <button disabled={isViewMode} onClick={handleGetLr} className={`px-4 py-1.5 rounded text-xs font-semibold shadow-sm text-white ${isViewMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e73be] hover:bg-blue-700'}`}>Go</button>
              <button disabled={isViewMode} type="button" onClick={() => !isViewMode && setShowLrPicker(true)} className={`px-4 py-1.5 rounded text-xs font-semibold shadow-sm text-white ${isViewMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e73be] hover:bg-blue-700'}`}>Get Lr</button>

              <div className="flex flex-col w-40 ml-6">
                <label className="text-[10px] text-gray-500 mb-0.5">Delivery Date</label>
                <input disabled={isViewMode} type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={`border border-gray-300 rounded p-1.5 text-xs outline-none ${isViewMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} />
              </div>
              <div className="flex flex-col w-40 ml-4">
                <label className="text-[10px] text-gray-500 mb-0.5">Delivery No</label>
                <input disabled={isViewMode} type="text" name="deliveryNo" value={formData.deliveryNo} onChange={handleChange} placeholder="Auto" className="border border-gray-300 rounded p-1.5 text-xs outline-none bg-gray-100 text-right" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1 relative" ref={partyDropdownRef}>
                <label className="text-[10px] text-gray-500 mb-0.5">Party</label>
                <div className={`border border-gray-300 rounded p-1.5 text-xs outline-none flex justify-between items-center h-[30px] ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`} onClick={() => !isViewMode && setShowPartyDropdown(!showPartyDropdown)}>
                  <span className={formData.partyName ? "text-gray-800" : "text-gray-400"}>{formData.partyName || "Select Party..."}</span><span className="text-gray-400 text-[10px]">▼</span>
                </div>
                {showPartyDropdown && (
                  <div className="absolute top-[100%] left-0 w-[550px] bg-white border-2 border-blue-400 shadow-2xl z-[60] mt-1 rounded overflow-hidden flex flex-col">
                    <div className="max-h-[250px] overflow-y-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm text-gray-700">
                          <tr><th className="p-2 border-r border-gray-300 font-semibold w-1/2">Party</th><th className="p-2 border-r border-gray-300 font-semibold">City</th><th className="p-2 font-semibold">GSTNO</th></tr>
                        </thead>
                        <tbody>
                          {clients.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">No parties found. Add one!</td></tr>
                          ) : (
                            clients.map(client => (
                              <tr key={client._id} onClick={() => { setFormData(prev => ({ ...prev, party: client._id, partyName: client.name, partyAddress: client.address || client.city || "" })); setShowPartyDropdown(false); }} className="border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition-colors">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-800">{client.name}</td><td className="p-2 border-r border-gray-200 text-gray-600">{client.city || "-"}</td><td className="p-2 text-gray-600">{client.gstNo || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
                      <button onClick={() => { setShowPartyDropdown(false); setShowAddPartyModal(true); }} type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
                      <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">✏️ (F6)</button>
                      <button onClick={fetchClients} type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">🔄 (F5)</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1"><label className="text-[10px] text-gray-500 mb-0.5">Party Name</label><input type="text" name="partyName" value={formData.partyName} className="border border-gray-300 rounded p-1.5 text-xs outline-none bg-gray-100 text-gray-700" readOnly /></div>
              <div className="flex flex-col flex-1"><label className="text-[10px] text-gray-500 mb-0.5">Party Address</label><input type="text" name="partyAddress" value={formData.partyAddress} className="border border-gray-300 rounded p-1.5 text-xs outline-none bg-gray-100 text-gray-700" readOnly /></div>
            </div>
          </div>

          <div className={`h-[220px] shrink-0 overflow-auto border-b border-gray-300 bg-white ${blueScrollbar}`}>
            <table className="min-w-[1200px] w-full text-left whitespace-nowrap table-auto">
              <thead className="bg-[#e2e8f0] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700 text-center">Lr no.</th><th className="p-2 border-r border-gray-300 font-semibold text-gray-700">LrDate</th>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">From</th><th className="p-2 border-r border-gray-300 font-semibold text-gray-700">To</th>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consigner</th><th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consigner GSTNO</th>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consignee</th><th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consignee GSTNO</th>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Pack</th><th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Description</th>
                  <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">FreightBy</th>
                  {!isViewMode && <th className="p-2 font-semibold text-gray-700 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {lrList.length === 0 ? (
                  <tr><td colSpan={isViewMode ? 11 : 12} className="p-12 text-center text-gray-500 text-xs">No records available. Enter an LR No above.</td></tr>
                ) : (
                  lrList.map((lr) => (
                    <tr key={lr.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border-r border-gray-300 text-center font-bold text-blue-600">{lr.lrNo}</td><td className="p-2 border-r border-gray-300">{lr.lrDate}</td>
                      <td className="p-2 border-r border-gray-300">{lr.from}</td><td className="p-2 border-r border-gray-300">{lr.to}</td>
                      <td className="p-2 border-r border-gray-300">{lr.consignor}</td><td className="p-2 border-r border-gray-300 text-gray-400">{lr.consignorGst}</td>
                      <td className="p-2 border-r border-gray-300">{lr.consignee}</td><td className="p-2 border-r border-gray-300 text-gray-400">{lr.consigneeGst}</td>
                      <td className="p-2 border-r border-gray-300">{lr.pack}</td><td className="p-2 border-r border-gray-300 truncate max-w-[150px]">{lr.description}</td>
                      <td className="p-2 border-r border-gray-300">{lr.freightBy}</td>
                      {!isViewMode && <td className="p-2 text-center"><button onClick={() => setLrList(prev => prev.filter(item => item.id !== lr.id))} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* ── RECEIVER DETAILS SECTION ── */}
          {!isViewMode && (
            <div className="border-b border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiverSection(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-all w-full text-left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 transition-transform duration-200 ${showReceiverSection ? "rotate-90" : "rotate-0"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {showReceiverSection ? "Hide Receiver Details" : "+ Add Receiver Details (Mobile / Vehicle / Aadhaar)"}
              </button>

              {showReceiverSection && (
                <div className="px-4 pb-3 pt-1 grid grid-cols-3 gap-4 bg-blue-50/40">

                  {/* Mobile No */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                      Receiver Mobile No.
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={receiverDetails.mobileNo}
                      onChange={e => setReceiverDetails(prev => ({
                        ...prev, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10)
                      }))}
                      placeholder="10-digit mobile"
                      className="border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 bg-white transition"
                    />
                  </div>

                  {/* Vehicle No */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                      Vehicle No.
                    </label>
                    <input
                      type="text"
                      value={receiverDetails.vehicleNo}
                      onChange={e => setReceiverDetails(prev => ({
                        ...prev, vehicleNo: e.target.value.toUpperCase()
                      }))}
                      placeholder="e.g. GJ01AB1234"
                      className="border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 bg-white transition"
                    />
                  </div>

                  {/* Aadhaar No */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                      Aadhaar Card No.
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={receiverDetails.aadhaarNo}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                        setReceiverDetails(prev => ({ ...prev, aadhaarNo: formatted }));
                      }}
                      placeholder="XXXX XXXX XXXX"
                      className="border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 bg-white transition"
                    />
                    <span className="text-[9px] text-gray-400">Auto-formatted • 12 digits</span>
                  </div>
                </div>

              )}
              {!isViewMode && (
                <div className="flex gap-4 items-end pt-3 mt-2 border-t border-orange-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 mr-1 shrink-0">
                    ⏱ Demurrage
                  </div>

                  <div className="flex flex-col w-28">
                    <label className="text-[10px] text-gray-500 mb-0.5">
                      Rate/Day (₹)
                    </label>
                    <input
                      type="text"
                      name="demurrageRatePerDay"
                      value={formData.demurrageRatePerDay || ""}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      className="border border-orange-300 rounded p-1.5 text-xs outline-none focus:border-orange-500 bg-orange-50"
                    />
                  </div>
                  <div className="flex flex-col w-24">
                    <label className="text-[10px] text-gray-500 mb-0.5">
                      Free Days
                    </label>
                    <input
                      type="text"
                      name="demurrageFreeDays"
                      value={formData.demurrageFreeDays ?? 7}
                      onChange={handleChange}
                      className="border border-orange-300 rounded p-1.5 text-xs outline-none focus:border-orange-500 bg-orange-50"
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mb-1.5">
                    Auto-filled from transport defaults • editable per delivery
                  </div>
                </div>
              )}

            </div>
          )}
          {(() => {
            const d = calcDemurrage({
              date: formData.deliveryDate,
              demurrageRatePerDay: Number(formData.demurrageRatePerDay),
              demurrageFreeDays: Number(formData.demurrageFreeDays),
            });
            if (!d) return null;
            return (
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold border mt-2 mx-4 mb-1 ${d.isOverdue
                ? "bg-red-50 border-red-300 text-red-700"
                : d.isWarning
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "bg-green-50 border-green-300 text-green-700"
                }`}>
                <span>
                  {d.isOverdue
                    ? `Charging started! ${d.chargeDays} overdue ${d.chargeDays === 1 ? "day" : "days"}`
                    : d.isWarning
                      ? `${d.daysUntilCharge} ${d.daysUntilCharge === 1 ? "day" : "days"} left in free period`
                      : `${d.daysTotal} of ${formData.demurrageFreeDays} free days used`
                  }
                </span>
                {d.isOverdue && (
                  <span className="font-bold text-red-800">
                    ₹{d.totalCharge.toLocaleString()} due
                  </span>
                )}
              </div>
            );
          })()}

          {/* Show read-only in view mode if data exists */}
          {isViewMode && (receiverDetails.mobileNo || receiverDetails.vehicleNo || receiverDetails.aadhaarNo) && (
            <div className="px-4 py-2 grid grid-cols-3 gap-4 bg-blue-50/30 border-b border-gray-200 shrink-0">
              {receiverDetails.mobileNo && (
                <div><span className="text-[10px] text-gray-500 uppercase font-semibold block">Mobile</span>
                  <span className="text-xs text-gray-800">{receiverDetails.mobileNo}</span></div>
              )}
              {receiverDetails.vehicleNo && (
                <div><span className="text-[10px] text-gray-500 uppercase font-semibold block">Vehicle No.</span>
                  <span className="text-xs text-gray-800">{receiverDetails.vehicleNo}</span></div>
              )}
              {receiverDetails.aadhaarNo && (
                <div><span className="text-[10px] text-gray-500 uppercase font-semibold block">Aadhaar</span>
                  <span className="text-xs text-gray-800">XXXX XXXX {receiverDetails.aadhaarNo.replace(/\s/g, "").slice(-4)}</span></div>
              )}
            </div>
          )}

          <div className="p-4 bg-white shrink-0">
            <div className="flex gap-4 items-end pb-4 border-b border-gray-200">
              <div className="flex flex-col w-24"><label className="text-[10px] text-gray-500 mb-0.5">Article</label><input disabled={isViewMode} type="text" name="article" value={formData.article} onChange={handleChange} className={`border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : 'bg-blue-50'}`} /></div>
              <div className="flex flex-col w-24"><label className="text-[10px] text-gray-500 mb-0.5">Weight</label><input disabled={isViewMode} type="text" name="weight" value={formData.weight} onChange={handleChange} className={`border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : 'bg-blue-50'}`} /></div>
              <div className="flex flex-col w-24"><label className="text-[10px] text-gray-500 mb-0.5">Rate</label><input disabled={isViewMode} type="text" name="rate" value={formData.rate} onChange={handleChange} className={`border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`} /></div>
              <div className="flex flex-col w-32">
                <label className="text-[10px] text-gray-500 mb-0.5">FreightOn</label>
                <select disabled={isViewMode} name="freightOn" value={formData.freightOn} onChange={handleChange} className={`border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`}>
                  <option value=""></option><option value="Weight">Weight</option><option value="Article">Article</option><option value="Quantity">Quantity</option><option value="Fix">Fix</option><option value="KM">KM</option>
                </select>
              </div>
              <div className="flex flex-col w-28"><label className="text-[10px] text-gray-500 mb-0.5">Amount</label><input disabled={isViewMode} type="text" name="amount" value={formData.amount} onChange={handleChange} className={`border border-blue-300 rounded p-1.5 text-xs outline-none focus:border-blue-500 font-bold ${isViewMode ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'}`} /></div>
              <div className="text-[11px] text-gray-600 mb-1.5 ml-2 font-medium">Pre. Rate :</div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-3">
              <div className="flex flex-col gap-4 border-r border-gray-200 pr-6">
                <div className={`relative border border-blue-300 rounded p-1.5 mt-2 focus-within:border-blue-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>
                  <label className={`absolute -top-2.5 left-2 px-1 text-[10px] text-gray-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>Delivery Type</label>
                  <select disabled={isViewMode} name="deliveryType" value={formData.deliveryType} onChange={handleChange} className={`w-full text-xs outline-none border-none bg-transparent ${isViewMode ? 'text-gray-500 cursor-not-allowed' : ''}`}>
                    <option>Cash</option><option>Bank</option><option>Online</option><option>Debit</option><option>T.B.B.</option>
                  </select>
                </div>
                <AccountDropdown
                  label="Account"
                  value={formData.account}
                  accounts={accounts}
                  onSelect={(val) => setFormData(prev => ({ ...prev, account: val }))}
                  onAdd={() => setShowAddAccountModal(true)}
                  disabled={isViewMode}
                />
              </div>

              <div className="flex flex-col gap-3 border-r border-gray-200 pr-6">
                <div className="flex flex-col flex-1 relative mt-2" ref={labourDropdownRef}>
                  <label className="absolute -top-2.5 left-2 bg-white px-1 text-[10px] text-gray-500 z-10">Labour</label>
                  <div className={`border border-gray-300 rounded p-1.5 text-xs outline-none flex justify-between items-center h-[30px] ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`} onClick={() => !isViewMode && setShowLabourDropdown(!showLabourDropdown)}>
                    <span className={formData.labour ? "text-gray-800" : "text-gray-400"}>{formData.labour || "Select Labour..."}</span><span className="text-gray-400 text-[10px]">▼</span>
                  </div>
                  {showLabourDropdown && (
                    <div className="absolute top-[100%] left-0 w-[450px] bg-white border-2 border-blue-400 shadow-2xl z-[60] mt-1 rounded overflow-hidden flex flex-col">
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm text-gray-700 text-xs">
                            <tr><th className="p-2 border-r border-gray-300 font-semibold w-2/3">Labour Name</th><th className="p-2 font-semibold">Account Group</th></tr>
                          </thead>
                          <tbody className="text-xs">
                            {labourers.map(lab => (
                              <tr key={lab._id} onClick={() => { setFormData(prev => ({ ...prev, labour: lab.name })); setShowLabourDropdown(false); }} className="border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition-colors">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-800">{lab.name}</td><td className="p-2 text-gray-600">{lab.accountGroup || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
                        <button onClick={() => { setShowLabourDropdown(false); setShowAddLabourModal(true); }} type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
                        <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">✏️ (F6)</button>
                        <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">🔄 (F5)</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`relative border border-blue-300 rounded p-1.5 mt-1 focus-within:border-blue-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>
                  <label className={`absolute -top-2.5 left-2 px-1 text-[10px] text-gray-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>Delivery At</label>
                  <input disabled={isViewMode} type="text" name="deliveryAt" value={formData.deliveryAt} onChange={handleChange} className={`w-full text-xs outline-none border-none bg-transparent ${isViewMode ? 'text-gray-500' : ''}`} />
                </div>
                <div className={`relative border border-blue-300 rounded p-1.5 mt-1 h-[42px] focus-within:border-blue-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>
                  <label className={`absolute -top-2.5 left-2 px-1 text-[10px] text-gray-500 ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}>Note</label>
                  <textarea disabled={isViewMode} rows="2" name="note" value={formData.note} onChange={handleChange} className={`w-full h-full text-xs outline-none border-none bg-transparent resize-none ${isViewMode ? 'text-gray-500' : ''}`}></textarea>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 text-[11px] pr-2 pb-2">
                <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Total Freight :</span><input type="text" name="totalFreight" value={formData.totalFreight} className="border border-blue-300 rounded p-1 w-28 text-right outline-none bg-gray-100 font-bold text-gray-500" readOnly /></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Hamali :</span><input disabled={isViewMode} type="text" name="hamali" value={formData.hamali} onChange={handleChange} className={`border border-blue-300 rounded p-1 w-28 text-right outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`} /></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Service Charge :</span><input disabled={isViewMode} type="text" name="serviceCharge" value={formData.serviceCharge} onChange={handleChange} className={`border border-blue-300 rounded p-1 w-28 text-right outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`} /></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Delivery SubTotal :</span><input type="text" name="deliverySubTotal" value={formData.deliverySubTotal} className="border border-blue-300 rounded p-1 w-28 text-right outline-none bg-blue-50 font-bold text-gray-500" readOnly /></div>
                <div className="flex justify-between items-center gap-2"><span className="text-gray-600 font-medium w-[60px]">GST Type :</span><select disabled={isViewMode} name="gstType" value={formData.gstType} onChange={handleChange} className={`border border-gray-300 rounded p-1 flex-1 outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`}><option></option></select><span className="text-gray-600 font-medium ml-1">GST Amt :</span><input type="text" name="gstAmt" value={formData.gstAmt} onChange={handleChange} className="border border-gray-300 rounded p-1 w-16 text-right outline-none bg-gray-50 text-gray-500" readOnly /></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 font-medium">Discount(Kasar) :</span><input disabled={isViewMode} type="text" name="discount" value={formData.discount} onChange={handleChange} className={`border border-blue-300 rounded p-1 w-28 text-right outline-none focus:border-blue-500 ${isViewMode ? 'bg-gray-100 text-gray-500' : ''}`} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER TOTALS */}
        <div className="bg-[#e2e8f0] px-4 py-2 border-t border-b border-gray-300 font-bold text-gray-800 flex justify-between items-center text-xs shrink-0 shadow-inner z-10">
          <div className="flex gap-10">
            <span>Total Items : <span className="text-blue-600">{lrList.length}</span></span>
            <span>Total Article : <span className="text-blue-600">{formData.article || 0}</span></span>
            <span>Total Weight : <span className="text-blue-600">{formData.weight || 0}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>DeliveryFreight :</span>
            <input type="text" name="deliveryFreight" value={formData.deliveryFreight} onChange={handleChange} className="border border-blue-400 rounded p-1 w-32 text-right outline-none bg-white font-bold text-blue-700 disabled:bg-gray-100" readOnly />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#f8fafc] px-3 py-2.5 flex justify-between items-center text-xs shrink-0 z-10">
          {/* ✅ Print button — F8 label added */}
          <button
            onClick={() => alert("Print feature coming soon")}
            className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            Print (F8)
          </button>

          <div className="flex gap-2">
            {/* ✅ Save & Close — F4 label */}
            {!isViewMode && (
              <button
                onClick={() => handleSave(true)}
                className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700 transition-colors"
              >
                Save & Close (F4)
              </button>
            )}
            {/* ✅ Cancel/Close — ESC label */}
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-5 py-1.5 rounded font-medium shadow-sm hover:bg-gray-700 flex items-center gap-1 transition-colors"
            >
              {isViewMode ? "Close (ESC)" : "Cancel (ESC)"}
            </button>
          </div>
        </div>
      </div>

      {showAddPartyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded shadow-2xl w-[400px] border border-gray-400 overflow-hidden">
            <div className="bg-[#1e73be] text-white px-3 py-2 font-semibold text-sm flex justify-between items-center">
              <span>+ Add Party</span><button onClick={() => setShowAddPartyModal(false)} className="hover:text-red-300 font-bold">✕</button>
            </div>
            <div className="p-4 flex flex-col gap-4 text-xs">
              <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Party Name <span className="text-red-500">*</span></label><input autoFocus type="text" value={newParty.name} onChange={(e) => setNewParty({ ...newParty, name: e.target.value })} className="border border-blue-300 rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter party name..." /></div>
              <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">City</label><input type="text" value={newParty.city} onChange={(e) => setNewParty({ ...newParty, city: e.target.value })} className="border border-gray-300 rounded p-1.5 outline-none focus:border-blue-400" placeholder="Enter city..." /></div>
              <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">GST No.</label><input type="text" value={newParty.gstNo} onChange={(e) => setNewParty({ ...newParty, gstNo: e.target.value })} className="border border-gray-300 rounded p-1.5 outline-none focus:border-blue-400" placeholder="Enter GST number..." /></div>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setShowAddPartyModal(false)} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium">Cancel</button>
              <button onClick={handleSaveNewParty} className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-medium shadow-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddLabourModal && (
        <AddLabourModal
          isOpen={showAddLabourModal}
          onClose={() => setShowAddLabourModal(false)}
          onSave={handleSaveNewLabour}
          accounts={accounts}
          onAddAccount={() => { setShowAddLabourModal(false); setShowAddAccountModal(true); }}
        />
      )}

      {showAddAccountModal && (
        <InlineAccountModal
          isOpen={showAddAccountModal}
          type="Account"
          onClose={() => setShowAddAccountModal(false)}
          onSave={handleSaveNewAccountMaster}
          locations={locations}
        />
      )}
      {showLrPicker && (
        <LrPickerModal
          isOpen={showLrPicker}
          onClose={() => setShowLrPicker(false)}
          alreadyAddedIds={lrList.map(lr => lr.id)}
          onSelect={(selectedRows) => {
            // Filter out already added
            const newRows = selectedRows.filter(
              row => !lrList.some(existing => existing.id === row.id)
            );
            setLrList(prev => [...prev, ...newRows]);
          }}
        />
      )}
    </div>
  );
}

// 1. THE UNIFIED ACCOUNT DROPDOWN COMPONENT
function AccountDropdown({ value, accounts, onSelect, onAdd, label, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAccounts = accounts.filter(acc =>
    !searchTerm || acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || (acc.city && acc.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative border border-gray-300 rounded p-1.5 mt-1 focus-within:border-blue-500 ${disabled ? 'bg-gray-100' : 'bg-white'}`} ref={dropdownRef}>
      <label className={`absolute -top-2.5 left-2 px-1 text-[10px] text-gray-500 z-10 ${disabled ? 'bg-gray-100' : 'bg-white'}`}>{label}</label>
      <div
        className={`w-full text-xs outline-none border-none bg-transparent flex justify-between items-center h-[18px] ${disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? (disabled ? "text-gray-500" : "text-gray-800") : "text-gray-400"}>{value || `Select ${label}...`}</span>
        <span className="text-gray-400 text-[10px]">▼</span>
      </div>
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 w-[400px] min-w-[350px] bg-white border-2 border-blue-400 shadow-2xl z-[999] mt-1 rounded flex flex-col overflow-hidden">
          <div className="p-1.5 bg-gray-50 border-b border-gray-200">
            <input type="text" autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full p-1 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-400 outline-none" />
          </div>
          <div className={`max-h-[200px] overflow-y-auto ${blueScrollbar}`}>
            <table className="w-full text-left whitespace-nowrap table-auto">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm text-gray-700 text-xs">
                <tr><th className="p-1.5 border-r border-gray-300 font-semibold w-1/2">Account</th><th className="p-1.5 border-r border-gray-300 font-semibold">City</th><th className="p-1.5 font-semibold">GSTNO</th></tr>
              </thead>
              <tbody className="text-xs">
                {filteredAccounts.length === 0 ? (
                  <tr><td colSpan={3} className="p-3 text-center text-gray-500">No accounts found.</td></tr>
                ) : (
                  filteredAccounts.map(acc => (
                    <tr key={acc._id} onClick={() => { onSelect(acc.name); setIsOpen(false); }} className="border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition-colors">
                      <td className="p-1.5 border-r border-gray-200 font-medium text-gray-800">{acc.name}</td><td className="p-1.5 border-r border-gray-200 text-gray-600">{acc.city || "-"}</td><td className="p-1.5 text-gray-600">{acc.gstNo || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#b3d8f3] border-t border-blue-300 p-1.5 flex gap-2 shrink-0">
            <button onClick={() => { setIsOpen(false); onAdd(); }} type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700">+ (F2)</button>
            <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">✏️ (F6)</button>
            <button type="button" className="bg-[#1e73be] text-white px-3 py-1 rounded shadow text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1">🔄 (F5)</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. ADD LABOUR MODAL
function AddLabourModal({ isOpen, onClose, onSave, accounts, onAddAccount }) {
  const [labourName, setLabourName] = useState("");
  const [selectedAccountGroup, setSelectedAccountGroup] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-[400px] border border-gray-400 overflow-visible">
        <div className="bg-[#1e73be] text-white px-3 py-2 font-semibold text-sm flex justify-between items-center">
          <span>+ Add Labour</span><button onClick={onClose} className="hover:text-red-300 font-bold">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-5 text-xs">
          <div className="relative border border-blue-300 rounded p-1.5 mt-2 bg-white focus-within:border-blue-500">
            <label className="absolute -top-2.5 left-2 bg-white px-1 text-[10px] text-gray-700 font-medium z-10">Labour Name <span className="text-red-500">*</span></label>
            <input autoFocus type="text" value={labourName} onChange={(e) => setLabourName(e.target.value)} className="w-full text-sm outline-none border-none bg-transparent" placeholder="Enter labourer name..." />
          </div>
          <AccountDropdown label="Account Group" value={selectedAccountGroup} accounts={accounts} onSelect={(name) => setSelectedAccountGroup(name)} onAdd={onAddAccount} />
        </div>
        <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200 text-xs">
          <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium">Cancel (Esc)</button>
          <button onClick={() => { if (labourName) onSave({ name: labourName, accountGroup: selectedAccountGroup }); }} className="px-5 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-medium shadow-sm">Save (F3)</button>
        </div>
      </div>
    </div>
  );
}

// 3. INLINE ACCOUNT MODAL COMPONENT (Account Master)
function InlineAccountModal({ isOpen, onClose, type, onSave, locations = [] }) {
  const [accName, setAccName] = useState("");
  const [accCity, setAccCity] = useState("");
  const [accGstNo, setAccGstNo] = useState("");

  // ✅ KEYBOARD SHORTCUTS FOR THIS MODAL ONLY — F4: Save & Close | ESC: Cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (accName) onSave({ name: accName, city: accCity, gstNo: accGstNo });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, accName, accCity, accGstNo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center">
          <h2 className="font-semibold text-sm">+ Add {type}</h2>
          <div className="flex gap-2">
            <button className="hover:bg-blue-700 px-1.5 rounded">📄</button>
            <button className="hover:bg-blue-700 px-1.5 rounded">🔍</button>
            <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black font-bold">✕</button>
          </div>
        </div>
        <div className={`flex-1 p-4 bg-[#f0f4f8] overflow-y-auto max-h-[75vh] ${blueScrollbar}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border border-gray-300 p-2 rounded bg-white relative mt-2">
              <label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Account Name <span className="text-red-500">*</span></label>
              <input type="text" value={accName} onChange={e => setAccName(e.target.value)} autoFocus className="w-full p-1 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Code/Alias</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Group</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Sundry Creditors (A/cs Payble)</option><option>Sundry Debtors</option></select></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Reg Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Regular</option></select></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Transport</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Transporter</option></select></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">GST By Trans.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>No</option></select></div></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Address</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1" /><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1" /><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
                <div className="flex gap-2">
                  <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">City</label><select className="border border-blue-300 rounded p-1 w-full bg-white" value={accCity} onChange={(e) => setAccCity(e.target.value)}><option value=""></option>{locations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select></div>
                  <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">State</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>GUJARAT</option></select></div>
                </div>
                <div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Area</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div><div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Pin</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Phone(O)</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Mobile</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Email</label><input type="email" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col relative"><label className="text-gray-600 mb-0.5">GSTNO</label><div className="flex"><input type="text" className="border border-blue-300 rounded-l p-1 w-full bg-white" value={accGstNo} onChange={(e) => setAccGstNo(e.target.value)} /><button className="border border-l-0 border-blue-300 bg-gray-50 px-2 rounded-r text-blue-500">🔍</button></div></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">PAN NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">ADHAR NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C NO.</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">MSME NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Limit</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Days</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white" /></div></div>
                <div className="border border-gray-300 rounded p-2 bg-white mt-1 relative"><label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Balance</label><div className="flex flex-col gap-2 mt-1"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Balance Method</label><select className="border border-gray-300 rounded p-1 w-full bg-gray-100"><option>Balance Only</option></select></div><div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Opening Balance</label><input type="number" defaultValue={0} className="border border-blue-300 rounded p-1 w-full bg-white text-right" /></div><div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Cr/Db.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Cr</option><option>Db</option></select></div></div></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FOOTER — F4: Save & Close | ESC: Cancel labels updated */}
        <div className="bg-[#e2e8f0] px-3 py-2 flex justify-between border-t items-center">
          <button className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium">{type}</button>
          <div className="flex gap-2">
            <button
              onClick={() => { if (accName) onSave({ name: accName, city: accCity, gstNo: accGstNo }); }}
              className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700"
            >
              Save & Close (F4)
            </button>
            <button
              onClick={onClose}
              className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}