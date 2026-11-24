import { useState } from 'react'
import { MapPin, Crosshair } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/common/MapView'

export default function Home({ items, setSelectedItem }) {
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState(null)

  const continueToReport = () => {
    if (!selectedLocation) return
    navigate('/report', { state: { selectedLocation } })
  }

  return (
    <section className="home-page">
      <div className="home-map-area">
        <MapView
          items={items}
          onSelect={setSelectedItem}
          onPick={setSelectedLocation}
          selected={selectedLocation}
        />
      </div>

      <aside className={`pin-panel ${selectedLocation ? 'has-selection' : ''}`}>
        <div className="pin-panel-heading">
          <div>
            <span className="eyebrow">MAP LOCATION</span>
            <h2>Pin a location</h2>
          </div>
          <span className="pin-panel-icon"><MapPin size={19} /></span>
        </div>

        {selectedLocation ? (
          <div className="selected-location-details" aria-live="polite">
            <div className="selected-location-title">
              <Crosshair size={17} /> Location selected
            </div>
            <div className="coordinate-row">
              <span>Latitude</span><strong>{selectedLocation.lat.toFixed(6)}</strong>
            </div>
            <div className="coordinate-row">
              <span>Longitude</span><strong>{selectedLocation.lng.toFixed(6)}</strong>
            </div>
            <div className="coordinate-row">
              <span>Selected using</span><strong>{selectedLocation.source || 'Manual pin'}</strong>
            </div>
            {selectedLocation.locationName && (
              <p className="selected-place-name">{selectedLocation.locationName}</p>
            )}
            <button className="text-button" type="button" onClick={() => setSelectedLocation(null)}>
              Clear selection
            </button>
          </div>
        ) : (
          <div className="pin-empty">
            <MapPin size={34} />
            <p>Search, use your current location, or tap the map to pin where the item was lost or found.</p>
          </div>
        )}

        <button
          type="button"
          className="primary-button"
          onClick={continueToReport}
          disabled={!selectedLocation}
        >
          {selectedLocation ? 'Use This Location' : 'Select a Location First'}
        </button>
      </aside>
    </section>
  )
}
