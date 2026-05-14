import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getLeaveBalanceByEmployee } from '../../api/leaveBalance'
import Spinner from '../../components/shared/Spinner'

export default function MyLeaveBalance() {
  const { userId, employeeId } = useSelector((s) => s.auth)
  const now = new Date()
  const [year, setYear]     = useState(now.getFullYear())
  const [balances, setBalances] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getLeaveBalanceByEmployee(employeeId, year)
      .then((r) => setBalances(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId, year])

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-700 text-gray-900">My Leave Balance</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : balances.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
          No leave balance data for {year}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => {
            const total     = b.totalDays ?? b.allocated ?? 0
            const used      = b.usedDays  ?? b.used ?? 0
            const remaining = b.remainingDays ?? (total - used)
            const pct       = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-700 text-gray-800 mb-4">
                  {b.leaveType?.name || b.leaveTypeName || 'Leave'}
                </h3>

                <div className="flex justify-between mb-3">
                  <Stat label="Total"     value={total}     color="text-gray-700" />
                  <Stat label="Used"      value={used}      color="text-amber-600" />
                  <Stat label="Remaining" value={remaining} color="text-emerald-600" />
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Used</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-700 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
