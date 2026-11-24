import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock3,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

import MapView from '../components/common/MapView'
import { getItemById } from '../services/api'

const formatItem = (item) => ({
  id: item._id,
  name: item.title,
  description: item.description,
  type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
  category: item.category,
  image: item.image || '',
  location: item.location?.name || '',
  lat: item.location?.coordinates?.latitude,
  lng: item.location?.coordinates?.longitude,
  date: item.date
    ? new Date(item.date).toLocaleDateString()
    : '',
  contactName: item.contact?.name || '',
  contactPhone: item.contact?.phone || '',
  contactEmail: item.contact?.email || '',
  contactWhatsapp: item.contact?.whatsapp || '',
  status: item.status,
})

export default function ItemDetails({ items = [] }) {
  const { id } = useParams()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const existingItem = items.find(
      entry => String(entry.id) === id
    )

    if (existingItem) {
      setItem(existingItem)
      setLoading(false)
      return
    }

    const fetchItem = async () => {
      try {
        setLoading(true)
        setError('')

        const backendItem = await getItemById(id)

        setItem(formatItem(backendItem))
      } catch (err) {
        console.error('Failed to fetch item:', err)

        setError(
          err.message || 'Failed to load this report.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, items])

  // Loading State
  if (loading) {
    return (
      <section className="item-details-page">
        <Link
          className="back-to-explore"
          to="/explore"
        >
          <ArrowLeft size={17} />
          Back to Explore
        </Link>

        <div className="details-not-found">
          <Loader2 size={24} className="animate-spin" />
          <h2>Loading report...</h2>
        </div>
      </section>
    )
  }

  // Error / Not Found State
  if (!item || error) {
    return (
      <section className="item-details-page">
        <Link
          className="back-to-explore"
          to="/explore"
        >
          <ArrowLeft size={17} />
          Back to Explore
        </Link>

        <div className="details-not-found">
          <h2>Report not found</h2>

          <p>
            {error ||
              'This report may have been removed.'}
          </p>
        </div>
      </section>
    )
  }

  const phone = item.contactPhone || ''
  const email = item.contactEmail || ''
  const whatsapp = item.contactWhatsapp || phone

  const phoneDigits = phone.replace(/[^\d+]/g, '')
  const whatsappDigits = whatsapp.replace(/\D/g, '')

  return (
    <section className="item-details-page">

      {/* Back Navigation */}
      <Link
        className="back-to-explore"
        to="/explore"
      >
        <ArrowLeft size={17} />
        Back to Explore
      </Link>

      <div className="details-layout">

        {/* Main Content */}
        <div className="details-main">

          {/* Item Image */}
          <div className="details-image-wrap">

            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
              />
            ) : (
              <div className="details-image-placeholder">
                No image available
              </div>
            )}

            <span
              className={`status-pill ${item.type.toLowerCase()}`}
            >
              {item.type}
            </span>

          </div>

          {/* Item Information */}
          <div className="details-content">

            <span className="details-category">
              {item.category}
            </span>

            <h1>{item.name}</h1>

            <p className="details-description">
              {item.description}
            </p>

            {/* Metadata */}
            <div className="details-meta">

              <span>
                <CalendarDays size={16} />
                {item.date}
              </span>

              {item.time && (
                <span>
                  <Clock3 size={16} />
                  {item.time}
                </span>
              )}

              <span>
                <MapPin size={16} />
                {item.location}
              </span>

            </div>

            {/* Reported Location */}
            <h2>Reported location</h2>

            <div className="details-map">
              <MapView
                items={[item]}
                center={
                  item.lat && item.lng
                    ? [item.lat, item.lng]
                    : undefined
                }
                zoom={15}
              />
            </div>

          </div>
        </div>

        {/* Contact Card */}
        <aside className="contact-card">

          <div className="contact-card-icon">
            <MessageCircle size={21} />
          </div>

          <span className="details-category">
            GET IN TOUCH
          </span>

          <h2>Contact the reporter</h2>

          <p>
            If you recognise this item or have found it,
            contact the person who submitted this report.
          </p>

          {/* Reporter Name */}
          {item.contactName && (
            <div className="reporter-name">
              Reported by{' '}
              <b>{item.contactName}</b>
            </div>
          )}

          {/* Contact Actions */}
          <div className="contact-actions">

            {/* Call */}
            {phone && (
              <a
                className="contact-action call"
                href={`tel:${phoneDigits}`}
              >
                <Phone size={18} />

                <span>
                  <b>Call</b>
                  <small>{phone}</small>
                </span>
              </a>
            )}

            {/* WhatsApp */}
            {whatsapp && (
              <a
                className="contact-action whatsapp"
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />

                <span>
                  <b>WhatsApp</b>
                  <small>Send a message</small>
                </span>
              </a>
            )}

            {/* Email */}
            {email && (
              <a
                className="contact-action email"
                href={`mailto:${email}`}
              >
                <Mail size={18} />

                <span>
                  <b>Email</b>
                  <small>{email}</small>
                </span>
              </a>
            )}

            {/* No Contact Information */}
            {!phone && !whatsapp && !email && (
              <div className="no-contact">
                <ShieldCheck size={18} />

                The reporter has not provided public
                contact details yet.
              </div>
            )}

          </div>

          {/* Privacy Notice */}
          <small className="contact-privacy">
            <ShieldCheck size={14} />

            Contact details are shown only when the
            reporter chooses to publish them.
          </small>

        </aside>

      </div>
    </section>
  )
}