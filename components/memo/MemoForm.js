"use client";
import React, { useState, useEffect } from "react";
import ComboBox from "@/components/ui/ComboBox";
import CenterMasterModal from "@/components/memo/CenterMasterModal"; 

export default function MemoForm({ isOpen, onClose, transport, transportSlug, onSaveSuccess, initialData, mode }) {
  const actualTransport = Array.isArray(transport) ? transport[0] : transport;
  const locations = actualTransport?.locations || []; 
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit"; 

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
    agent: initialData?.agent || "",
    hire: initialData?.hire || "",
    cashBank: initialData?.cashBank || "",
    advanced: initialData?.advanced || "",
    balance: initialData?.balance || "",
    center: initialData?.center || "",
    toPay: initialData?.toPay || "",
    paid: initialData?.paid || "",
    consignee: initialData?.consignee || "",
    consignor: initialData?.consignor || "",
    narration: initialData?.narration || "",
    memoFreight: initialData?.memoFreight || "",
  });

  const [lrList, setLrList] = useState(initialData?.lrList || []);
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

  useEffect(() => {
    if (isOpen && transportSlug) {
      fetch(`/api/memo?transport=${transportSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            // 1. Set the next Memo Number (Only if adding a new memo)
            if (!initialData?.memoNo && !isEditMode) {
              const lastNo = parseInt(data[0].memoNo);
              if (!isNaN(lastNo)) setFormData(prev => ({ ...prev, memoNo: (lastNo + 1).toString() }));
              else setFormData(prev => ({ ...prev, memoNo: "1000" }));
            }

            // 2. EXTRACT ALL PREVIOUSLY USED DATA FROM PAST MEMOS!
            const pastDrivers = data.map(m => m.driver).filter(Boolean);
            const pastCenters = data.map(m => m.center).filter(Boolean);
            const pastVehicles = data.map(m => m.vehicle).filter(Boolean);
            const pastBranches = data.map(m => m.toBranch).filter(Boolean);

            // 3. Add them to your dropdowns (Removes duplicates automatically)
            setDrivers(prev => [...new Set([...prev, ...pastDrivers])]);
            setCenterList(prev => [...new Set([...prev, ...pastCenters])]);
            setVehicles(prev => [...new Set([...prev, ...pastVehicles])]);
            setLocalBranches(prev => [...new Set([...prev, ...pastBranches])]);

          } else {
            if (!initialData?.memoNo && !isEditMode) {
              setFormData(prev => ({ ...prev, memoNo: "1000" }));
            }
          }
        })
        .catch(() => {
          if (!initialData?.memoNo && !isEditMode) {
            setFormData(prev => ({ ...prev, memoNo: "1000" }));
          }
        });
    } else if (isOpen && !initialData?.memoNo && !isEditMode) {
      setFormData(prev => ({ ...prev, memoNo: "1000" }));
    }
  }, [isOpen, initialData, transportSlug, isEditMode]);

  // --- BULLETPROOF DATA FETCHING ---
  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Cities
      fetch("/api/cities").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setLocalCities([...new Set([...locations, ...data.map(c => c.city)])]);
        }).catch(err => console.error(err));

      // 2. Fetch Cash/Bank
      fetch("/api/cash-bank").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCashBanks(data.map(cb => cb.name));
        }).catch(err => console.error(err));

      // 3. Fetch Vehicles
      fetch("/api/vehicles").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setVehicles([...new Set(data.map(v => v.number || v.name))].filter(Boolean));
        }).catch(err => console.error(err));

      // 4. Fetch Drivers (From dedicated Driver DB)
      fetch("/api/drivers").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Checks for name, driverName, or fullName to prevent schema mismatch errors
            const fetchedDrivers = data.map(d => d.name || d.driverName || d.fullName).filter(Boolean);
            setDrivers(prev => [...new Set([...prev, ...fetchedDrivers])]);
          }
        }).catch(err => console.error("Driver fetch error:", err));

      // 5. Fetch Accounts (Agents, Consignors, Consignees, AND Drivers saved as Accounts!)
      fetch("/api/client").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const allClients = data.filter(Boolean);
            const clientNames = [...new Set(allClients.map(c => c.name))].filter(Boolean);
            
            // Find any drivers that were saved via the InlineAccountModal
            const accountDrivers = allClients
              .filter(c => c.acType === "Driver")
              .map(c => c.name)
              .filter(Boolean);

            setAgents(clientNames);
            setAccountList(clientNames);
            
            // Add Account-Master drivers to the Driver dropdown list
            setDrivers(prev => [...new Set([...prev, ...accountDrivers])]);
          }
        }).catch(err => console.error(err));

      // 6. Fetch Centers
      fetch("/api/centers").then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Checks for centerName, name, or center to prevent schema mismatch errors
            const fetchedCenters = data.map(c => c.centerName || c.name || c.center).filter(Boolean);
            setCenterList([...new Set(fetchedCenters)]);
          }
        }).catch(() => console.log("Failed to fetch centers. Ensure /api/centers exists."));
    }
  }, [isOpen, locations]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        if (mode === "add") setLocalBranches([...localBranches, actionInput]);
        else setLocalBranches(localBranches.map((x) => (x === oldVal ? actionInput : x)));
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

  const handleAddLr = () => {
    if (!lrInput.trim()) return;
    const newLrEntry = {
      id: Date.now(), lrNo: lrInput, crossDate: formData.date, packaging: "Box", description: "General Goods",
      article: 5, freightBy: "Road", fromCity: "Ahmedabad", toCity: formData.toCity || "Surat",
      consignor: formData.consignor || "Default Consignor", centerName: formData.center || "Main Center",
      weight: 120, freight: 1500, 
    };
    setLrList((prev) => [...prev, newLrEntry]);
    setLrInput(""); 
  };

  const handleSave = async (closeAfterSave = true) => {
      try {
        const payload = { 
          ...formData, 
          lrList, 
          transportSlug: transportSlug || actualTransport?.slug
        };

        if (!payload._id) {
          delete payload._id;
        }

        const numFields = ['kMiter', 'toWt', 'hire', 'advanced', 'balance', 'toPay', 'paid', 'memoFreight'];
        numFields.forEach(field => {
          if (payload[field] === "") payload[field] = 0;
        });
        
        const method = isEditMode ? "PUT" : "POST";

        const res = await fetch("/api/memo", {
          method: method, 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) return alert(`Failed to save! Server responded with: ${res.status}\n${await res.text()}`);
        if (onSaveSuccess) onSaveSuccess(); 
        if (closeAfterSave) onClose(); 
      } catch (error) { alert("Network Error: " + error.message); }
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
                onChange={(e) => setFormData(prev => ({ ...prev, advanced: e.target.value.replace(/[^0-9.]/g, "") }))} 
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
              <label className="text-gray-600 mb-0.5">Balance</label>
              <input 
                type="text" name="balance" value={formData.balance} 
                onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value.replace(/[^0-9.]/g, "") }))} 
                className="border p-1 w-full bg-white" placeholder="0.00"
              />
            </div>
          </div>

          {/* MAIN LR TABLE */}
          <div className="border bg-white mb-2 h-40 overflow-y-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-1 border-r">Center Name</th><th className="p-1 border-r">Lr No</th>
                  <th className="p-1 border-r">Cross Date</th><th className="p-1 border-r">Packaging</th>
                  <th className="p-1 border-r">Description</th><th className="p-1 border-r">Article</th>
                  <th className="p-1 border-r">FreightBy</th><th className="p-1 border-r">From City</th>
                  <th className="p-1 border-r">To City</th><th className="p-1">Consignor</th>
                </tr>
              </thead>
              <tbody>
                {lrList.length === 0 ? (
                  <tr><td colSpan={10} className="p-4 text-center text-gray-400">No records available</td></tr>
                ) : (
                  lrList.map((lr, index) => (
                    <tr key={lr._id || lr.id || index} className="border-t">
                      <td className="p-1 border-r">{lr.centerName}</td><td className="p-1 border-r font-semibold text-blue-600">{lr.lrNo}</td>
                      <td className="p-1 border-r">{lr.crossDate}</td><td className="p-1 border-r">{lr.packaging}</td>
                      <td className="p-1 border-r">{lr.description}</td><td className="p-1 border-r">{lr.article}</td>
                      <td className="p-1 border-r">{lr.freightBy}</td><td className="p-1 border-r">{lr.fromCity}</td>
                      <td className="p-1 border-r">{lr.toCity}</td><td className="p-1">{lr.consignor}</td>
                    </tr>
                  ))
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
                <label>Consingee :</label>
                <div className="w-32">
                  <ComboBox label="" value={formData.consignee} options={accountList} onChange={(val) => setFormData({ ...formData, consignee: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Consignee" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Consignee", oldVal: val })} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label>Consingor :</label>
                <div className="w-32">
                  <ComboBox label="" value={formData.consignor} options={accountList} onChange={(val) => setFormData({ ...formData, consignor: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Consignor" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Consignor", oldVal: val })} />
                </div>
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
        <div className="bg-[#f0f4f8] px-3 py-2 flex justify-between border-t items-center">
          <button className="bg-[#1e73be] text-white px-4 py-1 rounded">Print</button>
          <div className="flex gap-2">
            {!isViewMode && (
              <>
                <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-4 py-1 rounded">Save (F3)</button>
                <button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-4 py-1 rounded">Save & Close (F4)</button>
              </>
            )}
            <button onClick={onClose} className="bg-gray-600 text-white px-4 py-1 rounded flex items-center gap-1">
              ✕ {isViewMode ? "Close" : "Cancel (ESC)"}
            </button>
          </div>
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
         <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
         <div className="bg-white w-full max-w-4xl flex flex-col shadow-2xl border border-gray-400 text-sm rounded-sm">
           <div className="flex items-center gap-4 p-3 border-b">
             <input type="text" placeholder="Fast Search (F1)" className="border border-gray-300 p-1.5 w-64 rounded outline-none focus:border-blue-500" autoFocus />
           </div>
           <div className="h-[400px] overflow-y-auto bg-gray-50 border-b">
             <table className="w-full text-left">
               <thead className="bg-gray-200 sticky top-0">
                 <tr>
                   <th className="p-2 border-r font-semibold text-center w-1/4">LR No</th><th className="p-2 border-r font-semibold text-center w-1/4">From City</th><th className="p-2 border-r font-semibold text-center w-1/4">To City</th><th className="p-2 font-semibold text-center w-1/4">Weight</th>
                 </tr>
               </thead>
               <tbody><tr><td colSpan={4} className="p-12 text-center text-gray-500">No records available</td></tr></tbody>
             </table>
           </div>
           <div className="p-2.5 flex justify-end gap-3 bg-white">
             <button onClick={() => setIsAutoAddModalOpen(false)} className="px-6 py-1.5 border border-gray-400 rounded hover:bg-gray-100 font-medium">Close</button>
             <button onClick={() => setIsAutoAddModalOpen(false)} className="px-6 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-semibold shadow-sm">Select</button>
           </div>
         </div>
       </div>
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
      const res = await fetch("/api/transports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: transportName, locations: ["Main Office"] }) });
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