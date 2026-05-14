import { useEffect, useState } from 'react'
import { Users, Building2, FileText, Clock } from 'lucide-react'
import StatCard from '../../components/shared/StatCard'
import Spinner from '../../components/shared/Spinner'
import { getEmployees } from '../../api/employee'
import { getDepartments } from '../../api/department'
import { getLeaveRequests } from '../../api/leaveRequest'
import { getOvertime } from '../../api/overtime'
import { getPayroll } from '../../api/payroll'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']

export default function AdminHome() {
  const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeaves: 0, pendingOvertime: 0 })
  const [payrollData, setPayrollData] = useState([])
  const [deptData, setDeptData] = useState([])
  const [leaveChart, setLeaveChart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [empRes, deptRes, leaveRes, overtimeRes, payrollRes] = await Promise.allSettled([
          getEmployees(), getDepartments(), getLeaveRequests(), getOvertime(), getPayroll()
        ])

        const employees = empRes.status === 'fulfilled' ? empRes.value.data : []
        const departments = deptRes.status === 'fulfilled' ? deptRes.value.data : []
        const leaves = leaveRes.status === 'fulfilled' ? leaveRes.value.data : []
        const overtime = overtimeRes.status === 'fulfilled' ? overtimeRes.value.data : []
        const payroll = payrollRes.status === 'fulfilled' ? payrollRes.value.data : []

        setStats({
          employees: employees.length,
          departments: departments.length,
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
          pendingOvertime: overtime.filter(o => o.status === 'Pending').length,
        })

        // Payroll bar chart — last 6 months net salary
        const now = new Date()
        const last6 = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
          return { month: MONTHS[d.getMonth()], year: d.getFullYear(), m: d.getMonth() + 1 }
        })
        setPayrollData(last6.map(({ month, year, m }) => ({
          month: `${month} ${year}`,
          net: payroll.filter(p => p.month === m && p.year === year)
                      .reduce((s, p) => s + (p.netSalary || 0), 0)
        })))

        // Pie — employees per department
        const deptMap = {}
        employees.forEach(e => {
          const name = e.departmentName || e.department?.name || 'Unknown'
          deptMap[name] = (deptMap[name] || 0) + 1
        })
        setDeptData(Object.entries(deptMap).map(([name, value]) => ({ name, value })))

        // Leave bar chart — approved vs rejected
        const approvedCount = leaves.filter(l => l.status === 'Approved').length
        const rejectedCount = leaves.filter(l => l.status === 'Rejected').length
        setLeaveChart([
          { name: 'Approved', count: approvedCount },
          { name: 'Rejected', count: rejectedCount },
          { name: 'Pending', count: leaves.filter(l => l.status === 'Pending').length },
        ])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-700 text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.employees} icon={Users} color="indigo" />
        <StatCard title="Departments" value={stats.departments} icon={Building2} color="violet" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FileText} color="amber" />
        <StatCard title="Pending Overtime" value={stats.pendingOvertime} icon={Clock} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Net Salary Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-600 text-gray-800 mb-4">Net Salary — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payrollData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Net Salary']} />
              <Bar dataKey="net" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Status Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-600 text-gray-800 mb-4">Leave Request Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveChart} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {leaveChart.map((_, i) => (
                  <Cell key={i} fill={['#10b981', '#ef4444', '#f59e0b'][i] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Employees per Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <h2 className="text-sm font-600 text-gray-800 mb-4">Employees by Department</h2>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">No employee data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
