"use client";
import { useState, useEffect } from "react";
import { CalendarDays, Save } from "lucide-react";

const MONTH_NAMES = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function AttendanceModal({ employee, month, year, onClose, onSaved }) {
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstDayOfWk = new Date(year, month - 1, 1).getDay();
  const todayDay     = new Date().getDate();
  const isThisMonth  = month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance?employeeId=${employee._id}&month=${month}&year=${year}`);
        const data = await res.json();
        const map = {};
        (data.records || []).forEach(r => { map[r.day] = r.status; });
        setStatusMap(map);
      } catch { setStatusMap({}); }
      finally { setLoading(false); }
    };
    fetchAttendance();
  }, [employee._id, month, year]);

  const toggle = (day) => {
    setStatusMap(prev => {
      const cur = prev[day];
      if (!cur)       return { ...prev, [day]: "P" };
      if (cur === "P") return { ...prev, [day]: "A" };
      if (cur === "A") return { ...prev, [day]: "H" };
      const next = { ...prev }; delete next[day]; return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(statusMap).map(([day, status]) => ({ day: Number(day), status }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee._id, month, year, records }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else alert("Failed to save attendance.");
    } catch { alert("Network error."); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(statusMap).filter(s => s === "P").length;
  const absentCount  = Object.values(statusMap).filter(s => s === "A").length;
  const holidayCount = Object.values(statusMap).filter(s => s === "H").length;

  const cellColor = (day) => {
    const s = statusMap[day];
    if (s === "P") return "bg-green-500 text-white";
    if (s === "A") return "bg-red-400 text-white";
    if (s === "H") return "bg-amber-400 text-white";
    return isThisMonth && day === todayDay
      ? "bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-400"
      : "bg-gray-100 text-gray-500 hover:bg-gray-200";
  };

  const cells = [...Array(firstDayOfWk).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">

        <div className="bg-[#2a64f6] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} />
            <span className="font-bold text-sm">
              Attendance — {employee.name} — {MONTH_NAMES[month]} {year}
            </span>
          </div>
          <button onClick={onClose} className="hover:text-red-200 font-bold text-lg leading-none">✕</button>
        </div>

        <div className="p-5">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-green-500 inline-block" /> P — Present</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-400 inline-block" /> A — Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-400 inline-block" /> H — Holiday</span>
            <span className="ml-auto text-gray-400">Click to toggle</span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 pb-1">{d}</div>
              ))}
              {cells.map((day, idx) =>
                day === null ? <div key={`e-${idx}`} /> : (
                  <button
                    key={day}
                    onClick={() => toggle(day)}
                    className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all active:scale-95 ${cellColor(day)}`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          )}

          {/* Footer counts */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-4 text-sm font-semibold">
              <span className="text-green-600">P: {presentCount}</span>
              <span className="text-red-500">A: {absentCount}</span>
              <span className="text-amber-500">H: {holidayCount}</span>
              <span className="text-gray-400">Unmarked: {daysInMonth - presentCount - absentCount - holidayCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-[#2a64f6] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
            <Save size={15} />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
