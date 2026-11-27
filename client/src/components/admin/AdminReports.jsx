import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Search, RefreshCw, ChevronLeft, ChevronRight, Eye, Trash2, X, MapPin, CalendarDays, UserRound, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAdminReports, getAdminReportById, deleteAdminReport } from '../../services/api'
import { formatDate, getId, getList, getPagination } from './adminUtils'

export default function AdminReports() {
  const { token } = useAuth()
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const result = await getAdminReports(token, { search, type, status, page, limit: 10 })
      const rows = getList(result, 'reports')
      setReports(rows)
      setPagination(getPagination(result, rows.length))
    } catch (err) { setError(err.message || 'Unable to load reports.') }
    finally { setLoading(false) }
  }, [token, search, type, status, page])

  useEffect(() => {
    const timer = setTimeout(loadReports, 300)
    return () => clearTimeout(timer)
  }, [loadReports])

  const openDetails = async (report) => {
    const id = getId(report)
    if (!id) return
    try {
      setDetailLoading(true); setSelected({ ...report, _loading: true })
      const result = await getAdminReportById(token, id)
      setSelected(result.report || result.item || result.data || result)
    } catch (err) {
      setError(err.message || 'Unable to load report details.')
      setSelected(null)
    } finally { setDetailLoading(false) }
  }

  const removeReport = async (report) => {
    const id = getId(report)
    if (!id || busyId) return
    if (!window.confirm(`Permanently delete "${report.title || 'this report'}"? This also attempts to remove its image from Cloudinary.`)) return
    try {
      setBusyId(id); setError('')
      await deleteAdminReport(token, id)
      setReports((current) => current.filter((item) => String(getId(item)) !== String(id)))
      setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }))
      if (String(getId(selected)) === String(id)) setSelected(null)
      await loadReports()
    } catch (err) { setError(err.message || 'Unable to delete report.') }
    finally { setBusyId('') }
  }

  const poster = selected?.reportedBy
  const locationName = selected?.location?.name || selected?.location?.address || 'Location not provided'

  return <div className="admin-page">
    <div className="admin-page-topline"><div><span className="admin-eyebrow">CONTENT MODERATION</span><h2>Report Management</h2><p>Review lost and found listings and remove inappropriate reports.</p></div><button className="admin-button admin-button-secondary" onClick={loadReports} disabled={loading}><RefreshCw size={15} />Refresh</button></div>
    <section className="admin-panel admin-table-panel">
      <div className="admin-toolbar">
        <label className="admin-search"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search title, description or category…" /></label>
        <select className="admin-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} aria-label="Filter by report type"><option value="">All report types</option><option value="lost">Lost</option><option value="found">Found</option></select>
        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter by report status"><option value="">All statuses</option><option value="active">Active</option><option value="resolved">Resolved</option></select>
      </div>
      {error && <div className="admin-alert admin-alert-error"><AlertCircle size={17} />{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Report</th><th>Type</th><th>Reported by</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="6" className="admin-table-message">Loading reports…</td></tr> : reports.length ? reports.map((report) => {
          const id = getId(report)
          const owner = report.reportedBy
          return <tr key={id}><td><div className="admin-report-cell"><div className="admin-report-thumb">{report.image ? <img src={report.image} alt="" /> : <ImageIcon size={17} />}</div><div><strong>{report.title || 'Untitled report'}</strong><span>{report.category || 'Uncategorised'}</span></div></div></td><td><span className={`admin-type-badge ${report.type === 'found' ? 'is-found' : 'is-lost'}`}>{report.type || '—'}</span></td><td>{owner?.name || owner?.email || 'Unknown user'}</td><td>{formatDate(report.createdAt || report.date)}</td><td><span className={`admin-status ${report.status === 'resolved' ? 'is-resolved' : 'is-active'}`}>{report.status || 'active'}</span></td><td><div className="admin-row-actions"><button className="admin-icon-action" onClick={() => openDetails(report)} aria-label="View report details" title="View details"><Eye size={16} /></button><button className="admin-icon-action is-danger" onClick={() => removeReport(report)} disabled={Boolean(busyId)} aria-label="Delete report" title="Delete report">{busyId === id ? '…' : <Trash2 size={16} />}</button></div></td></tr>
        }) : <tr><td colSpan="6" className="admin-table-message">No reports match your filters.</td></tr>}
      </tbody></table></div>
      <div className="admin-table-footer"><span>{pagination.total} report{pagination.total === 1 ? '' : 's'} found</span><div className="admin-pagination"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page {page} of {pagination.pages}</span><button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages || loading} aria-label="Next page"><ChevronRight size={17} /></button></div></div>
    </section>

    {selected && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }} role="presentation">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-report-modal-title">
        <div className="admin-modal-header"><div><span className="admin-eyebrow">REPORT DETAILS</span><h3 id="admin-report-modal-title">{selected.title || 'Report details'}</h3></div><button className="admin-icon-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={19} /></button></div>
        {detailLoading ? <div className="admin-loading-panel"><span className="admin-spinner" />Loading report…</div> : <div className="admin-modal-body">
          {selected.image && <img className="admin-detail-image" src={selected.image} alt={selected.title || 'Reported item'} />}
          <div className="admin-detail-badges"><span className={`admin-type-badge ${selected.type === 'found' ? 'is-found' : 'is-lost'}`}>{selected.type || '—'}</span><span className={`admin-status ${selected.status === 'resolved' ? 'is-resolved' : 'is-active'}`}>{selected.status || 'active'}</span></div>
          <div className="admin-detail-grid"><div><span>Category</span><strong>{selected.category || '—'}</strong></div><div><span>Date reported</span><strong>{formatDate(selected.createdAt || selected.date)}</strong></div><div><span>Location</span><strong><MapPin size={14} />{locationName}</strong></div><div><span>Reported date</span><strong><CalendarDays size={14} />{formatDate(selected.date)}</strong></div></div>
          <div className="admin-detail-section"><h4>Description</h4><p>{selected.description || 'No description provided.'}</p></div>
          <div className="admin-detail-section"><h4>Poster information</h4><p><UserRound size={14} />{poster?.name || 'Unknown user'}{poster?.email ? ` · ${poster.email}` : ''}</p></div>
          {selected.contact && <div className="admin-detail-section"><h4>Contact details</h4><p>{selected.contact.name || '—'}{selected.contact.phone ? ` · ${selected.contact.phone}` : ''}{selected.contact.email ? ` · ${selected.contact.email}` : ''}</p></div>}
        </div>}
        <div className="admin-modal-footer"><button className="admin-button admin-button-secondary" onClick={() => setSelected(null)}>Close</button><button className="admin-button admin-button-danger" disabled={detailLoading || Boolean(busyId)} onClick={() => removeReport(selected)}><Trash2 size={15} />Delete report</button></div>
      </section>
    </div>}
  </div>
}
