import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { getPayroll, createPayroll, updatePayroll, deletePayroll, generatePayslip } from '../../api/payroll'
import { getEmployees } from '../../api/employee'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const EMPTY = { employeeId: '', month: '', year: new Date().getFullYear(), basicSalary: '', allowances: '', deductions: '' }

export default function Payroll() {
  const [payroll, setPayroll] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [payslip, setPayslip] = useState(null)
  const [payslipLoading, setPayslipLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, e] = await Promise.all([getPayroll(), getEmployees()])
      setPayroll(p.data); setEmployees(e.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (r) => {
    setForm({ employeeId: r.employeeId, month: r.month, year: r.year, basicSalary: r.basicSalary, allowances: r.allowances, deductions: r.deductions })
    setSelected(r); setModal('form')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, employeeId: Number(form.employeeId), month: Number(form.month), year: Number(form.year), basicSalary: Number(form.basicSalary), allowances: Number(form.allowances), deductions: Number(form.deductions) }
      if (selected) await updatePayroll(selected.id, payload)
      else await createPayroll(payload)
      toast.success('Payroll saved'); setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this payroll record?')) return
    try { await deletePayroll(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const openPayslip = async (r) => {
    setModal('payslip'); setPayslipLoading(true)
    try { const res = await generatePayslip(r.id, r.month, r.year); setPayslip(res.data) }
    catch { toast.error('Failed to generate payslip'); setModal(null) }
    finally { setPayslipLoading(false) }
  }


  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName },
    { key: 'period', label: 'Period', render: r => `${MONTHS[(r.month||1)-1]} ${r.year}` },
    { key: 'basicSalary', label: 'Basic', render: r => `$${Number(r.basicSalary).toLocaleString()}` },
    { key: 'allowances', label: 'Allowances', render: r => `$${Number(r.allowances).toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', render: r => `$${Number(r.deductions).toLocaleString()}` },
    { key: 'netSalary', label: 'Net', render: r => <span className="font-600 text-indigo-600">${Number(r.netSalary ?? (r.basicSalary + r.allowances - r.deductions)).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: r => <span className="text-xs text-gray-500">{r.status || 'Draft'}</span> },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex items-center gap-1">
        <button
          onClick={async () => {
            try {
              const res = await generatePayslip(r.employeeId, r.month, r.year)

              const blob = new Blob([res.data], { type: 'application/pdf' })
              const url = window.URL.createObjectURL(blob)

              const link = document.createElement('a')
              link.href = url
              link.download = `Payslip-${r.employeeName}-${r.month}-${r.year}.pdf`

              document.body.appendChild(link)
              link.click()

              link.remove()
              window.URL.revokeObjectURL(url)
            } catch {
              toast.error('Failed to download payslip')
            }
          }}
          className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors"
          title="Payslip"
        >
          <FileText size={14} />
        </button>
        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  const ps = payslip
  const netSalary = ps ? (ps.netSalary ?? (ps.basicSalary + ps.allowances + (ps.approvedOvertimeAmount || 0) - ps.deductions)) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-400 mt-0.5">{payroll.length} records</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-500 transition-colors">
          <Plus size={15} /> Add Payroll
        </button>
      </div>

      <Table columns={columns} data={payroll} loading={loading} />

      {/* Add / Edit Modal */}
      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Edit Payroll' : 'Add Payroll'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-gray-600 mb-1">Employee</label>
            <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1">Month</label>
              <select value={form.month} onChange={e => setForm({...form, month: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white">
                <option value="">Select month...</option>
                {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2025"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
            </div>
          </div>
          {[
            { label: 'Basic Salary', key: 'basicSalary' },
            { label: 'Allowances', key: 'allowances' },
            { label: 'Deductions', key: 'deductions' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-600 text-gray-600 mb-1">{f.label}</label>
              <input type="number" value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder="0"
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

      {/* Payslip Modal */}
      <Modal open={modal === 'payslip'} onClose={() => setModal(null)} title="Payslip" width="max-w-md">
        {payslipLoading ? (
          <div className="py-12 flex justify-center"><Spinner /></div>
        ) : ps ? (
          <div id="payslip-content">
            {/* Header */}
            <div className="bg-indigo-600 text-white rounded-xl p-5 mb-5">
              <h3 className="font-700 text-lg">{ps.employeeName || empName(ps.employeeId)}</h3>
              <p className="text-indigo-200 text-sm">{ps.designationTitle || ps.designation || ''}</p>
              <p className="text-indigo-200 text-sm">{ps.departmentName || ps.department || ''}</p>
              <p className="text-indigo-100 text-sm mt-2 font-500">{MONTHS[(ps.month||1)-1]} {ps.year}</p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Basic Salary', value: ps.basicSalary, cls: '' },
                { label: 'Allowances', value: ps.allowances, cls: 'text-emerald-600' },
                { label: 'Approved Overtime', value: ps.approvedOvertimeAmount || 0, cls: 'text-emerald-600' },
                { label: 'Deductions', value: ps.deductions, cls: 'text-red-500', prefix: '-' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-500 ${item.cls}`}>{item.prefix || ''}${Number(item.value || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 bg-indigo-50 rounded-lg px-3 mt-3">
                <span className="font-700 text-gray-800">Net Salary</span>
                <span className="font-700 text-indigo-600 text-base">${Number(netSalary).toLocaleString()}</span>
              </div>
            </div>

            {ps.pendingOvertimeAmount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ⏳ Pending overtime of ${Number(ps.pendingOvertimeAmount).toLocaleString()} not yet included in net salary.
              </div>
            )}

            <button onClick={() => window.print()} className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-500 transition-colors">
              <Printer size={14} /> Print Payslip
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
