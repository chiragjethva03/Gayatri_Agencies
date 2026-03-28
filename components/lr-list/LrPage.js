"use client";

import { useEffect, useState } from "react";
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

  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- NEW: State to hold the Transport Master Data ---
  const [transportDetails, setTransportDetails] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchLrs(); 
      fetchTransportMasterData(); // Fetch GST/Mobile when page loads
    }
  }, [slug]);

  // --- NEW: Fetches Transport Details on Page Load ---
  const fetchTransportMasterData = async () => {
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const transports = await res.json();
        // Bulletproof slug matching
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

  // --- UPDATED PRINT LOGIC: Uses pre-loaded transport details ---
  const handlePrintSelected = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one LR to print.");
    
    // Copy the LR row data
    const selectedRow = { ...lrs.find(lr => lr._id === selectedIds[0]) };
    
    // Attach the pre-loaded Transport data to the PDF data
    if (transportDetails) {
      selectedRow.transportGst = transportDetails.gstNo || "-";
      
      const validMobiles = transportDetails.mobileNumbers 
        ? transportDetails.mobileNumbers.filter(num => num && num.trim() !== "")
        : [];
      
      selectedRow.transportMobiles = validMobiles.length > 0 ? validMobiles : ["-"];
    } else {
      selectedRow.transportGst = "-";
      selectedRow.transportMobiles = ["-"];
    }

    // Fire PDF Generator
    generateLrPdf(selectedRow); 
  };

  const filteredLrs = lrs.filter((lr) => {
    if (!searchTerm) return true; 
    const searchLower = searchTerm.toLowerCase();
    return (lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower)) ||
           (lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower)) ||
           (lr.toCity && lr.toCity.toLowerCase().includes(searchLower));
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
        <LrTable lrs={filteredLrs} loading={loading} selectedIds={selectedIds} onToggle={toggleSelection} />
        {showEntry && <LrEntryPanel mode={panelMode} initialData={viewData} onClose={() => { setShowEntry(false); fetchLrs(); }} />}
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}