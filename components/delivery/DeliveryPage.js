"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import DeliveryTopBar from "./DeliveryTopBar";
import DeliveryActionBar from "./DeliveryActionBar";
import DeliveryTable from "./DeliveryTable";
import DeliveryForm from "./DeliveryForm";
import DeleteConfirmModal from "../lr-list/DeleteConfirmModal";
import DemurrageManageModal from "./DemurrageManageModal";

export default function DeliveryPage() {
  const { slug } = useParams();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [freightByFilter, setFreightByFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  // --- NEW: State for View Mode ---
  const [isViewMode, setIsViewMode] = useState(false);
  const [showDemurrageModal, setShowDemurrageModal] = useState(false);
  const [demurrageDelivery, setDemurrageDelivery] = useState(null);
  useEffect(() => {
    if (slug) fetchDeliveries();
  }, [slug]);

  const fetchDeliveries = async (from = "", to = "") => {
    setLoading(true);
    try {
      let url = `/api/delivery?transport=${slug}`;
      if (from && to) url += `&from=${from}&to=${to}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error(err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFreightByFilter("All");
    setClearTrigger(prev => prev + 1);
    fetchDeliveries();
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsViewMode(false); // Make sure view mode is OFF
    setIsFormOpen(true);
  }

  const handleEdit = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to edit.");
    const targetDelivery = deliveries.find(d => d._id === selectedIds[0]);
    if (targetDelivery) {
      setEditData(targetDelivery);
      setIsViewMode(false); // Make sure view mode is OFF
      setIsFormOpen(true);
    }
  };

  // --- UPDATED: Handle View logic ---
  const handleView = () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row to view.");
    const targetDelivery = deliveries.find(d => d._id === selectedIds[0]);
    if (targetDelivery) {
      setEditData(targetDelivery);
      setIsViewMode(true); // Turn ON View Mode
      setIsFormOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    await fetch('/api/delivery', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selectedIds }),
      headers: { 'Content-Type': 'application/json' }
    });
    setDeliveries(prev => prev.filter(d => !selectedIds.includes(d._id || d.id)));
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  const handlePrintSelected = () => {
    alert("Delivery PDF print format coming soon!");
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (d.dNo && String(d.dNo).toLowerCase().includes(searchLower)) ||
      (d.consignee && d.consignee.toLowerCase().includes(searchLower)) ||
      (d.lrNo && String(d.lrNo).toLowerCase().includes(searchLower));

    const matchesFreight = freightByFilter === "All" ||
      (d.freightBy && d.freightBy.toLowerCase() === freightByFilter.toLowerCase());

    return matchesSearch && matchesFreight;
  });

  const handleExportExcel = () => {
    if (filteredDeliveries.length === 0) return alert("No data available to export.");
    const excelData = filteredDeliveries.map((d) => ({
      "Date": d.date || "-", "D. No": d.dNo || "-", "Type": d.type || "-",
      "L.R. No": d.lrNo || "-", "Consignee": d.consignee || "-", "From Branch": d.fromBranch || "-",
      "Art": d.art || "-", "Labour Name": d.labourName || "-", "Pack Name": d.packName || "-",
      "Del SubTotal": Number(d.delSubTotal) || 0, "Freight By": d.freightBy || "-", "Kasar": Number(d.kasar) || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery List");
    XLSX.writeFile(workbook, `Delivery_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <DeliveryTopBar onFilter={fetchDeliveries} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      <DeliveryActionBar
        onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick}
        selectedCount={selectedIds.length} onExportExcel={handleExportExcel} onRefresh={handleRefresh} onPrint={handlePrintSelected}
      />
      <div className="relative mt-3">
        <DeliveryTable
          deliveries={filteredDeliveries}
          loading={loading}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          freightByFilter={freightByFilter}
          onFreightByFilterChange={setFreightByFilter}
          onDemurrageClick={(delivery) => {
            setDemurrageDelivery(delivery);
            setShowDemurrageModal(true);
          }}
        />
        {showDemurrageModal && demurrageDelivery && (
          <DemurrageManageModal
            delivery={demurrageDelivery}
            onClose={() => {
              setShowDemurrageModal(false);
              setDemurrageDelivery(null);
            }}
            onSaveSuccess={() => {
              fetchDeliveries();
              setShowDemurrageModal(false);
              setDemurrageDelivery(null);
            }}
          />
        )}

        

        {/* --- UPDATED: Passing down isViewMode --- */}
        <DeliveryForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditData(null); setIsViewMode(false); }}
          onSaveSuccess={fetchDeliveries}
          initialData={editData}
          isViewMode={isViewMode}
        />

        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={executeDelete} count={selectedIds.length} />
      </div>
    </div>
  );
}