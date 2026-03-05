export default function LrTableHeader() {
  return (
    <thead className="bg-gray-200 sticky top-0 z-10">
      <tr>
        <th className="th w-8"></th>
        <th className="th">LR Date</th>
        <th className="th">LR No</th>
        <th className="th">From City</th>
        <th className="th">To City</th>
        <th className="th">Center</th>
        <th className="th">Consigner</th>
        
        {/* NEW: Replaced Cash columns with Consignee */}
        <th className="th">Consignee</th>
        
        <th className="th">Total Freight</th>
        <th className="th">Freight</th>
      </tr>
    </thead>
  );
}