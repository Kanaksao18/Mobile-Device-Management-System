function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="interactive-surface flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-700 dark:border-purple-700 dark:border-t-purple-200" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
