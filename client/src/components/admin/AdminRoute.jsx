import { Navigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="admin-auth-loading" role="status">
        <ShieldCheck size={28} />
        <strong>Verifying administrator access</strong>
        <span>Please wait while TraceBack checks your session.</span>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/home" replace />
  return children
}
