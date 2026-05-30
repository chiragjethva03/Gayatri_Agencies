"use client";
import React, { useState, useEffect, useRef } from "react";
import ComboBox from "@/components/ui/ComboBox";
import CenterMasterModal from "@/components/memo/CenterMasterModal";
import { generateMemoPdf } from "@/lib/generateMemoPdf";
import { X } from "lucide-react";

export default function MemoForm({ isOpen, onClose, transport, transportSlug, onSaveSuccess, initialData, mode }) {
  const actualTransport = Array.isArray(transport) ? transport[0] : transport;
  const locations = (actualTransport?.locations || []).map(l => typeof l === "string" ? l : (l?.name || ""));
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [isSaved, setIsSaved] = useState(isEditMode);
  const savedStateRef = useRef(isEditMode ? initialData : null);

  const [formData, setFormData] = useState({
    _id: initialData?._id || "", 
    date: initialData?.date || new Date().toISOString().split("T")[0],
    memoNo: initialData?.memoNo || "",
    toBranch: initialData?.toBranch || "",
    toCity: initialData?.toCity || "AMD-ASLALI", 
    vehicle: initialData?.vehicle || "",
    driver: initialData?.driver || "",
    kMiter: initialData?.kMiter || "",
    toWt: initialData?.toWt || "",
    agent: initialData?.agent || actualTransport?.name || "",
    hire: initialData?.hire || "",
    cashBank: initialData?.cashBank || "",
    advanced: initialData?.advanced || "",
    crossing: initialData?.crossing || "No",
    center: initialData?.center || "",
    toPay: initialData?.toPay || "",
    paid: initialData?.paid || "",
    hamali: initialData?.hamali || "",
    narration: initialData?.narration || "",
    memoFreight: initialData?.lrList?.length > 0
      ? initialData.lrList.reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0).toFixed(2)
      : (initialData?.memoFreight || ""),
  });

  const [lrList, setLrList] = useState(initialData?.lrList || []);

  // Reset to "Save" when anything changes after the last save
  useEffect(() => {
    if (!savedStateRef.current) return;
    if (JSON.stringify({ formData, lrList }) !== JSON.stringify(savedStateRef.current)) {
      setIsSaved(false);
    }
  }, [formData, lrList]);

  const [lrInput, setLrInput] = useState("");

  const [localBranches, setLocalBranches] = useState(locations);
  const [localCities, setLocalCities] = useState(locations); 
  const [vehicles, setVehicles] = useState([]); 
  const [drivers, setDrivers] = useState([]); 
  const [agents, setAgents] = useState([]); 
  const [cashBanks, setCashBanks] = useState([]); 
  const [accountList, setAccountList] = useState([]);
  const [centerList, setCenterList] = useState([]); 

  const [isAutoAddModalOpen, setIsAutoAddModalOpen] = useState(false); 
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", mode: "add", oldVal: "" }); 
  const [accountModal, setAccountModal] = useState({ isOpen: false, type: "" }); 
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [isCityMasterModalOpen, setIsCityMasterModalOpen] = useState(false); 
  const [isCashBankModalOpen, setIsCashBankModalOpen] = useState(false); 
  const [actionInput, setActionInput] = useState("");

  // Single effect — all 7 fetches fire in parallel via Promise.all.
  // `cancelled` flag pattern: if the effect is cleaned up before all fetches resolve
  // (e.g. React StrictMode double-invoke, or the form closes mid-fetch), we skip
  // all state updates so stale data never lands in the form.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchAll = async () => {
      try {
        // Start memo + all master-data fetches simultaneously
        const memoPromise = transportSlug
          ? fetch(`/api/memo?transport=${transportSlug}`).then(r => r.json())
          : Promise.resolve([]);

        const [citiesData, cashBankData, vehiclesData, driversData, clientData, centersData] =
          await Promise.all([
            fetch("/api/cities").then(r => r.json()),
            fetch("/api/cash-bank").then(r => r.json()),
            fetch("/api/vehicles").then(r => r.json()),
            fetch("/api/drivers").then(r => r.json()),
            fetch("/api/client").then(r => r.json()),
            fetch("/api/centers").then(r => r.json()),
          ]);

        const memoData = await memoPromise;

        // Bail out if this effect run was superseded — no state updates
        if (cancelled) return;

        // --- Memo: next number + extract past dropdown values ---
        if (Array.isArray(memoData) && memoData.length > 0) {
          if (!isEditMode) {
            const lastNo = parseInt(memoData[0].memoNo);
            setFormData(prev => ({ ...prev, memoNo: (!isNaN(lastNo) ? lastNo + 1 : 1000).toString() }));
          }
          setDrivers(prev => [...new Set([...prev, ...memoData.map(m => m.driver).filter(Boolean)])]);
          setCenterList(prev => [...new Set([...prev, ...memoData.map(m => m.center).filter(Boolean)])]);
          setVehicles(prev => [...new Set([...prev, ...memoData.map(m => m.vehicle).filter(Boolean)])]);
        } else if (!isEditMode) {
          setFormData(prev => ({ ...prev, memoNo: "1000" }));
        }

        // --- Cities ---
        if (Array.isArray(citiesData))
          setLocalCities([...new Set([...locations, ...citiesData.map(c => c.city)])]);

        // --- Cash / Bank ---
        if (Array.isArray(cashBankData))
          setCashBanks(cashBankData.map(cb => cb.name));

        // --- Vehicles ---
        if (Array.isArray(vehiclesData))
          setVehicles(prev => [...new Set([...prev, ...vehiclesData.map(v => v.number || v.name).filter(Boolean)])]);

        // --- Drivers ---
        if (Array.isArray(driversData)) {
          const fetched = driversData.map(d => d.name || d.driverName || d.fullName).filter(Boolean);
          setDrivers(prev => [...new Set([...prev, ...fetched])]);
        }

        // --- Clients (agents + account-drivers) ---
        if (Array.isArray(clientData)) {
          const allClients = clientData.filter(Boolean);
          const clientNames = [...new Set(allClients.map(c => c.name))].filter(Boolean);
          const accountDrivers = allClients.filter(c => c.acType === "Driver").map(c => c.name).filter(Boolean);
          setAgents(clientNames);
          setAccountList(clientNames);
          setDrivers(prev => [...new Set([...prev, ...accountDrivers])]);
        }

        // --- Centers ---
        if (Array.isArray(centersData)) {
          const fetched = centersData.map(c => c.centerName || c.name || c.center).filter(Boolean);
          setCenterList(prev => [...new Set([...prev, ...fetched])]);
        }

      } catch (err) {
        if (cancelled) return; // Effect cleaned up — silently discard
        console.error("MemoForm fetch error:", err);
        if (!isEditMode) setFormData(prev => ({ ...prev, memoNo: "1000" }));
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [isOpen, transportSlug, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = async () => {
    const hire        = Number(formData.hire)        || 0;
    const advanced    = Number(formData.advanced)    || 0;
    const toPay       = Number(formData.toPay)       || 0;
    const paid        = Number(formData.paid)        || 0;
    const hamali      = Number(formData.hamali)      || 0;
    const memoFreight = Number(formData.memoFreight) || 0;

    const crossingTotal = formData.crossing === "Yes"
      ? lrList.reduce((sum, lr) => sum + (Number(lr.crossing) || 0), 0) : 0;

    const totalFreight  = lrList.reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);
    const paidLrTotal   = lrList
      .filter(lr => (lr.freightBy || "").trim().toLowerCase() === "paid")
      .reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);
    const toPayLrTotal  = lrList
      .filter(lr => (lr.freightBy || "").trim().toLowerCase() === "to pay")
      .reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);
    const tbbLrTotal    = lrList
      .filter(lr => (lr.freightBy || "").trim().toLowerCase() === "tbb")
      .reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);

    const truckBalance   = hire - advanced;
    const paidNetSettled = paidLrTotal - advanced - crossingTotal - hamali;
    const tbb            = tbbLrTotal;

    // Live-enrich goods amounts from LR data for any entry where all goods.amount === 0
    // (memos saved before per-goods amount was introduced). No-op for already-enriched entries.
    let enrichedLrList = lrList;
    const needsEnrichment = lrList.some(lr =>
      (lr.goods || []).length > 0 && (lr.goods || []).every(g => !(Number(g.amount) > 0))
    );
    if (needsEnrichment) {
      try {
        const res = await fetch(`/api/lr?transport=${transportSlug}&all=true`);
        if (res.ok) {
          const allLrs = await res.json();
          enrichedLrList = lrList.map(lr => {
            if ((lr.goods || []).some(g => Number(g.amount) > 0)) return lr;
            const foundLr = allLrs.find(l =>
              String(l.lrNo).trim().toLowerCase() === String(lr.lrNo).trim().toLowerCase()
            );
            if (!foundLr?.goods?.length) return lr;
            return {
              ...lr,
              goods: (lr.goods || []).map((g, idx) => ({
                ...g,
                amount: Number(foundLr.goods[idx]?.amount) || 0,
              })),
            };
          });
        }
      } catch {
        // fallback: print with unenriched data (shows total on first row)
      }
    }

    const memoData = {
      ...formData,
      transportSlug,
      lrList: enrichedLrList,
      hire, advanced, toPay, paid, hamali, memoFreight,
      crossingTotal, totalFreight, paidLrTotal, toPayLrTotal,
      truckBalance, paidNetSettled, tbb,
    };
    generateMemoPdf(memoData, "print");
  };

  const handleSaveAndPrint = async () => {
    const success = await handleSave(false);
    if (success) handlePrint();
  };

  // Keyboard shortcuts: F3 = Save & Print, F4 = Save only, ESC = Close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "F3") { e.preventDefault(); isViewMode ? handlePrint() : handleSaveAndPrint(); return; }
      if (e.key === "F4") { e.preventDefault(); if (!isViewMode && !isSaved) handleSave(false); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isViewMode, onClose, formData, lrList]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Recalculate toPay, paid, hamali directly from a given LR list.
  // Pass overrideAdv / overrideCross when the user just changed those fields
  // (their new value isn't in formData yet at call-time).
  // All formData reads happen inside the setFormData updater so they always
  // use the latest state even if this function is called from a stale closure.
  const recalcFinancials = (list, overrideAdv = null, overrideCross = null) => {
    if (list.length === 0) return;

    let toPayTotal = 0, paidTotal = 0;
    list.forEach(lr => {
      const fb = (lr.freightBy || "").trim().toLowerCase();
      const freight = Number(lr.freight) || 0;
      if (fb === "paid") paidTotal += freight;
      else if (fb === "to pay") toPayTotal += freight;
      // TBB excluded from toPay auto-fill
    });
    const hamaliTotal  = list.reduce((sum, lr) => sum + (Number(lr.hamali)  || 0), 0);
    const totalFreight = list.reduce((sum, lr) => sum + (Number(lr.freight) || 0), 0);

    setFormData(prev => {
      const advancedVal  = Number(overrideAdv  ?? prev.advanced)  || 0;
      const crossingMode = overrideCross ?? prev.crossing;
      const crossingTotal = crossingMode === "Yes"
        ? list.reduce((sum, lr) => sum + (Number(lr.crossing) || 0), 0) : 0;
      const netPaid = Math.max(0, paidTotal - advancedVal - crossingTotal - hamaliTotal);
      return {
        ...prev,
        toPay:       toPayTotal  > 0 ? toPayTotal.toFixed(2)  : prev.toPay,
        paid:        netPaid.toFixed(2),
        hamali:      hamaliTotal > 0 ? hamaliTotal.toFixed(2) : prev.hamali,
        memoFreight: totalFreight.toFixed(2),
      };
    });
  };

  const handleRemoveLr = (index) => {
    const newLrList = lrList.filter((_, i) => i !== index);
    setLrList(newLrList);
    recalcFinancials(newLrList);
  };

  const openActionModal = (type, mode, currentSelection = "") => {
    if (mode === "edit" && !currentSelection) return alert(`Please select a ${type} to edit first.`);
    setActionModal({ isOpen: true, type, mode, oldVal: currentSelection });
    setActionInput(mode === "edit" ? currentSelection : "");
  };

  // --- UPDATED: Save new entries directly to Database ---
  const handleActionModalSave = async () => {
    if (!actionInput.trim()) return;
    const { type, mode, oldVal } = actionModal;

    try {
      if (type === "To Branch") {
        if (mode === "add") {
          await fetch("/api/transports", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transportId: actualTransport._id, newLocation: actionInput }),
          });
          setLocalBranches([...localBranches, actionInput]);
        } else {
          setLocalBranches(localBranches.map((x) => (x === oldVal ? actionInput : x)));
        }
        setFormData((prev) => ({ ...prev, toBranch: actionInput }));
      } 
      else if (type === "Vehicle") {
        if (mode === "add") {
          // Post to DB
          await fetch("/api/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: actionInput }),
          });
          setVehicles([...vehicles, actionInput]);
        } else {
          setVehicles(vehicles.map((x) => (x === oldVal ? actionInput : x)));
        }
        setFormData((prev) => ({ ...prev, vehicle: actionInput }));
      } 
      else if (type === "Driver") {
        if (mode === "add") {
          // Post to DB
          await fetch("/api/drivers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: actionInput }),
          });
          setDrivers([...drivers, actionInput]);
        } else {
          setDrivers(drivers.map((x) => (x === oldVal ? actionInput : x)));
        }
        setFormData((prev) => ({ ...prev, driver: actionInput }));
      }
    } catch (error) {
      console.error(`Failed to save ${type} to database`, error);
    }

    setActionModal({ isOpen: false, type: "", mode: "add", oldVal: "" });
  };

  const handleAddLr = async () => {
  if (!lrInput.trim()) return;

  // Check if already added to current memo
  if (lrList.some(lr => String(lr.lrNo).trim().toLowerCase() === lrInput.trim().toLowerCase())) {
    alert("This LR is already added to this memo!");
    return;
  }

  try {
    // Fetch LRs and all memos in parallel for efficiency
    const [lrRes, memoRes] = await Promise.all([
      fetch(`/api/lr?transport=${transportSlug}&all=true`),
      fetch(`/api/memo?transport=${transportSlug}`)
    ]);
    if (!lrRes.ok) throw new Error("Failed to fetch LRs");
    const allLrs = await lrRes.json();
    const allMemos = memoRes.ok ? await memoRes.json() : [];

    const foundLr = allLrs.find(lr =>
      String(lr.lrNo).trim().toLowerCase() === lrInput.trim().toLowerCase()
    );

    if (!foundLr) {
      alert(`LR No "${lrInput}" not found!`);
      return;
    }

    // Check if this LR is already assigned to a different memo
    const lrNoLower = lrInput.trim().toLowerCase();
    const conflictMemo = Array.isArray(allMemos)
      ? allMemos.find(m =>
          m._id !== formData._id &&
          (m.lrList || []).some(l => String(l.lrNo).toLowerCase() === lrNoLower)
        )
      : null;
    if (conflictMemo) {
      alert(`LR No "${lrInput}" is already assigned to Memo No. ${conflictMemo.memoNo}.`);
      return;
    }

    const newLr = {
      id: foundLr._id,
      lrNo: foundLr.lrNo,
      crossDate: foundLr.lrDate || formData.date,
      packaging: foundLr.goods?.[0]?.packaging || "-",      // backward compat
      description: foundLr.goods?.[0]?.goodsContain || "-", // backward compat
      goods: (foundLr.goods || [])
        .filter(g => Number(g.article) > 0 || g.packaging || g.goodsContain)
        .map(g => ({
          article:      Number(g.article)  || 0,
          packaging:    g.packaging        || "-",
          goodsContain: g.goodsContain     || "-",
          weight:       Number(g.weight)   || 0,
          amount:       Number(g.amount)   || 0,
        })),
      article: foundLr.goods?.reduce((sum, g) => sum + (Number(g.article) || 0), 0) || 0,
      freightBy: foundLr.freightBy || "-",
      fromCity: foundLr.fromCity || "-",
      toCity: foundLr.toCity || "-",
      consignor: foundLr.consignor || "-",
      consignee: foundLr.consignee || "-",
      centerName: foundLr.center || "-",
      weight: foundLr.goods?.reduce((sum, g) => sum + (Number(g.weight) || 0), 0) || 0,
      freight: foundLr.freight || foundLr.subTotal || 0,
      crossing: Number(foundLr.crossing) || 0,
      hamali: Number(foundLr.hamali) || 0,
    };
    const newLrList = [...lrList, newLr];
    setLrList(newLrList);
    recalcFinancials(newLrList);
    setLrInput("");

  } catch (err) {
    alert("Error: " + err.message);
  }
};

  const handleSave = async (closeAfterSave = true) => {
  try {
    // 🔴 STEP 1: FETCH ALL MEMOS
    const checkRes = await fetch(`/api/memo?transport=${transportSlug}`);
    const allMemos = await checkRes.json();

    // 🔴 STEP 2: CHECK DUPLICATE
    const isDuplicate = allMemos.some(
      (m) =>
        String(m.memoNo).trim() === String(formData.memoNo).trim() &&
        m._id !== formData._id // allow same record in edit mode
    );

    if (isDuplicate) {
      alert(`Memo No "${formData.memoNo}" already exists!`);
      return false;
    }

    // ✅ CONTINUE SAVE
    const payload = { 
      ...formData, 
      lrList, 
      transportSlug: transportSlug || actualTransport?.slug
    };

    if (!payload._id) {
      delete payload._id;
    }

    const numFields = ['kMiter','toWt','hire','advanced','toPay','paid','hamali','memoFreight'];
    numFields.forEach(field => {
      if (payload[field] === "") payload[field] = 0;
    });

    const method = isEditMode ? "PUT" : "POST";

    const res = await fetch("/api/memo", {
      method,
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      alert(err.error || "Failed to save!");
      return;
    }

    if (onSaveSuccess) onSaveSuccess();
    savedStateRef.current = JSON.parse(JSON.stringify({ formData, lrList }));
    setIsSaved(true);
    if (closeAfterSave) onClose();
    return true;

  } catch (error) {
    alert("Network Error: " + error.message);
    return false;
  }
};

  const citySummary = lrList.reduce((acc, lr) => {
    const city = lr.toCity || "Unknown";
    if (!acc[city]) acc[city] = { city, weight: 0, article: 0, freight: 0 };
    acc[city].weight += Number(lr.weight) || 0;
    acc[city].article += Number(lr.article) || 0;
    acc[city].freight += Number(lr.freight) || 0;
    return acc;
  }, {});
  const summaryData = Object.values(citySummary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[95vw] h-[95vh] flex flex-col shadow-xl border border-gray-400 text-xs">
        
        {/* HEADER */}
        <div className="bg-[#1e73be] text-white px-3 py-1 flex justify-between items-center">
          <h2 className="font-semibold">{isViewMode ? "View Memo Entry" : isEditMode ? "Edit Memo Entry" : "+Add Memo Entry"}</h2>
          <div className="flex gap-2">
            <button className="px-2 py-0.5 bg-white text-blue-600 font-bold border rounded">GO</button>
            <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black">✕</button>
          </div>
        </div>

        {/* BODY - Wrapped in fieldset to disable editing when in View Mode */}
        <fieldset disabled={isViewMode} className={`flex-1 overflow-y-auto p-2 bg-[#f0f4f8] ${isViewMode ? 'opacity-90' : ''}`}>
          <div className="grid grid-cols-6 gap-2 mb-2">
            
            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-1 w-full"/></div>
            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Memo No</label><input type="text" name="memoNo" value={formData.memoNo} onChange={handleChange} className="border p-1 w-full bg-white"/></div>
            
            <div className="col-span-1 flex flex-col">
              <ComboBox label="To Branch" value={formData.toBranch} options={localBranches} onChange={(val) => setFormData({ ...formData, toBranch: val })} onAdd={() => openActionModal("To Branch", "add")} onEdit={(val) => openActionModal("To Branch", "edit", val)} />
            </div>
            
            <div className="col-span-1 flex flex-col">
              <ComboBox label="Vehicle" value={formData.vehicle} options={vehicles} onChange={(val) => setFormData({ ...formData, vehicle: val })} onAdd={() => openActionModal("Vehicle", "add")} onEdit={(val) => openActionModal("Vehicle", "edit", val)} />
            </div>
            
            <div className="col-span-2 flex flex-col">
              <ComboBox label="Driver" value={formData.driver} options={drivers} onChange={(val) => setFormData({ ...formData, driver: val })} onAdd={() => openActionModal("Driver", "add")} onEdit={(val) => openActionModal("Driver", "edit", val)} />
            </div>

            {/* Row 2 */}
           <div className="col-span-2 flex flex-col">
              <ComboBox 
                label="To City" value={formData.toCity} options={localCities} onChange={(val) => setFormData({ ...formData, toCity: val })} 
                onAdd={() => setIsCityMasterModalOpen(true)} onEdit={() => setIsCityMasterModalOpen(true)} 
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="text-gray-600 mb-0.5">K. Miter</label>
              <input 
                type="text" name="kMiter" value={formData.kMiter} 
                onChange={(e) => setFormData((prev) => ({ ...prev, kMiter: e.target.value.replace(/[^0-9.]/g, "") }))} 
                className="border p-1 w-full" placeholder="0.00"
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="text-gray-600 mb-0.5">To WT</label>
              <input 
                type="text" name="toWt" value={formData.toWt} 
                onChange={(e) => setFormData((prev) => ({ ...prev, toWt: e.target.value.replace(/[^0-9.]/g, "") }))} 
                className="border p-1 w-full" placeholder="0.00"
              />
            </div>

            {/* Row 3 */}
            <div className="col-span-2 flex flex-col">
              <ComboBox label="Agent" value={formData.agent} options={agents} onChange={(val) => setFormData({ ...formData, agent: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Agent" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Agent", oldVal: val })} />
            </div>

            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Hire</label><input type="number" name="hire" value={formData.hire} onChange={handleChange} className="border p-1 w-full"/></div>
            
            <div className="col-span-1 flex flex-col">
              <ComboBox 
                label="Cash/Bank" value={formData.cashBank} options={cashBanks} 
                onChange={(val) => setFormData({ ...formData, cashBank: val })} 
                onAdd={() => setIsCashBankModalOpen(true)} onEdit={() => alert("Edit Cash/Bank pending")} 
              />
            </div>
            
            <div className="col-span-2 flex flex-col">
              <label className="text-gray-600 mb-0.5">Advanced</label>
              <input
                type="text" name="advanced" value={formData.advanced}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setFormData(prev => ({ ...prev, advanced: val }));
                  recalcFinancials(lrList, val);
                }}
                className="border p-1 w-full bg-white" placeholder="0.00"
              />
            </div>

            {/* Row 4 */}
            <div className="col-span-1 flex flex-col">
               <ComboBox label="Center" value={formData.center} options={centerList} onChange={(val) => setFormData({ ...formData, center: val })} onAdd={() => setIsCenterModalOpen(true)} onEdit={() => alert("Edit pending")} />
            </div>
            <div className="col-span-3 flex flex-col">
              <label className="text-gray-600 mb-0.5">Add Lr</label>
              <div className="flex gap-1">
                <input value={lrInput} onChange={(e) => setLrInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddLr()} className="border p-1 flex-1" placeholder="Enter LR Number" />
                <button type="button" onClick={handleAddLr} className="bg-[#1e73be] text-white px-3 py-1 rounded hover:bg-blue-700">Add Lr</button>
                <button type="button" onClick={() => setIsAutoAddModalOpen(true)} className="bg-[#1e73be] text-white px-3 py-1 rounded hover:bg-blue-700">Auto Add Lr</button>
              </div>
            </div>
            <div className="col-span-2 flex flex-col">
              <label className="text-gray-600 mb-0.5">
                Crossing
                {formData.crossing === "Yes" && (
                  <span className="ml-2 text-blue-700 font-semibold">
                    (₹ {lrList.reduce((sum, lr) => sum + (Number(lr.crossing) || 0), 0).toFixed(2)})
                  </span>
                )}
              </label>
              <select
                name="crossing"
                value={formData.crossing}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, crossing: val }));
                  recalcFinancials(lrList, null, val);
                }}
                className="border p-1 w-full bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* MAIN LR TABLE */}
          <div className="border bg-white mb-2 h-40 overflow-y-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-1 border-r">Lr No</th>
                  <th className="p-1 border-r">Cross Date</th><th className="p-1 border-r">Packaging</th>
                  <th className="p-1 border-r">Description</th><th className="p-1 border-r">Article</th>
                  <th className="p-1 border-r">FreightBy</th><th className="p-1 border-r">From City</th>
                  <th className="p-1 border-r">To City</th><th className="p-1 border-r">Consignor</th><th className="p-1 border-r">Consignee</th>
                  <th className="p-1"></th>
                </tr>
              </thead>
              <tbody>
                {lrList.length === 0 ? (
                  <tr><td colSpan={11} className="p-4 text-center text-gray-400">No records available</td></tr>
                ) : (
                  lrList.flatMap((lr, lrIndex) => {
                    // Expand each LR into per-goods rows; fall back to legacy single-row for old records
                    const goodsRows = (lr.goods || []).filter(g => g.article || g.packaging || g.goodsContain);
                    const rows = goodsRows.length > 0
                      ? goodsRows
                      : [{ article: lr.article, packaging: lr.packaging, goodsContain: lr.description }];

                    return rows.map((g, gIdx) => {
                      const isFirst = gIdx === 0;
                      return (
                        <tr
                          key={`${lr.lrNo || lrIndex}-${gIdx}`}
                          className={`border-t ${isFirst ? "hover:bg-red-50 group" : "bg-gray-50/40"}`}
                        >
                          <td className="p-1 border-r font-semibold text-blue-600">{isFirst ? lr.lrNo : ""}</td>
                          <td className="p-1 border-r text-gray-500">{isFirst ? lr.crossDate : ""}</td>
                          <td className="p-1 border-r">{g.packaging || "-"}</td>
                          <td className="p-1 border-r">{g.goodsContain || g.description || "-"}</td>
                          <td className="p-1 border-r text-center">{g.article || 0}</td>
                          <td className="p-1 border-r">{isFirst ? lr.freightBy : ""}</td>
                          <td className="p-1 border-r">{isFirst ? lr.fromCity : ""}</td>
                          <td className="p-1 border-r">{isFirst ? lr.toCity : ""}</td>
                          <td className="p-1 border-r">{isFirst ? lr.consignor : ""}</td>
                          <td className="p-1 border-r">{isFirst ? lr.consignee : ""}</td>
                          <td className="p-1 text-center">
                            {isFirst && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLr(lrIndex)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Remove LR"
                              >
                                <X size={14} strokeWidth={2.5} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border bg-white h-32 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-200 sticky top-0">
                  <tr><th className="p-1 border-r">City</th><th className="p-1 border-r">Weight</th><th className="p-1 border-r">Article</th><th className="p-1">Freight</th></tr>
                </thead>
                <tbody>
                  {summaryData.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No records available.</td></tr>
                  ) : (
                    summaryData.map((data, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-1 border-r">{data.city}</td><td className="p-1 border-r">{data.weight}</td>
                        <td className="p-1 border-r">{data.article}</td><td className="p-1">{data.freight}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between items-center">
                <label>To Pay :</label>
                <input 
                  type="text" name="toPay" value={formData.toPay} 
                  onChange={(e) => setFormData(prev => ({ ...prev, toPay: e.target.value.replace(/[^0-9.]/g, "") }))} 
                  className="border p-1 w-24 bg-gray-100" placeholder="0.00"
                />
              </div>
              <div className="row-span-4 flex flex-col">
                <label>Narration</label>
                <textarea 
                  name="narration" value={formData.narration} onChange={handleChange} 
                  className="border p-1 flex-1 resize-none" placeholder="Enter Narration..."
                ></textarea>
              </div>
              <div className="flex justify-between items-center">
                <label>Paid :</label>
                <input
                  type="text" name="paid" value={formData.paid}
                  onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.value.replace(/[^0-9.]/g, "") }))}
                  className="border p-1 w-24 bg-gray-100" placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <label>Hamali :</label>
                <input
                  type="text" name="hamali" value={formData.hamali}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData(prev => {
                      const crossingTotal = prev.crossing === "Yes"
                        ? lrList.reduce((sum, lr) => sum + (Number(lr.crossing) || 0), 0)
                        : 0;
                      const paidFreightTotal = lrList.reduce((sum, lr) =>
                        (lr.freightBy || "").trim().toLowerCase() === "paid"
                          ? sum + (Number(lr.freight) || 0) : sum, 0);
                      const netPaid = Math.max(0, paidFreightTotal - (Number(prev.advanced) || 0) - crossingTotal - (Number(val) || 0));
                      return { ...prev, hamali: val, paid: netPaid.toFixed(2) };
                    });
                  }}
                  className="border p-1 w-24 bg-gray-100" placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* FOOTER TOTALS */}
        <div className="bg-[#e2e8f0] px-3 py-1 flex justify-between border-t font-semibold items-center">
          <span>Total Lr : {lrList.length}</span>
          <span>Total Article : {lrList.reduce((acc, curr) => acc + (Number(curr.article) || 0), 0)}</span>
          
          <span>Total Ac. Weight : {lrList.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)}</span>
          <span>Total Weight : {lrList.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)}</span>
          
          <div className="flex items-center gap-2">
            <span>Memo Freight :</span>
            <input 
              type="text" name="memoFreight" value={formData.memoFreight} disabled={isViewMode}
              onChange={(e) => setFormData(prev => ({ ...prev, memoFreight: e.target.value.replace(/[^0-9.]/g, "") }))} 
              className="border p-1 w-24 bg-white text-right" placeholder="0.00"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#f0f4f8] px-3 py-2 flex justify-end border-t items-center gap-2">
          {!isViewMode && (
            <>
              <button onClick={handleSaveAndPrint} className="bg-[#1e73be] text-white px-4 py-1 rounded">Save & Print (F3)</button>
              <button onClick={() => handleSave(false)} disabled={isSaved} className="bg-[#1e73be] text-white px-4 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed">{isSaved ? "Saved" : "Save (F4)"}</button>
            </>
          )}
          <button onClick={onClose} className="bg-gray-600 text-white px-4 py-1 rounded flex items-center gap-1">
            ✕ {isViewMode ? "Close" : "Cancel (ESC)"}
          </button>
        </div>
      </div>

      {/* --- ALL NESTED MODALS BELOW --- */}
      {isCashBankModalOpen && (
        <CashBankMasterModal 
          onClose={() => setIsCashBankModalOpen(false)}
          onSave={(newCbName) => {
            setCashBanks(prev => [...new Set([...prev, newCbName])]);
            setFormData(prev => ({ ...prev, cashBank: newCbName }));
            setIsCashBankModalOpen(false);
          }}
        />
      )}

      {isCityMasterModalOpen && (
        <CityMasterModal 
          isOpen={isCityMasterModalOpen} 
          onClose={() => setIsCityMasterModalOpen(false)} 
          onSave={(newCityName) => {
            if (newCityName) {
              setLocalCities(prev => [...new Set([...prev, newCityName])]); 
              setFormData(prev => ({ ...prev, toCity: newCityName }));
            }
            setIsCityMasterModalOpen(false);
          }} 
        />
      )}

      {isAutoAddModalOpen && (
  <AutoAddLrModal
    transportSlug={transportSlug}
    currentMemoId={formData._id}
    alreadyAddedLrNos={lrList.map(lr => String(lr.lrNo).toLowerCase())}
    onClose={() => setIsAutoAddModalOpen(false)}
    onSelect={(selectedLrs) => {
      const newLrList = [...lrList, ...selectedLrs];
      setLrList(newLrList);
      recalcFinancials(newLrList);
      setIsAutoAddModalOpen(false);
    }}
  />
)}

      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded shadow-2xl w-80 overflow-hidden border border-gray-400">
            <div className="bg-[#1e73be] text-white px-3 py-1.5 font-semibold text-sm flex justify-between">
              <span>{actionModal.type} Master - [{actionModal.mode === "add" ? "Add" : "Edit"}]</span>
              <button onClick={() => setActionModal({ isOpen: false })} className="hover:text-red-300">✕</button>
            </div>
            <div className="p-4">
              <label className="block text-gray-700 font-medium mb-1 text-xs">
                {actionModal.type} Name/No <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus type="text" className="w-full border border-blue-400 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                value={actionInput} onChange={(e) => setActionInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleActionModalSave()}
              />
              <div className="flex justify-end gap-2 text-xs">
                <button onClick={() => setActionModal({ isOpen: false })} className="px-4 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                <button onClick={handleActionModalSave} className="px-4 py-1.5 bg-[#5ca0d3] text-white rounded hover:bg-blue-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accountModal.isOpen && (
        <InlineAccountModal 
          isOpen={accountModal.isOpen} 
          type={accountModal.type}
          onClose={() => setAccountModal({ isOpen: false, type: "" })} 
          onSave={(newAccountName) => {
            if (newAccountName) {
               if (accountModal.type === "Agent") {
                  setAgents((prev) => [...prev, newAccountName]);
                  setFormData(prev => ({ ...prev, agent: newAccountName }));
               } else if (accountModal.type === "Consignee") {
                  setAccountList((prev) => [...prev, newAccountName]);
                  setFormData(prev => ({ ...prev, consignee: newAccountName }));
               } else if (accountModal.type === "Consignor") {
                  setAccountList((prev) => [...prev, newAccountName]);
                  setFormData(prev => ({ ...prev, consignor: newAccountName }));
               }
            }
            setAccountModal({ isOpen: false, type: "" });
          }}
        />
      )}

      <CenterMasterModal 
        isOpen={isCenterModalOpen} onClose={() => setIsCenterModalOpen(false)}
        onSave={(newCenterName) => {
          if(newCenterName) {
             setCenterList(prev => [...prev, newCenterName]);
             setFormData(prev => ({...prev, center: newCenterName}));
          }
          setIsCenterModalOpen(false);
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------------------------------
// MODAL COMPONENTS DEFINITIONS BELOW
// --------------------------------------------------------------------------------------

function CashBankMasterModal({ onClose, onSave }) {
  const [cbData, setCbData] = useState({ name: "", city: "", gstNo: "" });

  const handleSave = async (closeAfter = true) => {
    if (!cbData.name.trim()) return alert("Cash/Bank Name is required");
    try {
      const res = await fetch("/api/cash-bank", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cbData)
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save Account");
      
      if (closeAfter) onSave(cbData.name);
      else { alert("Account saved successfully!"); setCbData({ name: "", city: "", gstNo: "" }); }
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center font-semibold">
          <h3 className="text-sm">+ Add Cash/Bank</h3>
          <button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded text-sm">✕</button>
        </div>
        <div className="p-5 bg-[#f0f8ff] space-y-4">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Cash/Bank <span className="text-red-500">*</span></label>
            <input type="text" autoFocus value={cbData.name} onChange={(e) => setCbData({...cbData, name: e.target.value})} className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">City</label>
            <input type="text" value={cbData.city} onChange={(e) => setCbData({...cbData, city: e.target.value})} className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">GSTNO</label>
            <input 
              type="text" 
              value={cbData.gstNo} 
              onChange={(e) => setCbData({...cbData, gstNo: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 15)})} 
              className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
        </div>
        <div className="bg-[#b3d8f3] p-3 flex justify-center gap-2 border-t border-blue-300">
          <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save (F3)</button>
          <button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close (F4)</button>
          <button onClick={onClose} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel (Esc)</button>
        </div>
      </div>
    </div>
  );
}

function CityMasterModal({ isOpen, onClose, onSave }) {
  const [cityData, setCityData] = useState({ city: "", district: "", state: "", stdCode: "", zone: "", cityCode: "", pinCode: "", extraDetail: "" });
  if (!isOpen) return null;
  const handleChange = (e) => setCityData({ ...cityData, [e.target.name]: e.target.value });

  const handleSave = async (closeAfter = true) => {
    if (!cityData.city.trim()) return alert("City name is required");
    try {
      const res = await fetch("/api/cities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cityData) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save city");
      if (closeAfter) onSave(cityData.city);
      else { alert("City saved successfully!"); setCityData({ city: "", district: "", state: "", stdCode: "", zone: "", cityCode: "", pinCode: "", extraDetail: "" }); }
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-[500px] border border-blue-400 overflow-hidden text-xs">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 font-semibold flex justify-between items-center">
          <span>+ Add City Master</span>
          <div className="flex gap-2">
            <button className="hover:text-gray-200">➕</button><button className="hover:text-gray-200">🔍</button><button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded">✕</button>
          </div>
        </div>
        <div className="p-4 bg-[#f0f8ff]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">City <span className="text-red-500">*</span></label><input autoFocus type="text" name="city" value={cityData.city} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"/></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">District</label><select name="district" value={cityData.district} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"><option value=""></option><option value="Ahmedabad">Ahmedabad</option><option value="Surat">Surat</option></select></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">State</label><select name="state" value={cityData.state} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"><option value=""></option><option value="Gujarat">Gujarat</option><option value="Maharashtra">Maharashtra</option></select></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">STD Code</label><input type="text" name="stdCode" value={cityData.stdCode} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"/></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Zone</label><select name="zone" value={cityData.zone} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"><option value=""></option><option value="North">North</option><option value="South">South</option></select></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">City Code</label><input type="text" name="cityCode" value={cityData.cityCode} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"/></div>
            <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Pin Code</label><input type="text" name="pinCode" value={cityData.pinCode} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"/></div>
            <div className="col-span-2 flex flex-col mt-2"><label className="text-gray-600 mb-0.5">Extra Detail</label><input type="text" name="extraDetail" value={cityData.extraDetail} onChange={handleChange} className="border border-blue-300 rounded p-1.5 w-full bg-white outline-none focus:border-blue-500"/></div>
          </div>
        </div>
        <div className="bg-[#b3d8f3] p-2 flex justify-center gap-2 border-t border-blue-300">
          <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save</button><button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close</button><button onClick={onClose} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function InlineAccountModal({ isOpen, onClose, type, onSave }) {
  const [accData, setAccData] = useState({
    name: "", codeAlias: "", acGroup: "Sundry Creditors (A/cs Payble)", regType: "Regular", transport: "", acType: "Transporter", gstByTrans: "No", address1: "", address2: "", address3: "", city: "", state: "GUJARAT", area: "", pin: "", phoneO: "", mobile: "", email: "", gstNo: "", panNo: "", adharNo: "", acNo: "", msmeNo: "", msmeType: "", creditLimit: 0, creditDays: 0, balanceMethod: "Balance Only", openingBalance: 0, crDb: "Cr", type: type
  });
  const [groupOptions, setGroupOptions] = useState(["Sundry Creditors (A/cs Payble)", "Sundry Debtors"]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState(["GUJARAT", "MAHARASHTRA"]);
  const [areaOptions, setAreaOptions] = useState([]);

  const [isGroupMasterModalOpen, setIsGroupMasterModalOpen] = useState(false);
  const [isTransportMasterModalOpen, setIsTransportMasterModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/account-groups").then(res => res.json()).then(data => { if(Array.isArray(data)) setGroupOptions([...new Set([...groupOptions, ...data.map(g => g.groupName)])]); }).catch(err => console.error(err));
    fetch("/api/transports").then(res => res.json()).then(data => { if(Array.isArray(data)) setTransportOptions(data.map(t => t.name)); }).catch(err => console.error(err));
    fetch("/api/cities").then(res => res.json()).then(data => { if(Array.isArray(data)) setCityOptions(data.map(c => c.city)); }).catch(err => console.error(err));
    fetch("/api/states").then(res => res.json()).then(data => { if(Array.isArray(data)) setStateOptions([...new Set([...stateOptions, ...data.map(s => s.name)])]); }).catch(err => console.error(err));
    fetch("/api/areas").then(res => res.json()).then(data => { if(Array.isArray(data)) setAreaOptions(data.map(a => a.areaName)); }).catch(err => console.error(err));
  }, []);

  if (!isOpen) return null;
  const handleChange = (e) => setAccData({ ...accData, [e.target.name]: e.target.value });

  const handleSave = async (closeAfter = true) => {
    if (!accData.name.trim()) return alert("Account Name is required!");
    try {
      const res = await fetch("/api/client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(accData) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save Account");
      if (closeAfter) onSave(accData.name);
      else { alert("Account saved successfully!"); setAccData({ ...accData, name: "", codeAlias: "", gstNo: "" }); }
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-5xl flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm">
          <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center">
            <h2 className="font-semibold text-sm">+ Add Account</h2>
            <div className="flex gap-2"><button className="hover:bg-blue-700 px-1.5 rounded">📄</button><button className="hover:bg-blue-700 px-1.5 rounded">🔍</button><button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black font-bold">✕</button></div>
          </div>
          <div className="flex-1 p-4 bg-[#f0f4f8] overflow-y-auto max-h-[75vh]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border border-gray-300 p-2 rounded bg-white relative mt-2">
                <label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Account Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={accData.name} onChange={handleChange} autoFocus className="w-full p-1 outline-none text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Code/Alias</label><input type="text" name="codeAlias" value={accData.codeAlias} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col">
                    <ComboBox label="A/C Group" value={accData.acGroup} options={groupOptions} onChange={(val) => setAccData({ ...accData, acGroup: val })} onAdd={() => setIsGroupMasterModalOpen(true)} onEdit={() => alert(`Edit Group not implemented`)} />
                  </div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Reg Type</label><select name="regType" value={accData.regType} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"><option>Regular</option><option>Composition</option><option>UnRegistered</option><option>Consumer</option></select></div>
                  <div className="flex flex-col">
                    <ComboBox label="Transport" value={accData.transport} options={transportOptions} onChange={(val) => setAccData({ ...accData, transport: val })} onAdd={() => setIsTransportMasterModalOpen(true)} onEdit={() => alert(`Edit Transport not implemented`)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-gray-600 mb-0.5">A/C Type</label>
                      <select name="acType" value={accData.acType} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"><option>All</option><option>Party</option><option>Transporter</option><option>Driver</option><option>Truck</option><option>Broker</option><option>Consignee</option><option>Consignor</option><option>TBB</option><option>Delivery Agent</option><option>All & Transporter</option></select>
                    </div>
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">GST By Trans.</label><select name="gstByTrans" value={accData.gstByTrans} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"><option>No</option><option>Yes</option><option>Exempt</option></select></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Address</label><input type="text" name="address1" value={accData.address1} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" name="address2" value={accData.address2} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" name="address3" value={accData.address3} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex gap-2">
                    <div className="flex flex-col flex-1"><ComboBox label="City" value={accData.city} options={cityOptions} onChange={(val) => setAccData({ ...accData, city: val })} onAdd={() => setIsCityModalOpen(true)} onEdit={() => setIsCityModalOpen(true)} /></div>
                    <div className="flex flex-col flex-1"><ComboBox label="State" value={accData.state} options={stateOptions} onChange={(val) => setAccData({ ...accData, state: val })} onAdd={() => setIsStateModalOpen(true)} onEdit={() => alert("Edit State not implemented")} /></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col flex-1"><ComboBox label="Area" value={accData.area} options={areaOptions} onChange={(val) => setAccData({ ...accData, area: val })} onAdd={() => setIsAreaModalOpen(true)} onEdit={() => alert("Edit Area not implemented")} /></div>
                    <div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Pin</label><input type="text" name="pin" value={accData.pin} onChange={(e) => setAccData({ ...accData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  </div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Phone(O)</label><input type="text" name="phoneO" value={accData.phoneO} onChange={(e) => setAccData({ ...accData, phoneO: e.target.value.replace(/[^0-9\s-]/g, '') })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Mobile</label><input type="text" name="mobile" value={accData.mobile} onChange={(e) => setAccData({ ...accData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Email</label><input type="email" name="email" value={accData.email} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">GSTNO</label><input type="text" name="gstNo" value={accData.gstNo} onChange={(e) => setAccData({ ...accData, gstNo: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 15) })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">PAN NO</label><input type="text" name="panNo" value={accData.panNo} onChange={(e) => setAccData({ ...accData, panNo: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10) })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">ADHAR NO</label><input type="text" name="adharNo" value={accData.adharNo} onChange={(e) => setAccData({ ...accData, adharNo: e.target.value.replace(/\D/g, '').slice(0, 12) })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C NO.</label><input type="text" name="acNo" value={accData.acNo} onChange={(e) => setAccData({ ...accData, acNo: e.target.value.replace(/\D/g, '') })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">MSME NO</label><input type="text" name="msmeNo" value={accData.msmeNo} onChange={(e) => setAccData({ ...accData, msmeNo: e.target.value.toUpperCase() })} className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Type</label><select name="msmeType" value={accData.msmeType} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"><option></option><option>Micro</option></select></div></div>
                  <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Limit</label><input type="number" name="creditLimit" value={accData.creditLimit} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Days</label><input type="number" name="creditDays" value={accData.creditDays} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"/></div></div>
                  <div className="border border-gray-300 rounded p-2 bg-white mt-1 relative"><label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Balance</label><div className="flex flex-col gap-2 mt-1"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Balance Method</label><select name="balanceMethod" value={accData.balanceMethod} onChange={handleChange} className="border border-gray-300 rounded p-1 w-full bg-gray-100"><option>Balance Only</option></select></div><div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Opening Balance</label><input type="number" name="openingBalance" value={accData.openingBalance} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white text-right"/></div><div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Cr/Db.</label><select name="crDb" value={accData.crDb} onChange={handleChange} className="border border-blue-300 rounded p-1 w-full bg-white"><option>Cr</option><option>Db</option></select></div></div></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#e2e8f0] px-3 py-2 flex justify-between border-t items-center">
            <button className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium">{type}</button>
            <div className="flex gap-2">
              <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save (F3)</button>
              <button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save & Close (F4)</button>
              <button onClick={onClose} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Cancel (Esc)</button>
            </div>
          </div>
        </div>
      </div>

      {isGroupMasterModalOpen && <GroupMasterModal onClose={() => setIsGroupMasterModalOpen(false)} onSave={(newGroupName) => { setGroupOptions(prev => [...new Set([...prev, newGroupName])]); setAccData(prev => ({ ...prev, acGroup: newGroupName })); setIsGroupMasterModalOpen(false); }} />}
      {isTransportMasterModalOpen && <TransportMasterModal onClose={() => setIsTransportMasterModalOpen(false)} onSave={(newTransportName) => { setTransportOptions(prev => [...new Set([...prev, newTransportName])]); setAccData(prev => ({ ...prev, transport: newTransportName })); setIsTransportMasterModalOpen(false); }} />}
      {isCityModalOpen && <CityMasterModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} onSave={(newCityName) => { if (newCityName) { setCityOptions(prev => [...new Set([...prev, newCityName])]); setAccData(prev => ({ ...prev, city: newCityName })); } setIsCityModalOpen(false); }} />}
      {isStateModalOpen && <StateMasterModal onClose={() => setIsStateModalOpen(false)} onSave={(newStateName) => { setStateOptions(prev => [...new Set([...prev, newStateName])]); setAccData(prev => ({ ...prev, state: newStateName })); setIsStateModalOpen(false); }} />}
      {isAreaModalOpen && <AreaMasterModal cityOptions={cityOptions} onAddCity={() => setIsCityModalOpen(true)} onClose={() => setIsAreaModalOpen(false)} onSave={(newAreaName) => { setAreaOptions(prev => [...new Set([...prev, newAreaName])]); setAccData(prev => ({ ...prev, area: newAreaName })); setIsAreaModalOpen(false); }} />}
    </>
  );
}

function GroupMasterModal({ onClose, onSave }) {
  const [groupData, setGroupData] = useState({ groupName: "", groupUnder: "", orderNo: "" });
  const handleSave = async (closeAfter = true) => {
    if (!groupData.groupName.trim()) return alert("Group Name is required");
    try {
      const res = await fetch("/api/account-groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(groupData) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save group");
      if (closeAfter) onSave(groupData.groupName);
      else { alert("Group saved successfully!"); setGroupData({ groupName: "", groupUnder: "", orderNo: "" }); }
    } catch (err) { alert(err.message); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center font-semibold">
          <h3 className="text-sm">+ Add A/c Group</h3>
          <div className="flex gap-2"><button className="hover:text-gray-200 bg-blue-600 px-1 rounded">➕</button><button className="hover:text-gray-200 bg-blue-600 px-1 rounded">🔍</button><button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded text-sm">✕</button></div>
        </div>
        <div className="p-5 bg-[#f0f8ff] space-y-4">
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Group Name <span className="text-red-500">*</span></label><input type="text" autoFocus value={groupData.groupName} onChange={(e) => setGroupData({...groupData, groupName: e.target.value})} className="border border-blue-400 rounded p-1.5 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Group Under</label><select value={groupData.groupUnder} onChange={(e) => setGroupData({...groupData, groupUnder: e.target.value})} className="border border-blue-400 rounded p-1.5 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500"><option value=""></option><option value="Balance Sheet">Balance Sheet</option><option value="Profit & Loss">Profit & Loss</option><option value="Trading A/C">Trading A/C</option></select></div>
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Order No</label><input type="text" value={groupData.orderNo} onChange={(e) => setGroupData({...groupData, orderNo: e.target.value})} className="border border-blue-400 rounded p-1.5 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
        </div>
        <div className="bg-[#b3d8f3] p-3 flex justify-between border-t border-blue-300">
          <button className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Validation</button>
          <div className="flex gap-2"><button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save</button><button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close</button><button onClick={onClose} className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel</button></div>
        </div>
      </div>
    </div>
  );
}

function TransportMasterModal({ onClose, onSave }) {
  const [transportName, setTransportName] = useState("");
  const handleSave = async (closeAfter = true) => {
    if (!transportName.trim()) return alert("Transport Name is required");
    try {
      const res = await fetch("/api/transports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: transportName, locations: [{ name: "Main Office", address: "" }] }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save transport");
      if (closeAfter) onSave(transportName);
      else { alert("Transport saved successfully!"); setTransportName(""); }
    } catch (err) { alert(err.message); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center font-semibold">
          <h3 className="text-sm">+ Add Transport</h3>
          <button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded text-sm">✕</button>
        </div>
        <div className="p-5 bg-[#f0f8ff] space-y-4">
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Transport Name <span className="text-red-500">*</span></label><input type="text" autoFocus value={transportName} onChange={(e) => setTransportName(e.target.value)} className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter Transport Name" /></div>
        </div>
        <div className="bg-[#b3d8f3] p-3 flex justify-center gap-2 border-t border-blue-300">
          <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save</button><button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close</button><button onClick={onClose} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function StateMasterModal({ onClose, onSave }) {
  const [stateName, setStateName] = useState("");
  const handleSave = async (closeAfter = true) => {
    if (!stateName.trim()) return alert("State Name is required");
    try {
      const res = await fetch("/api/states", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: stateName }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save state");
      if (closeAfter) onSave(stateName);
      else { alert("State saved successfully!"); setStateName(""); }
    } catch (err) { alert(err.message); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center font-semibold">
          <h3 className="text-sm">+ Add State Master</h3>
          <button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded text-sm">✕</button>
        </div>
        <div className="p-5 bg-[#f0f8ff] space-y-4">
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">State Name <span className="text-red-500">*</span></label><input type="text" autoFocus value={stateName} onChange={(e) => setStateName(e.target.value)} className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
        </div>
        <div className="bg-[#b3d8f3] p-3 flex justify-center gap-2 border-t border-blue-300">
          <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save (F3)</button><button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close (F4)</button><button onClick={onClose} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel (Esc)</button>
        </div>
      </div>
    </div>
  );
}

function AreaMasterModal({ onClose, onSave, cityOptions, onAddCity }) {
  const [areaData, setAreaData] = useState({ areaName: "", city: "" });
  const handleSave = async (closeAfter = true) => {
    if (!areaData.areaName.trim()) return alert("Area Name is required");
    try {
      const res = await fetch("/api/areas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(areaData) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save area");
      if (closeAfter) onSave(areaData.areaName);
      else { alert("Area saved successfully!"); setAreaData({ areaName: "", city: "" }); }
    } catch (err) { alert(err.message); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm overflow-hidden">
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center font-semibold">
          <h3 className="text-sm">+ Add Area Master</h3>
          <div className="flex gap-2"><button className="hover:text-gray-200 bg-blue-600 px-1 rounded">➕</button><button className="hover:text-gray-200 bg-blue-600 px-1 rounded">🔍</button><button onClick={onClose} className="hover:text-red-300 font-bold bg-red-600 px-1.5 rounded text-sm">✕</button></div>
        </div>
        <div className="p-5 bg-[#f0f8ff] space-y-4">
          <div className="flex flex-col"><label className="text-gray-700 font-medium mb-1">Area <span className="text-red-500">*</span></label><input type="text" autoFocus value={areaData.areaName} onChange={(e) => setAreaData({...areaData, areaName: e.target.value})} className="border border-blue-400 rounded p-2 w-full bg-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="flex flex-col"><ComboBox label="City" value={areaData.city} options={cityOptions} onChange={(val) => setAreaData({...areaData, city: val})} onAdd={onAddCity} onEdit={() => alert("Edit City not implemented")} /></div>
        </div>
        <div className="bg-[#b3d8f3] p-3 flex justify-center gap-2 border-t border-blue-300">
          <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save (F3)</button><button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Save & Close (F4)</button><button onClick={onClose} className="bg-[#1e73be] text-white px-5 py-1.5 rounded font-medium shadow hover:bg-blue-700">Cancel (Esc)</button>
        </div>
      </div>
    </div>
  );
}
function AutoAddLrModal({ transportSlug, currentMemoId, alreadyAddedLrNos, onClose, onSelect }) {
  const [allLrs, setAllLrs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLrs = async (from = "", to = "") => {
    setLoading(true);
    try {
      let lrUrl = `/api/lr?transport=${transportSlug}`;
      if (from && to) lrUrl += `&from=${from}&to=${to}`;
      else lrUrl += `&all=true`;

      // Fetch LRs and all memos in parallel
      const [lrRes, memoRes] = await Promise.all([
        fetch(lrUrl),
        fetch(`/api/memo?transport=${transportSlug}`)
      ]);

      if (!lrRes.ok) throw new Error("Failed to fetch LRs");
      const lrData = await lrRes.json();
      const memoData = memoRes.ok ? await memoRes.json() : [];

      // Build set of LR nos already used in OTHER memos (not the one being edited)
      const memoedLrNos = new Set();
      if (Array.isArray(memoData)) {
        memoData.forEach(memo => {
          if (memo._id === currentMemoId) return; // skip current memo
          (memo.lrList || []).forEach(lr => {
            memoedLrNos.add(String(lr.lrNo).toLowerCase());
          });
        });
      }

      setAllLrs(lrData.filter(lr => {
        const lrNoLower = String(lr.lrNo).toLowerCase();
        return (
          !alreadyAddedLrNos.includes(lrNoLower) &&
          !memoedLrNos.has(lrNoLower)
        );
      }));
    } catch (err) {
      console.error("Failed to fetch LRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLrs(); }, [transportSlug]);

  const filteredLrs = allLrs.filter(lr => {
    if (!debouncedSearch) return true;
    const s = debouncedSearch.toLowerCase();
    return (
      String(lr.lrNo).toLowerCase().includes(s) ||
      (lr.fromCity || "").toLowerCase().includes(s) ||
      (lr.toCity || "").toLowerCase().includes(s) ||
      (lr.consignor || "").toLowerCase().includes(s) ||
      (lr.consignee || "").toLowerCase().includes(s)
    );
  });

  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filteredLrs.length ? [] : filteredLrs.map(lr => lr._id));

  const handleSelect = () => {
    if (selectedIds.length === 0) return alert("Please select at least one LR.");
    const selected = allLrs
      .filter(lr => selectedIds.includes(lr._id))
      .map(lr => ({
        id: lr._id,
        lrNo: lr.lrNo,
        crossDate: lr.lrDate || "",
        packaging: lr.goods?.[0]?.packaging || "-",      // backward compat
        description: lr.goods?.[0]?.goodsContain || "-", // backward compat
        goods: (lr.goods || [])
          .filter(g => Number(g.article) > 0 || g.packaging || g.goodsContain)
          .map(g => ({
            article:      Number(g.article)  || 0,
            packaging:    g.packaging        || "-",
            goodsContain: g.goodsContain     || "-",
            weight:       Number(g.weight)   || 0,
            amount:       Number(g.amount)   || 0,
          })),
        article: lr.goods?.reduce((sum, g) => sum + (Number(g.article) || 0), 0) || 0,
        freightBy: lr.freightBy || "-",
        fromCity: lr.fromCity || "-",
        toCity: lr.toCity || "-",
        consignor: lr.consignor || "-",
        consignee: lr.consignee || "-",
        centerName: lr.center || "-",
        weight: lr.goods?.reduce((sum, g) => sum + (Number(g.weight) || 0), 0) || 0,
        freight: lr.freight || lr.subTotal || 0,
        crossing: Number(lr.crossing) || 0,
        hamali: Number(lr.hamali) || 0,
      }));
    onSelect(selected);
  };

  const allSelected = filteredLrs.length > 0 && selectedIds.length === filteredLrs.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl flex flex-col shadow-2xl rounded-lg overflow-hidden border border-gray-200">

        {/* HEADER */}
        <div className="bg-[#1e73be] text-white px-4 py-2.5 flex justify-between items-center">
          <h3 className="font-semibold text-sm">Select LR(s) to Add</h3>
          <button onClick={onClose} className="hover:bg-blue-700 px-2 py-0.5 rounded text-lg leading-none">✕</button>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-gray-50 flex-wrap">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 px-2 py-1.5 rounded text-xs outline-none focus:border-blue-500 bg-white"
          />
          <span className="text-xs text-gray-400">–</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 px-2 py-1.5 rounded text-xs outline-none focus:border-blue-500 bg-white"
          />
          <button
            onClick={() => fetchLrs(fromDate, toDate)}
            className="bg-[#1e73be] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-700"
          >
            Go
          </button>
          <button
            onClick={() => { setFromDate(""); setToDate(""); fetchLrs("", ""); }}
            className="border border-gray-300 bg-white text-gray-600 px-3 py-1.5 rounded text-xs hover:bg-gray-100"
          >
            Show All
          </button>
          <div className="flex-1 relative ml-1">
            <input
              type="text"
              autoFocus
              placeholder="Search LR No, From City, To City, Consignor, Consignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded text-xs outline-none focus:border-blue-500 w-full bg-white"
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {filteredLrs.length} LR(s)
            {selectedIds.length > 0 && <span className="ml-1 text-blue-600 font-semibold">· {selectedIds.length} selected</span>}
          </span>
        </div>

        {/* TABLE */}
        <div className="overflow-y-auto bg-white" style={{ height: "380px" }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-2.5 w-10 text-center border-r border-gray-200">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                </th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">LR Date</th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">LR No</th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">From City</th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">To City</th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">Consignor</th>
                <th className="p-2.5 border-r border-gray-200 font-semibold text-gray-700">Consignee</th>
                <th className="p-2.5 font-semibold text-gray-700 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">Loading LRs...</td></tr>
              ) : filteredLrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                    No LRs found.{fromDate || toDate ? " Try a different date range or click Show All." : ""}
                  </td>
                </tr>
              ) : (
                filteredLrs.map((lr) => {
                  const isSelected = selectedIds.includes(lr._id);
                  return (
                    <tr
                      key={lr._id}
                      onClick={() => toggleSelect(lr._id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-2.5 text-center border-r border-gray-100" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(lr._id)} className="cursor-pointer" />
                      </td>
                      <td className="p-2.5 border-r border-gray-100 text-gray-500">{lr.lrDate || "-"}</td>
                      <td className="p-2.5 border-r border-gray-100 font-semibold text-[#1e73be]">{lr.lrNo}</td>
                      <td className="p-2.5 border-r border-gray-100 text-gray-700">{lr.fromCity || "-"}</td>
                      <td className="p-2.5 border-r border-gray-100 text-gray-700">{lr.toCity || "-"}</td>
                      <td className="p-2.5 border-r border-gray-100 text-gray-700">{lr.consignor || "-"}</td>
                      <td className="p-2.5 border-r border-gray-100 text-gray-700">{lr.consignee || "-"}</td>
                      <td className="p-2.5 text-right text-gray-700">
                        {lr.goods?.reduce((sum, g) => sum + (Number(g.weight) || 0), 0) || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2.5 border-t bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {selectedIds.length > 0 ? `${selectedIds.length} LR(s) selected` : "Select LRs from the list above"}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-1.5 border border-gray-300 bg-white text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={selectedIds.length === 0}
              className="px-5 py-1.5 bg-[#1e73be] text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add {selectedIds.length > 0 ? `${selectedIds.length} LR(s)` : "Selected"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}