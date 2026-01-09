"use client";

import { useState } from "react";
import LrHeader from "./LrHeader";
import LrTable from "./LrTable";
import LrFooter from "./LrFooter";

export default function AddLrModal({ onClose, onSelect }) {
  const [selectedLrs, setSelectedLrs] = useState([]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[95%] h-[90%] rounded shadow flex flex-col">

        <LrHeader />

        <LrTable
          selectedLrs={selectedLrs}
          setSelectedLrs={setSelectedLrs}
        />

        <LrFooter
          onClose={onClose}
          onSelect={() => onSelect(selectedLrs)}
        />
      </div>
    </div>
  );
}
