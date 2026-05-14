import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { myEmployeeProfile } from '../../api/employee'
import Spinner from '../../components/shared/Spinner'
import { User, Mail, Phone, Building2, Briefcase, CalendarDays, DollarSign } from 'lucide-react'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-indigo-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-500 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function MyProfile() {
  const { userId } = useSelector((s) => s.auth)
  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    myEmployeeProfile(userId)
      .then((r) => setEmp(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!emp) return <div className="text-center text-gray-400 py-16">Profile not found.</div>

  const hireDate = emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const salary = emp.salary != null ? `$${Number(emp.salary).toLocaleString()}` : '—'

  return (
    <div>
      <h1 className="text-xl font-700 text-gray-900 mb-6">My Profile</h1>
      <div className="max-w-2xl">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <User size={32} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-700 text-gray-900">{`${emp.firstName} ${emp.lastName}`}</h2>
            <p className="text-sm text-indigo-600 font-500">{emp.designationTitle || '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{emp.departmentName || '—'}</p>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-600 text-gray-700 mb-3">Personal Information</h3>
          <InfoRow icon={Mail}        label="Email"       value={emp.email} />
          <InfoRow icon={Phone}       label="Phone"       value={emp.phone} />
          <InfoRow icon={Building2}   label="Department"  value={emp.departmentName} />
          <InfoRow icon={Briefcase}   label="Designation" value={emp.designationTitle} />
          <InfoRow icon={CalendarDays}label="Hire Date"   value={hireDate} />
          <InfoRow icon={DollarSign}  label="Salary"      value={salary} />
        </div>
      </div>
    </div>
  )
}
