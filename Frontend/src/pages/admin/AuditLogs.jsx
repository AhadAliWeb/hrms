import { useEffect, useState } from 'react'
import Table from '../../components/shared/Table'
import { getAuditLogs } from '../../api/auditLog'
import toast from 'react-hot-toast'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try { const r = await getAuditLogs(); setLogs(r.data) }
      catch { toast.error('Failed to load audit logs') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filterAction ? logs.filter(l => l.action === filterAction) : logs

  const formatJson = (val) => {
    if (!val) return '—'
    try { return typeof val === 'string' ? val : JSON.stringify(val, null, 1) }
    catch { return String(val) }
  }

  const columns = [
    { key: 'userId', label: 'User ID' },
    { key: 'action', label: 'Action', render: r => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-500 ring-1 ${
        r.action === 'Create' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
        r.action === 'Update' ? 'bg-sky-50 text-sky-700 ring-sky-200' :
        r.action === 'Delete' ? 'bg-red-50 text-red-600 ring-red-200' :
        'bg-gray-50 text-gray-600 ring-gray-200'}`}>
        {r.action}
      </span>
    )},
    { key: 'entityName', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'oldValues', label: 'Old Values', render: r => (
      <pre className="text-xs text-gray-400 max-w-32 truncate">{formatJson(r.oldValues)}</pre>
    )},
    { key: 'newValues', label: 'New Values', render: r => (
      <pre className="text-xs text-gray-600 max-w-32 truncate">{formatJson(r.newValues)}</pre>
    )},
    { key: 'timestamp', label: 'Timestamp', render: r => r.timestamp ? new Date(r.timestamp).toLocaleString() : '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} entries (read-only)</p>
        </div>
      </div>

      <div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
          <option value="">All Actions</option>
          {['Create','Update','Delete'].map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <Table columns={columns} data={filtered} loading={loading} />
    </div>
  )
}
