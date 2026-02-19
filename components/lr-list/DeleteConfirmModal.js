"use client";

import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, count }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h2>
          <p className="text-gray-600 mb-6">
            You are about to permanently delete <strong>{count}</strong> selected item(s). This action cannot be undone.
          </p>
          
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}