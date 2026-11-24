import { ChevronRight, MapPin } from 'lucide-react'

export default function ItemCard({ item, selected, onClick }) {
  return (
    <button
      className={`item-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      <img src={item.image} alt={item.name} />

      <span className="item-card-copy">
        <b>{item.name}</b>
        <small>
          <MapPin size={11} />
          {item.location}
        </small>
        <small>{item.date}</small>
      </span>

      <span className={`status-pill ${item.type.toLowerCase()}`}>{item.type}</span>
      <ChevronRight size={16} className="item-chevron" />
    </button>
  )
}
