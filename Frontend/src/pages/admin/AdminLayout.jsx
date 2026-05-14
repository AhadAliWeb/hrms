import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import Navbar from '../../components/shared/Navbar'
import {
  LayoutDashboard, Users, Building2, Briefcase, Calendar,
  List, FileText, BarChart2, Clock, DollarSign, Shield
} from 'lucide-react'

const links = [
  { to: '/admin',             label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/admin/employees',   label: 'Employees',      icon: Users },
  { to: '/admin/departments', label: 'Departments',    icon: Building2 },
  { to: '/admin/designations',label: 'Designations',   icon: Briefcase },
  { to: '/admin/attendance',  label: 'Attendance',     icon: Calendar },
  { to: '/admin/leave-types', label: 'Leave Types',    icon: List },
  { to: '/admin/leave-requests', label: 'Leave Requests', icon: FileText },
  { to: '/admin/leave-balances', label: 'Leave Balances', icon: BarChart2 },
  { to: '/admin/overtime',    label: 'Overtime',       icon: Clock },
  { to: '/admin/payroll',     label: 'Payroll',        icon: DollarSign },
  { to: '/admin/audit-logs',  label: 'Audit Logs',     icon: Shield },
]

export default function AdminLayout() {
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
