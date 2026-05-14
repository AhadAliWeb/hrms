import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { getLeaveBalances, createLeaveBalance } from '../../api/leaveBalance'
import { getEmployees } from '../../api/employee'
import { getLeaveTypes } from '../../api/leaveType'

const EMPTY = { employeeId: '', leaveTypeId: '', year: new Date().getFullYear() }

export default function LeaveBalances() {
  const [balances, setBalances] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [b, e, lt] = await Promise.all([getLeaveBalances(), getEmployees(), getLeaveTypes()])
      setBalances(b.data); setEmployees(e.data); setLeaveTypes(lt.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.employeeId || !form.leaveTypeId || !form.year) return toast.error('All fields required')
    setSaving(true)
    try {
      await createLeaveBalance({ employeeId: Number(form.employeeId), leaveTypeId: Number(form.leaveTypeId), year: Number(form.year) })
      toast.success('Leave balance created')
      setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName || '—' },
    { key: 'leaveType', label: 'Leave Type', render: r => r.leaveTypeName || '—' },
    { key: 'year', label: 'Year' },
    { key: 'totalDays', label: 'Total Days' },
    { key: 'usedDays', label: 'Used Days' },
    {
      key: 'remainingDays', label: 'Remaining', render: r => {
        const rem = r.remainingDays ?? (r.totalDays - r.usedDays)
        return <span className={rem < 3 ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>{rem}</span>
      }
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leave Balances</h1>
          <p className="text-sm text-gray-400 mt-0.5">{balances.length} records</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal('form') }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Add Balance
        </button>
      </div>

      <Table columns={columns} data={balances} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title="Add Leave Balance">
        <div className="space-y-4">
          {[
            { label: 'Employee', key: 'employeeId', options: employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })) },
            { label: 'Leave Type', key: 'leaveTypeId', options: leaveTypes.map(lt => ({ value: lt.id, label: lt.name })) },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
              <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
                <option value="">Select...</option>
                {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2025"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
          </div>
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
