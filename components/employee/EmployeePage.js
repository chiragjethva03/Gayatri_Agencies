"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserCheck, IndianRupee, Wallet,
  ChevronLeft, ChevronRight, Plus, Pencil,
  Trash2, CalendarDays, BadgeDollarSign,
} from "lucide-react";
import AddEmployeeModal    from "./AddEmployeeModal";
import AttendanceModal     from "./AttendanceModal";
import AdvanceModal        from "./AdvanceModal";
import DeleteConfirmModal  from "@/components/lr-list/DeleteConfirmModal";

const MONTH_NAMES = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n) => Math.round(n).toLocaleString("en-IN");

const AVATAR_COLORS = [
  "bg-blue-500","bg-emerald-500","bg-violet-500",
  "bg-orange-500","bg-pink-500","bg-teal-500","bg-indigo-500",
];
const avatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function EmployeePage() {
  const router = useRouter();
  const now    = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const [employees,     setEmployees]     = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [advanceMap,    setAdvanceMap]    = useState({});
  const [loading,       setLoading]       = useState(true);

  const [showAddModal,       setShowAddModal]       = useState(false);
  const [editEmployee,       setEditEmployee]       = useState(null);
  const [attendanceEmployee, setAttendanceEmployee] = useState(null);
  const [advanceEmployee,    setAdvanceEmployee]    = useState(null);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [deleteTargetId,     setDeleteTargetId]     = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      if (res.ok) setEmployees(await res.json());
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  const fetchSummaries = async () => {
    try {
      const [attRes, advRes] = await Promise.all([
        fetch(`/api/attendance?month=${month}&year=${year}`),
        fetch(`/api/salary-advance?month=${month}&year=${year}`),
      ]);
      if (attRes.ok) {
        const arr = await attRes.json();
        const map = {};
        arr.forEach(({ employeeId, records }) => { map[employeeId] = records; });
        setAttendanceMap(map);
      }
      if (advRes.ok) setAdvanceMap(await advRes.json());
    } catch { /* noop */ }
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchSummaries(); }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const empCalc = (emp) => {
    const records      = attendanceMap[emp._id] || [];
    const presentCount = records.filter(r => r.status === "P").length;
    const absentCount  = records.filter(r => r.status === "A").length;
    const perDayRate   = emp.monthlySalary / (emp.workingDaysPerMonth || 26);
    const payable      = presentCount * perDayRate;
    const advance      = advanceMap[emp._id] || 0;
    const remaining    = payable - advance;
    return { presentCount, absentCount, perDayRate, payable, advance, remaining };
  };

  const isThisMonth  = month === now.getMonth() + 1 && year === now.getFullYear();
  const todayDay     = now.getDate();
  const presentToday = isThisMonth
    ? employees.filter(e => (attendanceMap[e._id] || []).find(r => r.day === todayDay && r.status === "P")).length
    : "—";

  const totalPayable = employees.reduce((s, e) => s + empCalc(e).payable, 0);
  const totalAdvance = employees.reduce((s, e) => s + empCalc(e).advance, 0);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    await fetch(`/api/employees?id=${deleteTargetId}`, { method: "DELETE" });
    setShowDeleteModal(false);
    setDeleteTargetId(null);
    fetchEmployees();
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* ── Sticky Page Header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
            >
              <ChevronLeft size={16} /> Dashboard
            </button>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <h1 className="text-base font-bold text-slate-800">Employee Corner</h1>
            </div>
          </div>
          <button
            onClick={() => { setEditEmployee(null); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard
            label="Total Employees"
            value={String(employees.length)}
            icon={<Users size={20} />}
            accent="border-blue-500"
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label={isThisMonth ? "Present Today" : "Present Today"}
            value={isThisMonth ? `${presentToday} / ${employees.length}` : "—"}
            icon={<UserCheck size={20} />}
            accent="border-emerald-500"
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Total Payable"
            value={`₹ ${fmt(totalPayable)}`}
            icon={<IndianRupee size={20} />}
            accent="border-orange-500"
            iconBg="bg-orange-50 text-orange-500"
          />
          <StatCard
            label="Total Advance"
            value={`₹ ${fmt(totalAdvance)}`}
            icon={<Wallet size={20} />}
            accent="border-red-500"
            iconBg="bg-red-50 text-red-500"
          />
        </div>

        {/* ── Month Selector ── */}
        <div className="flex items-center justify-center mb-5">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-gray-800 w-36 text-center tracking-wide">
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Employee Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Employee","Monthly Salary","Present","Absent","Per Day (₹)","Payable (₹)","Advance (₹)","Remaining (₹)","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="py-16 text-center text-gray-400 text-sm">Loading employees...</td></tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <Users size={28} className="opacity-40" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">No employees yet</p>
                          <p className="text-xs mt-0.5">Click "Add Employee" to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map(emp => {
                    const { presentCount, absentCount, perDayRate, payable, advance, remaining } = empCalc(emp);
                    const initials = emp.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <tr key={emp._id} className="border-b border-gray-50 hover:bg-slate-50/60 transition-colors">
                        {/* Employee */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${avatarColor(emp.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{emp.name}</p>
                              {emp.role && <p className="text-xs text-gray-400">{emp.role}</p>}
                            </div>
                          </div>
                        </td>
                        {/* Monthly Salary */}
                        <td className="px-4 py-3 font-medium text-gray-700">
                          ₹ {emp.monthlySalary.toLocaleString("en-IN")}
                        </td>
                        {/* Present */}
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                            {presentCount}
                          </span>
                        </td>
                        {/* Absent */}
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-bold text-xs">
                            {absentCount}
                          </span>
                        </td>
                        {/* Per Day */}
                        <td className="px-4 py-3 text-gray-500">{fmt(perDayRate)}</td>
                        {/* Payable */}
                        <td className="px-4 py-3 font-semibold text-gray-800">{fmt(payable)}</td>
                        {/* Advance */}
                        <td className="px-4 py-3 text-orange-600 font-semibold">{fmt(advance)}</td>
                        {/* Remaining */}
                        <td className="px-4 py-3">
                          <span className={`font-bold ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {remaining < 0 ? "−" : ""}₹ {fmt(Math.abs(remaining))}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <ActionBtn title="Mark Attendance" onClick={() => setAttendanceEmployee(emp)} cls="hover:text-blue-600 hover:bg-blue-50">
                              <CalendarDays size={15} />
                            </ActionBtn>
                            <ActionBtn title="Salary Advance" onClick={() => setAdvanceEmployee(emp)} cls="hover:text-amber-600 hover:bg-amber-50">
                              <BadgeDollarSign size={15} />
                            </ActionBtn>
                            <ActionBtn title="Edit" onClick={() => { setEditEmployee(emp); setShowAddModal(true); }} cls="hover:text-slate-700 hover:bg-slate-100">
                              <Pencil size={15} />
                            </ActionBtn>
                            <ActionBtn title="Remove" onClick={() => handleDeleteClick(emp._id)} cls="hover:text-red-600 hover:bg-red-50">
                              <Trash2 size={15} />
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer totals */}
          {!loading && employees.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex flex-wrap gap-4 justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{employees.length} employee{employees.length !== 1 ? "s" : ""}</span>
              <div className="flex gap-6 font-bold text-sm">
                <span>Payable: <span className="text-emerald-700">₹ {fmt(totalPayable)}</span></span>
                <span>Advance: <span className="text-orange-600">₹ {fmt(totalAdvance)}</span></span>
                <span>Remaining: <span className="text-blue-700">₹ {fmt(totalPayable - totalAdvance)}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AddEmployeeModal
        isOpen={showAddModal}
        editData={editEmployee}
        onClose={() => { setShowAddModal(false); setEditEmployee(null); }}
        onSaved={fetchEmployees}
      />

      {attendanceEmployee && (
        <AttendanceModal
          employee={attendanceEmployee}
          month={month}
          year={year}
          onClose={() => setAttendanceEmployee(null)}
          onSaved={fetchSummaries}
        />
      )}

      {advanceEmployee && (
        <AdvanceModal
          employee={advanceEmployee}
          month={month}
          year={year}
          onClose={() => setAdvanceEmployee(null)}
          onSaved={fetchSummaries}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
        onConfirm={handleConfirmDelete}
        count={1}
      />
    </div>
  );
}

function StatCard({ label, value, icon, accent, iconBg }) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-lg font-bold text-gray-800 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function ActionBtn({ title, onClick, cls, children }) {
  return (
    <button title={title} onClick={onClick}
      className={`p-1.5 rounded-lg text-gray-400 transition ${cls}`}>
      {children}
    </button>
  );
}
