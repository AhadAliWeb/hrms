import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getLeaveRequestsByEmployee } from '../../api/leaveRequest'
import Table from '../../components/shared/Table'
import Badge from '../../components/shared/Badge'

function fmt(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

export default function MyLeaveRequests() {
  const { userId } = useSelector((s) => s.auth)
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('All')

  useEffect(() => {
    setLoading(true)
    getLeaveRequestsByEmployee()
      .then((r) => {
        setRows(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])  

  const filtered = status === 'All' ? rows : rows.filter((r) => r.status === status)

  const columns = [
    { key: 'leaveType', label: 'Leave Type',  render: (r) => r.leaveTypeName },
    { key: 'startDate', label: 'Start Date',  render: (r) => fmt(r.startDate) },
    { key: 'endDate',   label: 'End Date',    render: (r) => fmt(r.endDate) },
    { key: 'reason',    label: 'Reason',      render: (r) => <span className="max-w-xs truncate block">{r.reason || '—'}</span> },
    { key: 'status',    label: 'Status',      render: (r) => <Badge status={r.status} /> },
  ]

  return (
    <div>
      <h1 className="text-xl font-700 text-gray-900 mb-6">My Leave Requests</h1>

      <div className="mb-5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No leave requests found." />
    </div>
  )
}
