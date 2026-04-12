"use client";
import { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";
export default function LrTableHeader({ toCityFilter, setToCityFilter, uniqueToCities = [] }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown if user clicks away
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <thead className="bg-gray-200 sticky top-0 z-10">
      <tr>
        <th className="th w-8"></th>
        <th className="th">LR Date</th>
        <th className="th">LR No</th>
        <th className="th">From City</th>
        
        {/* --- FIXED: TO CITY COLUMN WITH DYNAMIC FILTER DROPDOWN --- */}
        <th className="th relative">
          <div className="flex items-center gap-1" ref={filterRef}>
            To City
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className={`p-1 rounded transition-colors ${toCityFilter !== "All" ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:bg-gray-300 hover:text-gray-800"}`}
              title="Filter by City"
            >
              {/* REPLACED SVG WITH LUCIDE ICON */}
              <ListFilter size={15} strokeWidth={2.5} />
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700">
                <div
                  className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${toCityFilter === 'All' ? 'bg-blue-50 font-bold text-blue-600' : ''}`}
                  onClick={() => { setToCityFilter('All'); setIsFilterOpen(false); }}
                >
                  All
                </div>
                
                {/* Dynamically render all unique cities */}
                {uniqueToCities.map((city, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 truncate ${toCityFilter === city ? 'bg-blue-50 font-bold text-blue-600' : ''}`}
                    onClick={() => { setToCityFilter(city); setIsFilterOpen(false); }}
                    title={city}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </th>

        {/* <th className="th">Center</th> */}
        <th className="th">Consigner</th>
        
        {/* NEW: Replaced Cash columns with Consignee */}
        <th className="th">Consignee</th>
        
        <th className="th">Total Freight</th>
        <th className="th">Freight</th>
      </tr>
    </thead>
  );
}