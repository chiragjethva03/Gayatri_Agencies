"use client";
import React, { useEffect, useState } from "react";

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

  /* ================= VEHICLE STATE ================= */
  const [vehicles, setVehicles] = useState([
    "GJ01AB1234",
    "GJ05CD6789",
  ]); // replace with DB later

  /* ================= DRIVER STATE ================= */
  const [drivers, setDrivers] = useState([
    "Ramesh",
    "Suresh",
  ]); // replace with DB later

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicleNo, setNewVehicleNo] = useState("");

  const [selectedDriver, setSelectedDriver] = useState("");
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");

  /** Auto-select first city */
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

    setLrList([
      ...lrList,
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
                className="border border-gray-300 rounded p-1 text-gray-900"
              />
            </div>

            {/* Memo No */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Memo No</label>
              <input
                type="text"
                value={formData.memoNo}
                disabled
                className="border border-gray-300 rounded p-1 bg-gray-100 text-gray-900"
              />
            </div>

            {/* To Branch */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To Branch</label>
              <select
                value={formData.toBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="border border-gray-300 rounded p-1 bg-white text-gray-900"
              >
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* VEHICLE (FIXED) */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Vehicle</label>

              <div className="flex gap-2">
                <select
                  value={selectedVehicle}
                  onChange={(e) => {
                    setSelectedVehicle(e.target.value);
                    setFormData({ ...formData, vehicle: e.target.value });
                  }}
                  className="flex-1 border border-gray-300 rounded p-1 bg-white text-gray-900"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowVehicleModal(true)}
                  className="px-3 rounded bg-blue-600 text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* DRIVER */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Driver</label>

              <div className="flex gap-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => {
                    setSelectedDriver(e.target.value);
                    setFormData({ ...formData, driver: e.target.value });
                  }}
                  className="flex-1 border border-gray-300 rounded p-1 bg-white text-gray-900"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowDriverModal(true)}
                  className="px-3 rounded bg-blue-600 text-white font-bold"
                  title="Add Driver"
                >
                  +
                </button>
              </div>
            </div>


            {/* To City */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To City</label>
              <select
                value={formData.toCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="border border-gray-300 rounded p-1 bg-white text-gray-900"
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
              <input className="border border-gray-300 rounded p-1 text-gray-900" />
            </div>

            {/* Advanced */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Advanced</label>
              <input className="border border-gray-300 rounded p-1 text-gray-900" />
            </div>

            {/* Add LR */}
            <div className="flex flex-col col-span-2">
              <label className="text-gray-600 mb-1">Add Lr</label>
              <div className="flex gap-2">
                <input
                  value={lrInput}
                  onChange={(e) => setLrInput(e.target.value)}
                  className="border border-gray-300 rounded p-1 flex-1 text-gray-900"
                  placeholder="Enter LR No"
                />
                <button
                  onClick={handleAddLr}
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Add Lr
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
        </div>

        {/* ACTION BAR */}
        <div className="bg-gray-200 p-3 border-t flex justify-between">
          <div className="font-semibold">
            Total Lr: {lrList.length}
          </div>
          <div className="flex gap-2">
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

        {/* ADD VEHICLE MODAL */}
        {showVehicleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-[400px] rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Add Vehicle</h3>

              <input
                type="text"
                placeholder="Enter Vehicle Number"
                value={newVehicleNo}
                onChange={(e) => setNewVehicleNo(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded p-2 mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowVehicleModal(false);
                    setNewVehicleNo("");
                  }}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!newVehicleNo.trim()) return;

                    setVehicles((prev) => [...prev, newVehicleNo]);
                    setSelectedVehicle(newVehicleNo);
                    setFormData({ ...formData, vehicle: newVehicleNo });

                    setNewVehicleNo("");
                    setShowVehicleModal(false);
                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* ADD DRIVER MODAL */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[400px] rounded-lg shadow-xl p-6">

            <h3 className="text-lg font-semibold mb-4">Add Driver</h3>

            <input
              type="text"
              placeholder="Enter Driver Name"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDriverModal(false);
                  setNewDriverName("");
                }}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!newDriverName.trim()) return;

                  setDrivers((prev) => [...prev, newDriverName]);
                  setSelectedDriver(newDriverName);
                  setFormData({ ...formData, driver: newDriverName });

                  setNewDriverName("");
                  setShowDriverModal(false);
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
