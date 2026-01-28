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
  const slug = params?.slug;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/transports?slug=${slug}`);

        if (!res.ok) {
          setError("SERVER_ERROR");
          return;
        }

        const data = await res.json();
        setTransport(data);
      } catch (err) {
        console.error("Failed to fetch transport", err);
        setError("SERVER_ERROR");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchTransport();
  }, [slug]);

  if (!slug || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <TailChase size="40" speed="1.75" color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load transport data
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
