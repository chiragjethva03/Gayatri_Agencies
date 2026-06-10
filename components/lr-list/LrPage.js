"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation"; 
import * as XLSX from "xlsx"; 
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";
import DeleteConfirmModal from "./DeleteConfirmModal";
import BulkSettleModal from "./BulkSettleModal";
import { generateLrPdfSlip }  from "@/lib/generateLrPdfSlip";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

export default function LrPage() {
  const { slug } = useParams(); 
  
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);

  const [toCityFilter, setToCityFilter] = useState("All");
  const [freightByFilter, setFreightByFilter] = useState("All");
  const [consignorFilter, setConsignorFilter] = useState([]);

  const [panelMode, setPanelMode] = useState("add"); 
  const [showEntry, setShowEntry] = useState(false);
  const [viewData, setViewData] = useState(null); 
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkSettle, setShowBulkSettle] = useState(false);

  const [transportDetails, setTransportDetails] = useState(null);
  const [activeDateFilter, setActiveDateFilter] = useState({ from: "", to: "" });

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
    setActiveDateFilter({ from, to });
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
    setToCityFilter("All");
    setFreightByFilter("All");
    setConsignorFilter([]);
    setClearTrigger(prev => prev + 1);
    fetchLrs();
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const allIds = filteredLrs.map(lr => lr._id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
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

  const handlePrintSelected = async () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one LR to print.");
    const selectedRow = { ...lrs.find(lr => lr._id === selectedIds[0]) };
    try {
      const res = await fetch("/api/client");
      const clients = await res.json();
      const consignorData = clients.find(c => c.name === selectedRow.consignor) || null;
      const consigneeData = clients.find(c => c.name === selectedRow.consignee) || null;
      generateLrPdfSlip(selectedRow, transportDetails, consignorData, consigneeData, "print");
    } catch {
      generateLrPdfSlip(selectedRow, transportDetails, null, null, "print");
    }
  };

  const uniqueToCities = useMemo(() => {
    const cities = lrs.map(lr => lr.toCity).filter(c => c && c.trim() !== "");
    return [...new Set(cities)].sort();
  }, [lrs]);

  const uniqueConsignors = useMemo(() => {
    const names = lrs.map(lr => lr.consignor).filter(c => c && c.trim() !== "");
    const unique = [...new Set(names)].sort();
    const hasCashParti = lrs.some(lr => lr.cashConsigner && lr.cashConsigner.trim());
    return hasCashParti ? ["Cash Parti", ...unique] : unique;
  }, [lrs]);

  const filteredLrs = lrs.filter((lr) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (lr.lrNo && String(lr.lrNo).toLowerCase().includes(searchLower)) ||
      (lr.fromCity && lr.fromCity.toLowerCase().includes(searchLower)) ||
      (lr.toCity && lr.toCity.toLowerCase().includes(searchLower));

    const matchesToCity = toCityFilter === "All" || lr.toCity === toCityFilter;
    const matchesFreightBy = freightByFilter === "All" || lr.freightBy === freightByFilter;

    const matchesConsignor = consignorFilter.length === 0 || consignorFilter.some(f =>
      f === "Cash Parti"
        ? lr.cashConsigner && lr.cashConsigner.trim()
        : lr.consignor === f
    );

    return matchesSearch && matchesToCity && matchesFreightBy && matchesConsignor;
  });

  const handleExportExcel = () => {
    if (lrs.length === 0) return alert("No data available to export.");
    const excelData = lrs.map((lr) => {
      const totalArticles = (lr.goods || []).reduce((s, g) => s + (Number(g.article) || 0), 0);
      const totalWeight = (lr.goods || []).reduce((s, g) => s + (Number(g.weight) || 0), 0);
      return {
        "LR Date": lr.lrDate || "-",
        "LR No": lr.lrNo || "-",
        "Center": lr.center || "-",
        "Freight By": lr.freightBy || "-",
        "Delivery": lr.delivery || "-",
        "From City": lr.fromCity || "-",
        "To City": lr.toCity || "-",
        "Consignor": lr.consignor || lr.cashConsigner || "-",
        "Consignor Mobile": lr.consignorMobile || "-",
        "Consignor Address": lr.consignorAddress || "-",
        "Consignee": lr.consignee || lr.cashConsignee || "-",
        "Consignee Mobile": lr.consigneeMobile || "-",
        "Consignee Address": lr.consigneeAddress || "-",
        "Total Articles": totalArticles || 0,
        "Total Weight": totalWeight || 0,
        "Freight": Number(lr.freight) || 0,
        "BC": Number(lr.bc) || 0,
        "Hamali": Number(lr.hamali) || 0,
        "Crossing": Number(lr.crossing) || 0,
        "Door Delivery": Number(lr.doorDelivery) || 0,
        "Sub Total": Number(lr.subTotal) || 0,
        "RCM": lr.rcm || "-",
        "Payment Status": lr.paymentStatus || "-",
        "Payment Type": lr.paymentType || "-",
        "Payment Date": lr.paymentDate || "-",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LR List");
    XLSX.writeFile(workbook, `LR_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]"><TailChase size="40" speed="1.75" color="#2563eb" /></div>;

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <LrTopBar onFilter={fetchLrs} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      <LrActionBar
        onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick}
        selectedCount={selectedIds.length} onExportExcel={handleExportExcel} onRefresh={handleRefresh}
        onPrint={handlePrintSelected}
        onBulkSettle={() => setShowBulkSettle(true)}
      />
      <div className="relative mt-3">
        {/* --- FIXED: PASSING NEW PROPS TO TABLE --- */}
        <LrTable
          lrs={filteredLrs}
          loading={loading}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={handleSelectAll}
          toCityFilter={toCityFilter}
          setToCityFilter={setToCityFilter}
          uniqueToCities={uniqueToCities}
          freightByFilter={freightByFilter}
          setFreightByFilter={setFreightByFilter}
          consignorFilter={consignorFilter}
          setConsignorFilter={setConsignorFilter}
          uniqueConsignors={uniqueConsignors}
        />
        
        {showEntry && (
          <LrEntryPanel 
            mode={panelMode} 
            initialData={viewData} 
            transport={transportDetails} 
            onClose={() => { setShowEntry(false); fetchLrs(activeDateFilter.from, activeDateFilter.to); }}
          />
        )}
        
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
        <BulkSettleModal
          isOpen={showBulkSettle}
          onClose={() => setShowBulkSettle(false)}
          transportSlug={slug}
          onSuccess={(updates) => {
            if (updates?.length) {
              const updateMap = new Map(updates.map(u => [u.id, u]));
              setLrs(prev => prev.map(lr => {
                const u = updateMap.get(String(lr._id));
                return u ? { ...lr, ...u } : lr;
              }));
            }
          }}
        />
      </div>

    </div>
  );
}