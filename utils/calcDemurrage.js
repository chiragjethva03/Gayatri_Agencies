const DEMURRAGE_RATE    = 10; // ₹10 per article per day
const DEMURRAGE_FREE_DAYS = 7; // first 7 days are free

export function calcDemurrage({ date, articles = 0 }) {
  if (!date || !articles) return null;

  // Handle both YYYY-MM-DD and DD/MM/YYYY
  let arrival;
  if (date.includes("/")) {
    const [dd, mm, yyyy] = date.split("/");
    arrival = new Date(`${yyyy}-${mm}-${dd}`);
  } else {
    arrival = new Date(date);
  }

  if (isNaN(arrival.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  arrival.setHours(0, 0, 0, 0);

  const daysTotal       = Math.floor((today - arrival) / 86400000);
  const chargeDays      = Math.max(0, daysTotal - DEMURRAGE_FREE_DAYS);
  const totalCharge     = chargeDays * DEMURRAGE_RATE * Number(articles);
  const daysUntilCharge = Math.max(0, DEMURRAGE_FREE_DAYS - daysTotal);

  return {
    daysTotal,
    chargeDays,
    totalCharge,
    daysUntilCharge,
    ratePerDay:  DEMURRAGE_RATE * Number(articles),
    freeDays:    DEMURRAGE_FREE_DAYS,
    isOverdue:  chargeDays > 0,
    isWarning:  daysUntilCharge <= 2 && daysUntilCharge > 0,
  };
}
