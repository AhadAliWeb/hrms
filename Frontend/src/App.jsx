import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Login from './pages/auth/Login'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import Employees from './pages/admin/Employees'
import Departments from './pages/admin/Departments'
import Designations from './pages/admin/Designations'
import Attendance from './pages/admin/Attendance'
import LeaveTypes from './pages/admin/LeaveTypes'
import LeaveRequests from './pages/admin/LeaveRequests'
import LeaveBalances from './pages/admin/LeaveBalances'
import Overtime from './pages/admin/Overtime'
import Payroll from './pages/admin/Payroll'
import AuditLogs from './pages/admin/AuditLogs'

// Employee
import EmployeeLayout from './pages/employee/EmployeeLayout'
import MyProfile from './pages/employee/MyProfile'
import MyAttendance from './pages/employee/MyAttendance'
import ApplyLeave from './pages/employee/ApplyLeave'
import MyLeaveRequests from './pages/employee/MyLeaveRequests'
import MyLeaveBalance from './pages/employee/MyLeaveBalance'
import MyOvertime from './pages/employee/MyOvertime'
import MyPayslip from './pages/employee/MyPayslip'

// HR
import HRLayout from './pages/hr/HRLayout'
import HRHome from './pages/hr/HRHome'
import HREmployees from './pages/hr/Employees'
import HRAttendance from './pages/hr/Attendance'
import HRLeaveRequests from './pages/hr/LeaveRequests'
import HRLeaveBalances from './pages/hr/LeaveBalances'
import HROverttime from './pages/hr/Overtime'
import HRPayroll from './pages/hr/Payroll'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' }, success: { duration: 3000 }, error: { duration: 4000 } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminHome />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="designations" element={<Designations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave-types" element={<LeaveTypes />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="leave-balances" element={<LeaveBalances />} />
          <Route path="overtime" element={<Overtime />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* HR Routes */}
        <Route path="/hr" element={<ProtectedRoute allowedRoles={['HRManager']}><HRLayout /></ProtectedRoute>}>
          <Route index element={<HRHome />} />
          <Route path="employees" element={<HREmployees />} />
          <Route path="attendance" element={<HRAttendance />} />
          <Route path="leave-requests" element={<HRLeaveRequests />} />
          <Route path="leave-balances" element={<HRLeaveBalances />} />
          <Route path="overtime" element={<HROverttime />} />
          <Route path="payroll" element={<HRPayroll />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<MyProfile />} />
          <Route path="attendance"     element={<MyAttendance />} />
          <Route path="apply-leave"    element={<ApplyLeave />} />
          <Route path="leave-requests" element={<MyLeaveRequests />} />
          <Route path="leave-balance"  element={<MyLeaveBalance />} />
          <Route path="overtime"       element={<MyOvertime />} />
          <Route path="payslip"        element={<MyPayslip />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}