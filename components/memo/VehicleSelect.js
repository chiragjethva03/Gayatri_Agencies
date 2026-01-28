"use client";
import { useState } from "react";
import ComboBox from "../ui/ComboBox";
import AddItemModal from "../ui/AddItemModal";

export default function VehicleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const saveVehicle = async (data) => {
    await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: data.number }),
    });
    onChange(data.number);
    setOpen(false);
  };

  return (
    <>
      <ComboBox
        label="Vehicle"
        value={value}
        fetchUrl="/api/vehicles"
        displayKey="number"
        onChange={onChange}
        onAdd={() => setOpen(true)}
      />

      {open && (
        <AddItemModal
          title="Add Vehicle"
          fields={[{ name: "number", label: "Vehicle Number" }]}
          onSave={saveVehicle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
