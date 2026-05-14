import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import Navbar from '../../components/shared/Navbar'
import { User, Calendar, PlusCircle, FileText, BarChart, Clock, DollarSign } from 'lucide-react'

const links = [
  { to: '/employee',               label: 'My Profile',        icon: User },
  { to: '/employee/attendance',    label: 'My Attendance',     icon: Calendar },
  { to: '/employee/apply-leave',   label: 'Apply Leave',       icon: PlusCircle },
  { to: '/employee/leave-requests',label: 'My Leave Requests', icon: FileText },
  { to: '/employee/leave-balance', label: 'My Leave Balance',  icon: BarChart },
  { to: '/employee/overtime',      label: 'My Overtime',       icon: Clock },
  { to: '/employee/payslip',       label: 'My Payslip',        icon: DollarSign },
]

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar links={links} />
      <Navbar />
      <main className="ml-60 pt-14 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
