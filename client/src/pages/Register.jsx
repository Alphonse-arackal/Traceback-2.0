import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  MapPin,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react'

import { registerUser } from '../services/api'
import '../styles/Login.css'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()

    try {
      setLoading(true)

      await registerUser({
        name: name.trim(),
        email: normalizedEmail,
        password,
      })

      // Redirect to email verification
      navigate('/verify-email', {
        state: {
          email: normalizedEmail,
        },
      })

    } catch (err) {
      console.error('Registration error:', err)

      // Redirect existing unverified accounts
      if (err.message.toLowerCase().includes('not verified')) {
        navigate('/verify-email', {
          state: {
            email: normalizedEmail,
          },
        })
        return
      }

      setError(
        err.message || 'Registration failed. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-background" />

      {/* BRAND */}
      <Link to="/" className="auth-brand">
        <div className="auth-brand-icon">
          <MapPin size={28} />
        </div>

        <div className="auth-brand-text">
          <h1>TraceBack</h1>
          <span>LOST & FOUND</span>
        </div>
      </Link>

      {/* REGISTER CARD */}
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-welcome-icon">
            <User size={24} />
          </div>

          <h2>Create an account</h2>

          <p>
            Join TraceBack and help reconnect lost items
          </p>
        </div>

        {/* FORM */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}
          <div className="auth-field">
            <label htmlFor="name">Full name</label>

            <div className="auth-input-wrapper">
              <User size={18} />

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="auth-field">
            <label htmlFor="email">Email address</label>

            <div className="auth-input-wrapper">
              <Mail size={18} />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="auth-input-wrapper">
              <Lock size={18} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <div className="auth-input-wrapper">
              <Lock size={18} />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            <span>
              {loading ? 'Creating account...' : 'Create Account'}
            </span>

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        {/* FOOTER */}
        <div className="auth-footer">
          <span>Already have an account?</span>

          <Link to="/login">
            Sign in
          </Link>
        </div>

      </div>

      {/* BOTTOM TEXT */}
      <div className="auth-bottom-text">
        <MapPin size={15} />

        <span>
          Helping people reconnect with what matters.
        </span>
      </div>

    </div>
  )
}