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

  useEffect(() => {
    fetchClients();
  }, []);

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
  }

  const handleOpenEditModal = (prefix, clientData) => {
      setActivePrefix(prefix);
      setModalInitialName(""); 
      setModalEditData(clientData); 
      setIsModalOpen(true); 
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      <PartyBlock
        title="Consignor"
        name={form.consignor}
        onChange={handleChange}
        prefix="consignor"
        clients={clients}
        openAddModal={(searchText) => handleOpenAddModal("consignor", searchText)}
        openEditModal={(clientData) => handleOpenEditModal("consignor", clientData)}
      />

      <PartyBlock
        title="Consignee"
        name={form.consignee}
        onChange={handleChange}
        prefix="consignee"
        clients={clients}
        openAddModal={(searchText) => handleOpenAddModal("consignee", searchText)}
        openEditModal={(clientData) => handleOpenEditModal("consignee", clientData)}
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

// THE SMART DROPDOWN
function PartyBlock({ title, name, onChange, prefix, clients, openAddModal, openEditModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // FIX APPLIED: A reference to the input box to control the blinking cursor
  const inputRef = useRef(null); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes((name || "").toLowerCase())
  );

  const handleSelectClient = (client) => {
    onChange(`${prefix}`, client.name);
    onChange(`${prefix}Mobile`, client.mobile || "");
    onChange(`${prefix}Address`, client.address || "");
    setIsOpen(false);
    
    // FIX APPLIED: Instantly throw the focus cursor back into the input box!
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 10);
  };

  const handleEditTrigger = () => {
    const searchName = (name || "").trim().toLowerCase();
    
    if (!searchName) {
      alert("Please select a client from the list first to Edit.");
      return;
    }

    const exactMatch = clients.find(c => c.name.trim().toLowerCase() === searchName);
    
    if (exactMatch) {
      openEditModal(exactMatch);
      setIsOpen(false);
    } else {
      alert(`Could not find a saved client named "${name}". Please select them from the dropdown list to edit.`);
    }
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <h3 className="font-semibold text-sm text-gray-800">{title}</h3>

      <div className="relative">
        <input
          ref={inputRef} // <--- Attached the reference here
          className="input w-full pr-14 focus:ring-2 focus:ring-blue-500 border-gray-300 cursor-text"
          placeholder="Search Name (F2 Add / F6 Edit)..."
          value={name || ""}
          onChange={(e) => {
            onChange(`${prefix}`, e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "F2") {
              e.preventDefault();
              openAddModal(""); 
              setIsOpen(false);
            } else if (e.key === "F6") {
              e.preventDefault(); 
              handleEditTrigger(); 
            }
          }}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {name && (
            <button
              type="button"
              className="text-gray-400 hover:text-red-600 focus:outline-none"
              title="Clear Selection"
              onClick={(e) => {
                e.stopPropagation(); 
                onChange(`${prefix}`, ""); 
                onChange(`${prefix}Mobile`, ""); 
                onChange(`${prefix}Address`, ""); 
                setIsOpen(true); 
                // Re-focus after clearing as well
                setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 10);
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
            
            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">
              <div className="col-span-6">{title}</div>
              <div className="col-span-3">City</div>
              <div className="col-span-3">GSTNO</div>
            </div>

            <div className="max-h-[200px] overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => handleSelectClient(client)}
                    className="grid grid-cols-12 px-3 py-2 text-sm border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
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
              <button 
                type="button"
                onClick={() => { openAddModal(""); setIsOpen(false); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1"
              >
                + (F2)
              </button>
              
              <button 
                type="button" 
                onClick={handleEditTrigger}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1"
              >
                ✎ (F6)
              </button>
              
              <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1">
                ↻ Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}