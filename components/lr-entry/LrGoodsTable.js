"use client";
import { useState, useEffect } from "react";

export default function LrGoodsTable({ form, setForm }) {
  // --- NEW: STATE FOR GOODS DROPDOWN & MODAL ---
  const [goodsList, setGoodsList] = useState([]);
  const [isGoodModalOpen, setIsGoodModalOpen] = useState(false);
  const [goodModalMode, setGoodModalMode] = useState("add"); // "add" or "edit"
  const [goodFormData, setGoodFormData] = useState({ _id: "", name: "", rs: "", no_of_parcel: "" });

  // Fetch goods from the database
  const fetchGoods = async () => {
    try {
      const res = await fetch("/api/goods");
      if (res.ok) {
        const data = await res.json();
        setGoodsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch goods", err);
    }
  };

  useEffect(() => {
    fetchGoods();
  }, []);

  // Open Modal Handler
  const openGoodModal = (mode, selectedGoodName = "") => {
    if (mode === "edit") {
      if (!selectedGoodName) {
        return alert("Please select a good from the dropdown to edit first!");
      }
      const existingGood = goodsList.find(g => g.name === selectedGoodName);
      if (existingGood) {
        setGoodFormData(existingGood);
      } else {
        return alert("Selected good not found in database.");
      }
    } else {
      setGoodFormData({ name: "", rs: "", no_of_parcel: "" });
    }
    setGoodModalMode(mode);
    setIsGoodModalOpen(true);
  };

  // Save Modal Data Handler
  const handleSaveGood = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goods", {
        method: goodModalMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goodFormData)
      });
      if (res.ok) {
        setIsGoodModalOpen(false);
        fetchGoods(); // Refresh the dropdown list automatically
      } else {
        alert("Failed to save Good entry.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const goods = form.goods?.length 
    ? form.goods 
    : Array(3).fill(null).map(() => ({
        article: "", packaging: "", goodsContain: "", weight: "", rate: "",
        freightOn: "Article", amount: "", valueInRs: "", eWayBillNo: "", eWayBillDate: "", eWayBillExpiry: ""
      }));

  const packagingOptions = [
    "", "Polythene", "Airtight", "Gunny Bag", "Carton", "Wooden Box", "Plastic Drum", "Loose"
  ];

  const freightOnOptions = ["Article", "Weight", "Fix"];

  const handleRowChange = (index, field, value) => {
    const updatedGoods = [...goods];
    const currentRow = { ...updatedGoods[index], [field]: value };

    // Strict Math Logic (Article * Rate)
    if (["article", "rate", "freightOn", "weight"].includes(field)) {
      const rateVal = Number(currentRow.rate) || 0;
      const articleVal = Number(currentRow.article) || 0;
      currentRow.freightOn = currentRow.freightOn || "Article";
      const calcAmount = rateVal * articleVal;
      currentRow.amount = calcAmount > 0 ? calcAmount.toString() : "";
    }

    updatedGoods[index] = currentRow;
    const newTotalFreight = updatedGoods.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    setForm({ 
      ...form, 
      goods: updatedGoods, 
      freight: newTotalFreight 
    });
  };

  const handleTextChange = (index, field, value) => {
    handleRowChange(index, field, value.replace(/[0-9]/g, ""));
  };

  const handleNumChange = (index, field, value) => {
    handleRowChange(index, field, value.replace(/[^0-9.]/g, ""));
  };

  const headers = [
    "Article", "Packaging", "Goods Contain", "Weight", "Rate", "Freight On",
    "Amount", "Value In Rs", "E-Way Bill No", "E-Way Bill Date", "E-Way Bill Expiry"
  ];

  const inputClass = "w-full h-full min-h-[36px] px-3 py-1.5 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 focus:z-10 relative bg-transparent transition-colors text-gray-800";
  const cellClass = "p-0 border-r border-gray-200 last:border-r-0 relative";

  return (
    <div>
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Article / Packaging</h3>

      <div className="border border-gray-300 rounded-lg overflow-x-auto shadow-sm bg-white">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-gray-300">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {goods.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                
                <td className={cellClass}>
                  <input inputMode="numeric" value={row.article || ""} onChange={(e) => handleNumChange(i, "article", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                
                <td className={cellClass}>
                  <select value={row.packaging || ""} onChange={(e) => handleRowChange(i, "packaging", e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {packagingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                
                {/* --- UPDATED: GOODS CONTAIN FIELD WITH DROPDOWN AND BUTTONS --- */}
                <td className={cellClass}>
                  <div className="flex items-center w-full h-full min-w-[220px]">
                    <select 
                      value={row.goodsContain || ""} 
                      onChange={(e) => handleTextChange(i, "goodsContain", e.target.value)} 
                      className="flex-1 h-full min-h-[36px] px-2 py-1.5 outline-none focus:bg-blue-50 bg-transparent text-gray-800"
                    >
                      <option value="">Select Good...</option>
                      {goodsList.map(g => (
                        <option key={g._id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                    
                    {/* Action Buttons */}
                    <div className="flex border-l border-gray-200 h-full items-center">
                      <button type="button" onClick={() => openGoodModal("add")} title="Add (F2)" className="px-2 py-1 text-blue-600 hover:bg-blue-100 font-bold transition-colors">+</button>
                      <button type="button" onClick={() => openGoodModal("edit", row.goodsContain)} title="Edit (F6)" className="px-2 py-1 text-green-600 hover:bg-green-100 font-bold transition-colors">✎</button>
                      <button type="button" onClick={fetchGoods} title="Refresh" className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold transition-colors">↻</button>
                    </div>
                  </div>
                </td>
                
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.weight || ""} onChange={(e) => handleNumChange(i, "weight", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.rate || ""} onChange={(e) => handleNumChange(i, "rate", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                
                <td className={cellClass}>
                  <select value={row.freightOn || "Article"} onChange={(e) => handleRowChange(i, "freightOn", e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {freightOnOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                
                <td className={cellClass}>
                  <input 
                    readOnly 
                    tabIndex={-1} 
                    value={row.amount || ""} 
                    className={`${inputClass} bg-gray-100 text-gray-500 font-semibold cursor-not-allowed`} 
                    placeholder="0" 
                  />
                </td>
                
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.valueInRs || ""} onChange={(e) => handleNumChange(i, "valueInRs", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                
                <td className={cellClass}>
                  <input inputMode="numeric" value={row.eWayBillNo || ""} onChange={(e) => handleNumChange(i, "eWayBillNo", e.target.value)} className={inputClass} />
                </td>
                
                <td className={cellClass}><input value={row.eWayBillDate || ""} onChange={(e) => handleRowChange(i, "eWayBillDate", e.target.value)} type="date" className={`${inputClass} text-gray-600`} /></td>
                <td className={cellClass}><input value={row.eWayBillExpiry || ""} onChange={(e) => handleRowChange(i, "eWayBillExpiry", e.target.value)} type="date" className={`${inputClass} text-gray-600`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- NEW: ADD/EDIT GOOD MODAL POPUP --- */}
      {isGoodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">{goodModalMode === "add" ? "Add New Good" : "Edit Good Entry"}</h2>
              <button type="button" onClick={() => setIsGoodModalOpen(false)} className="text-white/80 hover:text-white font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleSaveGood} className="p-6 space-y-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Good Name <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={goodFormData.name} 
                  onChange={(e) => setGoodFormData({...goodFormData, name: e.target.value})} 
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Electronics, Textiles..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">RS (Rate/Value)</label>
                <input 
                  type="number" 
                  value={goodFormData.rs} 
                  onChange={(e) => setGoodFormData({...goodFormData, rs: e.target.value})} 
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">No. of Parcel</label>
                <input 
                  type="number" 
                  value={goodFormData.no_of_parcel} 
                  onChange={(e) => setGoodFormData({...goodFormData, no_of_parcel: e.target.value})} 
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="0"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsGoodModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-sm"
                >
                  {goodModalMode === "add" ? "Save Good" : "Update Good"}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}