import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import Navbar from '../../components/shared/Navbar'
import {
  LayoutDashboard, Users, Calendar, FileText, BarChart2, Clock, DollarSign
} from 'lucide-react'

const links = [
  { to: '/hr',                  label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/hr/employees',        label: 'Employees',      icon: Users },
  { to: '/hr/attendance',       label: 'Attendance',     icon: Calendar },
  { to: '/hr/leave-requests',   label: 'Leave Requests', icon: FileText },
  { to: '/hr/leave-balances',   label: 'Leave Balances', icon: BarChart2 },
  { to: '/hr/overtime',         label: 'Overtime',       icon: Clock },
  { to: '/hr/payroll',          label: 'Payroll',        icon: DollarSign },
]

export default function HRLayout() {
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
