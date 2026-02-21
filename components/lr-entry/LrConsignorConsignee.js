"use client";

export default function LrConsignorConsignee({ form, setForm }) {
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <PartyBlock
        title="Consignor"
        name={form.consignor}
        mobile={form.consignorMobile}
        address={form.consignorAddress}
        onChange={handleChange}
        prefix="consignor"
      />

      <PartyBlock
        title="Consignee"
        name={form.consignee}
        mobile={form.consigneeMobile}
        address={form.consigneeAddress}
        onChange={handleChange}
        prefix="consignee"
      />

    </div>
  );
}

function PartyBlock({ title, name, mobile, address, onChange, prefix }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{title}</h3>

      <input
        className="input w-full"
        placeholder="Name"
        value={name || ""}
        onChange={(e) => onChange(`${prefix}`, e.target.value)}
      />

      <input
        className="input w-full"
        placeholder="Mobile"
        value={mobile || ""}
        onChange={(e) => onChange(`${prefix}Mobile`, e.target.value)}
      />

      <input
        className="input w-full"
        placeholder="Address"
        value={address || ""}
        onChange={(e) => onChange(`${prefix}Address`, e.target.value)}
      />
    </div>
  );
}
