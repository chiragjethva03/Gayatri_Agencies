"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MemoHeader from "./MemoHeader";
import MemoFilters from "./MemoFilters";
import MemoTable from "./MemoTable";

export default function MemoContent() {
  const { slug } = useParams();

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const res = await fetch(`/api/transports/${slug}`);
        if (!res.ok) throw new Error("Transport not found");

        const data = await res.json();
        setTransport(data);
      } catch (error) {
        console.error("Failed to fetch transport", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, [slug]);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading...</div>;
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
