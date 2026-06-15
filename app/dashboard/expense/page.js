"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { Wallet, ChevronLeft } from "lucide-react";
import ExpenseTopBar from "@/components/expense/ExpenseTopBar";
import ExpenseActionBar from "@/components/expense/ExpenseActionBar";
import ExpenseTable from "@/components/expense/ExpenseTable";
import ExpenseEntryPanel from "@/components/expense/ExpenseEntryPanel";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";
import LockPasswordModal from "@/components/ui/LockPasswordModal";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

const getTodayIST = () => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

const isExpenseLocked = (record) => record?.isLocked === true || record?.date < getTodayIST();

export default function GlobalExpensePage() {
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);

  const [panelMode, setPanelMode] = useState("add");
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const activeFilter = useRef({ from: getTodayIST(), to: getTodayIST() });

  const fetchRecords = async (from, to) => {
    const f = from !== undefined ? from : activeFilter.current.from;
    const t = to !== undefined ? to : activeFilter.current.to;
    activeFilter.current = { from: f, to: t };
    setLoading(true);
    try {
      let url = "/api/expense";
      if (f && t) url += `?from=${f}&to=${t}`;
      const res = await fetch(url);
      if (res.ok) setRecords(await res.json());
    } catch (err) {
      console.error("Failed to fetch expense records", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const today = getTodayIST();
    setClearTrigger(prev => prev + 1);
    fetchRecords(today, today);
  };

  useEffect(() => {
    const today = getTodayIST();
    fetchRecords(today, today);
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openLockModal = (action) => {
    setPendingAction(() => action);
    setShowLockModal(true);
  };

  const requireUnlock = (action) => {
    if (isSessionUnlocked) { action(); return; }
    openLockModal(action);
  };

  const handleUnlocked = () => {
    setIsSessionUnlocked(true);
    setShowLockModal(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  };

  const closeLockModal = () => {
    setShowLockModal(false);
    setPendingAction(null);
  };

  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    setViewData(records.find((r) => r._id === selectedIds[0]));
    setPanelMode("view");
    setShowEntry(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    const record = records.find((r) => r._id === selectedIds[0]);
    const doEdit = () => {
      setViewData(record);
      setPanelMode("edit");
      setShowEntry(true);
    };
    isExpenseLocked(record) ? requireUnlock(doEdit) : doEdit();
  };

  const handleAdd = () => {
    setViewData({ paymentMode: "Cash" });
    setPanelMode("add");
    setShowEntry(true);
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    const hasLocked = selectedIds.some((id) =>
      isExpenseLocked(records.find((r) => r._id === id))
    );
    const doDelete = () => setShowDeleteModal(true);
    hasLocked ? requireUnlock(doDelete) : doDelete();
  };

  const executeDelete = async () => {
    try {
      await fetch("/api/expense", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds }),
        headers: { "Content-Type": "application/json" },
      });
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r._id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredRecords = records.filter((r) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !debouncedSearch ||
      (r.payerName && r.payerName.toLowerCase().includes(s)) ||
      (r.payeeName && r.payeeName.toLowerCase().includes(s)) ||
      (r.narration && r.narration.toLowerCase().includes(s))
    );
  });

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]">
      <TailChase size="40" speed="1.75" color="#2563eb" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
          >
            <ChevronLeft size={16} />
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-amber-500" />
            <h1 className="text-base font-bold text-slate-800">Daily Expense</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <ExpenseTopBar
          onFilter={fetchRecords}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          clearTrigger={clearTrigger}
        />

        <ExpenseActionBar
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh}
          selectedCount={selectedIds.length}
        />

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
              onClose={() => {
                setShowEntry(false);
                setIsSessionUnlocked(false);
                fetchRecords();
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

      <LockPasswordModal
        isOpen={showLockModal}
        title="Expense Locked"
        description="This expense is from a previous day and was automatically locked after midnight IST. Enter the admin password to proceed."
        onUnlock={handleUnlocked}
        onCancel={closeLockModal}
      />
    </div>
  );
}
