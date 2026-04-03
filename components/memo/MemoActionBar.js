"use client";

import { useState, useRef, useEffect } from "react";
// IMPORT PROFESSIONAL ICONS
import { Plus, Pencil, Eye, Trash2, RefreshCw, Download, ChevronDown, Printer, FileSpreadsheet } from "lucide-react";

export default function MemoActionBar({ onAdd, onEdit, onDelete, onView, selectedCount, onExportExcel, onRefresh, onPrint }) {
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
          <Plus size={18} strokeWidth={2.5} /> Add
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
          <Pencil size={16} /> Edit
        </button>
        
        <button 
          onClick={onView}
          disabled={selectedCount !== 1}
          className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all flex items-center gap-2
            ${selectedCount === 1 
              ? 'bg-white border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <Eye size={16} /> View
        </button>
        
        <button 
          onClick={onDelete}
          disabled={selectedCount === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all flex items-center gap-2
            ${selectedCount > 0 
              ? 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <Trash2 size={16} /> Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
        </button>
      </div>

      {/* RIGHT SIDE: Secondary Utility Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Refresh
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Download size={16} /> Download
            <ChevronDown size={16} className={`transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDownloadOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
              <button 
                onClick={() => {
                  setIsDownloadOpen(false);
                  if(onPrint) onPrint(); 
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Printer size={16} /> Print
              </button>
              
              <button 
                onClick={() => {
                  setIsDownloadOpen(false);
                  if(onExportExcel) onExportExcel(); 
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}