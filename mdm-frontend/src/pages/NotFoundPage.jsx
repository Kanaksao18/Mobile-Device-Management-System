import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">404</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Page not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default NotFoundPage
