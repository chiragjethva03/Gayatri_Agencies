export default function LrCharges() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="space-y-2">
        <label className="text-sm">RCM</label>
        <select className="input w-48">
          <option>N/A</option>
        </select>

        <label className="text-sm">RCM 5%</label>
        <input className="input w-48" disabled />
      </div>

      <div className="space-y-2">
        {["Freight","B.C","Hamali","Crossing","Door Delivery","SubTotal"].map(f=>(
          <div key={f} className="flex justify-between gap-2">
            <label className="text-sm">{f}</label>
            <input className="input w-40" />
          </div>
        ))}
      </div>

    </div>
  );
}
