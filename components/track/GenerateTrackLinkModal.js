"use client";

import { useState, useEffect, useRef } from "react";
import { X, Link2, Copy, Check, ExternalLink, Loader2, Shield, ChevronDown, Search, Calendar } from "lucide-react";
import { useTransports } from "@/context/TransportContext";

const getDefaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
};

const getToday = () => new Date().toISOString().split("T")[0];

// ── Searchable Combobox with full keyboard nav ───────────────────────────────
function CustomSelect({ value, onChange, options, placeholder, disabled, loading }) {
  const [open,             setOpen]             = useState(false);
  const [search,           setSearch]           = useState("");
  const [debouncedQuery,   setDebouncedQuery]   = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const listRef      = useRef(null);

  // Debounce — 250 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset highlight when query changes
  useEffect(() => { setHighlightedIndex(-1); }, [debouncedQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const filteredOptions = debouncedQuery.trim()
    ? options.filter((o) => o.value === "" || o.label.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : options;

  const handleSelect = (optValue) => {
    onChange(optValue);
    setOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled || loading) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (open) setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;

      case "Enter":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(0);
        } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;

      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case "Tab":
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
        break;

      case "Backspace":
        if (!open && value) {
          e.preventDefault();
          onChange("");
          setSearch("");
        }
        break;
    }
  };

  const handleFocus = () => {
    if (!disabled && !loading) {
      setOpen(true);
      setSearch("");
      setHighlightedIndex(-1);
    }
  };

  const displayValue = open ? search : (value ? selectedLabel : "");

  return (
    <div ref={containerRef} className="relative">

      {/* Trigger input */}
      <div
        className={`flex items-center w-full px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all gap-2
          ${disabled || loading
            ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
            : open
              ? "border-violet-500 bg-white shadow-sm"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
      >
        <Search size={13} className={`shrink-0 transition-colors ${open ? "text-violet-400" : "text-gray-300"}`} />

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => { setSearch(e.target.value); if (!open) { setOpen(true); setHighlightedIndex(-1); } }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed min-w-0"
        />

        {loading ? (
          <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />
        ) : value && !open ? (
          // Clear button
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setSearch(""); }}
            className="text-gray-300 hover:text-gray-500 shrink-0 transition-colors"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {/* Dropdown list */}
      {open && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
          <div ref={listRef} className="max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400 text-center">No results found</p>
            ) : (
              filteredOptions.map((o, i) => {
                const isHighlighted = i === highlightedIndex;
                const isSelected    = o.value === value;
                const isEmpty       = o.value === "";

                return (
                  <button
                    key={o.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(o.value)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors
                      ${isHighlighted
                        ? "bg-violet-100 text-violet-800"
                        : isSelected
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : isEmpty
                            ? "text-gray-400 hover:bg-gray-50"
                            : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                  >
                    {isSelected
                      ? <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      : <span className="w-1.5 h-1.5 shrink-0" />
                    }
                    {o.label}
                  </button>
                );
              })
            )}
          </div>

          {/* Keyboard hint */}
          <div className="px-3 py-1.5 border-t border-gray-50 flex items-center gap-3 bg-gray-50/80">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-[9px]">↑↓</kbd>
              navigate
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-[9px]">↵</kbd>
              select
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 text-gray-500 font-mono text-[9px]">Esc</kbd>
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export default function GenerateTrackLinkModal({ onClose }) {
  const { transports } = useTransports();

  const [slug,       setSlug]       = useState("");
  const [consignor,  setConsignor]  = useState("");
  const [consignee,  setConsignee]  = useState("");
  const [fromDate,   setFromDate]   = useState(getDefaultFrom);
  const [link,       setLink]       = useState("");
  const [copied,     setCopied]     = useState(false);
  const [generating, setGenerating] = useState(false);

  const [consignors,     setConsignors]     = useState([]);
  const [consignees,     setConsignees]     = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);

  // Close modal on Escape when no dropdown is open
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!slug) {
      setConsignors([]);
      setConsignees([]);
      setConsignor("");
      setConsignee("");
      return;
    }
    const fetchParties = async () => {
      setLoadingParties(true);
      setConsignor("");
      setConsignee("");
      setLink("");
      try {
        const res = await fetch(`/api/track/${slug}/parties`);
        if (res.ok) {
          const { consignors: c, consignees: ce } = await res.json();
          setConsignors(c);
          setConsignees(ce);
        }
      } catch {}
      finally { setLoadingParties(false); }
    };
    fetchParties();
  }, [slug]);

  const transportOptions = [
    { value: "", label: "Select a transport..." },
    ...transports.map((t) => ({
      value: t.name.toLowerCase().replace(/\s+/g, "-"),
      label: t.name,
    })),
  ];

  const consignorOptions = [
    { value: "", label: "All consignors" },
    ...consignors.map((c) => ({ value: c, label: c })),
  ];

  const consigneeOptions = [
    { value: "", label: "All consignees" },
    ...consignees.map((c) => ({ value: c, label: c })),
  ];

  const handleGenerate = async () => {
    if (!slug) return alert("Please select a transport.");
    setGenerating(true);
    setLink("");
    try {
      const res = await fetch("/api/track/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, consignor, consignee, fromDate, expiryDays: 7 }),
      });
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setLink(`${origin}/track/${slug}?t=${token}`);
      setCopied(false);
    } catch {
      alert("Failed to generate link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Here is your LR tracking link (To Pay entries):\n\n${link}\n\n— Gayatri Agency`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Link2 size={17} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Generate Tracking Link</h2>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
                <Shield size={10} />
                Signed &amp; expires in 7 days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Transport */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Transport <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={slug}
              onChange={(v) => { setSlug(v); setLink(""); }}
              options={transportOptions}
              placeholder="Search transport..."
            />
          </div>

          {/* Consignor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Consignor
              <span className="text-gray-400 font-normal ml-1.5 text-xs">(optional)</span>
            </label>
            <CustomSelect
              value={consignor}
              onChange={(v) => { setConsignor(v); setLink(""); }}
              options={consignorOptions}
              placeholder="Search consignor..."
              disabled={!slug}
              loading={loadingParties}
            />
            {slug && !loadingParties && consignors.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No To Pay LRs found for this transport.</p>
            )}
          </div>

          {/* Consignee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Consignee
              <span className="text-gray-400 font-normal ml-1.5 text-xs">(optional)</span>
            </label>
            <CustomSelect
              value={consignee}
              onChange={(v) => { setConsignee(v); setLink(""); }}
              options={consigneeOptions}
              placeholder="Search consignee..."
              disabled={!slug}
              loading={loadingParties}
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Date</label>
            <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 focus-within:border-violet-500 focus-within:shadow-sm transition-all">
              <Calendar size={13} className="text-gray-300 shrink-0 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                max={getToday()}
                onChange={(e) => { setFromDate(e.target.value); setLink(""); }}
                className="flex-1 outline-none bg-transparent text-sm text-gray-800 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:hover:opacity-80 [&::-webkit-calendar-picker-indicator]:transition-opacity"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Shows To Pay LRs from this date up to today</p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!slug || generating}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold rounded-xl transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Secure Link"
            )}
          </button>

          {/* Generated link output */}
          {link && (
            <div className="border border-violet-100 bg-violet-50 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Your Secure Link</p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Shield size={10} /> Valid 7 days
                </span>
              </div>
              <div className="bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-gray-500 break-all font-mono leading-relaxed">
                {link}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition
                    ${copied ? "bg-green-500 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => window.open(link, "_blank")}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                  title="Preview"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
