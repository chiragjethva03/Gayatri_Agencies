"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

const getTodayIST = () => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split("T")[0];
};

export default function MemoTopBar({ onFilter, searchTerm, onSearchChange, clearTrigger }) {
  const { slug } = useParams();
  const transportName = slug ? slug.replace(/-/g, ' ').toUpperCase() : "";

  const [fromDate, setFromDate] = useState(getTodayIST);
  const [toDate, setToDate] = useState(getTodayIST);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const today = getTodayIST();
    setFromDate(today);
    setToDate(today);
  }, [clearTrigger]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="mb-4">
      {transportName && (
        <h1 className="text-2xl font-bold text-slate-800 mb-5">{transportName}</h1>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">List Of Memo</h2>

        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-gray-500 text-sm">To</span>
          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={() => onFilter && onFilter(fromDate, toDate)}
          >
            Go
          </button>
          <input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Fast Search (F1)"
            className="input ml-3 w-56"
          />
        </div>
      </div>
    </div>
  );
}
