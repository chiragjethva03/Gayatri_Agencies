"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ExpenseTopBar from "@/components/expense/ExpenseTopBar";
import ExpenseActionBar from "@/components/expense/ExpenseActionBar";
import ExpenseTable from "@/components/expense/ExpenseTable";
import ExpenseEntryPanel from "@/components/expense/ExpenseEntryPanel";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

const getTodayIST = () => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

const isExpenseLocked = (record) => record?.isLocked === true || record?.date < getTodayIST();

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

  const activeFilter = useRef({ from: getTodayIST(), to: getTodayIST() });

  // ── Lock state ───────────────────────────────────────────
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (slug) fetchRecords();
  }, [slug]);

  const fetchRecords = async (from, to) => {
    const f = from !== undefined ? from : activeFilter.current.from;
    const t = to !== undefined ? to : activeFilter.current.to;
    activeFilter.current = { from: f, to: t };
    setLoading(true);
    try {
      let url = `/api/expense?transport=${slug}`;
      if (f && t) url += `&from=${f}&to=${t}`;
      const res = await fetch(url);
      if (res.ok) setRecords(await res.json());
    } catch (error) {
      console.error("Failed to fetch expense records", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setClearTrigger(prev => prev + 1);
    const today = getTodayIST();
    fetchRecords(today, today);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ── Lock helpers ─────────────────────────────────────────
  const openLockModal = (action) => {
    setPendingAction(() => action);
    setLockPassword("");
    setLockError("");
    setShowLockModal(true);
  };

  const requireUnlock = (action) => {
    if (isSessionUnlocked) { action(); return; }
    openLockModal(action);
  };

  const handleVerifyPassword = async () => {
    if (!lockPassword.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/expense/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: lockPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSessionUnlocked(true);
        setShowLockModal(false);
        setLockPassword("");
        setLockError("");
        if (pendingAction) { pendingAction(); setPendingAction(null); }
      } else {
        setLockError(data.error || "Incorrect password. Please try again.");
      }
    } catch {
      setLockError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const closeLockModal = () => {
    setShowLockModal(false);
    setLockPassword("");
    setLockError("");
    setPendingAction(null);
  };

  // ── Actions ──────────────────────────────────────────────
  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    setViewData(records.find(r => r._id === selectedIds[0]));
    setPanelMode("view");
    setShowEntry(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    const record = records.find(r => r._id === selectedIds[0]);
    const doEdit = () => {
      setViewData(record);
      setPanelMode("edit");
      setShowEntry(true);
    };
    isExpenseLocked(record) ? requireUnlock(doEdit) : doEdit();
  };

  const handleAdd = () => {
    setViewData({ transportSlug: slug, paymentMode: "Cash" });
    setPanelMode("add");
    setShowEntry(true);
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    const hasLocked = selectedIds.some(id =>
      isExpenseLocked(records.find(r => r._id === id))
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

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]">
      <TailChase size="40" speed="1.75" color="#2563eb" />
    </div>
  );

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
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
            transport={slug}
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

      {/* ── LOCK PASSWORD MODAL ── */}
      {showLockModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-amber-100 overflow-hidden">

            <div className="bg-amber-500 text-white px-5 py-3 flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span className="font-bold text-sm tracking-wide">Expense Locked</span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                This expense is locked. Enter the admin password to proceed.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Admin Password
                </label>
                <input
                  autoFocus
                  type="password"
                  value={lockPassword}
                  onChange={(e) => { setLockPassword(e.target.value); setLockError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                  placeholder="Enter password..."
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition
                    ${lockError
                      ? "border-red-400 bg-red-50 focus:border-red-400"
                      : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                    }`}
                />
                {lockError && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">{lockError}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeLockModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPassword}
                disabled={isVerifying || !lockPassword.trim()}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Verifying...
                  </>
                ) : "Unlock"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
