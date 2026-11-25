import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
GoogleLogin,
GoogleOAuthProvider,
} from '@react-oauth/google'
import { MapPin } from 'lucide-react'

import { googleLogin } from '../services/api'
import '../styles/Login.css'

export default function Login() {
const navigate = useNavigate()
const { saveAuth } = useAuth()

const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

// Google OAuth Client ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// ============================================
// GOOGLE LOGIN SUCCESS
// ============================================
const handleGoogleSuccess = async (credentialResponse) => {
setError('')

if (!credentialResponse.credential) {
  setError('Google authentication failed. Please try again.')
  return
}

try {
  setLoading(true)

  const data = await googleLogin(
    credentialResponse.credential
  )

  // Save authentication details
  saveAuth(data)

  // Navigate to dashboard
  navigate('/home', { replace: true })

} catch (err) {
  console.error('Google login error:', err)

  setError(
    err.message || 'Google login failed. Please try again.'
  )
} finally {
  setLoading(false)
}

}

// ============================================
// GOOGLE LOGIN ERROR
// ============================================
const handleGoogleError = () => {
setError('Google sign-in was unsuccessful. Please try again.')
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

  {/* LOGIN CARD */}
  <div className="auth-card">

    {/* HEADER */}
    <div className="auth-header">
      <div className="auth-welcome-icon">
        <MapPin size={24} />
      </div>

      <h2>Welcome to TraceBack</h2>

      <p>Sign in to continue to your account</p>
    </div>

    {/* ERROR MESSAGE */}
    {error && (
      <div className="auth-error" role="alert">
        {error}
      </div>
    )}

    {/* GOOGLE LOGIN */}
    <div className="google-login-wrapper">

      {loading ? (
        <button
          className="auth-submit-button"
          disabled
        >
          <span>Signing in...</span>
        </button>
      ) : googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="continue_with"
            width="100%"
          />
        </GoogleOAuthProvider>
      ) : (
        <div className="auth-error" role="alert">
          Google Sign-In is not configured.
          Please contact the administrator.
        </div>
      )}

    </div>

    {/* FOOTER */}
    <div className="auth-footer">
      <span>
        New to TraceBack? Your account will be created automatically.
      </span>
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