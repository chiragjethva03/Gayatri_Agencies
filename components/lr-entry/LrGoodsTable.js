export default function LrGoodsTable() {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">Article / Packaging</h3>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              {[
                "Article","Packaging","Goods Contain",
                "Weight","Rate","Freight On",
                "Amount","Value In Rs","E-Way Bill No",
                "E-Way Bill Date","E-Way Bill Expiry"
              ].map(h => (
                <th key={h} className="px-2 py-1 border">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[1,2,3].map(i => (
              <tr key={i}>
                {Array(11).fill(0).map((_,j)=>(
                  <td key={j} className="border px-1 py-1">
                    <input className="w-full border px-1" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
