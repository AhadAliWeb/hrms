import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from '../../api/designation'
import { getDepartments } from '../../api/department'

const EMPTY = { title: '', departmentId: '' }

export default function Designations() {
  const [designations, setDesignations] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [d, dep] = await Promise.all([getDesignations(), getDepartments()])
      setDesignations(d.data); setDepartments(dep.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (d) => { setForm({ title: d.title, departmentId: d.departmentId }); setSelected(d); setModal('form') }

  const handleSave = async () => {
    if (!form.title.trim() || !form.departmentId) return toast.error('All fields required')
    setSaving(true)
    try {
      const payload = { ...form, departmentId: Number(form.departmentId) }
      if (selected) await updateDesignation(selected.id, payload)
      else await createDesignation(payload)
      toast.success(selected ? 'Designation updated' : 'Designation added')
      setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this designation?')) return
    try { await deleteDesignation(id); toast.success('Designation deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'department', label: 'Department', render: r => r.departmentName || departments.find(d => d.id === r.departmentId)?.name || '—' },
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
          <h1 className="text-xl font-700 text-gray-900">Designations</h1>
          <p className="text-sm text-gray-400 mt-0.5">{designations.length} designations</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-500 transition-colors">
          <Plus size={15} /> Add Designation
        </button>
      </div>

      <Table columns={columns} data={designations} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Edit Designation' : 'Add Designation'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Engineer"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Department</label>
            <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
              <option value="">Select department...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
