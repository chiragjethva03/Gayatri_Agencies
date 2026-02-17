"use client";

import { useEffect, useState } from "react";
import LrTopBar from "./LrTopBar";
import LrActionBar from "./LrActionBar";
import LrTable from "./LrTable";
import LrEntryPanel from "@/components/lr-entry/LrEntryPanel";

export default function LrPage() {
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEntry, setShowEntry] = useState(false);

  useEffect(() => {
    fetch("/api/lr")
      .then((res) => res.json())
      .then(setLrs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <LrTopBar />

      {/* PASS onAdd */}
      <LrActionBar onAdd={() => setShowEntry(true)} />

      <div className="relative mt-3">
        <LrTable lrs={lrs} loading={loading} />

        {showEntry && (
          <LrEntryPanel onClose={() => setShowEntry(false)} />
        )}
      </div>
    </div>
  );
}
