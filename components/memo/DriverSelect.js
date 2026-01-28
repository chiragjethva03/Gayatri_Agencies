"use client";
import { useState } from "react";
import ComboBox from "../ui/ComboBox";
import AddItemModal from "../ui/AddItemModal";

export default function DriverSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const saveDriver = async (data) => {
    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onChange(data.name);
    setOpen(false);
  };

  return (
    <>
      <ComboBox
        label="Driver"
        value={value}
        fetchUrl="/api/drivers"
        displayKey="name"
        onChange={onChange}
        onAdd={() => setOpen(true)}
      />

      {open && (
        <AddItemModal
          title="Add Driver"
          fields={[
            { name: "name", label: "Driver Name" },
            { name: "phone", label: "Phone (Optional)" },
          ]}
          onSave={saveDriver}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
