export default function LrConsignorConsignee() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <PartyBlock title="Consignor" />
      <PartyBlock title="Consignee" />

    </div>
  );
}

function PartyBlock({ title }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{title}</h3>

      <input className="input w-full" placeholder="Name" />
      <input className="input w-full" placeholder="Mobile" />
      <input className="input w-full" placeholder="Address" />
    </div>
  );
}
