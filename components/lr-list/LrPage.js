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
  
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchLrs(); // Initial fetch (loads everything)
  }, []);

  // UPDATED: Now accepts from and to dates
  const fetchLrs = (from = "", to = "") => {
    setLoading(true);
    
    // Construct the URL with query parameters if dates are provided
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

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      
      {/* NEW: Pass the fetch function to the TopBar so the Go button can trigger it */}
      <LrTopBar onFilter={fetchLrs} />

      <LrActionBar 
        onAdd={handleAdd}       
        onView={handleView}     
        onDelete={handleDeleteClick} 
        selectedCount={selectedIds.length} 
      />

      <div className="relative mt-3">
        <LrTable 
          lrs={lrs} 
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