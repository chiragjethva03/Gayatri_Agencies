"use client";
import { useState } from "react";

export default function LrTableRow({ lr, isSelected, onToggle }) {
  const [localLr, setLocalLr] = useState(lr);
  
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState("form"); 
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    payerName: localLr.payerName || localLr.consignor || "",
    payeeName: localLr.payeeName || localLr.consignee || "",
    paymentType: localLr.paymentType || "Cash",
    paymentStatus: localLr.paymentStatus || "Pending",
    paymentDate: localLr.paymentDate || new Date().toISOString().split("T")[0],
  });

  const isPaid = localLr.freightBy?.toLowerCase() === "paid";

  const handleOpenModal = (e) => {
    e.stopPropagation();
    // FIXED: Only show the summary directly if they have actually saved a Payment Date or Payer Name!
    if (localLr.paymentDate || localLr.payerName) {
      setModalView("summary");
    } else {
      setModalView("form");
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/lr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: localLr._id, ...formData })
      });
      
      if (res.ok) {
        const updatedLr = await res.json();
        setLocalLr(updatedLr); // Update the row UI instantly
        setModalView("summary"); // Switch to the text summary view!
      }
    } catch (err) {
      console.error("Failed to save payment info", err);
    } finally {
      setIsSaving(false);
    }
  };

  // FIXED: Smart fallbacks so the summary never looks blank
  const displayPayer = localLr.payerName || localLr.consignor || "Sender";
  const displayPayee = localLr.payeeName || localLr.consignee || "Receiver";
  const displayType = localLr.paymentType || formData.paymentType || "Cash";
  const displayDate = localLr.paymentDate || formData.paymentDate || "-";

  return (
    <tr className={`border-t transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <td className="td text-center">
        <input 
          type="checkbox" 
          checked={isSelected || false}
          onChange={onToggle}
          className="cursor-pointer w-4 h-4"
        />
      </td>
      <td className="td">{localLr.lrDate}</td>
      <td className="td font-medium text-blue-600">{localLr.lrNo}</td>
      <td className="td">{localLr.fromCity || "-"}</td>
      <td className="td">{localLr.toCity || "-"}</td>
      <td className="td">{localLr.consignor || "-"}</td> 
      <td className="td">{localLr.consignee || "-"}</td>
      <td className="td">{localLr.subTotal ? `₹ ${localLr.subTotal}` : "-"}</td>
      
      <td className="td">
        <div className="flex items-center gap-2">
          <span>{localLr.freightBy || "-"}</span>
          
          {isPaid && (
            <button 
              onClick={handleOpenModal}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors shadow-sm"
            >
              View Info
            </button>
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-2xl w-[450px] border border-gray-300 overflow-hidden cursor-default">
              
              {/* Header */}
              <div className="bg-[#1e73be] text-white px-4 py-2 font-semibold text-sm flex justify-between items-center">
                <span>Payment Information</span>
                <button onClick={() => setShowModal(false)} className="hover:text-red-300 font-bold text-lg leading-none">✕</button>
              </div>
              
              {/* DYNAMIC BODY: Form View OR Summary View */}
              {modalView === "form" ? (
                
                <div className="p-5 text-left bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Payer Name</label>
                      <input type="text" name="payerName" value={formData.payerName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Payee Name</label>
                      <input type="text" name="payeeName" value={formData.payeeName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Payment Type</label>
                      <select name="paymentType" value={formData.paymentType} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                        <option value="Cash">Cash</option>
                        <option value="GPay">GPay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                      <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                    <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-4">
                    <button onClick={() => setShowModal(false)} className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 font-medium">Cancel</button>
                    <button onClick={handleSavePayment} disabled={isSaving} className="px-5 py-1.5 bg-[#1e73be] text-white rounded text-sm hover:bg-blue-700 font-medium shadow-sm">
                      {isSaving ? "Saving..." : "Save Payment"}
                    </button>
                  </div>
                </div>

              ) : (

                <div className="flex flex-col">
                  <div className="p-8 text-center text-[15px] text-gray-800 leading-relaxed">
                    <span className="font-bold text-blue-700">{displayPayer}</span> 
                    
                    {localLr.paymentStatus === "Pending" ? (
                       <span> is <span className="text-orange-600 font-bold">pending to pay</span> </span>
                    ) : (
                       <span> had <span className="text-green-600 font-bold">paid</span> </span>
                    )}

                    <span className="font-bold">{localLr.subTotal ? `${localLr.subTotal} RS.` : "0 RS."}</span> 
                    {" "}to <span className="font-bold text-blue-700">{displayPayee}</span>
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      Via {displayType} on {displayDate}
                    </div>
                  </div>
                  
                  {/* Footer with Edit button */}
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
                    <button onClick={() => setModalView("form")} className="text-[#1e73be] hover:underline text-xs font-bold tracking-wide">
                      ✎ Edit Details
                    </button>
                    <button onClick={() => setShowModal(false)} className="px-6 py-1.5 bg-[#1e73be] text-white rounded text-xs font-medium hover:bg-blue-700 shadow-sm transition-colors">
                      Close
                    </button>
                  </div>
                </div>

              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}