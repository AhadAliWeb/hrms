import { useEffect, useState } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Badge from '../../components/shared/Badge'
import Spinner from '../../components/shared/Spinner'
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, deleteLeaveRequest } from '../../api/leaveRequest'
import { getEmployees } from '../../api/employee'
import { getLeaveTypes } from '../../api/leaveType'

export default function LeaveRequests() {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [lr, e, lt] = await Promise.all([getLeaveRequests(), getEmployees(), getLeaveTypes()])
      setRequests(lr.data); setEmployees(e.data); setLeaveTypes(lt.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const action = async (fn, id, successMsg) => {
    setActioning(id)
    try { await fn(id); toast.success(successMsg); load() }
    catch { toast.error('Action failed') }
    finally { setActioning(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return
    action(deleteLeaveRequest, id, 'Request deleted')
  }


  const filtered = filterStatus ? requests.filter(r => r.status === filterStatus) : requests

  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName },
    { key: 'leaveType', label: 'Leave Type', render: r => r.leaveTypeName },
    { key: 'startDate', label: 'Start Date', render: r => r.startDate?.slice(0,10) || '—' },
    { key: 'endDate', label: 'End Date', render: r => r.endDate?.slice(0,10) || '—' },
    { key: 'reason', label: 'Reason', render: r => <span className="max-w-40 truncate block text-gray-500">{r.reason || '—'}</span> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex items-center gap-1">
        {r.status === 'Pending' && (
          <>
            <button onClick={() => action(approveLeaveRequest, r.id, 'Approved')} disabled={actioning === r.id}
              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors disabled:opacity-40">
              {actioning === r.id ? <Spinner size="sm" /> : <Check size={14} />}
            </button>
            <button onClick={() => action(rejectLeaveRequest, r.id, 'Rejected')} disabled={actioning === r.id}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-40">
              <X size={14} />
            </button>
          </>
        )}
        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Leave Requests</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} requests</p>
        </div>
      </div>

      <div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
          <option value="">All Statuses</option>
          {['Pending','Approved','Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <Table columns={columns} data={filtered} loading={loading} />
    </div>
  )
}
