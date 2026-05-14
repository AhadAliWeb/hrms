import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getLeaveTypes } from '../../api/leaveType'
import { createLeaveRequest } from '../../api/leaveRequest'
import Spinner from '../../components/shared/Spinner'

// leaveRequest API doesn't export createLeaveRequest — create via axios
import api from '../../api/axios'

export default function ApplyLeave() {
  const { userId, employeeId } = useSelector((s) => s.auth)
  

  const [leaveTypes, setLeaveTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    getLeaveTypes()
      .then((r) => setLeaveTypes(r.data || []))
      .catch(console.error)
      .finally(() => setLoadingTypes(false))
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))


  const handleSubmit = async () => {
    if (!form.leaveTypeId || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields.')
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be on or after start date.')
      return
    }
    setSubmitting(true)
    try {
      const res = await createLeaveRequest({
        employeeId: employeeId,
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      })
      toast.success('Leave request submitted successfully!')
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  const labelCls = 'block text-xs font-600 text-gray-600 mb-1.5 uppercase tracking-wide'
  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

  return (
    <div>
      <h1 className="text-xl font-700 text-gray-900 mb-6">Apply for Leave</h1>

      <div className="max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Leave Type */}
        <div>
          <label className={labelCls}>Leave Type <span className="text-red-400">*</span></label>
          {loadingTypes ? (
            <div className="py-2"><Spinner size="sm" /></div>
          ) : (
            <select value={form.leaveTypeId} onChange={set('leaveTypeId')} className={inputCls}>
              <option value="">Select leave type…</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
            <input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
            <input type="date" value={form.endDate} onChange={set('endDate')} className={inputCls} />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className={labelCls}>Reason</label>
          <textarea
            value={form.reason}
            onChange={set('reason')}
            rows={4}
            placeholder="Briefly describe the reason for your leave…"
            className={inputCls + ' resize-none'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-600 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <><Spinner size="sm" /><span>Submitting…</span></> : 'Submit Leave Request'}
        </button>
      </div>
    </div>
  )
}
