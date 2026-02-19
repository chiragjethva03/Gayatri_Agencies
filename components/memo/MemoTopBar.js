"use client";
import { useState } from "react";

export default function MemoTopBar({ onFilter }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

        <input
          placeholder="Fast Search (F1)"
          className="input ml-3 w-56"
        />
      </div>
    </div>
  );
}