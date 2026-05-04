"use client";
import { useState } from "react";

export default function LrTableRow({ lr, isSelected, onToggle }) {
  const [localLr, setLocalLr] = useState(lr);

  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState("form");
  const [isSaving, setIsSaving] = useState(false);

  const [payees, setPayees] = useState([]);
  const [isAddingPayee, setIsAddingPayee] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState("");
  const [isSavingPayee, setIsSavingPayee] = useState(false);

  const [formData, setFormData] = useState({
    payerName: localLr.payerName || localLr.consignor || "",
    payeeName: localLr.payeeName || localLr.consignee || "",
    paymentType: localLr.paymentType || "Cash",
    paymentStatus: localLr.paymentStatus || "Pending",
    paymentDate: localLr.paymentDate || new Date().toISOString().split("T")[0],
  });

  const isPaid = localLr.freightBy?.toLowerCase() === "paid";
  const articleCount = (localLr.goods || []).reduce((sum, g) => sum + (Number(g.article) || 0), 0);

  const handleOpenModal = async (e) => {
    e.stopPropagation();
    setIsAddingPayee(false);
    setNewPayeeName("");
    if (localLr.paymentDate || localLr.payerName) {
      setModalView("summary");
    } else {
      setModalView("form");
    }
    setShowModal(true);
    try {
      const res = await fetch("/api/payees");
      const data = await res.json();
      setPayees(data.map(p => p.name));
    } catch {
      setPayees(["Sarthak", "Mehul"]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayeeSelect = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      setIsAddingPayee(true);
      setNewPayeeName("");
    } else {
      setFormData({ ...formData, payeeName: val });
    }
  };

  const handleSaveNewPayee = async () => {
    if (!newPayeeName.trim()) return;
    setIsSavingPayee(true);
    try {
      const res = await fetch("/api/payees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPayeeName.trim() }),
      });
      const saved = await res.json();
      setPayees(prev => [...prev, saved.name]);
      setFormData(prev => ({ ...prev, payeeName: saved.name }));
      setIsAddingPayee(false);
      setNewPayeeName("");
    } catch {
      alert("Failed to save payee name.");
    } finally {
      setIsSavingPayee(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/lr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: localLr._id, ...formData }),
      });
      if (res.ok) {
        const updatedLr = await res.json();
        setLocalLr(updatedLr);
        setModalView("summary");
      }
    } catch (err) {
      console.error("Failed to save payment info", err);
    } finally {
      setIsSaving(false);
    }
  };

  const displayPayer = localLr.payerName || localLr.consignor || "Sender";
  const displayPayee = localLr.payeeName || localLr.consignee || "Receiver";
  const displayType = localLr.paymentType || formData.paymentType || "Cash";
  const displayDate = localLr.paymentDate || formData.paymentDate || "-";

  return (
    <tr className={`border-t transition ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}>
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
      <td className="td font-medium text-gray-700">{articleCount > 0 ? articleCount : "-"}</td>
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

        {showModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden cursor-default">

              {/* Header */}
              <div className="bg-[#1e73be] text-white px-5 py-3 font-semibold text-sm flex justify-between items-center">
                <span className="tracking-wide">Payment Information</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-base leading-none"
                >
                  ✕
                </button>
              </div>

              {/* FORM VIEW */}
              {modalView === "form" ? (
                <div className="p-5 space-y-4">

                  {/* Row 1: Payer + Payee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Payer Name</label>
                      <input
                        type="text"
                        name="payerName"
                        value={formData.payerName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Payee Name</label>

                      {isAddingPayee ? (
                        <div className="space-y-2">
                          <input
                            autoFocus
                            type="text"
                            value={newPayeeName}
                            onChange={e => setNewPayeeName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSaveNewPayee()}
                            placeholder="Enter payee name..."
                            className="w-full border border-blue-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handleSaveNewPayee}
                              disabled={isSavingPayee || !newPayeeName.trim()}
                              className="py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {isSavingPayee ? "Saving..." : "Add & Select"}
                            </button>
                            <button
                              onClick={() => { setIsAddingPayee(false); setNewPayeeName(""); }}
                              className="py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={formData.payeeName}
                          onChange={handlePayeeSelect}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white transition"
                        >
                          <option value="" disabled>Select payee...</option>
                          {formData.payeeName && !payees.includes(formData.payeeName) && (
                            <option value={formData.payeeName}>{formData.payeeName}</option>
                          )}
                          {payees.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option disabled>──────────</option>
                          <option value="__add_new__">+ Add New Name</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Payment Type + Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Payment Type</label>
                      <select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white transition"
                      >
                        <option value="Cash">Cash</option>
                        <option value="GPay">GPay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white transition"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePayment}
                      disabled={isSaving}
                      className="px-6 py-2 bg-[#1e73be] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save Payment"}
                    </button>
                  </div>
                </div>

              ) : (
                /* SUMMARY VIEW */
                <div className="flex flex-col">
                  <div className="px-6 py-8 text-center space-y-3">
                    <div className="text-[15px] text-gray-800 leading-relaxed">
                      <span className="font-bold text-blue-700">{displayPayer}</span>
                      {localLr.paymentStatus === "Pending" ? (
                        <span> is <span className="text-orange-500 font-bold">pending to pay</span> </span>
                      ) : (
                        <span> has <span className="text-green-600 font-bold">paid</span> </span>
                      )}
                      <span className="font-bold text-gray-900">
                        {localLr.subTotal ? `₹ ${localLr.subTotal}` : "₹ 0"}
                      </span>
                      {" "}to{" "}
                      <span className="font-bold text-blue-700">{displayPayee}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Via <span className="font-semibold text-gray-700">{displayType}</span> &nbsp;·&nbsp; {displayDate}
                    </p>
                  </div>

                  <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
                    <button
                      onClick={() => setModalView("form")}
                      className="text-[#1e73be] hover:underline text-xs font-bold tracking-wide"
                    >
                      ✎ Edit Details
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-[#1e73be] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
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
