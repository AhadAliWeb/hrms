import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../../api/leaveType'

const EMPTY = { name: '', totalDays: '' }

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await getLeaveTypes(); setLeaveTypes(r.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (lt) => { setForm({ name: lt.name, totalDays: lt.totalDays }); setSelected(lt); setModal('form') }

  const handleSave = async () => {
    if (!form.name.trim() || !form.totalDays) return toast.error('All fields required')
    setSaving(true)
    try {
      const payload = { name: form.name, totalDays: Number(form.totalDays) }
      if (selected) await updateLeaveType(selected.id, payload)
      else await createLeaveType(payload)
      toast.success(selected ? 'Leave type updated' : 'Leave type added')
      setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this leave type?')) return
    try { await deleteLeaveType(id); toast.success('Leave type deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const columns = [
    { key: 'name', label: 'Leave Type Name' },
    { key: 'totalDays', label: 'Total Days' },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Leave Types</h1>
          <p className="text-sm text-gray-400 mt-0.5">{leaveTypes.length} types defined</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-500 transition-colors">
          <Plus size={15} /> Add Leave Type
        </button>
      </div>

      <Table columns={columns} data={leaveTypes} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Edit Leave Type' : 'Add Leave Type'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Annual Leave"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Total Days</label>
            <input type="number" value={form.totalDays} onChange={e => setForm({...form, totalDays: e.target.value})} placeholder="e.g. 21"
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
