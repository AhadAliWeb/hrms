import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAttendanceByEmployee } from '../../api/attendance'
import Table from '../../components/shared/Table'
import Badge from '../../components/shared/Badge'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtTime(str) {
  if (!str) return '—'
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function MyAttendance() {
  const { userId } = useSelector((s) => s.auth)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getAttendanceByEmployee(userId)
      .then((r) => setRows(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const filtered = rows.filter((r) => {
    const d = new Date(r.date || r.checkIn)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  const columns = [
    { key: 'date',    label: 'Date',      render: (r) => fmt(r.date || r.checkIn) },
    { key: 'checkIn', label: 'Check In',  render: (r) => fmtTime(r.checkIn) },
    { key: 'checkOut',label: 'Check Out', render: (r) => fmtTime(r.checkOut) },
    { key: 'status',  label: 'Status',    render: (r) => <Badge status={r.status} /> },
  ]

  return (
    <div>
      <h1 className="text-xl font-700 text-gray-900 mb-6">My Attendance</h1>

      <div className="flex gap-3 mb-5">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No attendance records for this period." />
    </div>
  )
}
