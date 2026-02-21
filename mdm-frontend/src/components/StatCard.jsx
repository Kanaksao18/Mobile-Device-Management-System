function StatCard({ label, value, accent = 'blue' }) {
  const accentMap = {
    blue: 'border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-900 dark:border-purple-900 dark:from-purple-950 dark:to-violet-950 dark:text-purple-100',
    green: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-100',
    amber: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 dark:border-amber-900 dark:from-amber-950 dark:to-orange-950 dark:text-amber-100',
    slate: 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-900 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100',
  }

  return (
    <div className={`interactive-surface rounded-xl border p-4 ${accentMap[accent] || accentMap.slate}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="brand-pulse mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

export default StatCard
