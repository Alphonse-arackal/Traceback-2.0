import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Users, FileText, Search, CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight, Clock3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAdminDashboard } from '../../services/api'
import { formatDate, getList } from './adminUtils'

const number = (value) => Number(value || 0).toLocaleString()

function StatCard({ label, value, note, icon: Icon, tone = '' }) {
  return <article className="admin-stat-card"><div className={`admin-stat-icon ${tone}`}><Icon size={20} /></div><div className="admin-stat-label">{label}</div><strong className="admin-stat-value">{number(value)}</strong><span className="admin-stat-note">{note}</span></article>
}

function LoadingBlock() {
  return <div className="admin-loading-panel"><span className="admin-spinner" />Loading dashboard data…</div>
}

export default function AdminOverview() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const result = await getAdminDashboard(token)
      setData({ ...(result || {}), ...(result?.data || {}), ...(result?.stats || {}) })
    } catch (err) {
      setError(err.message || 'Unable to load dashboard statistics.')
    } finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  if (loading && !data) return <LoadingBlock />

  const recentUsers = getList(data, 'recentUsers')
  const recentReports = getList(data, 'recentReports')

  return <div className="admin-page">
    <div className="admin-page-topline"><div><span className="admin-eyebrow">PLATFORM OVERVIEW</span><h2>Dashboard</h2><p>A live snapshot of activity across your TraceBack platform.</p></div><button className="admin-button admin-button-secondary" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'admin-spin' : ''} />Refresh</button></div>
    {error && <div className="admin-alert admin-alert-error"><AlertCircle size={17} />{error}<button onClick={load}>Try again</button></div>}
    <div className="admin-stats-grid">
      <StatCard label="Registered users" value={data?.totalUsers} note="Excludes administrator accounts" icon={Users} />
      <StatCard label="Total reports" value={data?.totalReports} note="All lost and found reports" icon={FileText} tone="orange" />
      <StatCard label="Lost reports" value={data?.lostReports} note="Items reported as lost" icon={Search} tone="blue" />
      <StatCard label="Found reports" value={data?.foundReports} note="Items reported as found" icon={CheckCircle2} tone="green" />
      <StatCard label="Active reports" value={data?.activeReports} note="Currently open reports" icon={Activity} tone="orange" />
      <StatCard label="Resolved reports" value={data?.resolvedReports} note="Marked as resolved" icon={CheckCircle2} tone="green" />
      <StatCard label="Suspended users" value={data?.suspendedUsers} note="Accounts currently restricted" icon={Users} tone="red" />
    </div>

    <div className="admin-dashboard-columns">
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Recent users</h3><p>Latest accounts registered on TraceBack</p></div><Link to="/admin/users" className="admin-text-link">View all <ArrowUpRight size={15} /></Link></div>
        {recentUsers.length ? <div className="admin-activity-list">{recentUsers.slice(0, 6).map((user) => <div className="admin-activity-row" key={user._id || user.id}><div className="admin-mini-avatar">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div><div className="admin-activity-main"><strong>{user.name || 'Unnamed user'}</strong><span>{user.email || 'No email available'}</span></div><span className={`admin-status ${user.accountStatus === 'suspended' ? 'is-danger' : 'is-active'}`}>{user.accountStatus || 'active'}</span></div>)}</div> : <div className="admin-empty-inline">No recent user data available.</div>}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Recent reports</h3><p>Recently submitted lost and found items</p></div><Link to="/admin/reports" className="admin-text-link">View all <ArrowUpRight size={15} /></Link></div>
        {recentReports.length ? <div className="admin-activity-list">{recentReports.slice(0, 6).map((report) => <div className="admin-activity-row" key={report._id || report.id}><div className="admin-report-thumb">{report.image ? <img src={report.image} alt="" /> : <FileText size={17} />}</div><div className="admin-activity-main"><strong>{report.title || 'Untitled report'}</strong><span>{report.type || 'Report'} · {formatDate(report.createdAt || report.date)}</span></div><span className={`admin-status ${report.status === 'resolved' ? 'is-resolved' : 'is-active'}`}>{report.status || 'active'}</span></div>)}</div> : <div className="admin-empty-inline"><Clock3 size={17} />No recent report data available.</div>}
      </section>
    </div>
  </div>
}
