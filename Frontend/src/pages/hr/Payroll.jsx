import { useEffect, useState } from 'react'
import { FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import Table from '../../components/shared/Table'
import Modal from '../../components/shared/Modal'
import Spinner from '../../components/shared/Spinner'
import { getPayroll, generatePayslip } from '../../api/payroll'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Payroll() {
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [payslip, setPayslip] = useState(null)
  const [payslipLoading, setPayslipLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getPayroll()
      setPayroll(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openPayslip = async (r) => {
    setModal('payslip'); setPayslipLoading(true); setPayslip(null)
    try {
      const res = await generatePayslip(r.employeeId, r.month, r.year)
      setPayslip(res.data)
    } catch { toast.error('Failed to generate payslip'); setModal(null) }
    finally { setPayslipLoading(false) }
  }

  const columns = [
    { key: 'employee', label: 'Employee', render: r => r.employeeName || '—' },
    { key: 'period', label: 'Period', render: r => `${MONTHS[(r.month || 1) - 1]} ${r.year}` },
    { key: 'basicSalary', label: 'Basic', render: r => `$${Number(r.basicSalary).toLocaleString()}` },
    { key: 'allowances', label: 'Allowances', render: r => `$${Number(r.allowances).toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', render: r => `$${Number(r.deductions).toLocaleString()}` },
    { key: 'netSalary', label: 'Net', render: r => <span className="font-semibold text-indigo-600">${Number(r.netSalary ?? (r.basicSalary + r.allowances - r.deductions)).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: r => <span className="text-xs text-gray-500">{r.status || 'Draft'}</span> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <button onClick={() => openPayslip(r)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors" title="Generate Payslip">
          <FileText size={14} />
        </button>
      )
    },
  ]

  const ps = payslip
  const netSalary = ps ? (ps.netSalary ?? (ps.basicSalary + ps.allowances + (ps.approvedOvertimeAmount || 0) - ps.deductions)) : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payroll</h1>
        <p className="text-sm text-gray-400 mt-0.5">{payroll.length} records</p>
      </div>

      <Table columns={columns} data={payroll} loading={loading} />

      {/* Payslip Modal */}
      <Modal open={modal === 'payslip'} onClose={() => setModal(null)} title="Payslip" width="max-w-md">
        {payslipLoading ? (
          <div className="py-12 flex justify-center"><Spinner /></div>
        ) : ps ? (
          <div>
            {/* Header */}
            <div className="bg-indigo-600 text-white rounded-xl p-5 mb-5">
              <h3 className="font-bold text-lg">{ps.employeeName || '—'}</h3>
              <p className="text-indigo-200 text-sm">{ps.designationTitle || ps.designation || ''}</p>
              <p className="text-indigo-200 text-sm">{ps.departmentName || ps.department || ''}</p>
              <p className="text-indigo-100 text-sm mt-2 font-medium">{MONTHS[(ps.month || 1) - 1]} {ps.year}</p>
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
                  <span className={`font-medium ${item.cls}`}>{item.prefix || ''}${Number(item.value || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 bg-indigo-50 rounded-lg px-3 mt-3">
                <span className="font-bold text-gray-800">Net Salary</span>
                <span className="font-bold text-indigo-600 text-base">${Number(netSalary).toLocaleString()}</span>
              </div>
            </div>

            {ps.pendingOvertimeAmount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ⏳ Pending overtime of ${Number(ps.pendingOvertimeAmount).toLocaleString()} not yet included in net salary.
              </div>
            )}

            <button onClick={() => window.print()} className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors">
              <Printer size={14} /> Print Payslip
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
