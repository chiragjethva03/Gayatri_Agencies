"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

import MemoTopBar from "./MemoTopBar";
import MemoActionBar from "./MemoActionBar";
import MemoTable from "./MemoTable";
import MemoForm from "./MemoForm"; 
import DeleteConfirmModal from "../lr-list/DeleteConfirmModal";

export default function MemoContent() {
  const params = useParams();
  const slug = params?.slug;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [memos, setMemos] = useState([]);
  
  // NEW STATE: Search Term
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchMemos = async (from = "", to = "") => {
    let url = `/api/memo?transport=${slug}`;
    if (from && to) {
      url += `?from=${from}&to=${to}`;
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

  // NEW LOGIC: Filter the list based on Memo No or City
  const filteredMemos = memos.filter((memo) => {
    const search = searchTerm.toLowerCase();
    const memoNoMatch = memo.memoNo?.toString().toLowerCase().includes(search);
    const cityMatch = memo.toCity?.toLowerCase().includes(search);
    return memoNoMatch || cityMatch;
  });

  const handleAddClick = () => {
    setViewData({ transportSlug: slug });
    setIsFormOpen(true);
  };

  const handleViewClick = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one Memo to view.");
      return;
    }
    const selectedMemo = memos.find((m) => m._id === selectedIds[0]);
    setViewData(selectedMemo); 
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

  if (!slug || loading) return <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]"><TailChase size="40" speed="1.75" color="#2563eb" /></div>;
  if (error) return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Failed to load transport data</div>;
  if (!transport) return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Transport not found</div>;

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      {/* UPDATED: Passing search props to TopBar */}
      <MemoTopBar 
        onFilter={fetchMemos} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <MemoActionBar 
        onAdd={handleAddClick} 
        onView={handleViewClick} 
        onDelete={handleDeleteClick}
        selectedCount={selectedIds.length}
      />

      <div className="relative mt-3">
        {/* UPDATED: Passing filteredMemos instead of memos */}
        <MemoTable 
          memos={filteredMemos} 
          selectedIds={selectedIds}
          onToggle={toggleSelection}
        />

       {/* UPDATED: Wrap MemoForm in this condition so it resets every time! */}
        {isFormOpen && (
          <MemoForm 
            isOpen={isFormOpen} 
            onClose={() => setIsFormOpen(false)} 
            transport={transport}
            onSaveSuccess={fetchMemos} 
            initialData={viewData}
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