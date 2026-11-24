import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ImagePlus,
  MapPin,
  X,
  Crosshair,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import MapView from '../components/common/MapView'
import { createItem, updateItem } from '../services/api'

const categories = [
  'Wallets & Purses',
  'Electronics',
  'Keys',
  'Books & Stationery',
  'Bags',
  'Documents',
  'Personal Items',
  'Clothing',
  'Accessories',
  'Other',
]

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ReportItem({ addItem, token }) {
  const routeLocation = useLocation()
  const navigate = useNavigate()
  const editItem = routeLocation.state?.editItem || null
  const isEditing = Boolean(editItem)

  const [step, setStep] = useState(1)
  const [type, setType] = useState('Lost')

  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactWhatsapp, setContactWhatsapp] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const [locationName, setLocationName] = useState('')
  const [pin, setPin] = useState(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  const [images, setImages] = useState([])
  const [existingImage, setExistingImage] = useState('')

  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')

  // Submission states
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ============================================
  // PREFILL FORM WHEN EDITING A REPORT
  // ============================================
  useEffect(() => {
    if (!editItem) return

    setType(editItem.type || 'Lost')
    setName(editItem.name || '')
    setCategory(editItem.category || categories[0])
    setDescription(editItem.description || '')
    setDate(editItem.dateInput || '')
    setContactName(editItem.contactName || '')
    setContactPhone(editItem.contactPhone || '')
    setContactWhatsapp(editItem.contactWhatsapp || '')
    setContactEmail(editItem.contactEmail || '')
    setLocationName(editItem.location || '')
    setExistingImage(editItem.image || '')

    if (editItem.lat != null && editItem.lng != null) {
      setPin({
        lat: Number(editItem.lat),
        lng: Number(editItem.lng),
        locationName: editItem.location || '',
        source: 'Saved report location',
      })
      setLocationConfirmed(true)
    }
  }, [editItem])

  // ============================================
  // HANDLE LOCATION FROM OTHER PAGES
  // ============================================
  useEffect(() => {
    const incoming = routeLocation.state?.selectedLocation

    if (incoming?.lat != null && incoming?.lng != null) {
      setPin(incoming)
      setLocationName(incoming.locationName || '')
      setLocationConfirmed(false)
      setStep(2)

      navigate(routeLocation.pathname, {
        replace: true,
        state: null,
      })
    }
  }, [
    routeLocation.state,
    routeLocation.pathname,
    navigate,
  ])

  // ============================================
  // CLEANUP IMAGE PREVIEWS
  // ============================================
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.url)
      })
    }
  }, [images])

  // ============================================
  // LOCATION
  // ============================================
  const choosePin = (nextPin) => {
    setPin(nextPin)

    if (nextPin.locationName) {
      setLocationName(nextPin.locationName)
    }

    setLocationConfirmed(false)
  }

  // ============================================
  // REPORT TYPE
  // ============================================
  const handleTypeChange = (nextType) => {
    setType(nextType)
    setErrors({})
    setSubmitError('')
  }

  // ============================================
  // IMAGE UPLOAD
  // ============================================
  const upload = (event) => {
    setImageError('')

    const selectedFiles = Array.from(
      event.target.files || []
    )

    const remaining = MAX_IMAGES - images.length
    const accepted = []

    for (const file of selectedFiles) {
      if (accepted.length >= remaining) {
        break
      }

      if (!file.type.startsWith('image/')) {
        setImageError('Please select image files only.')
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        setImageError(`${file.name} is larger than 5 MB.`)
        continue
      }

      accepted.push({
        file,
        url: URL.createObjectURL(file),
      })
    }

    setImages(current => [
      ...current,
      ...accepted,
    ])

    event.target.value = ''
  }

  // ============================================
  // REMOVE IMAGE
  // ============================================
  const removeImage = (index) => {
    setImages(current => {
      const removed = current[index]

      if (removed) {
        URL.revokeObjectURL(removed.url)
      }

      return current.filter(
        (_, currentIndex) => currentIndex !== index
      )
    })
  }

  // ============================================
  // VALIDATE DETAILS
  // ============================================
  const validateDetails = () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Enter the item name.'
    }

    if (!description.trim()) {
      nextErrors.description =
        'Add a description to help identify the item.'
    }

    if (!date) {
      nextErrors.date =
        `Select the date the item was ${
          type === 'Lost' ? 'lost' : 'found'
        }.`
    }

    if (
      date &&
      date > new Date().toISOString().slice(0, 10)
    ) {
      nextErrors.date = 'Date cannot be in the future.'
    }

    if (
      !contactPhone.trim() &&
      !contactWhatsapp.trim() &&
      !contactEmail.trim()
    ) {
      nextErrors.contact =
        'Add at least one way for people to contact you.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  // ============================================
  // CONTINUE TO LOCATION
  // ============================================
  const goToLocation = () => {
    if (validateDetails()) {
      setStep(2)
    }
  }

  // ============================================
  // SUBMIT REPORT TO BACKEND
  // ============================================
  const submit = async () => {
    if (!token) {
      setSubmitError('Your session has expired. Please sign in again.')
      return
    }

    if (!locationConfirmed || !pin) {
      setStep(2)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()

      // Item details
      formData.append('title', name.trim())
      formData.append('description', description.trim())
      formData.append('category', category)

      // Backend expects lowercase
      formData.append(
        'type',
        type.toLowerCase()
      )

      formData.append('date', date)

      // Location
      formData.append(
        'location[name]',
        locationName.trim() || 'Pinned location'
      )

      formData.append(
        'location[coordinates][latitude]',
        pin.lat
      )

      formData.append(
        'location[coordinates][longitude]',
        pin.lng
      )

      // Contact information
      formData.append(
        'contact[name]',
        contactName.trim()
      )

      formData.append(
        'contact[phone]',
        contactPhone.trim()
      )

      formData.append(
        'contact[email]',
        contactEmail.trim()
      )

      formData.append(
        'contact[whatsapp]',
        contactWhatsapp.trim()
      )

      // Upload the first image
      if (images.length > 0) {
        formData.append(
          'image',
          images[0].file
        )
      }

      // Create a new report or update the existing report
      const savedItem = isEditing
        ? await updateItem(editItem.id, formData, token)
        : await createItem(formData, token)

      // Update shared frontend state
      addItem(savedItem)

      // Return to Your Reports
      navigate('/reports', { replace: true })

    } catch (error) {
      console.error('Failed to submit report:', error)

      setSubmitError(
        error.message || 'Failed to submit report. Please try again.'
      )

    } finally {
      setSubmitting(false)
    }
  }

  const stepNames = [
    'Item details',
    'Location',
    'Review',
  ]

  return (
    <section className="report-page">

      <div className="report-form-card">

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div className="report-heading">

          <button
            className="back-button"
            type="button"
            onClick={() =>
              step > 1
                ? setStep(step - 1)
                : navigate(-1)
            }
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <span className="report-eyebrow">
              COMMUNITY LOST & FOUND
            </span>

            <h1>{isEditing ? 'Edit report' : 'Report an item'}</h1>

            <p>
              {isEditing
                ? 'Update the details of your existing report.'
                : 'Share the details so the community can help reunite an item with its owner.'}
            </p>
          </div>

        </div>

        {/* ================================== */}
        {/* STEPPER */}
        {/* ================================== */}

        <div
          className="report-stepper"
          aria-label={`Step ${step} of 3`}
        >
          {stepNames.map((label, index) => (
            <div
              className={`report-step ${
                step >= index + 1 ? 'active' : ''
              }`}
              key={label}
            >
              <span>{index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        {/* ================================== */}
        {/* STEP 1: ITEM DETAILS */}
        {/* ================================== */}

        {step === 1 && (
          <div className="form-fields">

            {/* Report type */}
            <div
              className="type-toggle"
              aria-label="Report type"
            >
              <button
                type="button"
                className={type === 'Lost' ? 'chosen' : ''}
                onClick={() => handleTypeChange('Lost')}
              >
                I lost an item
              </button>

              <button
                type="button"
                className={type === 'Found' ? 'chosen' : ''}
                onClick={() => handleTypeChange('Found')}
              >
                I found an item
              </button>
            </div>

            {/* Privacy note */}
            {type === 'Found' && (
              <div className="report-privacy-note">
                <ShieldCheck size={17} />

                <span>
                  For safety, don't publish serial numbers,
                  ID numbers, full names, or other private
                  details visible on the item.
                </span>
              </div>
            )}

            {/* Item details */}
            <div className="field-grid">

              <label>
                Item name <b>*</b>

                <input
                  value={name}
                  onChange={e => {
                    setName(e.target.value)

                    setErrors(old => ({
                      ...old,
                      name: '',
                    }))
                  }}
                  placeholder={
                    type === 'Lost'
                      ? 'e.g. Black leather wallet'
                      : 'e.g. Blue backpack'
                  }
                />

                {errors.name && (
                  <small className="field-error">
                    {errors.name}
                  </small>
                )}
              </label>

              <label>
                Category <b>*</b>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(itemCategory => (
                    <option key={itemCategory}>
                      {itemCategory}
                    </option>
                  ))}
                </select>
              </label>

            </div>

            {/* Description */}
            <label className="full-field">
              Description <b>*</b>

              <textarea
                maxLength={500}
                value={description}
                onChange={e => {
                  setDescription(e.target.value)

                  setErrors(old => ({
                    ...old,
                    description: '',
                  }))
                }}
                placeholder={
                  type === 'Lost'
                    ? 'Describe the item, its colour, brand, distinguishing features and where it may have been left.'
                    : 'Describe the item enough for its owner to recognise it, but keep one or two identifying details private.'
                }
              />

              <small className="char-count">
                {description.length}/500
              </small>

              {errors.description && (
                <small className="field-error">
                  {errors.description}
                </small>
              )}
            </label>

            {/* ================================== */}
            {/* IMAGE UPLOAD */}
            {/* ================================== */}

            <div className="upload-section">

              <h3>
                <ImagePlus size={18} />

                Item photos

                <span className="optional-label">
                  Optional · up to 5
                </span>
              </h3>

              <p>
                {type === 'Lost'
                  ? 'Add a photo of the item or a similar reference image.'
                  : 'Add a photo of the found item. Avoid showing private information.'}
              </p>

              <div className="upload-row">

                {existingImage && images.length === 0 && (
                  <div className="preview-image">
                    <img src={existingImage} alt="Current report" />
                    <span className="optional-label">Current photo</span>
                  </div>
                )}

                {images.map((image, index) => (
                  <div
                    className="preview-image"
                    key={`${image.file.name}-${index}`}
                  >
                    <img
                      src={image.url}
                      alt={`Selected item ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <label className="upload-box">

                    <ImagePlus size={24} />

                    <span>
                      {images.length
                        ? 'Add photos'
                        : 'Upload photos'}
                    </span>

                    <small>
                      JPG, PNG · Max 5 MB each
                    </small>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={upload}
                    />

                  </label>
                )}

              </div>

              {imageError && (
                <small className="field-error">
                  {imageError}
                </small>
              )}

            </div>

            {/* ================================== */}
            {/* DATE & TIME */}
            {/* ================================== */}

            <div className="field-grid date-grid">

              <label>
                Date {type.toLowerCase()} <b>*</b>

                <span className="input-icon">
                  <CalendarDays />

                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={date}
                    onChange={e => {
                      setDate(e.target.value)

                      setErrors(old => ({
                        ...old,
                        date: '',
                      }))
                    }}
                  />
                </span>

                {errors.date && (
                  <small className="field-error">
                    {errors.date}
                  </small>
                )}
              </label>

              <label>
                Approximate time

                <span className="optional-label">
                  Optional
                </span>

                <span className="input-icon">
                  <Clock3 />

                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </span>
              </label>

            </div>

            {/* ================================== */}
            {/* CONTACT INFORMATION */}
            {/* ================================== */}

            <div className="report-contact-fields">

              <div>
                <h3>Contact information</h3>

                <p>
                  Choose how people can reach you about
                  this report. At least one contact method
                  is required.
                </p>
              </div>

              <label>
                Your name

                <span className="optional-label">
                  Optional
                </span>

                <input
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Name shown with your report"
                />
              </label>

              <div className="field-grid">

                <label>
                  Phone number

                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label>
                  WhatsApp number

                  <input
                    type="tel"
                    value={contactWhatsapp}
                    onChange={e => setContactWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>

              </div>

              <label>
                Email address

                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              {errors.contact && (
                <small className="field-error">
                  {errors.contact}
                </small>
              )}

              <small className="contact-consent-note">
                <ShieldCheck size={14} />

                These details will be visible to people
                viewing your public report.
              </small>

            </div>

            {/* Continue */}
            <button
              className="primary-button form-next"
              type="button"
              onClick={goToLocation}
            >
              Continue to location
              <span>→</span>
            </button>

          </div>
        )}

        {/* ================================== */}
        {/* STEP 2: LOCATION */}
        {/* ================================== */}

        {step === 2 && (
          <div className="form-fields">

            <h3>
              Where was the item {type === 'Lost'
                ? 'last seen'
                : 'found'}?
            </h3>

            <p className="form-hint">
              Choose the incident location, not necessarily
              where you are right now. Search, use GPS,
              or tap the map.
            </p>

            <label className="location-name-field">
              Place name or nearby landmark

              <input
                className="location-input"
                value={locationName}
                onChange={event => {
                  setLocationName(event.target.value)
                  setLocationConfirmed(false)
                }}
                placeholder="e.g. Thrissur Railway Station"
              />
            </label>

            <div className="report-map tall">
              <MapView
                onPick={choosePin}
                selected={pin || undefined}
              />
            </div>

            {/* Selected location */}
            {pin ? (
              <div className="location-detail">

                <b>
                  <Crosshair size={15} />
                  Selected coordinates
                </b>

                <span>
                  Latitude: {pin.lat.toFixed(6)}
                </span>

                <span>
                  Longitude: {pin.lng.toFixed(6)}
                </span>

                <small>
                  Selected using: {pin.source || 'Manual pin'}

                  {pin.accuracy
                    ? ` · GPS accuracy ±${Math.round(pin.accuracy)} m`
                    : ''}
                </small>

              </div>
            ) : (
              <div className="report-location-prompt">
                <MapPin size={18} />

                No location selected yet. Choose a point
                on the map or use search/GPS.
              </div>
            )}

            {/* Confirm location */}
            <button
              type="button"
              className={`confirm-location-button ${
                locationConfirmed ? 'confirmed' : ''
              }`}
              disabled={!pin}
              onClick={() => setLocationConfirmed(true)}
            >
              <CheckCircle2 size={17} />

              {locationConfirmed
                ? 'Location confirmed'
                : 'Confirm this location'}
            </button>

            {/* Navigation */}
            <div className="step-actions">

              <button
                className="secondary-button"
                type="button"
                onClick={() => setStep(1)}
              >
                Back
              </button>

              <button
                className="primary-button"
                type="button"
                disabled={!locationConfirmed}
                onClick={() => setStep(3)}
              >
                Review report →
              </button>

            </div>

          </div>
        )}

        {/* ================================== */}
        {/* STEP 3: REVIEW */}
        {/* ================================== */}

        {step === 3 && (
          <div className="review-panel">

            <h3>Review your report</h3>

            <p>
              <b>Report type:</b> {type}
            </p>

            <p>
              <b>Item:</b> {name}
            </p>

            <p>
              <b>Category:</b> {category}
            </p>

            <p>
              <b>Description:</b> {description}
            </p>

            <p>
              <b>Date:</b> {date}
              {time ? ` at ${time}` : ''}
            </p>

            <p>
              <b>Location:</b>{' '}
              {locationName.trim() || 'Pinned location'}
            </p>

            <p>
              <b>Coordinates:</b>{' '}
              {pin?.lat.toFixed(6)}, {pin?.lng.toFixed(6)}
            </p>

            <p>
              <b>Location source:</b>{' '}
              {pin?.source || 'Manual pin'}
            </p>

            <p>
              <b>Contact:</b>{' '}
              {contactPhone ||
                contactWhatsapp ||
                contactEmail}
            </p>

            {/* Image preview */}
            {images.length > 0 && (
              <div className="review-image-row">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Report attachment ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {images.length === 0 && existingImage && (
              <div className="review-image-row">
                <img src={existingImage} alt="Current report" />
              </div>
            )}

            {/* Submission error */}
            {submitError && (
              <div className="report-submit-error">
                <AlertCircle size={17} />
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="step-actions">

              <button
                className="secondary-button"
                type="button"
                disabled={submitting}
                onClick={() => setStep(2)}
              >
                Back
              </button>

              <button
                className="primary-button"
                type="button"
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="spinner"
                    />

                    {isEditing ? 'Saving changes...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />

                    {isEditing ? 'Save changes' : 'Submit report'}
                  </>
                )}
              </button>

            </div>

          </div>
        )}

      </div>

      {/* ================================== */}
      {/* LOCATION SIDEBAR */}
      {/* ================================== */}

      <aside className="report-location-panel">

        <div className="location-panel-title">
          <MapPin />

          <h2>{type} location</h2>
        </div>

        <p>
          Pin the place where the item was
          {type === 'Lost'
            ? ' last seen.'
            : ' found.'}
        </p>

        <div className="report-map tall">
          <MapView
            onPick={choosePin}
            selected={pin || undefined}
          />
        </div>

        <div className="location-detail">

          <b>Location summary</b>

          <span>
            {locationName.trim() ||
              'No place name selected'}
          </span>

          {pin && (
            <small>
              Coordinates: {pin.lat.toFixed(6)},
              {' '}
              {pin.lng.toFixed(6)}
            </small>
          )}

          <small>
            Status: {locationConfirmed
              ? 'Confirmed'
              : 'Not confirmed'}
          </small>

        </div>

      </aside>

    </section>
  )
}
