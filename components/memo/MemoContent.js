"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";


import MemoHeader from "./MemoHeader";
import MemoFilters from "./MemoFilters";
import MemoTable from "./MemoTable";

export default function MemoContent() {
  const params = useParams();
  const slug = params?.slug; // ✅ safe access

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchTransports = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/transports");

      // ✅ Handle 500/502/etc WITHOUT throwing
      if (!res.ok) {
        setError("SERVER_ERROR");
        setTransports([]);
        return;
      }

      const data = await res.json();
      setTransports(data);
    } catch (err) {
      console.error("Failed to fetch transports", err);
      setError("SERVER_ERROR");
      setTransports([]);
    } finally {
      setLoading(false);
    }
  };

  fetchTransports();
}, []);


  // ✅ Prevent blank / error state during hydration
  if (!slug || loading) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <TailChase
        size="40"
        speed="1.75"
        color="#2563eb" // blue-600 (matches your UI)
      />
    </div>
  );
}


  if (!transport) {
    return <div className="p-6 text-red-500">Transport not found</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <MemoHeader transport={transport} />
      <MemoFilters transport={transport} />
      <MemoTable transport={transport} />
    </div>
  );
}
