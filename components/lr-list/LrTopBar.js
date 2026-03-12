"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

export default function LrTopBar({ onFilter, searchTerm, onSearchChange, clearTrigger }) {
  const { slug } = useParams(); 
  const transportName = slug ? slug.replace(/-/g, ' ').toUpperCase() : ""; 

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    setFromDate("");
    setToDate("");
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
      {/* BIG DASHBOARD HEADER AT THE VERY TOP */}
      {transportName && (
        <h1 className="text-2xl font-bold text-slate-800 mb-5">
          {transportName}
        </h1>
      )}

      {/* FILTER BAR SECTION */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          List Of LR
        </h2>

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