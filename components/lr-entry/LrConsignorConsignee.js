"use client";

import { useState, useEffect, useRef } from "react";
import ClientModal from "./ClientModal";

export default function LrConsignorConsignee({ form, setForm }) {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");
  const [modalEditData, setModalEditData] = useState(null);
  const [activePrefix, setActivePrefix] = useState("");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/client");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClientAddedOrUpdated = (clientData) => {
    fetchClients();
    handleChange(`${activePrefix}`, clientData.name);
    handleChange(`${activePrefix}Mobile`, clientData.mobile || "");
    handleChange(`${activePrefix}Address`, clientData.address || "");
    setIsModalOpen(false);
  };

  const handleOpenAddModal = (prefix, currentSearchText) => {
    setActivePrefix(prefix);
    setModalInitialName(currentSearchText);
    setModalEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prefix, clientData) => {
    setActivePrefix(prefix);
    setModalInitialName("");
    setModalEditData(clientData);
    setIsModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      <PartyBlock
        title="Consignor"
        name={form.consignor}
        onChange={handleChange}
        prefix="consignor"
        cashField="cashConsigner"
        clients={clients}
        form={form}
        openAddModal={(searchText) => handleOpenAddModal("consignor", searchText)}
        openEditModal={(clientData) => handleOpenEditModal("consignor", clientData)}
        onRefresh={fetchClients}
      />
      <PartyBlock
        title="Consignee"
        name={form.consignee}
        onChange={handleChange}
        prefix="consignee"
        cashField="cashConsignee"
        clients={clients}
        form={form}
        openAddModal={(searchText) => handleOpenAddModal("consignee", searchText)}
        openEditModal={(clientData) => handleOpenEditModal("consignee", clientData)}
        onRefresh={fetchClients}
      />
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleClientAddedOrUpdated}
        initialName={modalInitialName}
        editData={modalEditData}
      />
    </div>
  );
}

