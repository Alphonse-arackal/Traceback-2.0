import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  ArrowUpRight,
} from 'lucide-react'

import MapView from '../components/common/MapView'

export default function FindItems({
  items = [],
  search,
  setSearch,
  selectedItem,
  setSelectedItem,
}) {
  const navigate = useNavigate()

  const [category, setCategory] = useState('All categories')
  const [type, setType] = useState('Lost')
  const [showFilters, setShowFilters] = useState(false)

  // Get available categories
  const categories = useMemo(() => {
    return [
      'All categories',
      ...new Set(items.map(item => item.category)),
    ]
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()

    return items.filter(item => {
      const text = [
        item.name,
        item.location,
        item.description,
        item.category,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !q || text.includes(q)

      const matchesType =
        type === 'All' || item.type === type

      const matchesCategory =
        category === 'All categories' ||
        item.category === category

      return matchesSearch && matchesType && matchesCategory
    })
  }, [items, search, type, category])

  // Find the selected item from the currently filtered items
  const selected = selectedItem
    ? filteredItems.find(
        item => String(item.id) === String(selectedItem.id)
      )
    : null

  return (
    <section className="explore-page">

      {/* Explore Header */}
      <div className="explore-topbar">

        <div>
          <span className="explore-eyebrow">
            DISCOVER NEARBY
          </span>

          <h1>Explore lost items</h1>

          <p>
            Tap a pin to see what was lost and how to contact
            the reporter.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="explore-controls">

          <label className="explore-search">
            <Search size={17} />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search item or location"
            />
          </label>

          <button
            className={`explore-filter-button ${
              showFilters ? 'active' : ''
            }`}
            onClick={() => setShowFilters(v => !v)}
            type="button"
          >
            <SlidersHorizontal size={17} />

            <span>Filters</span>
          </button>

        </div>
      </div>

      {/* Filter Row */}
      <div className="explore-filter-row">

        {['Lost', 'Found', 'All'].map(value => (
          <button
            key={value}
            className={type === value ? 'active' : ''}
            onClick={() => setType(value)}
            type="button"
          >
            {value === 'All'
              ? 'All reports'
              : `${value} items`}
          </button>
        ))}

        {/* Category Filter */}
        {showFilters && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {categories.map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}

        <span className="explore-count">
          {filteredItems.length}{' '}
          {filteredItems.length === 1 ? 'map pin' : 'map pins'}
        </span>

      </div>

      {/* Map Container */}
      <div className="explore-map-wrap">

        <MapView
          items={filteredItems}
          onSelect={setSelectedItem}
        />

        {/* Selected Item Preview */}
        {selected && (
          <article className="map-item-preview">

            {/* Close Preview */}
            <button
              className="preview-close"
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close preview"
            >
              <X size={17} />
            </button>

            {/* Item Image */}
            {selected.image ? (
              <img
                src={selected.image}
                alt={selected.name}
              />
            ) : (
              <div className="preview-image-placeholder">
                No image available
              </div>
            )}

            {/* Item Information */}
            <div className="preview-copy">

              <span
                className={`status-pill ${selected.type.toLowerCase()}`}
              >
                {selected.type}
              </span>

              <h2>{selected.name}</h2>

              <p>
                <MapPin size={14} />
                {selected.location}
              </p>

              <small>
                {selected.category}
                {' · '}
                {selected.date}
              </small>

              {/* Contact Buttons */}
              <div className="preview-contact-row">

                {/* Call */}
                {selected.contactPhone && (
                  <a
                    href={`tel:${selected.contactPhone.replace(
                      /[^+\d]/g,
                      ''
                    )}`}
                  >
                    Call
                  </a>
                )}

                {/* WhatsApp */}
                {(selected.contactWhatsapp ||
                  selected.contactPhone) && (
                  <a
                    href={`https://wa.me/${(
                      selected.contactWhatsapp ||
                      selected.contactPhone
                    ).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                )}

                {/* Details */}
                <button
                  className="preview-details-button"
                  onClick={() =>
                    navigate(`/item/${selected.id}`)
                  }
                  type="button"
                >
                  Details
                  <ArrowUpRight size={15} />
                </button>

              </div>
            </div>
          </article>
        )}

        {/* Empty State */}
        {!filteredItems.length && (
          <div className="map-empty-state">
            No reports match these filters.
            Try another search or show all reports.
          </div>
        )}

      </div>

      {/* Map Legend */}
      <div className="explore-map-legend">

        <span>
          <i className="legend-dot lost-dot" />
          Lost item
        </span>

        <span>
          <i className="legend-dot found-dot" />
          Found item
        </span>

        <span>
          Tap a pin to preview a report
        </span>

      </div>

    </section>
  )
}
