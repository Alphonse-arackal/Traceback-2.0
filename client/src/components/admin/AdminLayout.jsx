import { useEffect, useState } from 'react'
import { Menu, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import '../../styles/admin.css'

export default function AdminLayout({ children, title = 'Overview', description = 'Manage and monitor your TraceBack platform.' }) {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => setSidebarOpen(false), [location.pathname])

  const name = user?.name?.trim() || 'Administrator'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'A'

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-icon-button admin-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open admin navigation" aria-expanded={sidebarOpen}><Menu size={21} /></button>
            <div className="admin-heading-copy">
              <div className="admin-breadcrumb"><span>TraceBack</span><span>/</span><strong>Administration</strong></div>
              <h1>{title}</h1><p>{description}</p>
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-security-badge"><ShieldCheck size={16} /><span>Administrator</span></div>
            <div className="admin-header-user">
              {user?.profilePicture ? <img className="admin-user-avatar" src={user.profilePicture} alt="" referrerPolicy="no-referrer" /> : <div className="admin-user-avatar">{initials}</div>}
              <div className="admin-user-info"><strong>{name}</strong><span>{user?.email || 'Admin account'}</span></div>
            </div>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  )
}
