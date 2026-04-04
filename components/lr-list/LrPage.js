"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation"; 
import * as XLSX from "xlsx"; 
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";
import DeleteConfirmModal from "./DeleteConfirmModal"; 
import { generateLrPdf } from "@/lib/generateLrPdf"; 

export default function LrPage() {
  const { slug } = useParams(); 
  
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);

  // --- NEW: STATE FOR TO CITY FILTER ---
  const [toCityFilter, setToCityFilter] = useState("All");

  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [transportDetails, setTransportDetails] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchTransportMasterData(); 
      fetchLrs(); 
    }
  }, [slug]);

  const fetchTransportMasterData = async () => {
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const transports = await res.json();
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        const currentTransport = transports.find(t => 
          t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug
        );
        
        if (currentTransport) {
          setTransportDetails(currentTransport);
        } else {
          console.warn("Transport not found in DB match!");
        }
      }
    } catch (error) {
      console.error("Failed to fetch transport master data", error);
    }
  };

  // Note: Date filtering is already handled here by passing from/to to the API
  const fetchLrs = (from = "", to = "") => {
    setLoading(true);
    let url = `/api/lr?transport=${slug}`; 
    if (from && to) url += `&from=${from}&to=${to}`;

    fetch(url)
      .then((res) => res.json())
      .then(setLrs)
      .finally(() => setLoading(false));
  };

  const handleRefresh = () => {
    setSearchTerm(""); 
    setToCityFilter("All"); // --- FIXED: Reset the new filter on refresh ---
    setClearTrigger(prev => prev + 1); 
    fetchLrs(); 
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    setViewData(lrs.find(lr => lr._id === selectedIds[0])); 
    setPanelMode("view"); 
    setShowEntry(true);       
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    setViewData(lrs.find(lr => lr._id === selectedIds[0])); 
    setPanelMode("edit"); 
    setShowEntry(true);       
  };

  const handleAdd = () => {
    setViewData({ transportSlug: slug }); 
    setPanelMode("add"); 
    setShowEntry(true);
  }

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    await fetch('/api/lr', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selectedIds }),
      headers: { 'Content-Type': 'application/json' }
    });
    setLrs(prev => prev.filter(lr => !selectedIds.includes(lr._id)));
    setSelectedIds([]);
    setShowDeleteModal(false); 
  };

  const handlePrintSelected = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one LR to print.");
    const selectedRow = { ...lrs.find(lr => lr._id === selectedIds[0]) };
    generateLrPdf(selectedRow, transportDetails); 
  };

  // --- NEW: DYNAMICALLY GET UNIQUE "TO CITIES" FOR THE DROPDOWN ---
  const uniqueToCities = useMemo(() => {
    const cities = lrs.map(lr => lr.toCity).filter(city => city && city.trim() !== "");
    return [...new Set(cities)].sort();
  }, [lrs]);

  // --- FIXED: FILTER BY SEARCH TERM *AND* TO CITY DROPDOWN ---
  const filteredLrs = lrs.filter((lr) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
           (lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower)) ||
           (lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower)) ||
           (lr.toCity && lr.toCity.toLowerCase().includes(searchLower));
           
    const matchesToCity = toCityFilter === "All" || lr.toCity === toCityFilter;

    return matchesSearch && matchesToCity;
  });

  const handleExportExcel = () => {
    if (filteredLrs.length === 0) return alert("No data available to export.");
    const excelData = filteredLrs.map((lr) => ({
      "LR Date": lr.lrDate || "-", "LR No": lr.lrNo || "-", "From City": lr.fromCity || "-",
      "To City": lr.toCity || "-", "Center": lr.center || "-", "Consignor": lr.consignor || "-",
      "Consignee": lr.consignee || "-", "Total Freight": Number(lr.subTotal) || 0, "Freight By": lr.freightBy || "-"
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LR List");
    XLSX.writeFile(workbook, `LR_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <LrTopBar onFilter={fetchLrs} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      <LrActionBar 
        onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick} 
        selectedCount={selectedIds.length} onExportExcel={handleExportExcel} onRefresh={handleRefresh} onPrint={handlePrintSelected} 
      />
      <div className="relative mt-3">
        {/* --- FIXED: PASSING NEW PROPS TO TABLE --- */}
        <LrTable 
          lrs={filteredLrs} 
          loading={loading} 
          selectedIds={selectedIds} 
          onToggle={toggleSelection}
          toCityFilter={toCityFilter}
          setToCityFilter={setToCityFilter}
          uniqueToCities={uniqueToCities} 
        />
        
        {showEntry && (
          <LrEntryPanel 
            mode={panelMode} 
            initialData={viewData} 
            transport={transportDetails} 
            onClose={() => { setShowEntry(false); fetchLrs(); }} 
          />
        )}
        
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}