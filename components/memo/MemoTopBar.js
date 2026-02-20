"use client";
import { useState, useEffect, useRef } from "react"; // Added useEffect and useRef

export default function MemoTopBar({ onFilter, searchTerm, onSearchChange }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // NEW: Reference for the search input
  const searchInputRef = useRef(null);

  // NEW: F1 Keyboard Shortcut
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
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-lg font-semibold text-gray-800">
        List Of Memo
      </h1>

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

        {/* UPDATED: Connected to search state and ref */}
        <input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Fast Search (F1)"
          className="input ml-3 w-56"
        />
      </div>
    </div>
  );
}