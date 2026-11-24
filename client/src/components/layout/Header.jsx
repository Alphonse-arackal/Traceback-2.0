import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Search, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ search, setSearch }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

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

        <Link
          className="user-chip"
          to="/profile"
          aria-label="Open profile"
        >
          <span className="user-avatar">A</span>

          <span className="user-details">
            <b>My Profile</b>
            <small>Account</small>
          </span>
        </Link>

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