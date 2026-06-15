"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ListFilter } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import MemoEmptyState from "./MemoEmptyState";
import MemoTableRow from "./MemoTableRow";

const COLUMNS = [
  { label: "",          key: null,        sortable: false, hasFilter: false },
  { label: "A",         key: null,        sortable: false, hasFilter: false },
  { label: "Memo Date", key: "date",      sortable: false, hasFilter: false },
  { label: "Memo No",   key: "memoNo",    sortable: true,  hasFilter: false },
  { label: "Truck",     key: "vehicle",   sortable: false, hasFilter: false },
  { label: "City",      key: "toCity",    sortable: false, hasFilter: false },
  { label: "Branch",    key: "toBranch",  sortable: false, hasFilter: true  },
  { label: "Freight",   key: "freight",   sortable: false, hasFilter: false },
  { label: "Weight",    key: "weight",    sortable: false, hasFilter: false },
];

const getSortValue = (memo, key) => {
  if (key === "freight")
    return memo.lrList?.reduce((s, lr) => s + (Number(lr.freight) || 0), 0) ?? 0;
  if (key === "weight")
    return memo.lrList?.reduce((s, lr) => s + (Number(lr.weight) || 0), 0) ?? 0;
  if (key === "memoNo") return parseInt(memo.memoNo) || 0;
  return memo[key] ?? "";
};

export default function MemoTable({
  memos = [],
  loading = false,
  selectedIds = [],
  onToggle,
  onSelectAll,
  branchFilter,
  onBranchChange,
  branchOptions = [],
}) {
  const tableRef  = useRef(null);
  const footerRef = useRef(null);
  const filterRef = useRef(null);      // wraps the filter icon + dropdown together

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);

  // Close the dropdown when clicking anywhere outside the filter widget
  useEffect(() => {
    if (!filterOpen) return;
    const onOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [filterOpen]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const selectBranch = (value) => {
    onBranchChange(value);
    setFilterOpen(false);
  };

  const sortedMemos = useMemo(() => {
    if (!sortKey) return memos;
    return [...memos].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum) && aVal !== "" && bVal !== "") {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [memos, sortKey, sortDir]);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const totalEntries  = memos.length;
  const totalArticles = memos.reduce((total, memo) =>
    total + (memo.lrList || []).reduce((sum, lr) => sum + (Number(lr.article) || 0), 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">

      <div ref={tableRef} onScroll={handleScroll} className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-[1100px] w-full text-sm table-fixed">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {COLUMNS.map((col, i) => {

                // ── Checkbox column ──────────────────────────────────────
                if (col.label === "") {
                  const allSelected = sortedMemos.length > 0 && sortedMemos.every(m => selectedIds.includes(m._id));
                  const someSelected = sortedMemos.some(m => selectedIds.includes(m._id));
                  return (
                    <th key={i} className="px-4 py-3 w-12 text-center font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={onSelectAll}
                        className="w-4 h-4 rounded border-gray-400 accent-blue-600 cursor-pointer"
                      />
                    </th>
                  );
                }

                // ── Branch column — inline filter dropdown ───────────────
                if (col.hasFilter) {
                  const active = !!branchFilter;
                  return (
                    <th key={i} className="px-4 py-3 text-left font-medium text-gray-700">
                      {/* ref wraps BOTH the icon button and the dropdown */}
                      <div ref={filterRef} className="inline-flex items-center gap-1 relative">
                        <span>{col.label}</span>

                        <button
                          onClick={() => setFilterOpen(prev => !prev)}
                          className={`p-0.5 rounded transition-colors ${
                            active
                              ? "text-blue-600 bg-blue-100"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-300"
                          }`}
                          title="Filter by branch"
                        >
                          <ListFilter size={13} />
                        </button>

                        {filterOpen && (
                          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[150px] max-h-60 overflow-y-auto py-1">
                            <button
                              onClick={() => selectBranch("")}
                              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                                !branchFilter ? "text-blue-600 font-semibold" : "text-gray-700"
                              }`}
                            >
                              All
                            </button>
                            {branchOptions.map(branch => (
                              <button
                                key={branch}
                                onClick={() => selectBranch(branch)}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                                  branchFilter === branch ? "text-blue-600 font-semibold" : "text-gray-700"
                                }`}
                              >
                                {branch}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                }

                // ── Regular / sortable column ────────────────────────────
                return (
                  <th
                    key={i}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 text-left font-medium text-gray-700 select-none ${
                      col.sortable ? "cursor-pointer hover:bg-gray-300 transition-colors" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      {col.sortable && (
                        sortKey === col.key ? (
                          sortDir === "asc"
                            ? <ChevronUp   size={13} className="text-blue-600 shrink-0" />
                            : <ChevronDown size={13} className="text-blue-600 shrink-0" />
                        ) : (
                          <ChevronsUpDown size={13} className="text-gray-400 shrink-0" />
                        )
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-16 text-center">
                  <div className="flex justify-center">
                    <TailChase size="40" speed="1.75" color="#2563eb" />
                  </div>
                </td>
              </tr>
            ) : sortedMemos.length === 0 ? (
              <MemoEmptyState colSpan={COLUMNS.length} />
            ) : (
              sortedMemos.map((memo) => (
                <MemoTableRow
                  key={memo._id}
                  memo={memo}
                  isSelected={selectedIds.includes(memo._id)}
                  onToggle={() => onToggle(memo._id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {memos.length > 0 && (
        <div
          ref={footerRef}
          className="bg-blue-50/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden pointer-events-none relative z-10"
        >
          <table className="min-w-[1100px] w-full text-sm font-bold text-gray-800 table-fixed">
            <tbody>
              <tr>
                <td className="px-4 py-3 w-12 border-none"></td>
                <td className="px-4 py-3 border-none font-bold">{totalArticles}</td>
                <td className="px-4 py-3 border-none text-blue-700 text-base tracking-wide whitespace-nowrap">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    {totalEntries} Entries
                  </span>
                </td>
                {/* Memo No, Truck, City, Branch, Freight, Weight */}
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
