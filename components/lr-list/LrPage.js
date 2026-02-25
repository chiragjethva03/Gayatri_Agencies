"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // NEW: Import this to read the URL
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";
import DeleteConfirmModal from "./DeleteConfirmModal"; 

export default function LrPage() {
  const { slug } = useParams(); // NEW: Get "demo-transport" or "somnath" from URL
  
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (slug) fetchLrs(); // Only fetch if we know the transport
  }, [slug]);

  const fetchLrs = (from = "", to = "") => {
    setLoading(true);
    // NEW: Attach the transport slug to the API request
    let url = `/api/lr?transport=${slug}`; 
    if (from && to) {
      url += `&from=${from}&to=${to}`;
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
    // NEW: When adding a new LR, attach the transport tag immediately!
    setViewData({ transportSlug: slug }); 
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

  const filteredLrs = lrs.filter((lr) => {
    if (!searchTerm) return true; 

    const searchLower = searchTerm.toLowerCase();
    const matchLrNo = lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower);
    const matchFrom = lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower);
    const matchTo = lr.toCity && lr.toCity.toLowerCase().includes(searchLower);

    return matchLrNo || matchFrom || matchTo;
  });

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
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