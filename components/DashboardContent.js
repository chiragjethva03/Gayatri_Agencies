"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import ServerError from "@/components/error/ServerError";
import { Trash2, Pencil } from "lucide-react";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";
import LockPasswordModal from "@/components/ui/LockPasswordModal";
import { useTransports } from "@/context/TransportContext";
import { useUser } from "@/context/UserContext";


export default function DashboardContent() {
  const { isDemo } = useUser();
  const { transports, transportsLoading, transportsError, fetchTransports } = useTransports();
  const [transportStats, setTransportStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError,   setStatsError]   = useState(false);

  const loading = transportsLoading || statsLoading;
  const error   = transportsError   || statsError;
  const [showEditModal, setShowEditModal] = useState(false);
  const [transportToEdit, setTransportToEdit] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(false);
        const statsRes = await fetch("/api/stats");
        if (!statsRes.ok) throw new Error("SERVER_ERROR");
        const statsData = await statsRes.json();
        setTransportStats(statsData || {});
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setStatsError(true);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setTransportToDelete(id);
    setShowPasswordModal(true);
  };

  const handlePasswordUnlocked = () => {
    setShowPasswordModal(false);
    setShowDeleteModal(true);
  };

  const handleEditClick = (e, transport) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("TRANSPORT _id:", transport._id);
    // console.log("TYPE:", typeof transport._id);
    setTransportToEdit(transport);
    setShowEditModal(true);
  };

  const executeDelete = async () => {
    if (!transportToDelete) return;
    try {
      const res = await fetch("/api/transports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [transportToDelete] })
      });
      if (res.ok) {
        await fetchTransports();
        setShowDeleteModal(false);
        setTransportToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete transport", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── SVG Background ─────────────────────────────────── */}
      <svg
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Page gradient */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#EFF6FF" />
            <stop offset="45%"  stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </linearGradient>

          {/* Flow line gradients */}
          <linearGradient id="fgBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="70%"  stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="fgIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="70%"  stopColor="#6366F1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
          </linearGradient>

          {/* Dot grid pattern */}
          <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="1.4" fill="#93C5FD" opacity="0.55" />
          </pattern>

          {/* Glow filter for orbs */}
          <filter id="orb-blur">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>

        {/* Base gradient */}
        <rect width="1600" height="900" fill="url(#bgGrad)" />

        {/* Dot grid */}
        <rect width="1600" height="900" fill="url(#dots)" />

        {/* ── Depth orbs (large, blurred) ── */}
        <circle cx="0"    cy="0"   r="380" fill="#3B82F6" opacity="0.07" filter="url(#orb-blur)" />
        <circle cx="1600" cy="900" r="420" fill="#6366F1" opacity="0.08" filter="url(#orb-blur)" />
        <circle cx="800"  cy="450" r="300" fill="#2563EB" opacity="0.04" filter="url(#orb-blur)" />

        {/* ── Flow line 1 — top ── */}
        <path d="M -60 158 C 200 110, 460 212, 760 155 S 1110 98, 1420 168 S 1660 145, 1700 158"
              stroke="url(#fgBlue)" strokeWidth="2" fill="none" />

        {/* ── Flow line 2 — mid-upper ── */}
        <path d="M -60 318 C 260 272, 520 378, 820 315 S 1120 255, 1420 332 S 1660 315, 1700 318"
              stroke="url(#fgIndigo)" strokeWidth="1.5" fill="none" />

        {/* ── Flow line 3 — mid-lower ── */}
        <path d="M -60 488 C 310 445, 580 548, 890 480 S 1180 412, 1490 492 S 1660 475, 1700 488"
              stroke="url(#fgBlue)" strokeWidth="2" fill="none" />

        {/* ── Flow line 4 — bottom ── */}
        <path d="M -60 662 C 250 620, 560 724, 860 656 S 1160 590, 1460 668 S 1660 652, 1700 662"
              stroke="url(#fgIndigo)" strokeWidth="1.5" fill="none" />

        {/* ── Vertical dashed connectors (network links) ── */}
        <line x1="220"  y1="118" x2="270"  y2="278"  stroke="#3B82F6" strokeWidth="1" strokeDasharray="5 5" opacity="0.2" />
        <line x1="490"  y1="210" x2="540"  y2="375"  stroke="#6366F1" strokeWidth="1" strokeDasharray="5 5" opacity="0.18" />
        <line x1="760"  y1="157" x2="820"  y2="318"  stroke="#3B82F6" strokeWidth="1" strokeDasharray="5 5" opacity="0.2" />
        <line x1="1110" y1="102" x2="1120" y2="260"  stroke="#6366F1" strokeWidth="1" strokeDasharray="5 5" opacity="0.18" />
        <line x1="540"  y1="375" x2="580"  y2="545"  stroke="#6366F1" strokeWidth="1" strokeDasharray="5 5" opacity="0.15" />
        <line x1="820"  y1="318" x2="890"  y2="482"  stroke="#3B82F6" strokeWidth="1" strokeDasharray="5 5" opacity="0.17" />
        <line x1="1120" y1="260" x2="1180" y2="418"  stroke="#6366F1" strokeWidth="1" strokeDasharray="5 5" opacity="0.15" />
        <line x1="580"  y1="545" x2="560"  y2="720"  stroke="#6366F1" strokeWidth="1" strokeDasharray="5 5" opacity="0.13" />
        <line x1="890"  y1="482" x2="860"  y2="658"  stroke="#3B82F6" strokeWidth="1" strokeDasharray="5 5" opacity="0.15" />

        {/* ── Nodes on flow 1 ── */}
        <circle cx="220"  cy="118" r="5" fill="#3B82F6" opacity="0.35" />
        <circle cx="490"  cy="210" r="4" fill="#3B82F6" opacity="0.28" />
        <circle cx="760"  cy="157" r="6" fill="#3B82F6" opacity="0.3"  />
        <circle cx="1110" cy="102" r="4" fill="#6366F1" opacity="0.28" />
        <circle cx="1420" cy="170" r="5" fill="#6366F1" opacity="0.22" />

        {/* ── Nodes on flow 2 ── */}
        <circle cx="270"  cy="278" r="4" fill="#6366F1" opacity="0.28" />
        <circle cx="540"  cy="375" r="5" fill="#6366F1" opacity="0.25" />
        <circle cx="820"  cy="318" r="4" fill="#3B82F6" opacity="0.25" />
        <circle cx="1120" cy="260" r="5" fill="#6366F1" opacity="0.22" />

        {/* ── Nodes on flow 3 ── */}
        <circle cx="310"  cy="448" r="4" fill="#3B82F6" opacity="0.22" />
        <circle cx="580"  cy="545" r="5" fill="#3B82F6" opacity="0.2"  />
        <circle cx="890"  cy="482" r="4" fill="#6366F1" opacity="0.2"  />
        <circle cx="1180" cy="418" r="5" fill="#3B82F6" opacity="0.18" />

        {/* ── Nodes on flow 4 ── */}
        <circle cx="260"  cy="622" r="4" fill="#6366F1" opacity="0.18" />
        <circle cx="560"  cy="720" r="4" fill="#6366F1" opacity="0.16" />
        <circle cx="860"  cy="658" r="5" fill="#3B82F6" opacity="0.18" />
        <circle cx="1160" cy="593" r="4" fill="#6366F1" opacity="0.15" />

        {/* ── Decorative corner arcs ── */}
        <path d="M 0 320 Q 120 220, 280 280" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.12" />
        <path d="M 0 380 Q 140 260, 320 335" stroke="#6366F1" strokeWidth="1"   fill="none" opacity="0.1"  />
        <path d="M 1600 580 Q 1480 680, 1320 620" stroke="#6366F1" strokeWidth="1.5" fill="none" opacity="0.12" />
        <path d="M 1600 640 Q 1460 720, 1280 665" stroke="#3B82F6" strokeWidth="1"   fill="none" opacity="0.1"  />

        {/* ── Subtle data-packet rectangles along flows ── */}
        <rect x="370"  y="145" width="28" height="16" rx="4" fill="#3B82F6" opacity="0.07" />
        <rect x="650"  y="305" width="24" height="14" rx="3" fill="#6366F1" opacity="0.06" />
        <rect x="1000" y="468" width="28" height="16" rx="4" fill="#3B82F6" opacity="0.06" />
        <rect x="700"  y="643" width="24" height="14" rx="3" fill="#6366F1" opacity="0.05" />
        <rect x="1280" y="150" width="28" height="16" rx="4" fill="#6366F1" opacity="0.06" />
      </svg>
      {/* ─────────────────────────────────────────────────── */}

      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {loading && (
          <div className="flex justify-center items-center h-64">
            <TailChase size="40" speed="1.75" color="#2563eb" />
          </div>
        )}

        {!loading && error && (
          <ServerError onRetry={() => window.location.reload()} />
        )}

        {!loading && transports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {transports.map((t) => {
              const slug = t.name.toLowerCase().replace(/\s+/g, "-");
              const currentStats = transportStats[slug] || { lrCount: 0, memoCount: 0 };

              return (
                <Link key={t._id} href={`/services/${slug}`} prefetch={false}  className="group block h-full">
                  <div className="flex flex-col h-full bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200 relative">

                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors capitalize pr-2">
                        {t.name}
                      </h4>

                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                          {currentStats.lrCount} LRs
                        </div>
                        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                          {currentStats.memoCount} MMs
                        </div>
                        {!isDemo && (
                          <button
                            onClick={(e) => handleEditClick(e, t)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Edit Transport"
                          >
                            <Pencil size={16} strokeWidth={2.5} />
                          </button>
                        )}
                        {!isDemo && (
                          <button
                            onClick={(e) => handleDeleteClick(e, t._id)}
                            className="p-1.5 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Delete Transport"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Available Locations
                      </h5>
                      <ul className="space-y-2">
                        {t.locations.map((loc, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 min-w-[6px] rounded-full bg-blue-400 mr-2.5"></span>
                            <span className="capitalize">{typeof loc === "string" ? loc : (loc?.name || "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 text-right">
                      <span className="text-xs font-medium text-blue-600 group-hover:underline">View Dashboard &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <LockPasswordModal
          isOpen={showPasswordModal}
          title="Delete Transport"
          description="Enter the admin password to delete this transport."
          onUnlock={handlePasswordUnlocked}
          onCancel={() => { setShowPasswordModal(false); setTransportToDelete(null); }}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setTransportToDelete(null); }}
          onConfirm={executeDelete}
          count={1}
        />

        {showEditModal && transportToEdit && (
          <EditTransportModal
            transport={transportToEdit}
            onClose={() => { setShowEditModal(false); setTransportToEdit(null); }}
            onSaveSuccess={async () => {
              await fetchTransports();
              setShowEditModal(false);
              setTransportToEdit(null);
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function EditTransportModal({ transport, onClose, onSaveSuccess }) {
  const [name, setName] = useState(transport.name || "");
  const [transportCode, setTransportCode] = useState(transport.transportCode || "");
  const [gstNo, setGstNo] = useState(transport.gstNo || "");
  const [jurisdictionCity, setJurisdictionCity] = useState(transport.jurisdictionCity || "");
  const [mobile1, setMobile1] = useState(transport.mobileNumbers?.[0] || "");
  const [locations, setLocations] = useState(
    transport.locations?.length > 0
      ? transport.locations.map(l => typeof l === "string" ? { name: l, address: "" } : { name: l?.name || "", address: l?.address || "" })
      : [{ name: "", address: "" }]
  );
  const [loading, setLoading] = useState(false);
  const [defaultDemurrageRate, setDefaultDemurrageRate] = useState(transport.defaultDemurrageRate ?? 0);
  const [defaultDemurrageFreeDays, setDefaultDemurrageFreeDays] = useState(transport.defaultDemurrageFreeDays ?? 7);

  const handleLocationNameChange = (index, value) => {
    setLocations(prev => prev.map((loc, i) => i === index ? { ...loc, name: value } : loc));
  };

  const handleLocationAddressChange = (index, value) => {
    setLocations(prev => prev.map((loc, i) => i === index ? { ...loc, address: value } : loc));
  };

  const addLocation = () => {
    setLocations(prev => [...prev, { name: "", address: "" }]);
  };

  const removeLocation = (index) => {
    if (locations.length <= 1) return;
    setLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Transport name is required");
    const cleanedLocations = locations
      .filter(l => l.name?.trim())
      .map(l => ({ name: l.name.trim(), address: l.address?.trim() || "" }));
    if (cleanedLocations.length === 0) return alert("At least 1 location is required");

    setLoading(true);
    try {
      const res = await fetch(`/api/transports/${transport._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          transportCode: transportCode.trim(),
          gstNo: gstNo.trim(),
          jurisdictionCity: jurisdictionCity.trim(),
          mobileNumbers: [mobile1].filter(Boolean),
          locations: cleanedLocations,
          defaultDemurrageRate: Number(defaultDemurrageRate) || 0,
          defaultDemurrageFreeDays: Number(defaultDemurrageFreeDays) || 7,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      onSaveSuccess(updated);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-300 flex flex-col max-h-[90vh]">

        {/* Fixed Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Edit Transport</h2>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-8 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Transport Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Transport Code</label>
            <input value={transportCode} onChange={e => setTransportCode(e.target.value.toUpperCase())}
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800">GST No.</label>
              <input value={gstNo} onChange={e => setGstNo(e.target.value.toUpperCase())} maxLength={15}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800">Jurisdiction City</label>
              <input value={jurisdictionCity} onChange={e => setJurisdictionCity(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Mobile</label>
            <input value={mobile1} onChange={e => setMobile1(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
          </div>

          {/* Locations Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Locations <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-500 ml-1">(min. 1 required)</span>
            </label>
            <div className="space-y-3">
              {locations.map((loc, i) => (
                <div key={i} className="relative border-2 border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  {locations.length > 1 && (
                    <button
                      onClick={() => removeLocation(i)}
                      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition text-base leading-none"
                      title="Remove location"
                    >
                      ✕
                    </button>
                  )}
                  <div className={locations.length > 1 ? "pr-8" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Location {i + 1}
                    </label>
                    <input
                      value={loc.name}
                      onChange={e => handleLocationNameChange(i, e.target.value)}
                      placeholder="e.g. Ahmedabad, Mumbai..."
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Address <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      value={loc.address}
                      onChange={e => handleLocationAddressChange(i, e.target.value)}
                      placeholder="Enter address for this location..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white outline-none focus:border-blue-600 transition resize-none text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addLocation}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add Another Location</span>
            </button>
          </div>
          <div className="border-t border-orange-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-orange-600">⏱ Demurrage Defaults</span>
              <span className="text-xs text-gray-400 font-normal">
                (auto-applies to all new deliveries)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Default Rate/Day (₹)
                </label>
                <input
                  type="number"
                  value={defaultDemurrageRate}
                  onChange={e => setDefaultDemurrageRate(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-orange-300 outline-none focus:border-orange-500 transition bg-orange-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Free Days
                </label>
                <input
                  type="number"
                  value={defaultDemurrageFreeDays}
                  onChange={e => setDefaultDemurrageFreeDays(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-orange-300 outline-none focus:border-orange-500 transition bg-orange-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}