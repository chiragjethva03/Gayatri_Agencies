"use client";
import React, { useState } from "react";
import MemoForm from "./MemoForm";

export default function MemoActions({ transport }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          className="
            btn-primary
            px-4 py-2
            text-white
            font-medium
            rounded-md
            cursor-pointer
          "
          onClick={() => setIsAddModalOpen(true)}
        >
          Add
        </button>

        <button
          className="
            btn-secondary
            px-4 py-2
            text-slate-700
            border border-gray-300
            bg-white
            rounded-md
            hover:bg-gray-50
            cursor-pointer
          "
        >
          Edit
        </button>

        <button
          className="
            btn-secondary
            px-4 py-2
            text-slate-700
            border border-gray-300
            bg-white
            rounded-md
            hover:bg-gray-50
            cursor-pointer
          "
        >
          View
        </button>

        <button
          className="
            btn-secondary
            px-4 py-2
            text-slate-700
            border border-gray-300
            bg-white
            rounded-md
            hover:bg-gray-50
            cursor-pointer
          "
        >
          Delete
        </button>

        <button
          className="
            btn-secondary
            px-4 py-2
            text-slate-700
            border border-gray-300
            bg-white
            rounded-md
            hover:bg-gray-50
            cursor-pointer
          "
        >
          Refresh
        </button>
      </div>

      {/* Modal */}
      <MemoForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        transport={transport}
      />
    </>
  );
}
