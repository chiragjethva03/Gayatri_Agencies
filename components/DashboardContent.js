"use client";

import { useEffect, useState } from "react"; // FIXED: removed useRouter from react
import { useRouter } from "next/navigation"; // FIXED: correct import
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import ServerError from "@/components/error/ServerError";
import { Trash2, Pencil } from "lucide-react";
import DeleteConfirmModal from "@/components/lr-list/DeleteConfirmModal";

export default function DashboardContent() {
  const [transports, setTransports] = useState([]);
  const [transportStats, setTransportStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [transportToEdit, setTransportToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [transRes, statsRes] = await Promise.all([
          fetch("/api/transports"),
          fetch("/api/stats")
        ]);
        if (!transRes.ok) throw new Error("SERVER_ERROR");
        const transData = await transRes.json();
        const statsData = await statsRes.json();
        setTransports(transData);
        setTransportStats(statsData || {});
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("SERVER_ERROR");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setTransportToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (e, transport) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("TRANSPORT _id:", transport._id);
    console.log("TYPE:", typeof transport._id);
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
        setTransports(prev => prev.filter(t => t._id !== transportToDelete));
        setShowDeleteModal(false);
        setTransportToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete transport", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {loading && (
          <div className="flex justify-center items-center h-64">
            <TailChase size="40" speed="1.75" color="#2563eb" />
          </div>
        )}

        {!loading && error === "SERVER_ERROR" && (
          <ServerError onRetry={() => window.location.reload()} />
        )}

        {!loading && transports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {transports.map((t) => {
              const slug = t.name.toLowerCase().replace(/\s+/g, "-");
              const currentStats = transportStats[slug] || { lrCount: 0, memoCount: 0 };

              return (
                <Link key={t._id} href={`/services/${slug}`} className="group block h-full">
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
                        <button
                          onClick={(e) => handleEditClick(e, t)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="Edit Transport"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, t._id)}
                          className="p-1.5 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Delete Transport"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
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
                            <span className="capitalize">{loc}</span>
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
            onSaveSuccess={(updated) => {
              setTransports(prev => prev.map(t => t._id === updated._id ? updated : t));
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
  const [mobile2, setMobile2] = useState(transport.mobileNumbers?.[1] || "");
  const [address, setAddress] = useState(transport.address || "");
  const [locations, setLocations] = useState(
    transport.locations?.length > 0 ? transport.locations : [""]
  );
  const [loading, setLoading] = useState(false);
  const [defaultDemurrageRate, setDefaultDemurrageRate] = useState(transport.defaultDemurrageRate ?? 0);
  const [defaultDemurrageFreeDays, setDefaultDemurrageFreeDays] = useState(transport.defaultDemurrageFreeDays ?? 7);

  const handleLocationChange = (index, value) => {
    setLocations(prev => prev.map((loc, i) => (i === index ? value : loc)));
  };

  const addLocation = () => {
    setLocations(prev => [...prev, ""]);
  };

  const removeLocation = (index) => {
    if (locations.length <= 1) return; // must keep at least 1
    setLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Transport name is required");
    const cleanedLocations = locations.map(l => l.trim()).filter(Boolean);
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
          mobileNumbers: [mobile1, mobile2].filter(n => n),
          address: address.trim(),
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800">Mobile 1</label>
              <input value={mobile1} onChange={e => setMobile1(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800">Mobile 2</label>
              <input value={mobile2} onChange={e => setMobile2(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition" />
            </div>
          </div>

          {/* Locations Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Locations <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-500 ml-1">(min. 1 required)</span>
            </label>
            <div className="space-y-2">
              {locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={loc}
                    onChange={e => handleLocationChange(i, e.target.value)}
                    placeholder={`Location ${i + 1}`}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition"
                  />
                  {/* Only show remove button if more than 1 location */}
                  {locations.length > 1 && (
                    <button
                      onClick={() => removeLocation(i)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove location"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addLocation}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
            >
              + Add Location
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-400 outline-none focus:border-blue-600 transition resize-none" />
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