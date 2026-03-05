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
        // FILTER: Removes all numbers
        onChange={(v) => handleChange("center", v.replace(/[0-9]/g, ""))}
      />
      
      <Field
        label="Freight By"
        value={form.freightBy}
        onChange={(v) => handleChange("freightBy", v)}
        options={["Paid", "To Pay", "TBB"]} 
      />
      
      <Field
        label="Delivery"
        value={form.delivery}
        // FILTER: Removes all numbers
        onChange={(v) => handleChange("delivery", v.replace(/[0-9]/g, ""))}
      />
      
      <Field
        label="From City"
        value={form.fromCity}
        // FILTER: Removes all numbers
        onChange={(v) => handleChange("fromCity", v.replace(/[0-9]/g, ""))}
      />
      
      <Field
        label="To City"
        value={form.toCity}
        // FILTER: Removes all numbers
        onChange={(v) => handleChange("toCity", v.replace(/[0-9]/g, ""))}
      />
    </div>
  );
}

function Field({ label, type = "text", value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      {options ? (
        <select
          className="input bg-white"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}