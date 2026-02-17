"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";

export default function LrEntryPanel() {
  const router = useRouter();
  const { slug } = useParams();

  const closeForm = () => {
    router.replace(`/services/${slug}/lr`);
  };

  const saveForm = () => {
    console.log("SAVE LR");
    // TODO: API call
  };

  const saveAndClose = () => {
    console.log("SAVE & CLOSE LR");
    // TODO: API call
    closeForm();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC → Close
      if (e.key === "Escape") {
        e.preventDefault();
        closeForm();
      }

      // F3 → Save
      if (e.key === "F3") {
        e.preventDefault();
        saveForm();
      }

      // F4 → Save & Close
      if (e.key === "F4") {
        e.preventDefault();
        saveAndClose();
      }

      // Ctrl + S → Save
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveForm();
      }

      // Ctrl + Enter → Save & Close
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        saveAndClose();
      }

      // Alt + C → Close
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        closeForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-xl overflow-hidden">
        <LrEntryHeader onClose={closeForm}/>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          <LrBasicDetails />
          <LrConsignorConsignee />
          <LrGoodsTable />
          <LrCharges />
        </div>

        <LrFooterActions
          onSave={saveForm}
          onSaveClose={saveAndClose}
          onCancel={closeForm}
        />
      </div>
    </div>
  );
}
