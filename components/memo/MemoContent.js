"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

import MemoTopBar from "./MemoTopBar";
import MemoActionBar from "./MemoActionBar";
import MemoTable from "./MemoTable";
import MemoForm from "./MemoForm"; // <--- NEW: Import the form

export default function MemoContent() {
  const params = useParams();
  const slug = params?.slug;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  
  // <--- NEW: State to control form visibility
  const [isFormOpen, setIsFormOpen] = useState(false); 

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
      <div className="flex h-[60vh] items-center justify-center bg-[#F4F6FA]">
        <TailChase size="40" speed="1.75" color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Failed to load transport data</div>;
  }

  if (!transport) {
    return <div className="p-6 text-red-500 bg-[#F4F6FA] min-h-screen">Transport not found</div>;
  }

  return (
    <div className="p-4 bg-[#F4F6FA] min-h-screen">
      <MemoTopBar onFilter={(from, to) => console.log("Filter from", from, "to", to)} />
      
      <MemoActionBar 
        // <--- UPDATED: Set state to true when Add is clicked
        onAdd={() => setIsFormOpen(true)} 
        onView={() => console.log("View selected Memo")}
        onDelete={() => console.log("Delete selected Memo")}
        selectedCount={selectedIds.length}
      />

      <div className="relative mt-3">
        <MemoTable transport={transport} />
        
        {/* <--- NEW: Render the form and pass props */}
        <MemoForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          transport={transport}
        />
      </div>
    </div>
  );
}