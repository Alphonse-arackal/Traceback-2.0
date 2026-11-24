import { useState } from 'react'
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteItem } from '../services/api'

export default function YourReports({ items, token, removeItem }) {
  const [tab, setTab] = useState('All')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const myReports = items.filter(
    (item) => tab === 'All' || item.type === tab
  )

  // EDIT REPORT
  const handleEdit = (item) => {
    navigate('/report', {
      state: {
        editItem: item,
      },
    })
  }

  // DELETE REPORT
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(item.id)
      setError('')

      await deleteItem(item.id, token)

      removeItem(item.id)
    } catch (err) {
      console.error('Failed to delete report:', err)
      setError(err.message || 'Failed to delete report.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="reports-page">

      {/* HEADER */}
      <div className="page-title-row">
        <div>
          <h1>Your Reports</h1>
          <p>Manage and track the items you've reported.</p>
        </div>

        <Link className="primary-button add-report" to="/report">
          <Plus size={17} />
          Report Item
        </Link>
      </div>

      {/* FILTER TABS */}
      <div className="report-tabs">
        {['All', 'Lost', 'Found'].map((option) => (
          <button
            className={tab === option ? 'active' : ''}
            onClick={() => setTab(option)}
            key={option}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* REPORTS */}
      <div className="reports-grid">

        {myReports.map((item) => (
          <div className="report-tile" key={item.id}>

            <img
              src={item.image || '/placeholder.png'}
              alt={item.name}
            />

            <div>
              <span className={`status-pill ${item.type.toLowerCase()}`}>
                {item.type}
              </span>

              <h3>{item.name}</h3>

              <p>{item.location}</p>

              <small>{item.date}</small>

              {/* ACTION BUTTONS */}
              <div className="report-actions">

                <button
                  type="button"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <Eye size={15} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  disabled={deletingId === item.id}
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="delete-button"
                >
                  <Trash2 size={15} />
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {!myReports.length && (
        <p className="empty-state">
          You haven't created any reports yet.
        </p>
      )}

    </section>
  )
}