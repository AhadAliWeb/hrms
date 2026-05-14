import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { generatePayslip } from '../../api/payroll'
import Spinner from '../../components/shared/Spinner'
import toast from 'react-hot-toast'
import { Printer } from 'lucide-react'

const MONTHS = [
  { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
  { v: 4, l: 'April' },   { v: 5, l: 'May' },       { v: 6, l: 'June' },
  { v: 7, l: 'July' },    { v: 8, l: 'August' },    { v: 9, l: 'September' },
  { v: 10, l: 'October' },{ v: 11, l: 'November' }, { v: 12, l: 'December' },
]

function currency(val) {
  if (val == null) return '—'
  return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function MyPayslip() {
  const { userId, employeeId } = useSelector((s) => s.auth)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [payslip, setPayslip] = useState(null)
  const [loading, setLoading] = useState(false)
  const printRef = useRef()

const handleGenerate = async () => {
  setLoading(true)

  try {
    const response = await generatePayslip(employeeId, month, year)

    // Create blob from PDF response
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    })

    // Create download link
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `Payslip_${month}_${year}.pdf`

    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Payslip downloaded successfully')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Could not download payslip.')
  } finally {
    setLoading(false)
  }
}

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Payslip</title>
      <style>
        body { font-family: Inter, sans-serif; padding: 32px; color: #111; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .label { color: #6b7280; } .value { font-weight: 600; color: #111827; }
        .net { background: #eef2ff; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; margin-top: 12px; }
        .net .label { color: #4338ca; font-weight: 700; font-size: 16px; } .net .value { color: #4338ca; font-weight: 800; font-size: 18px; }
        h2 { margin-bottom: 4px; } h3 { color: #6366f1; font-size: 13px; margin: 0 0 16px; }
        .note { background: #fffbeb; border-radius: 8px; padding: 10px 14px; margin-top: 12px; font-size: 13px; color: #92400e; }
      </style></head><body>${content}</body></html>
    `)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  const inputCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

  const monthLabel = MONTHS.find((m) => m.v === month)?.l

  return (
    <div>
      <h1 className="text-xl font-700 text-gray-900 mb-6">My Payslip</h1>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wide mb-1.5">Month</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputCls}>
            {MONTHS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputCls + ' w-24'}
            min={2020}
            max={2099}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-600 px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? <><Spinner size="sm" /><span>Generating…</span></> : 'Generate Payslip'}
        </button>
      </div>

      {/* Payslip card */}
      {payslip && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div ref={printRef}>
              <div>
                <h2 className="text-lg font-700 text-gray-900">{payslip.employeeName || payslip.fullName || '—'}</h2>
                <p className="text-sm text-indigo-600 font-500">{payslip.designation || payslip.designationName || '—'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{payslip.department || payslip.departmentName || '—'}</p>
                <p className="text-xs text-gray-400 mt-2 font-500">{monthLabel} {year}</p>
              </div>

              <div className="mt-6 space-y-0.5">
                <Row label="Basic Salary"              value={currency(payslip.basicSalary)} />
                <Row label="Allowances"                value={currency(payslip.allowances)} />
                <Row label="Approved Overtime Amount"  value={currency(payslip.approvedOvertimeAmount ?? payslip.overtimeAmount)} />
                <Row label="Deductions"                value={currency(payslip.deductions)} negative />
              </div>

              {/* Net Salary */}
              <div className="mt-4 bg-indigo-50 rounded-xl px-5 py-4 flex items-center justify-between">
                <span className="text-indigo-700 font-700 text-base">Net Salary</span>
                <span className="text-indigo-700 font-800 text-xl">{currency(payslip.netSalary)}</span>
              </div>

              {/* Pending overtime note */}
              {payslip.pendingOvertimeAmount != null && payslip.pendingOvertimeAmount > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <span className="text-amber-500 text-lg leading-none">⚠</span>
                  <p className="text-xs text-amber-700 font-500">
                    Pending overtime of <strong>{currency(payslip.pendingOvertimeAmount)}</strong> is not yet included in this payslip. It will be added once approved.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-600 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors ml-4"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-600 ${negative ? 'text-red-500' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}
