"use client";

import { useState, useRef, useEffect } from "react";

export default function LrActionBar({ onAdd, onEdit, onDelete, onView, selectedCount, onExportExcel, onRefresh }) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex items-center justify-between">
      
      {/* LEFT SIDE: Primary Row Actions */}
      <div className="flex items-center gap-3">
        
        <button 
          onClick={onAdd} 
          className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <button 
          onClick={onEdit} 
          disabled={selectedCount !== 1}
          className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all flex items-center gap-2
            ${selectedCount === 1 
              ? 'bg-white border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          ✏️ Edit
        </button>
        
        <button 
          onClick={onView}
          disabled={selectedCount !== 1}
          className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all flex items-center gap-2
            ${selectedCount === 1 
              ? 'bg-white border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          👁 View
        </button>
        
        <button 
          onClick={onDelete}
          disabled={selectedCount === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all flex items-center gap-2
            ${selectedCount > 0 
              ? 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          🗑 Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
        </button>
      </div>

      {/* RIGHT SIDE: Secondary Utility Actions */}
      <div className="flex items-center gap-3">
        
        {/* UPDATED: Added onClick={onRefresh} right here! */}
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          🔄 Refresh
        </button>

        <div className="relative" ref={dropdownRef}>
          
          <button 
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            📥 Download
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              fill="currentColor" 
              viewBox="0 0 16 16"
              className={`transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>

          {isDownloadOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
              <button 
                onClick={() => {
                  setIsDownloadOpen(false);
                  // Add your print logic here later
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                🖨 Print
              </button>
              
              <button 
                onClick={() => {
                  setIsDownloadOpen(false);
                  onExportExcel(); 
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                📊 Excel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}