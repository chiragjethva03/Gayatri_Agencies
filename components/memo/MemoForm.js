// components/memo/MemoForm.js
"use client";
import React, { useState } from 'react';

// Icons (Optional: Install lucide-react or heroicons if you haven't, or use text)
// import { X, Plus, Save, Printer } from 'lucide-react'; 

export default function MemoForm({ isOpen, onClose }) {
  // 1. Form State (Header Fields)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memoNo: '1',
    toBranch: '',
    vehicle: '',
    driver: '',
    toCity: '',
    kMiter: '',
    hire: '',
    advanced: '',
    // ... add all other header fields here
  });

  // 2. Grid State (The middle table)
  const [lrList, setLrList] = useState([]);
  
  // 3. New LR Input State
  const [lrInput, setLrInput] = useState('');

  if (!isOpen) return null;

  // Handler to add a dummy row (simulating "Add Lr")
  const handleAddLr = () => {
    if(!lrInput) return;
    const newRow = {
      id: Date.now(),
      lrNo: lrInput,
      centerName: 'Test Center', // Mock data
      date: '2025-12-16',
      description: 'Test Item',
      weight: 150,
      freight: 2000
    };
    setLrList([...lrList, newRow]);
    setLrInput('');
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg shadow-xl overflow-hidden border border-gray-200">
        
        {/* Header Title Bar */}
        <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
          <h2 className="font-semibold">+ Add Memo</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
             ✕ {/* Replace with Icon if available */}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 text-sm">
          
          {/* SECTION 1: Top Input Fields (Grid Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            
            {/* Input Group Helper */}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="border border-gray-300 rounded p-1 focus:outline-blue-500" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Memo No</label>
              <input type="text" className="border border-gray-300 rounded p-1" defaultValue="1" />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To Branch</label>
              <select className="border border-gray-300 rounded p-1 bg-white">
                <option>Select Branch</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Vehicle</label>
              <select className="border border-gray-300 rounded p-1 bg-white">
                <option>Select Vehicle</option>
              </select>
            </div>

             <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Driver</label>
              <select className="border border-gray-300 rounded p-1 bg-white">
                <option>Select Driver</option>
              </select>
            </div>
            
            {/* Row 2 */}
             <div className="flex flex-col">
              <label className="text-gray-600 mb-1">To City</label>
              <select className="border border-gray-300 rounded p-1 bg-white">
                <option>Select City</option>
              </select>
            </div>

             <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Hire</label>
              <input type="number" className="border border-gray-300 rounded p-1" />
            </div>

             <div className="flex flex-col">
              <label className="text-gray-600 mb-1">Advanced</label>
              <input type="number" className="border border-gray-300 rounded p-1" />
            </div>

            {/* LR Adder Section */}
            <div className="flex flex-col col-span-2">
               <label className="text-gray-600 mb-1">Add Lr</label>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={lrInput}
                    onChange={(e) => setLrInput(e.target.value)}
                    className="border border-gray-300 rounded p-1 flex-1" 
                    placeholder="Enter LR No"
                 />
                 <button 
                    onClick={handleAddLr}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Add Lr
                 </button>
               </div>
            </div>
          </div>

          {/* SECTION 2: Data Grid (Middle) */}
          <div className="border border-gray-300 rounded bg-white mb-6 h-64 overflow-y-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Lr No</th>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Center Name</th>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Date</th>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Description</th>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Weight</th>
                  <th className="p-2 border-b text-xs font-semibold text-gray-700">Freight</th>
                </tr>
              </thead>
              <tbody>
                {lrList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No records available. Add an LR to start.
                    </td>
                  </tr>
                ) : (
                  lrList.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{row.lrNo}</td>
                      <td className="p-2">{row.centerName}</td>
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">{row.description}</td>
                      <td className="p-2">{row.weight}</td>
                      <td className="p-2">{row.freight}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 3: Footer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Summary Table */}
            <div className="border border-gray-300 rounded bg-white h-32 overflow-hidden">
               {/* Similar table structure as above for City/Weight/Article summary */}
               <div className="p-2 text-center text-gray-400 text-xs mt-10">Summary Table Mockup</div>
            </div>

            {/* Middle Spacer or Additional Inputs */}
            <div></div>

            {/* Right Financials */}
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <label className="w-24 text-gray-600">To Pay :</label>
                 <input className="border border-gray-300 rounded p-1 w-full bg-gray-100" disabled />
               </div>
               <div className="flex items-center justify-between">
                 <label className="w-24 text-gray-600">Paid :</label>
                 <input className="border border-gray-300 rounded p-1 w-full" />
               </div>
               <div className="flex flex-col mt-2">
                 <label className="text-gray-600 mb-1">Narration</label>
                 <textarea className="border border-gray-300 rounded p-1 w-full h-16"></textarea>
               </div>
            </div>
          </div>

        </div>

        {/* Footer Actions Bar */}
        <div className="bg-gray-200 p-3 border-t border-gray-300 flex justify-between items-center text-sm">
           <div className="flex gap-4 font-semibold text-gray-700">
             <span>Total Lr: {lrList.length}</span>
             <span>Total Weight: {lrList.reduce((a, b) => a + (b.weight || 0), 0)}</span>
           </div>

           <div className="flex gap-2">
             <button className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-800">Print</button>
             <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save (F3)</button>
             <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Cancel (ESC)</button>
           </div>
        </div>

      </div>
    </div>
  );
}