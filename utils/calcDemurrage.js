export function calcDemurrage(delivery) {
  const {
    date,
    demurrageFreeDays   = 7,
    demurrageRatePerDay = 0,
  } = delivery;

  // No rate set = not tracking demurrage for this delivery
  if (!date || !demurrageRatePerDay) return null;

  // ✅ Handle both YYYY-MM-DD and DD/MM/YYYY safely
  let arrival;
  if (date.includes("/")) {
    const [dd, mm, yyyy] = date.split("/");
    arrival = new Date(`${yyyy}-${mm}-${dd}`);
  } else {
    arrival = new Date(date);
  }

  // ✅ Guard against bad/invalid dates
  if (isNaN(arrival.getTime())) return null;

  // ✅ Compare dates only — strip time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  arrival.setHours(0, 0, 0, 0);

  const freeDays        = Number(demurrageFreeDays);
  const ratePerDay      = Number(demurrageRatePerDay);
  const daysTotal       = Math.floor((today - arrival) / 86400000);
  const chargeDays      = Math.max(0, daysTotal - freeDays);
  const totalCharge     = chargeDays * ratePerDay;
  const daysUntilCharge = Math.max(0, freeDays - daysTotal);

  return {
    daysTotal,         // total days goods in warehouse
    chargeDays,        // days being charged (after free period)
    totalCharge,       // ₹ total amount due
    daysUntilCharge,   // days left before charging starts
    isOverdue: chargeDays > 0,
    isWarning: daysUntilCharge <= 2 && daysUntilCharge > 0, // amber warning — 2 days left
  };
}