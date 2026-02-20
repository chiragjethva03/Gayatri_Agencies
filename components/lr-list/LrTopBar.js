"use client";
import { useState, useEffect, useRef } from "react";

// NEW: Accept searchTerm and onSearchChange as props
export default function LrTopBar({ onFilter, searchTerm, onSearchChange }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // NEW: Create a reference to the search input so we can focus it programmatically
  const searchInputRef = useRef(null);

  // NEW: Listen for the F1 keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1") {
        e.preventDefault(); // Stop the browser's default F1 Help menu
        searchInputRef.current?.focus(); // Jump the cursor into the search box!
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return ( 
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-lg font-semibold text-gray-800">
        List Of LR
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
          onClick={() => onFilter(fromDate, toDate)}
        >
          Go
        </button>

        {/* UPDATED: Attach the ref, value, and onChange to the search input */}
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