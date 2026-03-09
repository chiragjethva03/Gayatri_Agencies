"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import * as XLSX from "xlsx"; 
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";
import DeleteConfirmModal from "./DeleteConfirmModal"; 
import { generateLrPdf } from "@/lib/generateLrPdf"; // 1. IMPORT THE GENERATOR

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

  useEffect(() => {
    if (slug) fetchLrs(); 
  }, [slug]);

  const fetchLrs = (from = "", to = "") => {
    setLoading(true);
    let url = `/api/lr?transport=${slug}`; 
    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }

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
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleView = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one row to view.");
      return;
    }
    const selectedRow = lrs.find(lr => lr._id === selectedIds[0]);
    setViewData(selectedRow); 
    setPanelMode("view"); 
    setShowEntry(true);       
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one row to edit.");
      return;
    }
    const selectedRow = lrs.find(lr => lr._id === selectedIds[0]);
    setViewData(selectedRow); 
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

  // 2. CREATE THE PRINT FUNCTION FOR SELECTED ROWS
  const handlePrintSelected = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one LR to print.");
      return;
    }
    const selectedRow = lrs.find(lr => lr._id === selectedIds[0]);
    if (selectedRow) {
      generateLrPdf(selectedRow); // Generate PDF using the checked row's data
    }
  };

  const filteredLrs = lrs.filter((lr) => {
    if (!searchTerm) return true; 

    const searchLower = searchTerm.toLowerCase();
    const matchLrNo = lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower);
    const matchFrom = lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower);
    const matchTo = lr.toCity && lr.toCity.toLowerCase().includes(searchLower);

    return matchLrNo || matchFrom || matchTo;
  });

  const handleExportExcel = () => {
    if (filteredLrs.length === 0) {
      alert("No data available to export.");
      return;
    }

    const excelData = filteredLrs.map((lr) => ({
      "LR Date": lr.lrDate || "-",
      "LR No": lr.lrNo || "-",
      "From City": lr.fromCity || "-",
      "To City": lr.toCity || "-",
      "Center": lr.center || "-",
      "Consignor": lr.consignor || "-",
      "Consignee": lr.consignee || "-",
      "Total Freight": Number(lr.subTotal) || 0,
      "Freight By": lr.freightBy || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LR List");

    const fileName = `LR_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <LrTopBar 
        onFilter={fetchLrs} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        clearTrigger={clearTrigger} 
      />

      <LrActionBar 
        onAdd={handleAdd}       
        onEdit={handleEdit}     
        onView={handleView}     
        onDelete={handleDeleteClick} 
        selectedCount={selectedIds.length} 
        onExportExcel={handleExportExcel} 
        onRefresh={handleRefresh} 
        onPrint={handlePrintSelected} // 3. PASS PRINT FUNCTION TO ACTION BAR
      />

      <div className="relative mt-3">
        <LrTable 
          lrs={filteredLrs} 
          loading={loading}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
        />

        {showEntry && (
          <LrEntryPanel 
            mode={panelMode} 
            initialData={viewData} 
            onClose={() => {
              setShowEntry(false);
              fetchLrs();
            }}
          />
        )}

        <DeleteConfirmModal 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={executeDelete}
          count={selectedIds.length}
        />
      </div>
    </div>
  );
}