import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Badge from '../../components/shared/Badge'
import Spinner from '../../components/shared/Spinner'
import { getAttendance, createAttendance, updateAttendance } from '../../api/attendance'
import { getEmployees } from '../../api/employee'

const EMPTY = { employeeId: '', date: '', checkIn: '', checkOut: '', status: 'Present' }

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterEmp, setFilterEmp] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [a, e] = await Promise.all([getAttendance(), getEmployees()])
      setRecords(a.data); setEmployees(e.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (r) => {
    setForm({ employeeId: r.employeeId, date: r.date?.slice(0, 10) || '', checkIn: r.checkIn || '', checkOut: r.checkOut || '', status: r.status })
    setSelected(r); setModal('form')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, employeeId: Number(form.employeeId) }
      if (selected) await updateAttendance(selected.id, payload)
      else await createAttendance(payload)
      toast.success('Attendance saved')
      setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const filtered = records.filter(r => {
    if (filterEmp && r.employeeId !== Number(filterEmp)) return false
    if (filterDate && r.date?.slice(0, 10) !== filterDate) return false
    return true
  })


  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName },
    { key: 'date', label: 'Date', render: r => r.date?.slice(0, 10) || '—' },
    { key: 'checkIn', label: 'Check In', render: r => r.checkIn || '—' },
    { key: 'checkOut', label: 'Check Out', render: r => r.checkOut || '—' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors">
          <Pencil size={14} />
        </button>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} records</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white min-w-40">
          <option value="">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500" />
        {(filterEmp || filterDate) && (
          <button onClick={() => { setFilterEmp(''); setFilterDate('') }}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Clear
          </button>
        )}
      </div>

      <Table columns={columns} data={filtered} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Edit Attendance' : 'Add Attendance'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Employee</label>
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          {[
            { label: 'Date', key: 'date', type: 'date' },
            { label: 'Check In', key: 'checkIn', type: 'time' },
            { label: 'Check Out', key: 'checkOut', type: 'time' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
              {['Present', 'Absent', 'Late'].map(s => <option key={s}>{s}</option>)}
            </select>
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