// ---------------------------------------------------------
// PARTY BLOCK — full keyboard nav (↑↓ Enter to select)
// ---------------------------------------------------------
function PartyBlock({ title, name, onChange, prefix, cashField, clients, form, openAddModal, openEditModal, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  // -1 = Cash Parti highlighted, 0..N-1 = client index, -2 = none
  const [highlightedIndex, setHighlightedIndex] = useState(-2);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isCashParti = name === "Cash Parti";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when input text changes
  useEffect(() => { setHighlightedIndex(-2); }, [name]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current || !isOpen) return;
    if (highlightedIndex === -1) {
      listRef.current.querySelector("[data-cash-parti]")?.scrollIntoView({ block: "nearest" });
    } else if (highlightedIndex >= 0) {
      listRef.current.querySelector(`[data-client-idx="${highlightedIndex}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes((name || "").toLowerCase())
  );

  const doSelectClient = (client) => {
    onChange(`${prefix}`, client.name);
    onChange(`${prefix}Mobile`, client.mobile || "");
    onChange(`${prefix}Address`, client.address || "");
    setIsOpen(false);
    setHighlightedIndex(-2);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const doSelectCashParti = () => {
    onChange(prefix, "Cash Parti");
    onChange(cashField, "");
    onChange(`${prefix}Mobile`, "");
    onChange(`${prefix}Address`, "");
    setIsOpen(false);
    setHighlightedIndex(-2);
  };

  const handleClearCashParti = () => {
    onChange(prefix, "");
    onChange(cashField, "");
    onChange(`${prefix}Mobile`, "");
    onChange(`${prefix}Address`, "");
  };

  const handleEditTrigger = () => {
    const searchName = (name || "").trim().toLowerCase();
    if (!searchName) { alert("Please select a client from the list first to Edit."); return; }
    const exactMatch = clients.find(c => c.name.trim().toLowerCase() === searchName);
    if (exactMatch) { openEditModal(exactMatch); setIsOpen(false); }
    else alert(`Could not find a saved client named "${name}". Please select them from the dropdown list to edit.`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-2);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setHighlightedIndex(-2);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) { setIsOpen(true); setHighlightedIndex(-1); return; }
      setHighlightedIndex(i => {
        if (i === -2 || i === -1) return filteredClients.length > 0 ? (i === -1 ? 0 : -1) : -1;
        return Math.min(i + 1, filteredClients.length - 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) return;
      setHighlightedIndex(i => {
        if (i <= -1) return -1;
        if (i === 0) return -1;
        return i - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) { setIsOpen(true); setHighlightedIndex(-1); return; }
      if (highlightedIndex === -1) {
        doSelectCashParti();
      } else if (highlightedIndex >= 0 && filteredClients[highlightedIndex]) {
        doSelectClient(filteredClients[highlightedIndex]);
      } else if (filteredClients.length === 1) {
        doSelectClient(filteredClients[0]);
      }
    } else if (e.key === "F2") {
      e.preventDefault(); openAddModal(""); setIsOpen(false);
    } else if (e.key === "F6") {
      e.preventDefault(); handleEditTrigger();
    }
  };

  // ── CASH PARTI MODE ──
  if (isCashParti) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
            ₹ Cash Parti
          </span>
        </div>
        <div className="flex gap-2">
          <input
            value={form[cashField] || ""}
            onChange={(e) => onChange(cashField, e.target.value)}
            placeholder={`${title} Name (Optional)`}
            className="input w-1/2 focus:ring-2 focus:ring-amber-500"
          />
          <input
            value={form[`${prefix}Mobile`] || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              onChange(`${prefix}Mobile`, val);
            }}
            placeholder="Mobile Number *"
            maxLength={10}
            className={`input w-1/2 focus:ring-2 focus:ring-amber-500 border-amber-300 ${
              form[`${prefix}Mobile`] && form[`${prefix}Mobile`].length !== 10 ? "border-red-400" : ""
            }`}
          />
        </div>
        <input
          value={form[`${prefix}Address`] || ""}
          onChange={(e) => onChange(`${prefix}Address`, e.target.value)}
          placeholder={`${title} Address (Optional)`}
          className="input w-full"
        />
        {form[`${prefix}Mobile`] && form[`${prefix}Mobile`].length !== 10 && (
          <p className="text-xs text-red-500">Mobile must be 10 digits.</p>
        )}
        <button type="button" onClick={handleClearCashParti} className="text-xs text-red-500 hover:text-red-700 underline">
          ✕ Clear
        </button>
      </div>
    );
  }

  // ── NORMAL MODE ──
  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <h3 className="font-semibold text-sm text-gray-800">{title}</h3>

      <div className="relative">
        <input
          ref={inputRef}
          className="input w-full pr-14 focus:ring-2 focus:ring-blue-500 border-gray-300 cursor-text"
          placeholder="Search Name (F2 Add / F6 Edit)..."
          value={name || ""}
          onChange={(e) => { onChange(`${prefix}`, e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) setIsOpen(false);
            }, 150);
          }}
          onKeyDown={handleKeyDown}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {name && (
            <button
              type="button"
              tabIndex={-1}
              className="text-gray-400 hover:text-red-600 focus:outline-none"
              title="Clear Selection"
              onClick={(e) => {
                e.stopPropagation();
                onChange(`${prefix}`, "");
                onChange(`${prefix}Mobile`, "");
                onChange(`${prefix}Address`, "");
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 10);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </button>
          )}
          <div className="text-gray-600 pointer-events-none border-l border-gray-300 pl-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-[140%] max-w-[600px] bg-white border border-gray-300 shadow-xl rounded-md overflow-hidden flex flex-col">

            <div ref={listRef} className="flex flex-col overflow-y-auto max-h-[260px]">
              {/* CASH PARTI — pinned at top */}
              <div
                data-cash-parti
                onMouseDown={(e) => { e.preventDefault(); doSelectCashParti(); }}
                onMouseEnter={() => setHighlightedIndex(-1)}
                className={`flex items-center gap-2 px-3 py-2 border-b border-amber-200 cursor-pointer transition-colors ${
                  highlightedIndex === -1 ? "bg-amber-200" : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <span className="text-amber-700 font-semibold text-sm">₹ Cash Parti</span>
                <span className="text-xs text-amber-500 ml-auto">Mobile number entry</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 sticky top-0">
                <div className="col-span-6">{title}</div>
                <div className="col-span-3">City</div>
                <div className="col-span-3">GSTNO</div>
              </div>

              {/* Client list */}
              {filteredClients.length > 0 ? (
                filteredClients.map((client, idx) => (
                  <div
                    key={client._id}
                    data-client-idx={idx}
                    onMouseDown={(e) => { e.preventDefault(); doSelectClient(client); }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`grid grid-cols-12 px-3 py-2 text-sm border-b border-gray-100 cursor-pointer transition-colors ${
                      idx === highlightedIndex ? "bg-blue-100 font-semibold" : "hover:bg-blue-50"
                    }`}
                  >
                    <div className="col-span-6 font-medium text-gray-800 truncate pr-2">{client.name}</div>
                    <div className="col-span-3 text-gray-600 truncate pr-2">{client.city || "-"}</div>
                    <div className="col-span-3 text-gray-600 truncate">{client.gstNo || "-"}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500 text-center italic">
                  No matching clients found. Press F2 to add.
                </div>
              )}
            </div>

            <div className="bg-blue-100 border-t border-blue-200 px-2 py-1.5 flex gap-2">
              <button tabIndex={-1} type="button" onMouseDown={(e) => { e.preventDefault(); openAddModal(""); setIsOpen(false); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1">+ (F2)</button>
              <button tabIndex={-1} type="button" onMouseDown={(e) => { e.preventDefault(); handleEditTrigger(); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1">✎ (F6)</button>
              <button tabIndex={-1} type="button" onMouseDown={(e) => { e.preventDefault(); onRefresh?.(); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1">↻ Refresh</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
