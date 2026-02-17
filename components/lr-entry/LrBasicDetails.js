"use client";

export default function LrBasicDetails() {
  // get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-6 gap-4">
      <Field label="Date" type="date" defaultValue={today} />
      <Select label="Center" />
      <Select label="Freight By" />
      <Select label="Delivery" />
      <Field label="From City" />
      <Field label="To City" />
    </div>
  );
}

function Field({ label, type = "text", defaultValue }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        defaultValue={defaultValue}
      />
    </div>
  );
}

function Select({ label }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input">
        <option>Select</option>
      </select>
    </div>
  );
}
