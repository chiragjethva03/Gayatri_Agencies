"use client";

export default function ExpenseTable({ records, loading, selectedIds, onToggle }) {
  const paidTotal    = records.filter(r => r.status === "Paid"   ).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingTotal = records.filter(r => r.status !== "Paid"   ).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const paymentModeBadge = (mode) => {
    if (mode === "GPay") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
  };

  const paymentModeLabel = (record) => record.paymentMode || "Cash";

  const statusBadge = (record) => {
    if (record.status === "Paid") return "bg-green-100 text-green-700 border border-green-200";
    return "bg-amber-100 text-amber-700 border border-amber-200";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-220px)] relative">

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-medium sticky top-0 z-10">
            <tr>
              <th className="p-3 w-10 text-center"></th>
              <th className="p-3">Date</th>
              <th className="p-3">Payer Name</th>
              <th className="p-3">Receiver Name</th>
              <th className="p-3">Amount (₹)</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No records available.</td></tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(record._id)}
                      onChange={() => onToggle(record._id)}
                    />
                  </td>
                  <td className="p-3 text-gray-700">{record.date}</td>
                  <td className="p-3 text-gray-700">{record.payerName}</td>
                  <td className="p-3 text-gray-700">{record.payeeName}</td>
                  <td className="p-3 font-semibold text-gray-800">₹ {record.amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${paymentModeBadge(paymentModeLabel(record))}`}>
                      {paymentModeLabel(record)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit ${statusBadge(record)}`}>
                      {record.isLocked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      )}
                      {record.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && records.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center z-10">
          <span className="text-blue-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            {records.length} Entries
          </span>
          <div className="flex items-center gap-2">
            <span className="text-amber-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-amber-200 shadow-sm">
              Pending: ₹ {pendingTotal.toLocaleString()}
            </span>
            <span className="text-red-600 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-red-200 shadow-sm">
              Paid: ₹ {paidTotal.toLocaleString()}
            </span>
            <span className="text-emerald-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
              Total: ₹ {(pendingTotal + paidTotal).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
