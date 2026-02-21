"use client";

export default function LrBasicDetails({ form, setForm }) {
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-6 gap-4">
      <Field
        label="Date"
        type="date"
        value={form.lrDate || today}
        onChange={(v) => handleChange("lrDate", v)}
      />
      <Field
        label="Center"
        value={form.center}
        onChange={(v) => handleChange("center", v)}
      />
      <Field
        label="Freight By"
        value={form.freightBy}
        onChange={(v) => handleChange("freightBy", v)}
      />
      <Field
        label="Delivery"
        value={form.delivery}
        onChange={(v) => handleChange("delivery", v)}
      />
      <Field
        label="From City"
        value={form.fromCity}
        onChange={(v) => handleChange("fromCity", v)}
      />
      <Field
        label="To City"
        value={form.toCity}
        onChange={(v) => handleChange("toCity", v)}
      />
    </div>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
