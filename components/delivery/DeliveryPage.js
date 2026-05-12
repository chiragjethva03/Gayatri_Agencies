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
import { generateDeliveryPdf } from "@/lib/generateDeliveryPdf";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

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
  const [transportDetails, setTransportDetails] = useState(null);

  useEffect(() => {
    if (slug) { fetchDeliveries(); fetchTransportDetails(); }
  }, [slug]);

  const fetchTransportDetails = async () => {
    try {
      const res = await fetch("/api/transports");
      if (res.ok) {
        const transports = await res.json();
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
        const match = transports.find(t => t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSlug);
        if (match) setTransportDetails(match);
      }
    } catch { /* noop */ }
  };

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

  const handleDeliveryPrint = async () => {
    if (selectedIds.length !== 1) return alert("Please select exactly one row for delivery print.");
    const row = deliveries.find(d => d._id === selectedIds[0]);
    if (!row) return;
    const fd     = row.formData || {};
    const lrList = row.lrList  || [];

    let cnorClient = null, cneeClient = null;
    try {
      const res = await fetch("/api/client");
      if (res.ok) {
        const clientsList = await res.json();
        cnorClient = clientsList.find(c => c.name === (lrList[0]?.consignor || "")) || null;
        cneeClient = clientsList.find(c => c.name === (row.consignee || "")) || null;
      }
    } catch { /* noop */ }

    // Use top-level demurrage fields — these are authoritative (updated by DemurrageManageModal)
    const demurragePaid   = Number(row.demurragePaidAmt)   || 0;
    const ratePerDay      = Number(row.demurrageRatePerDay) || 0;
    const freeDays        = Number(row.demurrageFreeDays)   || 7;
    const deliveryDateStr = row.date || "";
    let demurrageCalc     = demurragePaid;
    if (!demurragePaid && ratePerDay && deliveryDateStr) {
      const daysSince      = Math.floor((Date.now() - new Date(deliveryDateStr)) / 86400000);
      const chargeableDays = Math.max(0, daysSince - freeDays);
      demurrageCalc = chargeableDays * ratePerDay;
    }

    const lrDataForPrint = {
      lrNo:            lrList[0]?.lrNo || row.lrNo || "-",
      refNo:           row.dNo || "",
      lrDate:          row.date   || "",
      fromCity:        row.fromBranch || lrList[0]?.fromCity || "",
      toCity:          lrList[0]?.toCity || "",
      consignor:       lrList[0]?.consignor || "",
      consignee:       row.consignee || "",
      consignorMobile: cnorClient?.mobile || cnorClient?.phoneO || "",
      consignorGst:    cnorClient?.gstNo  || "",
      consigneeMobile: cneeClient?.mobile || cneeClient?.phoneO || "",
      consigneeGst:    cneeClient?.gstNo  || "",
      delivery:        fd.deliveryType || row.freightBy || "",
      goods: [{
        article:      row.art              || "0",
        weight:       fd.weight            || "0",
        goodsContain: lrList.map(l => l.goodsContain || "").filter(Boolean).join(", ") || "-",
        packaging:    lrList[0]?.packaging || "",
        valueInRs:    lrList[0]?.valueInRs || "",
      }],
      rate:      Number(fd.rate)                                || 0,
      freight:   Number(fd.totalFreight  || row.delSubTotal)    || 0,
      hamali:    Number(fd.hamali)                              || 0,
      bc:        Number(fd.serviceCharge)                       || 0,
      demurrage: demurrageCalc,
      gstAmt:    fd.gstAmt                                      || "",
      subTotal:  Number(row.delSubTotal  || fd.deliveryFreight) || 0,
      freightBy: row.freightBy || fd.deliveryType || "",
    };
    generateDeliveryPdf(lrDataForPrint, transportDetails);
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

  if (loading) return <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]"><TailChase size="40" speed="1.75" color="#2563eb" /></div>;

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <DeliveryTopBar onFilter={fetchDeliveries} searchTerm={searchTerm} onSearchChange={setSearchTerm} clearTrigger={clearTrigger} />
      <DeliveryActionBar
        onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteClick}
        selectedCount={selectedIds.length} onExportExcel={handleExportExcel} onRefresh={handleRefresh}
        onDeliveryPrint={handleDeliveryPrint}
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