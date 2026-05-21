"use client";
import { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";
import ColumnMultiFilter from "./ColumnMultiFilter";

const FREIGHT_OPTIONS = ["Paid", "To Pay", "TBB"];

export default function LrTableHeader({
  toCityFilter, setToCityFilter, uniqueToCities = [],
  freightByFilter, setFreightByFilter,
  consignorFilter, setConsignorFilter, uniqueConsignors = [],
  allSelected, someSelected, onSelectAll,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFreightFilterOpen, setIsFreightFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const freightFilterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (freightFilterRef.current && !freightFilterRef.current.contains(event.target)) {
        setIsFreightFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <thead className="bg-gray-200 sticky top-0 z-10">
      <tr>
        <th className="th w-8">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-gray-400 accent-blue-600 cursor-pointer"
          />
        </th>
        <th className="th w-[90px]">LR Date</th>
        <th className="th w-[80px]">LR No</th>
        <th className="th w-[105px]">From City</th>

        {/* TO CITY — single-select filter (existing) */}
        <th className="th w-[115px] relative">
          <div className="flex items-center gap-1" ref={filterRef}>
            To City
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1 rounded transition-colors ${toCityFilter !== "All" ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:bg-gray-300 hover:text-gray-800"}`}
              title="Filter by City"
            >
              <ListFilter size={15} strokeWidth={2.5} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700">
                <div
                  className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${toCityFilter === "All" ? "bg-blue-50 font-bold text-blue-600" : ""}`}
                  onClick={() => { setToCityFilter("All"); setIsFilterOpen(false); }}
                >
                  All
                </div>
                {uniqueToCities.map((city, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 truncate ${toCityFilter === city ? "bg-blue-50 font-bold text-blue-600" : ""}`}
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

        {/* CONSIGNOR — multi-select filter */}
        <th className="th w-[200px] relative">
          <ColumnMultiFilter
            label="Consigner"
            options={uniqueConsignors}
            selected={consignorFilter}
            onChange={setConsignorFilter}
          />
        </th>

        <th className="th w-[200px]">Consignee</th>
        <th className="th w-[110px]">Articles</th>
        <th className="th w-[120px]">Total Freight</th>
        <th className="th w-[160px] relative">
          <div className="flex items-center gap-1" ref={freightFilterRef}>
            Freight
            <button
              onClick={() => setIsFreightFilterOpen(!isFreightFilterOpen)}
              className={`p-1 rounded transition-colors ${freightByFilter !== "All" ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:bg-gray-300 hover:text-gray-800"}`}
              title="Filter by Freight By"
            >
              <ListFilter size={15} strokeWidth={2.5} />
            </button>

            {isFreightFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700">
                <div
                  className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${freightByFilter === "All" ? "bg-blue-50 font-bold text-blue-600" : ""}`}
                  onClick={() => { setFreightByFilter("All"); setIsFreightFilterOpen(false); }}
                >
                  All
                </div>
                {FREIGHT_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${freightByFilter === opt ? "bg-blue-50 font-bold text-blue-600" : ""}`}
                    onClick={() => { setFreightByFilter(opt); setIsFreightFilterOpen(false); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </th>
      </tr>
    </thead>
  );
}
