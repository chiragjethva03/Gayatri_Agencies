"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

const blueScrollbar = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-[#1e73be] hover:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded-full";

export default function LrPickerModal({ isOpen, onClose, onSelect, alreadyAddedIds = [] }) {
    const { slug } = useParams();

    const [lrs, setLrs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLrNo, setSearchLrNo] = useState("");
    const [searchCity, setSearchCity] = useState("");
    const [selectedLrs, setSelectedLrs] = useState([]);
    const [debouncedLrNo, setDebouncedLrNo] = useState("");
    const [debouncedCity, setDebouncedCity] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchLrs();
            setSelectedLrs([]);
            setSearchLrNo("");
            setSearchCity("");
        }
    }, [isOpen]);

    const fetchLrs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/lr?transport=${slug}`);
            if (res.ok) setLrs(await res.json());
        } catch (err) {
            console.error("Failed to fetch LRs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLrNo(searchLrNo), 500);
        return () => clearTimeout(timer);
    }, [searchLrNo]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedCity(searchCity), 500);
        return () => clearTimeout(timer);
    }, [searchCity]);


    const filteredLrs = lrs.filter(lr => {
        const matchLrNo = !debouncedLrNo ||
            lr.lrNo?.toLowerCase().includes(debouncedLrNo.toLowerCase());
        const matchCity = !debouncedCity ||
            lr.fromCity?.toLowerCase().includes(debouncedCity.toLowerCase()) ||
            lr.toCity?.toLowerCase().includes(debouncedCity.toLowerCase());
        return matchLrNo && matchCity;
    });

    const toggleSelect = (lr) => {
        setSelectedLrs(prev =>
            prev.find(x => x._id === lr._id)
                ? prev.filter(x => x._id !== lr._id)
                : [...prev, lr]
        );
    };

    const isSelected = (lr) => selectedLrs.some(x => x._id === lr._id);
    const isAlreadyAdded = (lr) => alreadyAddedIds.includes(lr._id);

    // ✅ Map LR data same as handleGetLr in DeliveryForm
    const handleSelect = () => {
        const mapped = selectedLrs.map(lr => {
            const totalArt = lr.goods?.reduce((sum, g) => sum + (Number(g.article) || 0), 0) || 0;
            const totalWt = lr.goods?.reduce((sum, g) => sum + (Number(g.weight) || 0), 0) || 0;
            const packNames = lr.goods?.map(g => g.packaging).filter(Boolean).join(", ") || "-";
            const desc = lr.goods?.map(g => g.goodsContain).filter(Boolean).join(", ") || "-";
            const freightAmount = Number(lr.subTotal) || Number(lr.freight) || 0;

            return {
                id: lr._id,
                lrNo: lr.lrNo,
                lrDate: lr.lrDate || "-",
                from: lr.fromCity || "-",
                to: lr.toCity || "-",
                consignor: lr.consignor || "-",
                consignorGst: "-",
                consignee: lr.consignee || "-",
                consigneeGst: "-",
                pack: packNames,
                description: desc,
                freightBy: lr.freightBy || "-",
                article: totalArt,
                weight: totalWt,
                amount: freightAmount,
            };
        });

        onSelect(mapped);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
            <div className="bg-white w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-400 rounded-sm overflow-hidden">

                {/* Header */}
                <div className="bg-[#1e73be] text-white px-4 py-2 flex justify-between items-center shrink-0">
                    <h2 className="font-semibold text-sm">Select L.R.</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-red-500 px-2 py-0.5 rounded bg-white text-black font-bold transition-colors text-xs"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-gray-200 flex gap-3 items-end shrink-0">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                            Search by LR No.
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={searchLrNo}
                            onChange={e => setSearchLrNo(e.target.value)}
                            placeholder="e.g. LR01"
                            className="border border-blue-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-40 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                            Search by City
                        </label>
                        <input
                            type="text"
                            value={searchCity}
                            onChange={e => setSearchCity(e.target.value)}
                            placeholder="e.g. Ahmedabad"
                            className="border border-blue-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-40 bg-white"
                        />
                    </div>
                    <button
                        onClick={fetchLrs}
                        className="px-4 py-1.5 bg-[#1e73be] hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    <div className="ml-auto text-xs text-gray-500">
                        {filteredLrs.length} LRs found
                        {selectedLrs.length > 0 && (
                            <span className="ml-2 text-blue-600 font-semibold">
                                • {selectedLrs.length} selected
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className={`flex-1 overflow-auto ${blueScrollbar}`}>
                    <table className="min-w-[1000px] w-full text-xs text-left whitespace-nowrap">
                        <thead className="bg-[#e2e8f0] sticky top-0 z-10">
                            <tr>
                                <th className="p-2 border-r border-gray-300 w-8"></th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">LR No.</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">LR Date</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">From</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">To</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consignor</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Consignee</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">FreightBy</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Article</th>
                                <th className="p-2 border-r border-gray-300 font-semibold text-gray-700">Weight</th>
                                <th className="p-2 font-semibold text-gray-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-gray-500">
                                        Loading LRs...
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredLrs.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-gray-500">
                                        No LRs found.
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredLrs.map(lr => {
                                const already = isAlreadyAdded(lr);
                                const selected = isSelected(lr);
                                const totalArt = lr.goods?.reduce((s, g) => s + (Number(g.article) || 0), 0) || 0;
                                const totalWt = lr.goods?.reduce((s, g) => s + (Number(g.weight) || 0), 0) || 0;

                                return (
                                    <tr
                                        key={lr._id}
                                        onClick={() => !already && toggleSelect(lr)}
                                        className={`border-b border-gray-100 transition-colors ${already
                                            ? "bg-gray-50 opacity-50 cursor-not-allowed"
                                            : selected
                                                ? "bg-blue-50 cursor-pointer"
                                                : "hover:bg-blue-50/50 cursor-pointer"
                                            }`}
                                    >
                                        <td className="p-2 border-r border-gray-200 text-center">
                                            {already ? (
                                                <span className="text-green-500 text-xs font-bold">✓</span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleSelect(lr)}
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 cursor-pointer"
                                                />
                                            )}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 font-bold text-blue-600">
                                            {lr.lrNo || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-600">
                                            {lr.lrDate || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700">
                                            {lr.fromCity || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700">
                                            {lr.toCity || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700">
                                            {lr.consignor || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700">
                                            {lr.consignee || "-"}
                                        </td>
                                        <td className="p-2 border-r border-gray-200">
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${lr.freightBy?.toLowerCase() === "to pay"
                                                ? "bg-orange-100 text-orange-700"
                                                : lr.freightBy?.toLowerCase() === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {lr.freightBy || "-"}
                                            </span>
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700 text-center">
                                            {totalArt}
                                        </td>
                                        <td className="p-2 border-r border-gray-200 text-gray-700 text-center">
                                            {totalWt}
                                        </td>
                                        <td className="p-2 text-gray-800 font-semibold text-right pr-3">
                                            ₹{Number(lr.subTotal || lr.freight || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-[#f8fafc] border-t border-gray-200 flex justify-between items-center shrink-0">
                    <span className="text-xs text-gray-500">
                        {selectedLrs.length === 0
                            ? "Select one or more LRs from the list"
                            : `${selectedLrs.length} LR${selectedLrs.length > 1 ? "s" : ""} selected — ${selectedLrs.map(l => l.lrNo).join(", ")}`
                        }
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-5 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSelect}
                            disabled={selectedLrs.length === 0}
                            className={`px-6 py-1.5 text-white text-xs font-semibold rounded transition-colors ${selectedLrs.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-[#1e73be] hover:bg-blue-700"
                                }`}
                        >
                            Select ({selectedLrs.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}