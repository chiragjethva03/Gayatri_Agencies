"use client";

export default function LrGoodsTable({ form, setForm }) {
  const goods = form.goods?.length ? form.goods : Array(3).fill({
    article: "", packaging: "", goodsContain: "", weight: "", rate: "",
    freightOn: "", amount: "", valueInRs: "", eWayBillNo: "", eWayBillDate: "", eWayBillExpiry: ""
  });

  const packagingOptions = [
    "", "Polythene", "Airtight", "Gunny Bag", "Carton", "Wooden Box", "Plastic Drum", "Loose"
  ];

  const handleRowChange = (index, field, value) => {
    const updatedGoods = [...goods];
    updatedGoods[index] = { ...updatedGoods[index], [field]: value };

    let newFreight = form.freight;
    if (field === "rate") {
      newFreight = updatedGoods.reduce((sum, row) => sum + (Number(row.rate) || 0), 0);
    }

    setForm({ 
      ...form, 
      goods: updatedGoods, 
      ...(field === "rate" && { freight: newFreight }) 
    });
  };

  // FILTER HELPER: For text-only fields (removes numbers)
  const handleTextChange = (index, field, value) => {
    handleRowChange(index, field, value.replace(/[0-9]/g, ""));
  };

  // FILTER HELPER: For number-only fields (removes letters, allows decimals)
  const handleNumChange = (index, field, value) => {
    handleRowChange(index, field, value.replace(/[^0-9.]/g, ""));
  };

  const headers = [
    "Article", "Packaging", "Goods Contain", "Weight", "Rate", "Freight On",
    "Amount", "Value In Rs", "E-Way Bill No", "E-Way Bill Date", "E-Way Bill Expiry"
  ];

  const inputClass = "w-full h-full min-h-[36px] px-3 py-1.5 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 focus:z-10 relative bg-transparent transition-colors text-gray-800";
  const cellClass = "p-0 border-r border-gray-200 last:border-r-0 relative";

  return (
    <div>
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Article / Packaging</h3>

      <div className="border border-gray-300 rounded-lg overflow-x-auto shadow-sm bg-white">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-gray-300">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {goods.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                
                <td className={cellClass}>
                  <input inputMode="numeric" value={row.article || ""} onChange={(e) => handleNumChange(i, "article", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                
                <td className={cellClass}>
                  <select value={row.packaging || ""} onChange={(e) => handleRowChange(i, "packaging", e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {packagingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                
                <td className={cellClass}>
                  <input value={row.goodsContain || ""} onChange={(e) => handleTextChange(i, "goodsContain", e.target.value)} className={inputClass} />
                </td>
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.weight || ""} onChange={(e) => handleNumChange(i, "weight", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.rate || ""} onChange={(e) => handleNumChange(i, "rate", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                <td className={cellClass}>
                  <input value={row.freightOn || ""} onChange={(e) => handleTextChange(i, "freightOn", e.target.value)} className={inputClass} />
                </td>
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.amount || ""} onChange={(e) => handleNumChange(i, "amount", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                <td className={cellClass}>
                  <input inputMode="decimal" value={row.valueInRs || ""} onChange={(e) => handleNumChange(i, "valueInRs", e.target.value)} className={inputClass} placeholder="0" />
                </td>
                <td className={cellClass}>
                  <input inputMode="numeric" value={row.eWayBillNo || ""} onChange={(e) => handleNumChange(i, "eWayBillNo", e.target.value)} className={inputClass} />
                </td>
                <td className={cellClass}><input value={row.eWayBillDate || ""} onChange={(e) => handleRowChange(i, "eWayBillDate", e.target.value)} type="date" className={`${inputClass} text-gray-600`} /></td>
                <td className={cellClass}><input value={row.eWayBillExpiry || ""} onChange={(e) => handleRowChange(i, "eWayBillExpiry", e.target.value)} type="date" className={`${inputClass} text-gray-600`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}