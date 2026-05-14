import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth)
  
  

  if (!isAuthenticated) return <Navigate to="/login" replace />

  

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl font-700 text-indigo-300 mb-2">403</div>
          <h1 className="text-xl font-600 text-gray-700 mb-1">Access Denied</h1>
          <p className="text-gray-400 text-sm">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return children
}
