import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Badge from '../../components/shared/Badge'
import Spinner from '../../components/shared/Spinner'
import { getEmployees, createEmployee, updateEmployee } from '../../api/employee'
import { getDepartments } from '../../api/department'
import { getDesignations } from '../../api/designation'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', hireDate: '', salary: '', departmentId: '', designationId: '' }

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input {...props} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
  </div>
)

const Select = ({ label, value, onChange, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white">
      <option value="">Select...</option>
      {children}
    </select>
  </div>
)

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [e, d, des] = await Promise.all([getEmployees(), getDepartments(), getDesignations()])
      setEmployees(e.data); setDepartments(d.data); setDesignations(des.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (emp) => {
    setForm({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone || '', dateOfBirth: emp.dateOfBirth?.slice(0, 10) || '',
      hireDate: emp.hireDate?.slice(0, 10) || '', salary: emp.salary ?? '',
      departmentId: emp.departmentId?.toString() || '', designationId: emp.designationId?.toString() || ''
    })
    setSelected(emp); setModal('form')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, salary: Number(form.salary), departmentId: Number(form.departmentId), designationId: Number(form.designationId) }
      if (modal === 'form' && selected) await updateEmployee(selected.id, payload)
      else await createEmployee(payload)
      toast.success(selected ? 'Employee updated' : 'Employee added')
      setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const filteredDesig = designations.filter(d => !form.departmentId || d.departmentId === Number(form.departmentId))

  const columns = [
    { key: 'name', label: 'Name', render: r => `${r.firstName} ${r.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department', render: r => r.departmentName || departments.find(d => d.id === r.departmentId)?.name || '—' },
    { key: 'designation', label: 'Designation', render: r => r.designationTitle || designations.find(d => d.id === r.designationId)?.title || '—' },
    { key: 'salary', label: 'Salary', render: r => r.salary ? `$${Number(r.salary).toLocaleString()}` : '—' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.isActive === false ? 'Inactive' : 'Active'} /> },
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
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-400 mt-0.5">{employees.length} total employees</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Add Employee
        </button>
      </div>

      <Table columns={columns} data={employees} loading={loading} />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Edit Employee' : 'Add Employee'} width="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
          <Field label="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
          <Field label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          <Field label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
          <Field label="Hire Date" type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} />
          <Field label="Salary" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="50000" />
          <Select label="Department" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value, designationId: '' })}>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <div className="col-span-2">
            <Select label="Designation" value={form.designationId} onChange={e => setForm({ ...form, designationId: e.target.value })}>
              {filteredDesig.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
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
