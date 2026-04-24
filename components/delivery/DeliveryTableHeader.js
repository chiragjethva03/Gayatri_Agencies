"use client";

export default function DeliveryTableHeader() {
  return (
    <thead className="bg-gray-200 sticky top-0 z-10">
      <tr>
        <th className="th w-8"></th>
        <th className="th">Date</th>
        <th className="th">D. No</th>
        <th className="th">Type</th>
        <th className="th">L.R. No.</th>
        <th className="th">Consignee</th>
        <th className="th">From Branch</th>
        <th className="th">Art</th>
        <th className="th">LabourName</th>
        <th className="th">PackName</th>
        <th className="th">DelSubTotal</th>
        <th className="th">FreightBy</th>
        <th className="th">Kasar</th>
        <th className="th">Demurrage</th>
      </tr>
    </thead>
  );
}