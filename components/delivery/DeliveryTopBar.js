"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

export default function DeliveryTopBar({ onFilter, searchTerm, onSearchChange, clearTrigger }) {
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
          List Of Delivery
        </h2>

        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="input border border-gray-300 rounded px-2 py-1" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-gray-500 text-sm">To</span>
          <input 
            type="date" 
            className="input border border-gray-300 rounded px-2 py-1" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          
          <button 
            className="btn-primary bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
            onClick={() => onFilter(fromDate, toDate)}
          >
            Go
          </button>

          <input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Fast Search (F1)"
            className="input ml-3 w-56 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}