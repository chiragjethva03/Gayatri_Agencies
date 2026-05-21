"use client";

import { useRef, useState } from "react";
import LrTableHeader from "./LrTableHeader";
import LrTableRow from "./LrTableRow";
import LrEmptyState from "./LrEmptyState";

export default function LrTable({ lrs, loading, selectedIds, onToggle, onSelectAll, toCityFilter, setToCityFilter, uniqueToCities, freightByFilter, setFreightByFilter, consignorFilter, setConsignorFilter, uniqueConsignors }) {

  const tableRef = useRef(null);
  const footerRef = useRef(null);
  const [showReceivedModal, setShowReceivedModal] = useState(false);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const grandTotalFreight = lrs.reduce((sum, lr) => sum + (Number(lr.subTotal) || 0), 0);
  const grandTotalArticles = lrs.reduce((sum, lr) => sum + (lr.goods || []).reduce((s, g) => s + (Number(g.article) || 0), 0), 0);
  const totalEntries = lrs.length;

  // Received payment summary: freightBy === "Paid" AND paymentStatus === "Paid"
  const receivedLrs = lrs.filter(
    lr => lr.freightBy?.toLowerCase().trim() === "paid" && lr.paymentStatus === "Paid"
  );

  const receivedByConsignor = receivedLrs.reduce((acc, lr) => {
    const name = lr.cashConsigner?.trim() || lr.consignor?.trim() || "Unknown";
    if (!acc[name]) acc[name] = { count: 0, total: 0 };
    acc[name].count += 1;
    acc[name].total += Number(lr.subTotal) || 0;
    return acc;
  }, {});

  const totalReceived = receivedLrs.reduce((sum, lr) => sum + (Number(lr.subTotal) || 0), 0);
  const consignorRows = Object.entries(receivedByConsignor).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">

      <div
        ref={tableRef}
        onScroll={handleScroll}
        className="overflow-auto flex-1 custom-scrollbar"
      >
        <table className="min-w-[1550px] w-full text-sm table-fixed">
          <LrTableHeader
            toCityFilter={toCityFilter}
            setToCityFilter={setToCityFilter}
            uniqueToCities={uniqueToCities}
            freightByFilter={freightByFilter}
            setFreightByFilter={setFreightByFilter}
            consignorFilter={consignorFilter}
            setConsignorFilter={setConsignorFilter}
            uniqueConsignors={uniqueConsignors}
            allSelected={lrs.length > 0 && lrs.every(lr => selectedIds?.includes(lr._id))}
            someSelected={lrs.some(lr => selectedIds?.includes(lr._id))}
            onSelectAll={onSelectAll}
          />
          <tbody>
            {loading && (
              <tr>
                <td colSpan="11" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && lrs.length === 0 && <LrEmptyState />}

            {!loading &&
              lrs.map((lr) => (
              <LrTableRow
                key={lr._id}
                lr={lr}
                isSelected={selectedIds?.includes(lr._id)}
                onToggle={() => onToggle(lr._id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!loading && lrs.length > 0 && (
        <div
          ref={footerRef}
          className="bg-blue-50/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden relative z-10 flex justify-between"
        >
          <table className="min-w-[1550px] w-full text-sm font-bold text-gray-800 table-fixed">
            <tbody>
              <tr>
                <td className="td w-8 border-none"></td>
                <td className="td w-[90px] py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800 mr-2">
                    {totalEntries} Entries
                  </span>

                  {toCityFilter !== "All" && (
                    <span className="text-gray-500 font-medium text-xs ml-2">
                      City: <span className="text-gray-800 font-bold">{toCityFilter}</span>
                    </span>
                  )}
                  {freightByFilter !== "All" && (
                    <span className="text-gray-500 font-medium text-xs ml-2">
                      Freight: <span className="text-gray-800 font-bold">{freightByFilter}</span>
                    </span>
                  )}
                  {consignorFilter.length > 0 && (
                    <span className="text-gray-500 font-medium text-xs ml-2">
                      Consignor: <span className="text-gray-800 font-bold">{consignorFilter.length === 1 ? consignorFilter[0] : `${consignorFilter.length} selected`}</span>
                    </span>
                  )}
                </td>
                <td className="td w-[80px] border-none"></td>
                <td className="td w-[105px] border-none"></td>
                <td className="td w-[115px] border-none"></td>
                <td className="td w-[200px] border-none"></td>
                <td className="td w-[200px] border-none"></td>
                <td className="td w-[110px] py-3 font-bold text-gray-700 text-sm border-none">
                  {grandTotalArticles > 0 && (
                    <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200 text-gray-800">
                      {grandTotalArticles} Articles
                    </span>
                  )}
                </td>
                <td className="td w-[120px] py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    ₹ {grandTotalFreight.toLocaleString()}
                  </span>
                </td>
                <td className="td w-[160px] py-3 border-none">
                  {receivedLrs.length > 0 && (
                    <button
                      onClick={() => setShowReceivedModal(true)}
                      className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-md shadow-sm text-xs font-semibold hover:bg-green-100 hover:border-green-300 transition-colors"
                      title="View received payment breakdown"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Received ₹{totalReceived.toLocaleString()}
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Received Payment Modal */}
      {showReceivedModal && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReceivedModal(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-green-100 overflow-hidden">

            {/* Header */}
            <div className="bg-green-600 text-white px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="font-bold text-sm tracking-wide">Received All Payment</span>
              </div>
              <button
                onClick={() => setShowReceivedModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Summary pill */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-2.5">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Received</span>
                <span className="text-base font-bold text-green-800">₹ {totalReceived.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 px-0.5">
                {receivedLrs.length} LR{receivedLrs.length !== 1 ? "s" : ""} · Paid freight with Paid status
              </p>
            </div>

            {/* Consignor table */}
            <div className="px-5 pb-5">
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Consignor</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">LRs</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {consignorRows.map(([name, { count, total }], idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-800 font-medium text-sm">{name}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-green-700">₹ {total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 border-t border-green-100">
                      <td className="px-3 py-2.5 text-xs font-bold text-green-800 uppercase tracking-wide">Total</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{receivedLrs.length}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-green-800">₹ {totalReceived.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
