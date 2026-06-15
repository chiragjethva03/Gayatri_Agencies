"use client";
import { useState, useEffect, useRef } from "react";

export default function LrGoodsTable({ form, setForm }) {
  // --- NEW: STATE FOR GOODS DROPDOWN & MODAL ---
  const [goodsList, setGoodsList] = useState([]);
  const [isGoodModalOpen, setIsGoodModalOpen] = useState(false);
  const [goodModalMode, setGoodModalMode] = useState("add"); // "add" or "edit"
  const [goodFormData, setGoodFormData] = useState({ _id: "", name: "", rs: "", no_of_parcel: "" });
  const [packagingList, setPackagingList] = useState([]);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [newPackagingName, setNewPackagingName] = useState("");
  const [packagingModalRowIndex, setPackagingModalRowIndex] = useState(null);
  const [goodModalRowIndex, setGoodModalRowIndex] = useState(null);
  // floating dropdown state — "pack-0", "goods-1", etc.
  const [openDropKey, setOpenDropKey] = useState(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const [dropHighlight, setDropHighlight] = useState(0);
  const dropListRef = useRef(null);

  const toggleDrop = (key, btnEl) => {
    if (openDropKey === key) { setOpenDropKey(null); return; }
    const rect = btnEl.getBoundingClientRect();
    setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    // set initial highlight to current selection
    const isPack = key.startsWith("pack-");
    const isFreight = key.startsWith("freight-");
    const rowIdx = parseInt(key.split("-").pop());
    const items = isPack ? packagingList : isFreight ? freightOnOptions : goodsList;
    const curVal = isPack ? goods[rowIdx]?.packaging : isFreight ? (goods[rowIdx]?.freightOn || "Article") : goods[rowIdx]?.goodsContain;
    const curIdx = items.findIndex(it => (typeof it === "string" ? it : it.name) === curVal);
    setDropHighlight(curIdx >= 0 ? curIdx : 0);
    setOpenDropKey(key);
  };

  // auto-scroll highlighted item into view
  useEffect(() => {
    if (!dropListRef.current || !openDropKey) return;
    const el = dropListRef.current.children[dropHighlight];
    el?.scrollIntoView({ block: "nearest" });
  }, [dropHighlight, openDropKey]);

  // keyboard nav for open dropdown
  useEffect(() => {
    if (!openDropKey) return;
    const isPack = openDropKey.startsWith("pack-");
    const isFreight = openDropKey.startsWith("freight-");
    const rowIdx = parseInt(openDropKey.split("-").pop());
    const items = isPack ? packagingList : isFreight ? freightOnOptions : goodsList;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropHighlight(h => Math.min(h + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setDropHighlight(h => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[dropHighlight];
        if (item) {
          const name = typeof item === "string" ? item : item.name;
          if (isPack) {
            handleRowChange(rowIdx, "packaging", name);
          } else if (isFreight) {
            handleRowChange(rowIdx, "freightOn", name);
          } else {
            const g = goodsList.find(g => g.name === name);
            applyGoodToRow(rowIdx, name, g?.rs || "");
          }
          setOpenDropKey(null);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpenDropKey(null);
      } else if (e.key === "Tab") {
        setOpenDropKey(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDropKey, dropHighlight, packagingList, goodsList]);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("[data-lrdd]")) setOpenDropKey(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const fetchPackaging = async () => {
    try {
      const res = await fetch("/api/packaging");
      if (res.ok) {
        const data = await res.json();
        setPackagingList(data.map(p => p.name));
      }
    } catch (err) {
      console.error("Failed to fetch packaging", err);
    }
  };

  useEffect(() => {
    fetchPackaging();
  }, []);

  const handleSavePackaging = async () => {
    if (!newPackagingName.trim()) return;
    try {
      const res = await fetch("/api/packaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPackagingName.trim() })
      });
      if (res.ok) {
        const saved = newPackagingName.trim();
        setNewPackagingName("");
        setIsPackagingModalOpen(false);
        await fetchPackaging();
        // Auto-select in the row that opened the modal
        if (packagingModalRowIndex !== null) {
          handleRowChange(packagingModalRowIndex, "packaging", saved);
          setPackagingModalRowIndex(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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
  const openGoodModal = (mode, selectedGoodName = "", rowIndex = null) => {
    setGoodModalRowIndex(rowIndex);
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

  // Apply goodsContain + rate together in one form update
  const applyGoodToRow = (rowIndex, goodName, rsValue) => {
    const updatedGoods = [...goods];
    const currentRow = { ...updatedGoods[rowIndex], goodsContain: goodName };
    if (rsValue) {
      const rateVal    = Number(rsValue) || 0;
      currentRow.rate  = String(rsValue);
      const articleVal = Number(currentRow.article) || 0;
      const weightVal  = Number(currentRow.weight)  || 0;
      const freightOn  = currentRow.freightOn || "Article";
      let calcAmount   = 0;
      if      (freightOn === "Weight") calcAmount = rateVal * weightVal;
      else if (freightOn === "Fix")    calcAmount = rateVal;
      else                             calcAmount = rateVal * articleVal;
      currentRow.amount = calcAmount > 0 ? calcAmount.toString() : "";
    }
    updatedGoods[rowIndex] = currentRow;
    const newTotalFreight = updatedGoods.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    setForm({ ...form, goods: updatedGoods, freight: newTotalFreight });
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
        fetchGoods();
        // Auto-select the saved good in the triggering row and fill rate
        if (goodModalRowIndex !== null) {
          applyGoodToRow(goodModalRowIndex, goodFormData.name, goodFormData.rs);
          setGoodModalRowIndex(null);
        }
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
      freightOn: "Article", amount: "", valueInRs: "", eWayBillNo: ""
    }));

  const freightOnOptions = ["Article", "Weight", "Fix"];

  const handleRowChange = (index, field, value) => {
    const updatedGoods = [...goods];
    const currentRow = { ...updatedGoods[index], [field]: value };

    // Strict Math Logic (Article * Rate)
    if (["article", "rate", "freightOn", "weight"].includes(field)) {
  const rateVal = Number(currentRow.rate) || 0;
  const articleVal = Number(currentRow.article) || 0;
  const weightVal = Number(currentRow.weight) || 0;
  currentRow.freightOn = currentRow.freightOn || "Article";

  let calcAmount = 0;
  if (currentRow.freightOn === "Weight") {
    calcAmount = rateVal * weightVal;
  } else if (currentRow.freightOn === "Fix") {
    calcAmount = rateVal;
  } else {
    // Article (default)
    calcAmount = rateVal * articleVal;
  }

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

  const handleNumChange = (index, field, value) => {
    handleRowChange(index, field, value.replace(/[^0-9.]/g, ""));
  };

  const headers = [
    "Article", "Packaging", "Goods Contain", "Weight", "Rate", "Freight On",
    "Amount", "Value In Rs", "E-Way Bill No"
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
                  <div className="flex items-center w-full h-full">
                    <button
                      type="button"
                      tabIndex={0}
                      data-lrdd
                      onClick={(e) => toggleDrop(`pack-${i}`, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (openDropKey === `pack-${i}`) {
                          if (["ArrowDown", "ArrowUp", "Enter", " ", "Escape"].includes(e.key)) e.preventDefault();
                          return;
                        }
                        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                          e.preventDefault();
                          toggleDrop(`pack-${i}`, e.currentTarget);
                        }
                      }}
                      className="flex-1 h-full min-h-[36px] px-2 py-1.5 text-sm flex justify-between items-center hover:bg-blue-50 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                    >
                      <span className={row.packaging ? "text-gray-800 text-sm" : "text-gray-400 text-xs"}>{row.packaging || "Select..."}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 shrink-0 ml-1">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                    <div className="flex border-l border-gray-200 h-full items-center shrink-0">
                      <button tabIndex={-1} type="button" onClick={() => { setPackagingModalRowIndex(i); setIsPackagingModalOpen(true); }} title="Add (F2)" className="px-2 py-1 text-blue-600 hover:bg-blue-100 font-bold transition-colors">+</button>
                      <button tabIndex={-1} type="button" onClick={fetchPackaging} title="Refresh" className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold transition-colors">↻</button>
                    </div>
                  </div>
                </td>

                {/* --- GOODS CONTAIN --- */}
                <td className={`${cellClass} min-w-[220px]`}>
                  <div className="flex items-center w-full h-full">
                    <button
                      type="button"
                      tabIndex={0}
                      data-lrdd
                      onClick={(e) => toggleDrop(`goods-${i}`, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (openDropKey === `goods-${i}`) {
                          if (["ArrowDown", "ArrowUp", "Enter", " ", "Escape"].includes(e.key)) e.preventDefault();
                          return;
                        }
                        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                          e.preventDefault();
                          toggleDrop(`goods-${i}`, e.currentTarget);
                        }
                      }}
                      className="flex-1 h-full min-h-[36px] px-2 py-1.5 text-sm flex justify-between items-center hover:bg-blue-50 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                    >
                      <span className={row.goodsContain ? "text-gray-800 text-sm" : "text-gray-400 text-xs"}>{row.goodsContain || "Select Good..."}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 shrink-0 ml-1">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                    <div className="flex border-l border-gray-200 h-full items-center shrink-0">
                      <button tabIndex={-1} type="button" onClick={() => openGoodModal("add", "", i)} title="Add (F2)" className="px-2 py-1 text-blue-600 hover:bg-blue-100 font-bold transition-colors">+</button>
                      <button tabIndex={-1} type="button" onClick={() => openGoodModal("edit", row.goodsContain)} title="Edit (F6)" className="px-2 py-1 text-green-600 hover:bg-green-100 font-bold transition-colors">✎</button>
                      <button tabIndex={-1} type="button" onClick={fetchGoods} title="Refresh" className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold transition-colors">↻</button>
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
                  <button
                    type="button"
                    tabIndex={0}
                    data-lrdd
                    onClick={(e) => toggleDrop(`freight-${i}`, e.currentTarget)}
                    onKeyDown={(e) => {
                      if (openDropKey === `freight-${i}`) {
                        if (["ArrowDown", "ArrowUp", "Enter", " ", "Escape"].includes(e.key)) e.preventDefault();
                        return;
                      }
                      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                        e.preventDefault();
                        toggleDrop(`freight-${i}`, e.currentTarget);
                      }
                    }}
                    className="w-full h-full min-h-[36px] px-2 py-1.5 text-sm flex justify-between items-center hover:bg-blue-50 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                  >
                    <span className="text-gray-800 text-sm">{row.freightOn || "Article"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 shrink-0 ml-1">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
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
                  <input value={row.eWayBillNo || ""} onChange={(e) => handleRowChange(i, "eWayBillNo", e.target.value)} className={inputClass} placeholder="" />
                </td>

                <td className={cellClass}>
                  {i >= 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = goods.filter((_, idx) => idx !== i);
                        const newTotalFreight = updated.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
                        setForm({ ...form, goods: updated, freight: newTotalFreight });
                      }}
                      className="px-2 py-1 text-red-400 hover:text-red-600 hover:bg-red-50 font-bold transition-colors"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- FLOATING DROPDOWN (fixed position, escapes table stacking context) --- */}
      {openDropKey && (() => {
        const isPack = openDropKey.startsWith("pack-");
        const isFreight = openDropKey.startsWith("freight-");
        const rowIdx = parseInt(openDropKey.split("-").pop());
        const items = isPack ? packagingList : isFreight ? freightOnOptions : goodsList;
        const currentVal = isPack ? goods[rowIdx]?.packaging : isFreight ? (goods[rowIdx]?.freightOn || "Article") : goods[rowIdx]?.goodsContain;
        const minW = isPack ? 180 : isFreight ? 130 : 220;
        return (
          <div
            data-lrdd
            style={{ position: "fixed", top: dropPos.top, left: dropPos.left, minWidth: Math.max(dropPos.width, minW), zIndex: 9999 }}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
          >
            <div ref={dropListRef} className="max-h-[280px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">No items</div>
              ) : items.map((item, idx) => {
                const name = typeof item === "string" ? item : item.name;
                const isSelected = name === currentVal;
                const isHighlighted = idx === dropHighlight;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isPack) {
                        handleRowChange(rowIdx, "packaging", name);
                      } else if (isFreight) {
                        handleRowChange(rowIdx, "freightOn", name);
                      } else {
                        const g = goodsList.find(g => g.name === name);
                        applyGoodToRow(rowIdx, name, g?.rs || "");
                      }
                      setOpenDropKey(null);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${isHighlighted ? "bg-blue-100 text-blue-800 font-semibold" : isSelected ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-blue-50"}`}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* --- ADD/EDIT GOOD MODAL POPUP --- */}
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
                  onChange={(e) => setGoodFormData({ ...goodFormData, name: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Electronics, Textiles..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">RS (Rate/Value)</label>
                <input
                  type="number"
                  value={goodFormData.rs}
                  onChange={(e) => setGoodFormData({ ...goodFormData, rs: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">No. of Parcel</label>
                <input
                  type="number"
                  value={goodFormData.no_of_parcel}
                  onChange={(e) => setGoodFormData({ ...goodFormData, no_of_parcel: e.target.value })}
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
      {isPackagingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add Packaging Type</h2>
              <button type="button" onClick={() => setIsPackagingModalOpen(false)} className="text-white/80 hover:text-white font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Packaging Name <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={newPackagingName}
                  onChange={(e) => setNewPackagingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSavePackaging()}
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Wooden Box, Drum..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsPackagingModalOpen(false); setNewPackagingName(""); setPackagingModalRowIndex(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="button" onClick={handleSavePackaging} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold shadow-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          const newRow = {
            article: "", packaging: "", goodsContain: "", weight: "", rate: "",
            freightOn: "Article", amount: "", valueInRs: "", eWayBillNo: ""
          };
          setForm({ ...form, goods: [...goods, newRow] });
        }}
        className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow transition"
      >
        + Add Row
      </button>
    </div>
  );
}