"use client";
import React, { useState } from "react";

export default function AddAccountModal({ isOpen, onClose, type = "Consignee", onSave }) {
  const [activeTab, setActiveTab] = useState("Basic Details");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col shadow-2xl border border-gray-400 text-xs rounded-sm">
        
        {/* HEADER */}
        <div className="bg-[#1e73be] text-white px-3 py-1.5 flex justify-between items-center">
          <h2 className="font-semibold text-sm">+ Add Account</h2>
          <div className="flex gap-2">
            <button className="hover:bg-blue-700 px-1.5 rounded">📄</button>
            <button className="hover:bg-blue-700 px-1.5 rounded">🔍</button>
            <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded bg-white text-black font-bold">✕</button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b text-sm">
          {["Basic Details", "Personal Details", "Other Details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 font-medium border-r ${
                activeTab === tab ? "bg-white text-blue-600 border-b-2 border-b-blue-600" : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 p-4 bg-[#f0f4f8] overflow-y-auto max-h-[75vh]">
          {activeTab === "Basic Details" && (
            <div className="flex flex-col gap-4">
              
              {/* Account Name Row */}
              <div className="flex items-center gap-2 border border-red-300 p-2 rounded bg-white relative">
                <label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px] text-red-500">Account Name *</label>
                <input type="text" autoFocus className="w-full p-1 outline-none text-sm" />
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap">* Account Name Required</span>
              </div>

              {/* 3-Column Layout */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* COLUMN 1 */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Code/Alias</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Group</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Sundry Creditors (A/cs Payble)</option><option>Sundry Debtors</option></select></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Reg Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Regular</option></select></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Transport</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Transporter</option></select></div>
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">GST By Trans.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>No</option></select></div>
                  </div>
                </div>

                {/* COLUMN 2 */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Address</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white mb-1"/><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex gap-2">
                    <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">City</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                    <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">State</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>GUJARAT</option></select></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Area</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                    <div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Pin</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  </div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Phone(O)</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Mobile</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Email</label><input type="email" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                </div>

                {/* COLUMN 3 */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col relative">
                    <label className="text-gray-600 mb-0.5">GSTNO</label>
                    <div className="flex">
                      <input type="text" className="border border-blue-300 rounded-l p-1 w-full bg-white"/>
                      <button className="border border-l-0 border-blue-300 bg-gray-50 px-2 rounded-r text-blue-500">🔍</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">PAN NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">ADHAR NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  </div>

                  <div className="flex flex-col"><label className="text-gray-600 mb-0.5">A/C NO.</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">MSME NO</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Type</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option></option></select></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Limit</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                    <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Credit Days</label><input type="text" className="border border-blue-300 rounded p-1 w-full bg-white"/></div>
                  </div>

                  {/* Balance Box */}
                  <div className="border border-gray-300 rounded p-2 bg-white mt-1 relative">
                    <label className="text-gray-700 font-medium absolute -top-2.5 left-2 bg-white px-1 text-[10px]">Balance</label>
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex flex-col"><label className="text-gray-600 mb-0.5">Balance Method</label><select className="border border-gray-300 rounded p-1 w-full bg-gray-100"><option>Balance Only</option></select></div>
                      <div className="flex gap-2">
                        <div className="flex flex-col flex-1"><label className="text-gray-600 mb-0.5">Opening Balance</label><input type="number" defaultValue={0} className="border border-blue-300 rounded p-1 w-full bg-white text-right"/></div>
                        <div className="flex flex-col w-20"><label className="text-gray-600 mb-0.5">Cr/Db.</label><select className="border border-blue-300 rounded p-1 w-full bg-white"><option>Cr</option><option>Db</option></select></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#e2e8f0] px-3 py-2 flex justify-between border-t items-center">
          <button className="bg-[#1e73be] text-white px-4 py-1.5 rounded font-medium">{type}</button>
          <div className="flex gap-2">
            <button className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save (F3)</button>
            <button className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Save & Close (F4)</button>
            <button onClick={onClose} className="bg-[#1e73be] text-white px-6 py-1.5 rounded font-medium shadow-sm hover:bg-blue-700">Cancel (Esc)</button>
          </div>
        </div>
      </div>
    </div>
  );
}