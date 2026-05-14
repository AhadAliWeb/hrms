import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getOvertimeByEmployee, createOvertime } from '../../api/overtime'
import Table from '../../components/shared/Table'
import Badge from '../../components/shared/Badge'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { Plus } from 'lucide-react'

function fmt(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MyOvertime() {
  const { userId, employeeId } = useSelector((s) => s.auth)
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]         = useState({ date: '', hours: '', hourlyRate: '' })

  const load = () => {
    setLoading(true)
    getOvertimeByEmployee(employeeId)
      .then((r) => {
        setRows(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (userId) load() }, [userId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.date || !form.hours || !form.hourlyRate) {
      toast.error('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    try {
      await createOvertime({
        employeeId: employeeId,
        date: form.date,
        hours: Number(form.hours),
        hourlyRate: Number(form.hourlyRate),
      })
      toast.success('Overtime request submitted!')
      setModalOpen(false)
      setForm({ date: '', hours: '', hourlyRate: '' })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'date',        label: 'Date',          render: (r) => fmt(r.date) },
    { key: 'hours',       label: 'Hours',          render: (r) => r.hours ?? '—' },
    { key: 'hourlyRate',  label: 'Hourly Rate',    render: (r) => r.hourlyRate != null ? `$${r.hourlyRate}` : '—' },
    { key: 'totalAmount', label: 'Total Amount',   render: (r) => {
      const total = (r.totalAmount != null) ? r.totalAmount : (r.hours && r.hourlyRate ? r.hours * r.hourlyRate : null)
      return total != null ? `$${Number(total).toLocaleString()}` : '—'
    }},
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
  ]

  const labelCls = 'block text-xs font-600 text-gray-600 mb-1.5 uppercase tracking-wide'
  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-700 text-gray-900">My Overtime</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-600 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Submit Overtime
        </button>
      </div>

      <Table columns={columns} data={rows} loading={loading} emptyMessage="No overtime records found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Overtime">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Date <span className="text-red-400">*</span></label>
            <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hours <span className="text-red-400">*</span></label>
              <input type="number" min="0.5" step="0.5" value={form.hours} onChange={set('hours')} placeholder="e.g. 2" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hourly Rate ($) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="0.01" value={form.hourlyRate} onChange={set('hourlyRate')} placeholder="e.g. 25" className={inputCls} />
            </div>
          </div>

          {form.hours && form.hourlyRate && (
            <div className="bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-700 font-600">
              Total: ${(Number(form.hours) * Number(form.hourlyRate)).toLocaleString()}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-500 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition"
            >
              {submitting ? <><Spinner size="sm" /><span>Submitting…</span></> : 'Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
