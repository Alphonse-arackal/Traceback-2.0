import { useEffect, useState } from 'react'
import {
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  User,
  Phone,
  FileText,
  X,
  Save,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import {
  getUserProfile,
  updateUserProfile,
} from '../services/api'

export default function Profile() {
  const { user, token, updateUser } = useAuth()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: '',
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ============================================
  // FETCH PROFILE
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getUserProfile(token)

        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
        })

      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(err.message || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  // ============================================
  // HANDLE INPUT CHANGES
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target

    setProfile(current => ({
      ...current,
      [name]: value,
    }))
  }

  // ============================================
  // SAVE PROFILE
  // ============================================
  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updatedUser = await updateUserProfile(token, {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      })

      setProfile(current => ({
        ...current,
        ...updatedUser,
      }))

      updateUser(updatedUser)

      setIsEditing(false)
      setSuccess('Profile updated successfully!')

    } catch (err) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // CANCEL EDITING
  // ============================================
  const handleCancel = async () => {
    try {
      const data = await getUserProfile(token)

      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
      })

      setIsEditing(false)
      setError('')
      setSuccess('')

    } catch (err) {
      setError('Unable to restore profile information.')
    }
  }

  // ============================================
  // AVATAR INITIALS
  // ============================================
  const initials = (profile.name || user?.name || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>Loading your profile...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-page">

      {/* PAGE HEADING */}
      <div className="profile-heading">
        <h1>My Profile</h1>
        <p>Manage your TraceBack account information.</p>
      </div>

      {/* PROFILE CARD */}
      <div className="profile-card">

        <div className="profile-cover" />

        {/* PROFILE HEADER */}
        <div className="profile-main">

          <div className="profile-avatar">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
              />
            ) : (
              initials
            )}
          </div>

          <div className="profile-name">
            <h2>{profile.name || 'TraceBack User'}</h2>
            <p>TraceBack member</p>
          </div>

          {!isEditing && (
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setIsEditing(true)
                setError('')
                setSuccess('')
              }}
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          )}

        </div>

        {/* MESSAGES */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success" role="status">
            {success}
          </div>
        )}

        {/* PROFILE DETAILS */}
        <div className="profile-details">

          {isEditing ? (

            <form onSubmit={handleSave}>

              <div className="profile-edit-heading">
                <h3>Edit Personal Information</h3>

                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Cancel editing"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="profile-edit-field">
                <label htmlFor="name">Display name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  maxLength={60}
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  maxLength={20}
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  maxLength={100}
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="bio">About me</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  maxLength={250}
                  rows={4}
                />
                <small>{profile.bio.length}/250 characters</small>
              </div>

              <div className="profile-edit-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="secondary-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

              </div>

            </form>

          ) : (

            <>
              <h3>Personal Information</h3>

              <div>
                <User />
                <span>
                  <small>Display name</small>
                  <b>{profile.name || 'Not added'}</b>
                </span>
              </div>

              <div>
                <Mail />
                <span>
                  <small>Google account email</small>
                  <b>{profile.email || 'Not available'}</b>
                </span>
              </div>

              <div>
                <Phone />
                <span>
                  <small>Phone number</small>
                  <b>{profile.phone || 'Not added yet'}</b>
                </span>
              </div>

              <div>
                <MapPin />
                <span>
                  <small>Location</small>
                  <b>{profile.location || 'Not added yet'}</b>
                </span>
              </div>

              <div>
                <FileText />
                <span>
                  <small>About me</small>
                  <b>{profile.bio || 'No bio added yet'}</b>
                </span>
              </div>

              <div>
                <ShieldCheck />
                <span>
                  <small>Account security</small>
                  <b>Google account connected</b>
                </span>
              </div>
            </>

          )}

        </div>

      </div>
    </section>
  )
}