import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Badge from '../../components/shared/Badge'
import Spinner from '../../components/shared/Spinner'
import { getOvertime, approveOvertime, rejectOvertime } from '../../api/overtime'

export default function Overtime() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getOvertime()
      setRecords(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const action = async (fn, id, msg) => {
    setActioning(id)
    try { await fn(id); toast.success(msg); load() }
    catch { toast.error('Action failed') }
    finally { setActioning(null) }
  }

  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName || '—' },
    { key: 'date', label: 'Date', render: r => r.date?.slice(0, 10) || '—' },
    { key: 'hours', label: 'Hours' },
    { key: 'hourlyRate', label: 'Rate', render: r => r.hourlyRate ? `$${r.hourlyRate}` : '—' },
    {
      key: 'totalAmount', label: 'Total', render: r => {
        const total = r.totalAmount ?? (r.hours * r.hourlyRate)
        return total ? `$${Number(total).toLocaleString()}` : '—'
      }
    },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div className="flex items-center gap-1">
          {r.status === 'Pending' ? (
            <>
              <button
                onClick={() => action(approveOvertime, r.id, 'Overtime approved')}
                disabled={actioning === r.id}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors disabled:opacity-40"
                title="Approve"
              >
                {actioning === r.id ? <Spinner size="sm" /> : <Check size={14} />}
              </button>
              <button
                onClick={() => action(rejectOvertime, r.id, 'Overtime rejected')}
                disabled={actioning === r.id}
                className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-40"
                title="Reject"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-300 px-1">—</span>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overtime</h1>
        <p className="text-sm text-gray-400 mt-0.5">{records.length} records</p>
      </div>

      <Table columns={columns} data={records} loading={loading} />
    </div>
  )
}
