"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation"; 
import InwardOutwardTopBar from "./InwardOutwardTopBar";
import InwardOutwardActionBar from "./InwardOutwardActionBar";
import InwardOutwardTable from "./InwardOutwardTable";
import InwardOutwardEntryPanel from "./InwardOutwardEntryPanel";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";
import { generateInwardOutwardPdf } from "@/lib/generateInwardOutwardPdf";

export default function InwardOutwardPage() {
  const { slug } = useParams(); 
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fromCityFilter, setFromCityFilter] = useState("All");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [transportDetails, setTransportDetails] = useState(null);
  
  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRecords();
      fetchTransportDetails();
    }
  }, [slug]);

  const fetchTransportDetails = async () => {
    try {
      const res = await fetch(`/api/transports/${slug}`);
      if (res.ok) setTransportDetails(await res.json());
    } catch {}
  };

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
    setTypeFilter("All");
    setFromCityFilter("All");
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

  // --- NEW: CALCULATE TOTAL REAL-TIME STOCK (Inward - Outward) ---
  const totalStock = records.reduce((acc, record) => {
    // Sum up all articles in the goods array for this record
    const recordArticles = (record.goods || []).reduce((sum, item) => sum + (parseInt(item.article) || 0), 0);
    
    // Add if Inward, Subtract if Outward
    if (record.type === "Inward") return acc + recordArticles;
    if (record.type === "Outward") return acc - recordArticles;
    return acc;
  }, 0);
  // -------------------------------------------------------------

  const uniqueFromCities = useMemo(() => {
    const fromRecords = records.map(r => r.fromCity).filter(c => c && c.trim() !== "");
    const fromTransport = (transportDetails?.locations || [])
      .map(loc => (typeof loc === "string" ? loc : loc?.name))
      .filter(c => c && c.trim() !== "");
    return [...new Set([...fromTransport, ...fromRecords])].sort();
  }, [records, transportDetails]);

  const filteredRecords = records.filter((r) => {
    const matchesSearch = !searchTerm ||
      (r.no && String(r.no).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.fromCity && r.fromCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.toCity && r.toCity.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "All" || r.type === typeFilter;
    const matchesFromCity = fromCityFilter === "All" || r.fromCity === fromCityFilter;

    return matchesSearch && matchesType && matchesFromCity;
  });

  const handlePrint = async () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to print.");
    const record = records.find(r => r._id === selectedIds[0]);
    if (!record) return;
    let transportData = null;
    try {
      const res = await fetch(`/api/transports/${slug}`);
      if (res.ok) transportData = await res.json();
    } catch {}
    generateInwardOutwardPdf(record, transportData, "print");
  };

  const handleExportExcel = () => {
    import("xlsx").then((XLSX) => {
      if (records.length === 0) return alert("No data available to export.");
      const excelData = records.map((record) => {
        const totalArticles = (record.goods || []).reduce((s, g) => s + (Number(g.article) || 0), 0);
        const totalWeight = (record.goods || []).reduce((s, g) => s + (Number(g.weight) || 0), 0);
        return {
          "Date": record.date || "-",
          "No.": record.no || "-",
          "LR No": record.lrNo || "-",
          "Type": record.type || "-",
          "From City": record.fromCity || "-",
          "To City": record.toCity || "-",
          "Center": record.center || "-",
          "Consignor": record.consignor || "-",
          "Consignee": record.consignee || "-",
          "Total Articles": totalArticles || 0,
          "Total Weight": totalWeight || 0,
          "Driver": record.driverName || "-",
          "Vehicle No": record.vehicleNo || "-",
          "Phone No": record.phoneNo ? `+91${record.phoneNo}` : "-",
          "Total Freight": Number(record.deliveryData?.totalFreight) || 0,
          "Hamali": Number(record.deliveryData?.hamali) || 0,
          "Service Charge": Number(record.deliveryData?.serviceCharge) || 0,
          "Delivery Freight": Number(record.deliveryData?.deliveryFreight) || 0,
          "Delivery Type": record.deliveryData?.deliveryType || "-",
          "Delivery At": record.deliveryData?.deliveryAt || "-",
          "Note": record.deliveryData?.note || "-",
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inward Outward List");
      XLSX.writeFile(workbook, `Inward_Outward_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    });
  };

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <InwardOutwardTopBar onFilter={fetchRecords} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      <InwardOutwardActionBar onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick} selectedCount={selectedIds.length} onExportExcel={handleExportExcel} onPrint={handlePrint} onRefresh={handleRefresh} />
      
      <div className="relative mt-3">
        <InwardOutwardTable
          records={filteredRecords}
          loading={loading}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          fromCityFilter={fromCityFilter}
          setFromCityFilter={setFromCityFilter}
          uniqueFromCities={uniqueFromCities}
          totalStock={totalStock}
        />
        
        {showEntry && (
          <InwardOutwardEntryPanel
            mode={panelMode}
            initialData={viewData}
            transport={slug}
            totalStock={totalStock}
            existingLrNos={records
              .filter(r => !viewData?._id || r._id !== viewData._id)
              .map(r => r.lrNo)
              .filter(Boolean)}
            onClose={() => { setShowEntry(false); fetchRecords(); }}
          />
        )}
        
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}