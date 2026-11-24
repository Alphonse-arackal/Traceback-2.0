import { useState } from 'react';
import L from 'leaflet';

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  CircleMarker,
} from 'react-leaflet';

import {
  LocateFixed,
  Search,
  X,
  MapPin,
} from 'lucide-react';

// Handles map clicks and returns selected coordinates
function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        source: 'Manual pin',
        locationName: '',
      });
    },
  });

  return null;
}

// Search locations using OpenStreetMap Nominatim
function LocationSearchControl({ onPick }) {
  const map = useMap();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();

    const searchQuery = query.trim();

    if (!searchQuery) {
      setError('Please enter a location to search.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSelectedPlace('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (!response.ok) {
        throw new Error('Location search failed. Please try again.');
      }

      const data = await response.json();

      if (data.length === 0) {
        setError('No locations found. Try another search.');
        return;
      }

      setResults(data);
    } catch (err) {
      setError(
        err.message || 'Something went wrong while searching.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place) => {
    const latitude = Number(place.lat);
    const longitude = Number(place.lon);

    const coordinates = {
      lat: latitude,
      lng: longitude,
      source: 'Search',
      locationName: place.display_name,
    };

    map.flyTo([latitude, longitude], 16, {
      duration: 1.5,
    });

    onPick?.(coordinates);

    setSelectedPlace(place.display_name);
    setQuery(place.display_name);
    setResults([]);
    setError('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
    setSelectedPlace('');
  };

  return (
    <div className="location-search">
      <form
        className="location-search-form"
        onSubmit={handleSearch}
      >
        <Search size={19} className="search-icon" />

        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError('');
            setResults([]);
            setSelectedPlace('');
          }}
          placeholder="Search a location..."
          aria-label="Search for a location"
        />

        {query && (
          <button
            type="button"
            className="search-clear-button"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}

        <button
          type="submit"
          className="search-submit-button"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="search-message">
          {error}
        </div>
      )}

      {selectedPlace && !results.length && (
        <div className="search-message search-success">
          <MapPin size={14} />
          Location selected
        </div>
      )}

      {results.length > 0 && (
        <div className="location-search-results">
          {results.map((place) => (
            <button
              type="button"
              key={place.place_id}
              className="location-search-result"
              onClick={() => handleSelect(place)}
            >
              <MapPin size={17} />

              <span>{place.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Handles current location detection
function LocateMeControl({ onPick }) {
  const map = useMap();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        console.log('Geolocation result:', {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date(position.timestamp),
        });

        if (accuracy > 1000) {
          setError(
            `Location accuracy is too low (${Math.round(
              accuracy
            )} metres). Please pin your location manually.`
          );

          setLoading(false);
          return;
        }

        const location = [latitude, longitude];

        setUserLocation(location);
        setAccuracy(accuracy);
        onPick?.({
          lat: latitude,
          lng: longitude,
          source: 'GPS',
          locationName: '',
          accuracy,
        });

        map.flyTo(location, 16, {
          duration: 1.5,
        });

        setLoading(false);
      },

      (error) => {
        const messages = {
          1: 'Location permission was denied.',
          2: 'Your location is currently unavailable.',
          3: 'Location request timed out.',
        };

        setError(
          messages[error.code] || 'Unable to detect your location.'
        );

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <button
        type="button"
        className="locate-me-button"
        onClick={handleLocate}
        disabled={loading}
        title="Find my current location"
      >
        <LocateFixed size={18} />
        {loading ? 'Locating...' : 'Locate Me'}
      </button>

      {error && (
        <div className="location-error">
          {error}
        </div>
      )}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={9}
          pathOptions={{
            color: '#ffffff',
            weight: 3,
            fillColor: '#2878ff',
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>You are here</strong>
            <br />
            Accuracy: approximately {Math.round(accuracy)} metres
          </Popup>
        </CircleMarker>
      )}
    </>
  );
}

// Creates custom icons for lost and found items
const iconFor = (type) =>
  L.divIcon({
    className: 'tb-map-icon',

    html: `
      <span class="map-pin ${
        type === 'Lost' ? 'pin-lost' : 'pin-found'
      }">
        ${type === 'Lost' ? '⌕' : '✓'}
      </span>
    `,

    iconSize: [34, 42],
    iconAnchor: [17, 40],
  });

// Main map component
export default function MapView({
  items = [],
  onPick,
  selected,
  onSelect,
  center = [10.5276, 76.2144],
  zoom = 13,
}) {
  return (
    <div className="map-frame">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="leaflet-map"
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Location search */}
        <LocationSearchControl onPick={onPick} />

        {/* Map click handler */}
        <ClickHandler onPick={onPick} />

        {/* Current location control */}
        <LocateMeControl onPick={onPick} />

        {/* Lost and found markers */}
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[
              item.lat ?? center[0],
              item.lng ?? center[1],
            ]}
            icon={iconFor(item.type)}
            eventHandlers={{
              click: () => onSelect?.(item),
            }}
          >
            <Popup>
              <b>{item.name}</b>
              <br />
              {item.type} · {item.location}
            </Popup>
          </Marker>
        ))}

        {/* Selected location marker */}
        {selected?.lat != null && selected?.lng != null && (
          <Marker
            position={[selected.lat, selected.lng]}
            icon={L.divIcon({
              className: 'tb-map-icon',
              html: '<span class="map-pin pin-selected">●</span>',
              iconSize: [34, 42],
              iconAnchor: [17, 40],
            })}
          >
            <Popup>Selected location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}