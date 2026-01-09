"use client";
import React, { useEffect, useState } from "react";
import VehicleSelect from "./VehicleSelect";
import DriverSelect from "./DriverSelect";
import AddLrModal from "@/components/lr/AddLrModal";


export default function MemoForm({ isOpen, onClose, transport }) {
  const locations = transport?.locations || [];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    memoNo: "1",
    toBranch: "",
    toCity: "",
    vehicle: "",
    driver: "",
    kMiter: "",
    hire: "",
    advanced: "",
  });

  const [lrList, setLrList] = useState([]);
  const [lrInput, setLrInput] = useState("");
  const [isLrModalOpen, setIsLrModalOpen] = useState(false);


  useEffect(() => {
    if (locations.length > 0) {
      setFormData((prev) => ({
        ...prev,
        toBranch: locations[0],
        toCity: locations[0],
      }));
    }
  }, [locations]);

  if (!isOpen) return null;

  const handleAddLr = () => {
    if (!lrInput) return;

    setLrList((prev) => [
      ...prev,
      {
        id: Date.now(),
        lrNo: lrInput,
        centerName: "Test Center",
        date: "2025-12-16",
        description: "Test Item",
        weight: 150,
        freight: 2000,
      },
    ]);

    setLrInput("");
  };

  const handleBranchChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      toBranch: value,
      toCity: value,
    }));
  };

  const handleCityChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      toCity: value,
      toBranch: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg shadow-xl overflow-hidden border border-gray-200">

        {/* HEADER */}
        <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
          <h2 className="font-semibold">+ Add Memo</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 text-sm">

          {/* TOP FORM */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">

            {/* Date */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="border border-gray-300 rounded p-1"
              />
            </div>

            {/* Memo No */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Memo No</label>
              <input
                type="text"
                value={formData.memoNo}
                disabled
                className="border border-gray-300 rounded p-1 bg-gray-100"
              />
            </div>

            {/* To Branch */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To Branch</label>
              <select
                value={formData.toBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="border border-gray-300 rounded p-1"
              >
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* VEHICLE (ERP Dropdown) */}
            <VehicleSelect
              value={formData.vehicle}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, vehicle: val }))
              }
            />

            {/* DRIVER (ERP Dropdown) */}
            <DriverSelect
              value={formData.driver}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, driver: val }))
              }
            />

            {/* To City */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To City</label>
              <select
                value={formData.toCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="border border-gray-300 rounded p-1"
              >
                {locations.map((city, i) => (
                  <option key={i} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Hire */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Hire</label>
              <input className="border border-gray-300 rounded p-1" />
            </div>

            {/* Advanced */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Advanced</label>
              <input className="border border-gray-300 rounded p-1" />
            </div>

            {/* Add LR */}
            <div className="flex flex-col col-span-2">
              <label className="text-gray-600 mb-1">Add Lr</label>
              <div className="flex gap-2">
                <input
                  value={lrInput}
                  onChange={(e) => setLrInput(e.target.value)}
                  className="border border-gray-300 rounded p-1 flex-1"
                  placeholder="Enter LR No"
                />
                <button
                  onClick={() => setIsLrModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add LR
                </button>

              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="border border-gray-300 rounded bg-white mb-6 h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-2">Lr No</th>
                  <th className="p-2">Center Name</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Weight</th>
                  <th className="p-2">Freight</th>
                </tr>
              </thead>
              <tbody>
                {lrList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-600">
                      No records available. Add an LR to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-300 rounded bg-white h-32 flex items-center justify-center">
              Summary Table Mockup
            </div>
            <div />
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <label className="w-24">To Pay :</label>
                <input disabled className="w-full border rounded bg-gray-200" />
              </div>

              <div className="flex gap-2 items-center">
                <label className="w-24">Paid :</label>
                <input className="w-full border rounded" />
              </div>

              <div>
                <label className="block mb-1">Narration</label>
                <textarea className="w-full h-16 border rounded resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="bg-gray-200 p-3 border-t flex justify-between">
          <div className="font-semibold">
            Total Lr: {lrList.length} | Total Weight:{" "}
            {lrList.reduce((a, b) => a + (b.weight || 0), 0)}
          </div>
          <div className="flex gap-2">
            <button className="bg-sky-700 text-white px-4 py-2 rounded">
              Print
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Save (F3)
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel (ESC)
            </button>
          </div>
        </div>

      </div>
      {isLrModalOpen && (
  <AddLrModal
    onClose={() => setIsLrModalOpen(false)}
    onSelect={(selectedLrs) => {
      setLrList((prev) => [...prev, ...selectedLrs]);
      setIsLrModalOpen(false);
    }}
  />
)}
    </div>
  );
}
