"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function ExpenseTopBar({ onFilter, searchTerm, onSearchChange, clearTrigger }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setFromDate("");
    setToDate("");
  }, [clearTrigger]);

  const handleGo = () => onFilter(fromDate, toDate);

  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">List Of Daily Expense</h1>
      
      <div className="flex flex-wrap items-center gap-3">
        
        {/* FIXED: Separated the Date inputs into their own bordered boxes */}
        <input 
          type="date" 
          value={fromDate} 
          onChange={(e) => setFromDate(e.target.value)} 
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none focus:border-blue-500 shadow-sm bg-white" 
        />
        
        <span className="text-gray-500 text-sm font-medium">To</span>
        
        <input 
          type="date" 
          value={toDate} 
          onChange={(e) => setToDate(e.target.value)} 
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none focus:border-blue-500 shadow-sm bg-white" 
        />
        
        <button onClick={handleGo} className="bg-[#2a64f6] hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95 ml-1">
          Go
        </button>

        <div className="relative ml-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Fast Search (F1)" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm w-48 lg:w-60"
          />
        </div>

      </div>
    </div>
  );
}