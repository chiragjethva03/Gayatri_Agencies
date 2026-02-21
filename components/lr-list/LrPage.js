"use client";

import { useEffect, useState } from "react";
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";
import DeleteConfirmModal from "./DeleteConfirmModal"; 

export default function LrPage() {
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW STATE: Store the search text
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchLrs(); 
  }, []);

  const fetchLrs = (from = "", to = "") => {
    setLoading(true);
    let url = "/api/lr";
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then(setLrs)
      .finally(() => setLoading(false));
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleView = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one row to view.");
      return;
    }
    const selectedRow = lrs.find(lr => lr._id === selectedIds[0]);
    setViewData(selectedRow); 
    setShowEntry(true);       
  };

  const handleAdd = () => {
    setViewData(null); 
    setShowEntry(true);
  }

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    await fetch('/api/lr', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selectedIds }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    setLrs(prev => prev.filter(lr => !selectedIds.includes(lr._id)));
    setSelectedIds([]);
    setShowDeleteModal(false); 
  };

  // NEW LOGIC: Filter the LRs based on the search term
  const filteredLrs = lrs.filter((lr) => {
    if (!searchTerm) return true; // If search is empty, show everything

    const searchLower = searchTerm.toLowerCase();
    
    // Safely check if the properties exist before running .toLowerCase() on them
    const matchLrNo = lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower);
    const matchFrom = lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower);
    const matchTo = lr.toCity && lr.toCity.toLowerCase().includes(searchLower);

    // If any of these match, keep the row!
    return matchLrNo || matchFrom || matchTo;
  });

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      
      {/* UPDATED: Pass the searchTerm and the update function to TopBar */}
      <LrTopBar 
        onFilter={fetchLrs} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <LrActionBar 
        onAdd={handleAdd}       
        onView={handleView}     
        onDelete={handleDeleteClick} 
        selectedCount={selectedIds.length} 
      />

      <div className="relative mt-3">
        {/* UPDATED: Pass the FILTERED array down to the table, not the raw array */}
        <LrTable 
          lrs={filteredLrs} 
          loading={loading}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
        />

        {showEntry && (
          <LrEntryPanel 
            initialData={viewData} 
            onClose={() => {
              setShowEntry(false);
              fetchLrs();
            }}
          />
        )}

        <DeleteConfirmModal 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={executeDelete}
          count={selectedIds.length}
        />
      </div>
    </div>
  );
}