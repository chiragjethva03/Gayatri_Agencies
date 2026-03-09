"use client";
import React, { useState, useEffect } from "react";
import ComboBox from "@/components/ui/ComboBox";
import CenterMasterModal from "@/components/memo/CenterMasterModal"; 

export default function MemoForm({ isOpen, onClose, transport, onSaveSuccess, initialData }) {
  const actualTransport = Array.isArray(transport) ? transport[0] : transport;
  const locations = actualTransport?.locations || [];
  
  // 1. FORM DATA STATE
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    memoNo: initialData?.memoNo || "",
    toBranch: "",
    toCity: "",
    vehicle: "",
    driver: "",
    kMiter: "",
    toWt: "",
    agent: "",
    hire: "",
    cashBank: "",
    advanced: "",
    balance: "",
    center: "",
    toPay: "",
    paid: "",
    consignee: "",
    consignor: "",
    narration: "",
    memoFreight: "",
    ...initialData,
  });

  const [lrList, setLrList] = useState(initialData?.lrList || []);
  const [lrInput, setLrInput] = useState("");

  // 2. DROPDOWN DATA STATES (ALL DUMMY DATA REMOVED)
  const [localBranches, setLocalBranches] = useState(locations);
  const [vehicles, setVehicles] = useState([]); 
  const [drivers, setDrivers] = useState([]); 
  const [agents, setAgents] = useState([]); 
  const [cashBanks, setCashBanks] = useState([]); 
  const [accountList, setAccountList] = useState([]);
  const [centerList, setCenterList] = useState([]); 

  // 3. MODAL VISIBILITY STATES
  const [isAutoAddModalOpen, setIsAutoAddModalOpen] = useState(false); 
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", mode: "add", oldVal: "" }); 
  const [accountModal, setAccountModal] = useState({ isOpen: false, type: "" }); 
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [actionInput, setActionInput] = useState("");

  // 4. AUTO-GENERATE MEMO NO
  useEffect(() => {
    if (isOpen && !initialData?.memoNo) {
      const slug = actualTransport?.slug;
      if (slug) {
        fetch(`/api/memo?transport=${slug}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              const lastNo = parseInt(data[0].memoNo);
              if (!isNaN(lastNo)) setFormData(prev => ({ ...prev, memoNo: (lastNo + 1).toString() }));
              else setFormData(prev => ({ ...prev, memoNo: "1000" }));
            } else {
              setFormData(prev => ({ ...prev, memoNo: "1000" }));
            }
          })
          .catch(() => setFormData(prev => ({ ...prev, memoNo: "1000" })));
      } else {
        setFormData(prev => ({ ...prev, memoNo: "1000" }));
      }
    }
  }, [isOpen, initialData, actualTransport]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* --- HANDLERS FOR F2 / F6 (Branch, Vehicle, Driver ONLY) --- */
  const openActionModal = (type, mode, currentSelection = "") => {
    if (mode === "edit" && !currentSelection) {
      alert(`Please select a ${type} to edit first.`);
      return;
    }
    setActionModal({ isOpen: true, type, mode, oldVal: currentSelection });
    setActionInput(mode === "edit" ? currentSelection : "");
  };

  const handleActionModalSave = () => {
    if (!actionInput.trim()) return;
    const { type, mode, oldVal } = actionModal;

    if (type === "To Branch") {
      if (mode === "add") setLocalBranches([...localBranches, actionInput]);
      else setLocalBranches(localBranches.map((x) => (x === oldVal ? actionInput : x)));
      setFormData((prev) => ({ ...prev, toBranch: actionInput }));
    } else if (type === "Vehicle") {
      if (mode === "add") setVehicles([...vehicles, actionInput]);
      else setVehicles(vehicles.map((x) => (x === oldVal ? actionInput : x)));
      setFormData((prev) => ({ ...prev, vehicle: actionInput }));
    } else if (type === "Driver") {
      if (mode === "add") setDrivers([...drivers, actionInput]);
      else setDrivers(drivers.map((x) => (x === oldVal ? actionInput : x)));
      setFormData((prev) => ({ ...prev, driver: actionInput }));
    }

    setActionModal({ isOpen: false, type: "", mode: "add", oldVal: "" });
  };

  /* --- MANUAL ADD LR LOGIC --- */
  const handleAddLr = () => {
    if (!lrInput.trim()) return;
    const newLrEntry = {
      id: Date.now(),
      lrNo: lrInput,
      crossDate: formData.date,
      packaging: "Box",
      description: "General Goods",
      article: 5, 
      freightBy: "Road",
      fromCity: "Ahmedabad",
      toCity: formData.toCity || "Surat",
      consignor: formData.consignor || "Default Consignor",
      centerName: formData.center || "Main Center",
      weight: 120, 
      freight: 1500, 
    };
    setLrList((prev) => [...prev, newLrEntry]);
    setLrInput(""); 
  };

  const handleSave = async (closeAfterSave = true) => {
     try {
        const payload = { ...formData, lrList };
        const res = await fetch("/api/memo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorText = await res.text();
          alert(`Failed to save! Server responded with: ${res.status}\n${errorText}`);
          return;
        }
        if (onSaveSuccess) onSaveSuccess(); 
        if (closeAfterSave) onClose(); 
      } catch (error) {
        alert("Network Error: " + error.message);
      }
  };

  // Summary calculations
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
          <h2 className="font-semibold">+Add Memo Entry</h2>
          <div className="flex gap-2">
            <button className="px-2 py-0.5 bg-white text-blue-600 font-bold border rounded">GO</button>
            <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black">✕</button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8]">
          <div className="grid grid-cols-6 gap-2 mb-2">
            
            {/* Row 1 */}
            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-1 w-full"/></div>
            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Memo No</label><input type="text" name="memoNo" value={formData.memoNo} onChange={handleChange} className="border p-1 w-full bg-white"/></div>
            
            <div className="col-span-1 flex flex-col">
              <ComboBox label="To Branch" value={formData.toBranch} options={localBranches} onChange={(val) => setFormData({ ...formData, toBranch: val })} onAdd={() => openActionModal("To Branch", "add")} onEdit={(val) => openActionModal("To Branch", "edit", val)} onRefresh={() => alert("Branch list refreshed!")} />
            </div>
            
            <div className="col-span-1 flex flex-col">
              <ComboBox label="Vehicle" value={formData.vehicle} options={vehicles} onChange={(val) => setFormData({ ...formData, vehicle: val })} onAdd={() => openActionModal("Vehicle", "add")} onEdit={(val) => openActionModal("Vehicle", "edit", val)} onRefresh={() => alert("Vehicle list refreshed!")} />
            </div>
            
            <div className="col-span-2 flex flex-col">
              <ComboBox label="Driver" value={formData.driver} options={drivers} onChange={(val) => setFormData({ ...formData, driver: val })} onAdd={() => openActionModal("Driver", "add")} onEdit={(val) => openActionModal("Driver", "edit", val)} onRefresh={() => alert("Driver list refreshed!")} />
            </div>

            {/* Row 2 */}
            <div className="col-span-2 flex flex-col"><label className="text-gray-600 mb-0.5">To City</label><select name="toCity" value={formData.toCity} onChange={handleChange} className="border p-1 w-full"><option value="">Select</option>{locations.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-span-2 flex flex-col"><label className="text-gray-600 mb-0.5">K. Miter</label><input type="text" name="kMiter" value={formData.kMiter} onChange={handleChange} className="border p-1 w-full"/></div>
            <div className="col-span-2 flex flex-col"><label className="text-gray-600 mb-0.5">To WT</label><input type="text" name="toWt" value={formData.toWt} onChange={handleChange} className="border p-1 w-full"/></div>

            {/* Row 3 */}
            <div className="col-span-2 flex flex-col">
              <ComboBox label="Agent" value={formData.agent} options={agents} onChange={(val) => setFormData({ ...formData, agent: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Agent" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Agent", oldVal: val })} onRefresh={() => alert("Agent list refreshed!")} />
            </div>

            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Hire</label><input type="number" name="hire" value={formData.hire} onChange={handleChange} className="border p-1 w-full"/></div>
            <div className="col-span-1 flex flex-col"><label className="text-gray-600 mb-0.5">Cash/Bank</label><select name="cashBank" value={formData.cashBank} onChange={handleChange} className="border p-1 w-full"><option value="">Select</option>{cashBanks.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-span-2 flex flex-col"><label className="text-gray-600 mb-0.5">Advanced</label><input type="number" name="advanced" value={formData.advanced} onChange={handleChange} className="border p-1 w-full"/></div>

            {/* Row 4 */}
            <div className="col-span-1 flex flex-col">
               <ComboBox label="Center" value={formData.center} options={centerList} onChange={(val) => setFormData({ ...formData, center: val })} onAdd={() => setIsCenterModalOpen(true)} onEdit={() => alert("Edit Center feature pending")} onRefresh={() => alert("Center list refreshed!")} />
            </div>
            <div className="col-span-3 flex flex-col">
              <label className="text-gray-600 mb-0.5">Add Lr</label>
              <div className="flex gap-1">
                <input value={lrInput} onChange={(e) => setLrInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddLr()} className="border p-1 flex-1" placeholder="Enter LR Number" />
                <button type="button" onClick={handleAddLr} className="bg-[#1e73be] text-white px-3 py-1 rounded hover:bg-blue-700">Add Lr</button>
                <button type="button" onClick={() => setIsAutoAddModalOpen(true)} className="bg-[#1e73be] text-white px-3 py-1 rounded hover:bg-blue-700">Auto Add Lr</button>
              </div>
            </div>
            <div className="col-span-2 flex flex-col"><label className="text-gray-600 mb-0.5">Balance</label><input type="number" name="balance" value={formData.balance} disabled className="border p-1 w-full bg-gray-200"/></div>
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
                  lrList.map((lr) => (
                    <tr key={lr.id} className="border-t">
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
              <div className="flex justify-between items-center"><label>To Pay :</label><input type="number" name="toPay" value={formData.toPay} onChange={handleChange} className="border p-1 w-24 bg-gray-100"/></div>
              <div className="row-span-4 flex flex-col"><label>Narration</label><textarea name="narration" value={formData.narration} onChange={handleChange} className="border p-1 flex-1 resize-none"></textarea></div>
              <div className="flex justify-between items-center"><label>Paid :</label><input type="number" name="paid" value={formData.paid} onChange={handleChange} className="border p-1 w-24 bg-gray-100"/></div>
              
              <div className="flex justify-between items-center">
                <label>Consingee :</label>
                <div className="w-32">
                  <ComboBox label="" value={formData.consignee} options={accountList} onChange={(val) => setFormData({ ...formData, consignee: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Consignee" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Consignee", oldVal: val })} onRefresh={() => alert("Consignee list refreshed!")} />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label>Consingor :</label>
                <div className="w-32">
                  <ComboBox label="" value={formData.consignor} options={accountList} onChange={(val) => setFormData({ ...formData, consignor: val })} onAdd={() => setAccountModal({ isOpen: true, type: "Consignor" })} onEdit={(val) => setAccountModal({ isOpen: true, type: "Consignor", oldVal: val })} onRefresh={() => alert("Consignor list refreshed!")} />
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* FOOTER TOTALS */}
         <div className="bg-[#e2e8f0] px-3 py-1 flex justify-between border-t font-semibold">
          <span>Total Lr : {lrList.length}</span>
          <span>Total Article : {lrList.reduce((acc, curr) => acc + (Number(curr.article) || 0), 0)}</span>
          <span>Total Ac. Weight : 0</span>
          <span>Total Weight : {lrList.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)}</span>
          <div className="flex items-center gap-2">
            <span>Memo Freight :</span>
            <input type="number" name="memoFreight" value={formData.memoFreight} onChange={handleChange} className="border p-1 w-24 bg-white"/>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#f0f4f8] px-3 py-2 flex justify-between border-t items-center">
          <button className="bg-[#1e73be] text-white px-4 py-1 rounded">Print</button>
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} className="bg-[#1e73be] text-white px-4 py-1 rounded">Save (F3)</button>
            <button onClick={() => handleSave(true)} className="bg-[#1e73be] text-white px-4 py-1 rounded">Save & Close (F4)</button>
            <button onClick={onClose} className="bg-gray-600 text-white px-4 py-1 rounded flex items-center gap-1">✕ Cancel (ESC)</button>
          </div>
        </div>
      </div>

      {/* AUTO ADD LR MODAL (F1 Search) */}
      {isAutoAddModalOpen && (
         <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
         <div className="bg-white w-full max-w-4xl flex flex-col shadow-2xl border border-gray-400 text-sm rounded-sm">
           <div className="flex items-center gap-4 p-3 border-b">
             <input type="text" placeholder="Fast Search (F1)" className="border border-gray-300 p-1.5 w-64 rounded outline-none focus:border-blue-500" autoFocus />
             <label className="flex items-center gap-1.5 cursor-pointer text-gray-700"><input type="checkbox" className="w-3.5 h-3.5" /> All City</label>
             <label className="flex items-center gap-1.5 cursor-pointer text-gray-700"><input type="checkbox" className="w-3.5 h-3.5" /> Show Inward LR</label>
           </div>
           <div className="h-[400px] overflow-y-auto bg-gray-50 border-b">
             <table className="w-full text-left">
               <thead className="bg-gray-200 sticky top-0">
                 <tr>
                   <th className="p-2 border-r font-semibold text-center w-1/4">LR No</th>
                   <th className="p-2 border-r font-semibold text-center w-1/4">From City</th>
                   <th className="p-2 border-r font-semibold text-center w-1/4">To City</th>
                   <th className="p-2 font-semibold text-center w-1/4">Weight</th>
                 </tr>
               </thead>
               <tbody>
                 <tr><td colSpan={4} className="p-12 text-center text-gray-500">No records available</td></tr>
               </tbody>
             </table>
           </div>
           <div className="p-2.5 flex justify-end gap-3 bg-white">
             <button onClick={() => setIsAutoAddModalOpen(false)} className="px-6 py-1.5 border border-gray-400 rounded hover:bg-gray-100 font-medium">Close</button>
             <button onClick={() => setIsAutoAddModalOpen(false)} className="px-6 py-1.5 bg-[#1e73be] text-white rounded hover:bg-blue-700 font-semibold shadow-sm">Select</button>
           </div>
         </div>
       </div>
      )}

      {/* SINGLE-INPUT ACTION MODAL (Branch, Vehicle, Driver ONLY) */}
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
                autoFocus
                type="text"
                className="w-full border border-blue-400 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleActionModalSave()}
              />
              <div className="flex justify-end gap-2 text-xs">
                <button onClick={() => setActionModal({ isOpen: false })} className="px-4 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                <button onClick={handleActionModalSave} className="px-4 py-1.5 bg-[#5ca0d3] text-white rounded hover:bg-blue-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT MASTER MODAL (Agent, Consignee, Consignor) */}
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

      {/* CENTER MASTER MODAL */}
      <CenterMasterModal 
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
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
// INLINE ACCOUNT MODAL COMPONENT (Agent, Consignee, Consignor)
// --------------------------------------------------------------------------------------
function InlineAccountModal({ isOpen, onClose, type, onSave }) {
  const [accName, setAccName] = useState("");
  if (!isOpen) return null;
  return (
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
              <input type="text" value={accName} onChange={e => setAccName(e.target.value)} autoFocus className="w-full p-1 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Code/Alias</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Group</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Sundry Creditors (A/cs Payble)</option><option>Sundry Debtors</option></select></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Reg Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Regular</option></select></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Transport</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Transporter</option></select></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">GST By Trans.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>No</option></select></div></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Address</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                <div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">City</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">State</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>GUJARAT</option></select></div></div>
                <div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Area</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div><div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Pin</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Phone(O)</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Mobile</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Email</label><input type="email" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col relative"><label className="text-gray-600 mb-0.5">GSTNO</label><div className="flex"><input type="text" className="border border-blue-300 rounded-l p-1 w-full bg-white"/><button className="border border-l-0 border-blue-300 bg-gray-50 px-2 rounded-r text-blue-500">🔍</button></div></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">PAN NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">ADHAR NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div></div>
                <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C NO.</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">MSME NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div></div>
                <div className="grid grid-cols-2 gap-2"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Limit</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Days</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div></div>
                <div className="border border-gray-300 rounded p-2 bg-white mt-1 relative"><label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Balance</label><div className="flex flex-col gap-2 mt-1"><div className="flex flex-col"><label className="text-gray-600 mb-0.5">Balance Method</label><select className="border border-gray-300 rounded p-1 w-full bg-gray-100"><option>Balance Only</option></select></div><div className="flex gap-2"><div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Opening Balance</label><input type="number" defaultValue={0} className="border border-blue-300 rounded p-1 w-full bg-white text-right"/></div><div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Cr/Db.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Cr</option><option>Db</option></select></div></div></div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#e2e8f0] px-3 py-2 flex justify-between border-t items-center">
          <button className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium">{type}</button>
          <div className="flex gap-2"><button onClick={() => { if(accName) onSave(accName); }} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save (F3)</button><button onClick={() => { if(accName) onSave(accName); }} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save & Close (F4)</button><button onClick={onClose} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Cancel (Esc)</button></div>
        </div>
      </div>
    </div>
  );
}