import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Search,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ search, setSearch }) {
  const { logout, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const isSuperAdmin =
    isAuthenticated && user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'U'

  return (
    <header className="topbar">

      {/* BRAND */}
      <Link className="brand" to="/" aria-label="TraceBack home">
        <span className="brand-pin">
          <MapPin size={24} />
        </span>

        <span className="brand-copy">
          <strong>TraceBack</strong>
          <small>LOST &amp; FOUND</small>
        </span>
      </Link>

      {/* GLOBAL SEARCH */}
      <label className="global-search">
        <Search size={18} />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items or places..."
          aria-label="Search items or places"
        />
      </label>

      {/* USER ACTIONS */}
      <div className="header-actions">

        {/* SUPER ADMIN DASHBOARD BUTTON */}
        {isSuperAdmin && (
          <Link
            to="/admin"
            className="admin-dashboard-button"
            title="Open Admin Dashboard"
          >
            <ShieldCheck size={17} />
            <span>Admin Dashboard</span>
          </Link>
        )}

        {/* PROFILE */}
        <Link
          className="user-chip"
          to="/profile"
          aria-label="Open profile"
        >
          {user?.profilePicture ? (
            <img
              className="user-avatar"
              src={user.profilePicture}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="user-avatar">
              {initials}
            </span>
          )}

          <span className="user-details">
            <b>{user?.name || 'My Profile'}</b>
            <small>Account</small>
          </span>
        </Link>

        {/* LOGOUT */}
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>

      </div>

    </header>
  )
}