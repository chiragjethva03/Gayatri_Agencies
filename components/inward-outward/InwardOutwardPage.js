"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import InwardOutwardTopBar from "./InwardOutwardTopBar";
import InwardOutwardActionBar from "./InwardOutwardActionBar";
import InwardOutwardTable from "./InwardOutwardTable";
import InwardOutwardEntryPanel from "./InwardOutwardEntryPanel";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";

export default function InwardOutwardPage() {
  const { slug } = useParams(); 
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // NEW: State for the Type Filter (Defaults to "All")
  const [typeFilter, setTypeFilter] = useState("All"); 
  
  const [clearTrigger, setClearTrigger] = useState(0);
  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRecords(); 
    }
  }, [slug]);

  const fetchRecords = async (from = "", to = "") => {
    setLoading(true);
    try {
      let url = `/api/inward-outward?transport=${slug}`;
      if (from && to) url += `&from=${from}&to=${to}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch inward/outward records", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm(""); 
    setTypeFilter("All"); // FIXED: Refresh button now resets the filter!
    setClearTrigger(prev => prev + 1); 
    fetchRecords(); 
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    setViewData(records.find(r => r._id === selectedIds[0])); 
    setPanelMode("view"); 
    setShowEntry(true);       
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    setViewData(records.find(r => r._id === selectedIds[0])); 
    setPanelMode("edit"); 
    setShowEntry(true);       
  };

  const handleAdd = () => {
    setViewData({ transportSlug: slug, type: "Inward" }); 
    setPanelMode("add"); 
    setShowEntry(true);
  }

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await fetch('/api/inward-outward', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
        headers: { 'Content-Type': 'application/json' }
      });
      setRecords(prev => prev.filter(r => !selectedIds.includes(r._id)));
      setSelectedIds([]);
      setShowDeleteModal(false); 
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // UPDATED: Now filters by Search Term AND the Dropdown Type!
  const filteredRecords = records.filter((r) => {
    const matchesSearch = !searchTerm || 
           (r.no && String(r.no).toLowerCase().includes(searchTerm.toLowerCase())) ||
           (r.fromCity && r.fromCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (r.toCity && r.toCity.toLowerCase().includes(searchTerm.toLowerCase()));
           
    const matchesType = typeFilter === "All" || r.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleExportExcel = () => {
    import("xlsx").then((XLSX) => {
      if (filteredRecords.length === 0) return alert("No data available to export.");
      const excelData = filteredRecords.map((record) => ({
        "Date": record.date || "-", 
        "No.": record.no || "-", 
        "Type": record.type || "-", 
        "From City": record.fromCity || "-",
        "To City": record.toCity || "-", 
        "Consignor": record.consignor || "-",
        "Consignee": record.consignee || "-"
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inward Outward List");
      XLSX.writeFile(workbook, `Inward_Outward_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    });
  };

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <InwardOutwardTopBar 
        onFilter={fetchRecords} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        clearTrigger={clearTrigger} 
      />
      <InwardOutwardActionBar 
        onAdd={handleAdd} 
        onEdit={handleEdit} 
        onView={handleView} 
        onDelete={handleDeleteClick} 
        selectedCount={selectedIds.length} 
        onExportExcel={handleExportExcel} 
        onRefresh={handleRefresh} 
      />
      <div className="relative mt-3">
        <InwardOutwardTable 
          records={filteredRecords} 
          loading={loading} 
          selectedIds={selectedIds} 
          onToggle={toggleSelection} 
          typeFilter={typeFilter}       // Passed down to table
          setTypeFilter={setTypeFilter} // Passed down to table
        />
        
        {showEntry && (
          <InwardOutwardEntryPanel 
            mode={panelMode} 
            initialData={viewData} 
            transport={slug} 
            onClose={() => { 
              setShowEntry(false); 
              fetchRecords(); 
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