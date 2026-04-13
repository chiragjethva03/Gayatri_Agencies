"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import ExpenseTopBar from "@/components/expense/ExpenseTopBar";
import ExpenseActionBar from "@/components/expense/ExpenseActionBar";
import ExpenseTable from "@/components/expense/ExpenseTable";
import ExpenseEntryPanel from "@/components/expense/ExpenseEntryPanel";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";

export default function ExpensePage() {
  const { slug } = useParams(); 
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);
  
  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (slug) fetchRecords(); 
  }, [slug]);

  const fetchRecords = async (from = "", to = "") => {
    setLoading(true);
    try {
      let url = `/api/expense?transport=${slug}`;
      if (from && to) url += `&from=${from}&to=${to}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch expense records", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    setViewData(records.find(r => r._id === selectedIds[0])); 
    setPanelMode("view"); 
    setShowEntry(true);       
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    setViewData(records.find(r => r._id === selectedIds[0])); 
    setPanelMode("edit"); 
    setShowEntry(true);       
  };

  const handleAdd = () => {
    setViewData({ transportSlug: slug, status: "To Pay" }); 
    setPanelMode("add"); 
    setShowEntry(true);
  }

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await fetch('/api/expense', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
        headers: { 'Content-Type': 'application/json' }
      });
      setRecords(prev => prev.filter(r => !selectedIds.includes(r._id)));
      setSelectedIds([]);
      setShowDeleteModal(false); 
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const filteredRecords = records.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
           (r.payerName && r.payerName.toLowerCase().includes(searchLower)) ||
           (r.payeeName && r.payeeName.toLowerCase().includes(searchLower)) ||
           (r.narration && r.narration.toLowerCase().includes(searchLower));
  });

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <ExpenseTopBar onFilter={fetchRecords} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      
      <ExpenseActionBar onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick} selectedCount={selectedIds.length} />
      
      <div className="relative mt-3">
        <ExpenseTable 
          records={filteredRecords} 
          loading={loading} 
          selectedIds={selectedIds} 
          onToggle={toggleSelection} 
        />
        
        {showEntry && (
          <ExpenseEntryPanel 
            mode={panelMode} 
            initialData={viewData} 
            transport={slug}
            onClose={() => { setShowEntry(false); fetchRecords(); }} 
          />
        )}
        
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}