import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  MapPin,
  Mail,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

import {
  verifyEmail,
  resendVerificationOTP,
} from '../services/api'

import '../styles/Login.css'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()

  const { saveAuth } = useAuth()

  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [countdown, setCountdown] = useState(60)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  // ============================================
  // VERIFY OTP
  // ============================================
  const handleVerify = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    try {
      setLoading(true)

      const data = await verifyEmail(email, otp)

      saveAuth(data)

      setSuccess('Email verified successfully!')

      setTimeout(() => {
        navigate('/')
      }, 800)

    } catch (err) {
      console.error('OTP verification error:', err)

      setError(
        err.message || 'Verification failed. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // RESEND OTP
  // ============================================
  const handleResend = async () => {
    setError('')
    setSuccess('')

    try {
      setResending(true)

      const data = await resendVerificationOTP(email)

      setSuccess(data.message || 'A new OTP has been sent to your email.')

      setOtp('')
      setCountdown(60)

    } catch (err) {
      console.error('Resend OTP error:', err)

      setError(
        err.message || 'Could not resend OTP. Please try again.'
      )

    } finally {
      setResending(false)
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

      {/* VERIFICATION CARD */}
      <div className="auth-card">

        <div className="auth-header">

          <div className="auth-welcome-icon">
            <Mail size={24} />
          </div>

          <h2>Verify your email</h2>

          <p>
            We've sent a verification code to
          </p>

          <strong>{email}</strong>

        </div>

        {/* OTP FORM */}
        <form
          className="auth-form"
          onSubmit={handleVerify}
        >

          <div className="auth-field">

            <label htmlFor="otp">
              Enter verification code
            </label>

            <div className="auth-input-wrapper">

              <Mail size={18} />

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)

                  setOtp(value)
                }}
                maxLength={6}
                required
              />

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          {/* VERIFY BUTTON */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading || otp.length !== 6}
          >
            <span>
              {loading ? 'Verifying...' : 'Verify Email'}
            </span>

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        {/* RESEND OTP */}
        <div className="auth-footer">

          <span>Didn't receive the code?</span>

          {countdown > 0 ? (
            <span>
              Resend in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="auth-resend-button"
            >
              <RefreshCw size={14} />

              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}

        </div>

        <div className="auth-footer">
          <Link to="/login">
            Back to login
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