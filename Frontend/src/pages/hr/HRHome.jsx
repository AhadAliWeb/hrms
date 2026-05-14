import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, Clock } from 'lucide-react'
import StatCard from '../../components/shared/StatCard'
import Spinner from '../../components/shared/Spinner'
import { getEmployees } from '../../api/employee'
import { getAttendance } from '../../api/attendance'
import { getLeaveRequests } from '../../api/leaveRequest'
import { getOvertime } from '../../api/overtime'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function HRHome() {
  const [stats, setStats] = useState({ employees: 0, presentToday: 0, pendingLeaves: 0, pendingOvertime: 0 })
  const [leaveChart, setLeaveChart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [empRes, attRes, leaveRes, overtimeRes] = await Promise.allSettled([
          getEmployees(), getAttendance(), getLeaveRequests(), getOvertime()
        ])

        const employees = empRes.status === 'fulfilled' ? empRes.value.data : []
        const attendance = attRes.status === 'fulfilled' ? attRes.value.data : []
        const leaves = leaveRes.status === 'fulfilled' ? leaveRes.value.data : []
        const overtime = overtimeRes.status === 'fulfilled' ? overtimeRes.value.data : []

        const today = new Date().toISOString().slice(0, 10)
        const presentToday = attendance.filter(a => a.date?.slice(0, 10) === today && a.status === 'Present').length

        setStats({
          employees: employees.length,
          presentToday,
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
          pendingOvertime: overtime.filter(o => o.status === 'Pending').length,
        })

        // Leave chart — this month approved vs rejected
        const now = new Date()
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()
        const monthLeaves = leaves.filter(l => {
          const d = new Date(l.startDate)
          return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear
        })
        setLeaveChart([
          { name: 'Approved', count: monthLeaves.filter(l => l.status === 'Approved').length },
          { name: 'Rejected', count: monthLeaves.filter(l => l.status === 'Rejected').length },
          { name: 'Pending', count: monthLeaves.filter(l => l.status === 'Pending').length },
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

  const BAR_COLORS = ['#10b981', '#ef4444', '#f59e0b']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview of workforce activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.employees} icon={Users} color="indigo" />
        <StatCard title="Present Today" value={stats.presentToday} icon={UserCheck} color="emerald" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FileText} color="amber" />
        <StatCard title="Pending Overtime" value={stats.pendingOvertime} icon={Clock} color="rose" />
      </div>

      {/* Leave Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-xl">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Leave Requests — This Month</h2>
        <p className="text-xs text-gray-400 mb-4">Approved vs Rejected vs Pending</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={leaveChart} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {leaveChart.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
