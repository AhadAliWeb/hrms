import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../store/authSlice'
import { login as loginApi } from '../../api/auth'
import { jwtDecode } from 'jwt-decode'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/shared/Spinner'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginApi(form)
      const token = res.data.token
      dispatch(login(token))
      const decoded = jwtDecode(token)
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || ''
      toast.success('Welcome back!')
      if (role === 'Admin') navigate('/admin')
      else if (role === 'HRManager') navigate('/hr')
      else navigate('/employee')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-700 text-gray-900">HRM System</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-600 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 space-y-2.5">
          <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-3">Demo Credentials</p>
          {[
            { role: 'Admin', username: 'admin', password: '123456', color: 'bg-violet-100 text-violet-700' },
            { role: 'HR Manager', username: 'hrmanager', password: 'hr1234', color: 'bg-blue-100 text-blue-700' },
            { role: 'Employee', username: 'sara', password: 'sara1234', color: 'bg-emerald-100 text-emerald-700' },
          ].map(({ role, username, password, color }) => (
            <div key={role} className="flex items-center gap-3">
              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-md shrink-0 ${color}`}>{role}</span>
              <span className="text-xs text-gray-500 font-mono">{username}</span>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-xs text-gray-500 font-mono">{password}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}