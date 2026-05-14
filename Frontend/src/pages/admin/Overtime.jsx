import { useEffect, useState } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Badge from '../../components/shared/Badge'
import Spinner from '../../components/shared/Spinner'
import { getOvertime, createOvertime, approveOvertime, rejectOvertime, deleteOvertime } from '../../api/overtime'
import { getEmployees } from '../../api/employee'

const EMPTY = { employeeId: '', date: '', hours: '', hourlyRate: '' }

export default function Overtime() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [o, e] = await Promise.all([getOvertime(), getEmployees()])
      setRecords(o.data); setEmployees(e.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await createOvertime({ employeeId: Number(form.employeeId), date: form.date, hours: Number(form.hours), hourlyRate: Number(form.hourlyRate) })
      toast.success('Overtime added'); setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const action = async (fn, id, msg) => {
    setActioning(id)
    try { await fn(id); toast.success(msg); load() }
    catch { toast.error('Action failed') }
    finally { setActioning(null) }
  }


  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName },
    { key: 'date', label: 'Date', render: r => r.date?.slice(0,10) || '—' },
    { key: 'hours', label: 'Hours' },
    { key: 'hourlyRate', label: 'Rate', render: r => r.hourlyRate ? `$${r.hourlyRate}` : '—' },
    { key: 'totalAmount', label: 'Total', render: r => {
      const total = r.totalAmount ?? (r.hours * r.hourlyRate)
      return total ? `$${Number(total).toLocaleString()}` : '—'
    }},
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex items-center gap-1">
        {r.status === 'Pending' && (
          <>
            <button onClick={() => action(approveOvertime, r.id, 'Approved')} disabled={actioning === r.id}
              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors disabled:opacity-40">
              <Check size={14} />
            </button>
            <button onClick={() => action(rejectOvertime, r.id, 'Rejected')} disabled={actioning === r.id}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-40">
              <X size={14} />
            </button>
          </>
        )}
        <button onClick={() => { if(confirm('Delete?')) action(deleteOvertime, r.id, 'Deleted') }}
          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Overtime</h1>
          <p className="text-sm text-gray-400 mt-0.5">{records.length} records</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal('form') }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-500 transition-colors">
          <Plus size={15} /> Add Overtime
        </button>
      </div>

      <Table columns={columns} data={records} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title="Add Overtime">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Employee</label>
            <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          {[
            { label: 'Date', key: 'date', type: 'date' },
            { label: 'Hours', key: 'hours', type: 'number', placeholder: '2' },
            { label: 'Hourly Rate ($)', key: 'hourlyRate', type: 'number', placeholder: '25' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-600 text-gray-600 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
            {saving && <Spinner size="sm" />} Save
          </button>
        </div>
      </Modal>
    </div>
  )
}
