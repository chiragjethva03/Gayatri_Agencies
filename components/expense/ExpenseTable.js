"use client";

export default function ExpenseTable({ records, loading, selectedIds, onToggle }) {
  const totalAmount = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-220px)] relative">
      
      {/* Scrollable Table Area */}
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap text-sm min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-medium sticky top-0 z-10">
            <tr>
              <th className="p-3 w-10 text-center"></th>
              <th className="p-3">Date</th>
              <th className="p-3">Payer Name</th>
              <th className="p-3">Payee Name</th>
              <th className="p-3">Amount (₹)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No records available.</td></tr>
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
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* FIXED FOOTER DIV - Sticks to absolute bottom */}
      {!loading && records.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center z-10">
          
          {/* Left Side: Entries */}
          <span className="text-blue-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            {records.length} Entries
          </span>
          
          {/* Right Side: Total Amount (with mr-[150px] to skip the Status column and align under Amount) */}
          <span className="text-emerald-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-emerald-200 shadow-sm mr-[150px]">
            Total Amount: ₹ {totalAmount.toLocaleString()}
          </span>

        </div>
      )}

    </div>
  );
}