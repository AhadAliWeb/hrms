export default function Badge({ status }) {
  const map = {
    Pending:  'bg-amber-100 text-amber-700 ring-amber-200',
    Approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Rejected: 'bg-red-100 text-red-700 ring-red-200',
    Active:   'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Inactive: 'bg-gray-100 text-gray-600 ring-gray-200',
    Present:  'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Absent:   'bg-red-100 text-red-700 ring-red-200',
    Late:     'bg-amber-100 text-amber-700 ring-amber-200',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-600 ring-gray-200'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {status}
    </span>
  )
}
