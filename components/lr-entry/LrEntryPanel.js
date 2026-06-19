"use client";

import { useEffect, useState, useRef } from "react";
import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";
import { generateLrPdfSlip } from "@/lib/generateLrPdfSlip";

export default function LrEntryPanel({ onClose, onSaved, initialData, mode, transport }) {

  const [form, setForm] = useState(initialData || {});
  const [errorMessage, setErrorMessage] = useState("");
  const [lrNoStatus, setLrNoStatus] = useState("idle");
  const [isSaved, setIsSaved] = useState(mode === "edit");
  const savedFormRef = useRef(mode === "edit" ? { ...(initialData || {}) } : null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Incrementing this key forces all form child components to remount → clean slate
  const [formKey, setFormKey] = useState(0);

  // Reset to "Save" when anything changes after the last save
  useEffect(() => {
    if (!savedFormRef.current) return;
    if (JSON.stringify(form) !== JSON.stringify(savedFormRef.current)) {
      setIsSaved(false);
    }
  }, [form]);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const validateForm = () => {
    // lrDate → auto-filled to today, fromCity → auto-filled to AMD-ASLALI: skip both
    if (!form.freightBy) return "Freight By is required.";
    if (!form.toCity)    return "To City is required.";
    if (!form.consignor) return "Consignor is required.";
    if (!form.consignee) return "Consignee is required.";

    if (form.consignor === "Cash Parti" && !form.consignorMobile)
      return "Mobile number is required for Cash Parti Consignor.";
    if (form.consignor === "Cash Parti" && form.consignorMobile && !/^\d{10}$/.test(form.consignorMobile))
      return "Consignor Cash Parti mobile must be a 10-digit number.";
    if (form.consignee === "Cash Parti" && !form.consigneeMobile)
      return "Mobile number is required for Cash Parti Consignee.";
    if (form.consignee === "Cash Parti" && form.consigneeMobile && !/^\d{10}$/.test(form.consigneeMobile))
      return "Consignee Cash Parti mobile must be a 10-digit number.";

    const hasGoods = (form.goods || []).some(g => parseInt(g.article) > 0);
    if (!hasGoods) return "At least one article must be entered in the goods table.";

    if (lrNoStatus === "checking")
      return "Please wait — checking if LR No. is available.";
    if (lrNoStatus === "taken")
      return `LR No. "${form.lrNo}" is already used. Enter a different number or leave blank for auto.`;

    return null;
  };

  const saveForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return false;
    }

    try {
      const res = await fetch("/api/lr", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 409) {
        const body = await res.json();
        setErrorMessage(body.message || "Duplicate LR number detected.");
        return false;
      }

      if (res.ok) {
        const savedData = await res.json();
        savedFormRef.current = { ...savedData };
        setForm(savedData);
        setIsSaved(true);
        return savedData;
      }

      setErrorMessage("Failed to save. Please try again.");
      return false;
    } catch (error) {
      console.error("Failed to save:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
      return false;
    }
  };

  const handleSaveOnly = async () => {
    await saveForm();
  };

  // Add-mode only: save → show loader → reset to fresh empty form
  const handleSaveAndNext = async () => {
    setIsSaving(true);
    try {
      const savedRecord = await saveForm();
      if (savedRecord) {
        onSaved?.(savedRecord);
        setForm({ transportSlug: initialData?.transportSlug });
        savedFormRef.current = null;
        setIsSaved(false);
        setLrNoStatus("idle");
        setErrorMessage("");
        setFormKey(k => k + 1);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    try {
      const res = await fetch("/api/client");
      const clients = await res.json();
      const consignorData = clients.find(c => c.name === form.consignor) || null;
      const consigneeData = clients.find(c => c.name === form.consignee) || null;
      generateLrPdfSlip(form, transport, consignorData, consigneeData, "print");
    } catch (err) {
      // console.log("ERROR:", err);
      generateLrPdfSlip(form, transport, null, null, "print");
    }
  };

  const handleSaveAndPrint = async () => {
    setIsPrinting(true);
    try {
      if (!isSaved) {
        const savedRecord = await saveForm();
        if (!savedRecord) return;
      }
      await handlePrint();
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (errorMessage) {
          setErrorMessage("");
        } else {
          onClose();
        }
        return;
      }
      if (e.key === "F3") {
        e.preventDefault();
        if (!errorMessage) isViewMode ? handlePrint() : await handleSaveAndPrint();
        return;
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (isSaving) return;
        if (isEditMode) {
          if (!isSaved) await handleSaveOnly();
        } else {
          await handleSaveAndNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [form, isViewMode, isEditMode, errorMessage]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-7xl h-[90vh] flex flex-col rounded-lg border shadow-xl overflow-hidden relative">

        <LrEntryHeader
          onClose={onClose}
          isViewMode={isViewMode}
          lrNo={form.lrNo}
        />

        <div key={formKey} className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <fieldset disabled={isViewMode} className="space-y-6">
            <LrBasicDetails form={form} setForm={setForm} onLrNoStatusChange={setLrNoStatus} isEditMode={isEditMode} />
            <LrConsignorConsignee form={form} setForm={setForm} transport={transport} />
            <LrGoodsTable form={form} setForm={setForm} />
            <LrCharges form={form} setForm={setForm} />
          </fieldset>
        </div>

        {!isViewMode ? (
          <LrFooterActions
            onSaveAndPrint={handleSaveAndPrint}
            onF4={isEditMode ? handleSaveOnly : handleSaveAndNext}
            isSaved={isSaved}
            isAddMode={!isEditMode}
            isSaving={isSaving}
            onCancel={onClose}
          />
        ) : (
          <div className="bg-gray-200 p-3 border-t flex justify-end items-center">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-medium"
            >
              Close (Esc)
            </button>
          </div>
        )}

        {/* SAVING LOADER */}
        {isSaving && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl px-10 py-7 flex flex-col items-center gap-3 border border-gray-100">
              <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-700 font-semibold text-sm tracking-wide">Saving to database...</p>
            </div>
          </div>
        )}

        {/* PRINTING LOADER */}
        {isPrinting && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl px-10 py-7 flex flex-col items-center gap-3 border border-gray-100">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-700 font-semibold text-sm tracking-wide">Please wait...</p>
            </div>
          </div>
        )}

        {/* ERROR MODAL */}
        {errorMessage && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-red-100 overflow-hidden">

              <div className="bg-red-50 p-5 flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0 mt-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-base">Cannot Save</h3>
                  <p className="text-red-600 mt-1 text-sm leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setErrorMessage("")}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm"
                >
                  OK, Fix It
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
