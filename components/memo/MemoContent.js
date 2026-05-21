"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const getTodayIST = () => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

export default function MemoContent() {
  const params = useParams();
  const slug = params?.slug;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  const [memos, setMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  // Track active date filter so refresh and post-save re-fetch stay on same range
  const activeFilterRef = useRef({ from: getTodayIST(), to: getTodayIST() });

  const fetchMemos = async (from, to) => {
    const f = from !== undefined ? from : activeFilterRef.current.from;
    const t = to !== undefined ? to : activeFilterRef.current.to;
    activeFilterRef.current = { from: f, to: t };
    try {
      let url = `/api/memo?transport=${slug}`;
      if (f && t) url += `&from=${f}&to=${t}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setMemos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch memos", err);
    }
  };

  useEffect(() => {
    if (slug) {
      const today = getTodayIST();
      fetchMemos(today, today);
    }
  }, [slug]);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/transports/${slug}`);
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

  // Branch options derived from transport locations + any toBranch values already in loaded memos.
  // No extra API call — reuses already-fetched data.
  const branchOptions = useMemo(() => {
    const fromTransport = (transport?.locations || [])
      .map(l => (typeof l === "string" ? l : l?.name || ""))
      .filter(Boolean);
    const fromMemos = memos.map(m => m.toBranch).filter(Boolean);
    return [...new Set([...fromTransport, ...fromMemos])].sort();
  }, [transport, memos]);

  const handleRefresh = () => {
    setSearchTerm("");
    setBranchFilter("");
    setClearTrigger(prev => prev + 1);
    const today = getTodayIST();
    fetchMemos(today, today);
  };

  const filteredMemos = memos.filter((memo) => {
    const search = searchTerm.toLowerCase();
    const searchMatch =
      memo.memoNo?.toString().toLowerCase().includes(search) ||
      memo.toCity?.toLowerCase().includes(search);
    const branchMatch = !branchFilter || memo.toBranch === branchFilter;
    return searchMatch && branchMatch;
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

  const handleSelectAll = () => {
    const allIds = filteredMemos.map(m => m._id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
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

  const handlePrintSelected = async () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one Memo to print.");
      return;
    }
    const selectedMemo = memos.find((m) => m._id === selectedIds[0]);
    if (!selectedMemo) return;

    // Live-enrich goods amounts for LR entries saved before per-goods amount was introduced
    let memoData = selectedMemo;
    const needsEnrichment = (selectedMemo.lrList || []).some(lr =>
      (lr.goods || []).length > 0 && (lr.goods || []).every(g => !(Number(g.amount) > 0))
    );
    if (needsEnrichment) {
      try {
        const res = await fetch(`/api/lr?transport=${slug}&all=true`);
        if (res.ok) {
          const allLrs = await res.json();
          const enrichedLrList = (selectedMemo.lrList || []).map(lr => {
            if ((lr.goods || []).some(g => Number(g.amount) > 0)) return lr;
            const foundLr = allLrs.find(l =>
              String(l.lrNo).trim().toLowerCase() === String(lr.lrNo).trim().toLowerCase()
            );
            if (!foundLr?.goods?.length) return lr;
            return {
              ...lr,
              goods: (lr.goods || []).map((g, idx) => ({
                ...g,
                amount: Number(foundLr.goods[idx]?.amount) || 0,
              })),
            };
          });
          memoData = { ...selectedMemo, lrList: enrichedLrList };
        }
      } catch {
        // fallback: print with unenriched data
      }
    }
    generateMemoPdf(memoData, "print");
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
      <MemoTopBar
        onFilter={fetchMemos}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        clearTrigger={clearTrigger}
      />
      
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
        <MemoTable
          memos={filteredMemos}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={handleSelectAll}
          branchFilter={branchFilter}
          onBranchChange={setBranchFilter}
          branchOptions={branchOptions}
        />

    {isFormOpen && (
          <MemoForm 
            isOpen={isFormOpen} 
            onClose={() => setIsFormOpen(false)} 
            transport={transport}
            transportSlug={slug} // <--- NEW: Explicitly pass the slug!
            onSaveSuccess={() => fetchMemos(activeFilterRef.current.from, activeFilterRef.current.to)}
            initialData={viewData}
            mode={formMode} 
          />
        )}

        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}