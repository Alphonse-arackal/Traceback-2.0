import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Search, RefreshCw, ShieldCheck, UserRound, ChevronLeft, ChevronRight, Ban, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAdminUsers, suspendAdminUser, reactivateAdminUser } from '../../services/api'
import { formatDate, getId, getList, getPagination } from './adminUtils'

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const result = await getAdminUsers(token, { search, status, page, limit: 10 })
      const rows = getList(result, 'users')
      setUsers(rows)
      setPagination(getPagination(result, rows.length))
    } catch (err) { setError(err.message || 'Unable to load users.') }
    finally { setLoading(false) }
  }, [token, search, status, page])

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [loadUsers])

  const changeStatus = async (person) => {
    const id = getId(person)
    if (!id || busyId) return
    const suspended = person.accountStatus === 'suspended'
    const action = suspended ? 'reactivate' : 'suspend'
    const confirmed = window.confirm(`Are you sure you want to ${action} ${person.name || person.email || 'this account'}?`)
    if (!confirmed) return
    try {
      setBusyId(id); setError('')
      if (suspended) await reactivateAdminUser(token, id)
      else await suspendAdminUser(token, id)
      await loadUsers()
    } catch (err) { setError(err.message || `Unable to ${action} user.`) }
    finally { setBusyId('') }
  }

  return <div className="admin-page">
    <div className="admin-page-topline"><div><span className="admin-eyebrow">ACCOUNT CONTROL</span><h2>User Management</h2><p>Review registered accounts and manage account access.</p></div><button className="admin-button admin-button-secondary" onClick={loadUsers} disabled={loading}><RefreshCw size={15} />Refresh</button></div>
    <section className="admin-panel admin-table-panel">
      <div className="admin-toolbar">
        <label className="admin-search"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email…" /></label>
        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter users by account status"><option value="">All account statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
      </div>
      {error && <div className="admin-alert admin-alert-error"><AlertCircle size={17} />{error}</div>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Joined</th><th>Account status</th><th>Action</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="4" className="admin-table-message">Loading users…</td></tr> : users.length ? users.map((person) => {
          const id = getId(person)
          const isSuspended = person.accountStatus === 'suspended'
          const isSelf = String(id) === String(currentUser?._id || currentUser?.id)
          return <tr key={id}><td><div className="admin-table-user">{person.profilePicture ? <img src={person.profilePicture} alt="" /> : <div className="admin-table-avatar"><UserRound size={17} /></div>}<div><strong>{person.name || 'Unnamed user'}</strong><span>{person.email || '—'}</span></div></div></td><td>{formatDate(person.createdAt)}</td><td><span className={`admin-status ${isSuspended ? 'is-danger' : 'is-active'}`}>{person.accountStatus || 'active'}</span></td><td><button className={`admin-button admin-button-small ${isSuspended ? 'admin-button-success' : 'admin-button-danger'}`} disabled={Boolean(busyId) || isSelf} onClick={() => changeStatus(person)}>{busyId === id ? 'Updating…' : isSuspended ? <><CheckCircle2 size={14} />Reactivate</> : <><Ban size={14} />Suspend</>}</button>{isSelf && <small className="admin-inline-hint">Your account</small>}</td></tr>
        }) : <tr><td colSpan="4" className="admin-table-message">No users match your search.</td></tr>}
      </tbody></table></div>
      <div className="admin-table-footer"><span>{pagination.total} user{pagination.total === 1 ? '' : 's'} found</span><div className="admin-pagination"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page {page} of {pagination.pages}</span><button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages || loading} aria-label="Next page"><ChevronRight size={17} /></button></div></div>
    </section>
    <div className="admin-security-footnote"><ShieldCheck size={16} />Administrator accounts are excluded from user management. You cannot suspend your own account.</div>
  </div>
}
