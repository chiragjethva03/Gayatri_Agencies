"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import * as XLSX from "xlsx"; 

import MemoTopBar from "./MemoTopBar";
import MemoActionBar from "./MemoActionBar";
import MemoTable from "./MemoTable";
import MemoForm from "./MemoForm"; 
import DeleteConfirmModal from "../lr-list/DeleteConfirmModal";
import { generateMemoPdf } from "@/lib/generateMemoPdf"; 

export default function MemoContent() {
  const params = useParams();
  const slug = params?.slug;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [formMode, setFormMode] = useState("add"); // --- NEW: Tracks if we are Adding, Editing, or Viewing ---
  
  const [memos, setMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchMemos = async (from = "", to = "") => {
    let url = `/api/memo?transport=${slug}`;
    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setMemos(data);
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/transports?slug=${slug}`);
        if (!res.ok) throw new Error("SERVER_ERROR");
        const data = await res.json();
        setTransport(data);
      } catch (err) {
        console.error("Failed to fetch transport", err);
        setError("SERVER_ERROR");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchTransport();
  }, [slug]);

  const handleRefresh = () => {
    setSearchTerm(""); 
    setClearTrigger(prev => prev + 1); 
    fetchMemos(); 
  };

  const filteredMemos = memos.filter((memo) => {
    const search = searchTerm.toLowerCase();
    const memoNoMatch = memo.memoNo?.toString().toLowerCase().includes(search);
    const cityMatch = memo.toCity?.toLowerCase().includes(search);
    return memoNoMatch || cityMatch;
  });

  const handleAddClick = () => {
    setViewData({ transportSlug: slug });
    setFormMode("add"); // Set mode
    setIsFormOpen(true);
  };

  // --- NEW: Handle Edit ---
  const handleEditClick = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one Memo to edit.");
      return;
    }
    const selectedMemo = memos.find((m) => m._id === selectedIds[0]);
    setViewData(selectedMemo); 
    setFormMode("edit"); // Set mode
    setIsFormOpen(true);
  };

  // --- NEW: Handle View ---
  const handleViewClick = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one Memo to view.");
      return;
    }
    const selectedMemo = memos.find((m) => m._id === selectedIds[0]);
    setViewData(selectedMemo); 
    setFormMode("view"); // Set mode
    setIsFormOpen(true);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await fetch('/api/memo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setMemos((prev) => prev.filter((m) => !selectedIds.includes(m._id)));
      setSelectedIds([]); 
      setShowDeleteModal(false); 
    } catch (err) {
      alert("Error deleting memo: " + err.message);
    }
  };

  const handlePrintSelected = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one Memo to print.");
      return;
    }
    const selectedMemo = memos.find((m) => m._id === selectedIds[0]);
    if (selectedMemo) {
      generateMemoPdf(selectedMemo); 
    }
  };

  const handleExportExcel = () => {
    if (filteredMemos.length === 0) {
      alert("No data available to export.");
      return;
    }
    const excelData = filteredMemos.map((memo) => ({
      "Memo Date": memo.memoDate || "-",
      "Memo No": memo.memoNo || "-",
      "Truck No": memo.truckNo || "-",
      "City": memo.toCity || "-",
      "Freight": Number(memo.totalFreight) || 0,
      "Weight": Number(memo.totalWeight) || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Memo List");
    const fileName = `Memo_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (!slug || loading) return <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]"><TailChase size="40" speed="1.75" color="#2563eb" /></div>;
  if (error) return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Failed to load transport data</div>;
  if (!transport) return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Transport not found</div>;

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <MemoTopBar onFilter={fetchMemos} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      
      <MemoActionBar 
        onAdd={handleAddClick} 
        onEdit={handleEditClick} // Wired up
        onView={handleViewClick} // Wired up
        onDelete={handleDeleteClick}
        selectedCount={selectedIds.length}
        onExportExcel={handleExportExcel} 
        onRefresh={handleRefresh}
        onPrint={handlePrintSelected} 
      />

      <div className="relative mt-3">
        <MemoTable memos={filteredMemos} selectedIds={selectedIds} onToggle={toggleSelection} />

    {isFormOpen && (
          <MemoForm 
            isOpen={isFormOpen} 
            onClose={() => setIsFormOpen(false)} 
            transport={transport}
            transportSlug={slug} // <--- NEW: Explicitly pass the slug!
            onSaveSuccess={fetchMemos} 
            initialData={viewData}
            mode={formMode} 
          />
        )}

        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}