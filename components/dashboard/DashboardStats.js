export default function DashboardStats() {
  const stats = [
    { label: "LR", value: 3, bg: "bg-cyan-100" },
    { label: "Full Load", value: 0, bg: "bg-orange-100" },
    { label: "Delivery", value: 0, bg: "bg-yellow-100" },
    { label: "Memo", value: 0, bg: "bg-blue-100" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl p-6 text-center ${item.bg}`}
        >
          <div className="text-3xl font-bold text-slate-900">
            {item.value}
          </div>
          <div className="mt-1 text-sm font-medium text-slate-600">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
