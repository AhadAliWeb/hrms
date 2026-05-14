import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { username, role } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={12} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-600 text-gray-800 leading-none">{username || 'User'}</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-500 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  )
}
