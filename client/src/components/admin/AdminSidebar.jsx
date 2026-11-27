import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, FileText, ArrowLeft, LogOut, X, ShieldCheck } from 'lucide-react'

const links = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'User Management', path: '/admin/users', icon: Users },
  { name: 'Report Management', path: '/admin/reports', icon: FileText },
]

export default function AdminSidebar({ open, setOpen }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button className={`admin-sidebar-overlay ${open ? 'is-visible' : ''}`} onClick={() => setOpen(false)} aria-label="Close navigation" tabIndex={open ? 0 : -1} />
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-mark">T</div>
          <div className="admin-brand-copy"><strong>TraceBack</strong><span>ADMIN CONSOLE</span></div>
          <button className="admin-icon-button admin-sidebar-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-caption">WORKSPACE</span>
          <nav className="admin-navigation">
            {links.map(({ name, path, icon: Icon, end }) => (
              <NavLink key={path} to={path} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                <Icon size={19} /><span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-note"><ShieldCheck size={17} /><div><strong>Protected area</strong><span>Administrator access only</span></div></div>
          <button className="admin-nav-link" onClick={() => { setOpen(false); navigate('/home') }}><ArrowLeft size={18} /><span>Back to TraceBack</span></button>
          <button className="admin-nav-link admin-logout-link" onClick={handleLogout}><LogOut size={18} /><span>Sign out</span></button>
          <div className="admin-sidebar-footer"><span>TraceBack Administration</span><span>Management console</span></div>
        </div>
      </aside>
    </>
  )
}
